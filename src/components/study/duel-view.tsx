"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Swords,
  Users,
  Timer,
  Trophy,
  Copy,
  LogOut,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Wifi,
  WifiOff,
  Loader2,
  Target,
  Zap,
  Crown,
  ShieldCheck,
  Handshake,
} from "lucide-react";
import { io, type Socket } from "socket.io-client";
import { lessons, examBank } from "@/data";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy, questionSourceLesson } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { sendStats } from "@/lib/identity";

// ------------------------------------------------------------------
// نبرد دودنفره — مصاف زندهٔ واژگانی با یادگیرندهٔ دیگر روی همین کتاب.
// داوری متمرکز: سرویس socket.io (پورت ۳۰۰۳ از طریق گیت‌وی) خودش بانک
// ۴۹۰ سؤال را دارد، ترتیب سؤال‌ها و بُر گزینه‌ها را صادر می‌کند و
// درستیِ هر پاسخ را خودش اعتبارسنجی می‌کند (اعتمادی به کلاینت نیست).
// کلاینت فقط id + perm می‌گیرد و متن را از بانک استاتیک خودش رندر
// می‌کند؛ بازخورد فوری هم چون کلیدها در بانک عمومی‌اند محلی است.
// ------------------------------------------------------------------

type Phase = "setup" | "waiting" | "countdown" | "play" | "done";
type Feedback = "none" | "right" | "wrong";
type Conn = "connecting" | "online" | "offline";

const PER_Q_MS = 15_000;
const LETTERS = ["A", "B", "C", "D"];

/** همان شکلی که سرویس ۳۰۰۳ می‌فرستد */
interface PublicPlayer {
  sid: string;
  name: string;
  color: string;
  qi: number;
  score: number;
  correct: number;
  answered: number;
  done: boolean;
  disconnected: boolean;
}

interface DuelQ {
  id: string;
  perm: number[];
}

interface EndPayload {
  reason: "finished" | "forfeit";
  winner: string | null;
  total: number;
  startedAt: number | null;
  players: PublicPlayer[];
}

export default function DuelView() {
  const { toast } = useToast();
  const mounted = useMounted();
  const userName = useStudy((s) => s.userName);
  const avatarColor = useStudy((s) => s.avatarColor);
  const duelWins = useStudy((s) => s.duelWins);
  const duelLosses = useStudy((s) => s.duelLosses);
  const duelTies = useStudy((s) => s.duelTies);

  // ----------------------------- اتصال -----------------------------
  const socketRef = useRef<Socket | null>(null);
  const [conn, setConn] = useState<Conn>("connecting");
  const [phase, setPhase] = useState<Phase>("setup");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [mySid, setMySid] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);
  const [countdownLeft, setCountdownLeft] = useState(0);
  const [rematchVotes, setRematchVotes] = useState(0);
  const [oppLeft, setOppLeft] = useState(false);
  const [endData, setEndData] = useState<EndPayload | null>(null);
  const [myFinishAt, setMyFinishAt] = useState(0);

  // ----------------------------- مسابقه -----------------------------
  const [questions, setQuestions] = useState<DuelQ[]>([]);
  const [total, setTotal] = useState(10);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState(-1);
  const [feedback, setFeedback] = useState<Feedback>("none");
  const [timeLeft, setTimeLeft] = useState(PER_Q_MS);
  const [myDone, setMyDone] = useState(false);

  const bank = useMemo(() => {
    const m = new Map<string, QuizQuestion>();
    for (const l of lessons) for (const q of l.quizzes) m.set(q.id, q);
    for (const q of examBank) m.set(q.id, q);
    return m;
  }, []);

  const me = players.find((p) => p.sid === mySid) ?? null;
  const opp = players.find((p) => p.sid !== mySid) ?? null;
  const oppConnected = !!opp && !opp.disconnected;

  // refs برای استفادهٔ امن داخل callbackهای سوکت (همگام‌سازی پس از commit)
  const phaseRef = useRef(phase);
  const qiRef = useRef(qi);
  const feedbackRef = useRef(feedback);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    qiRef.current = qi;
  }, [qi]);
  useEffect(() => {
    feedbackRef.current = feedback;
  }, [feedback]);
  const endedRef = useRef(false);
  const persistedRef = useRef(false);
  const qStartRef = useRef(0);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const qTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ----------------------------- پایان مسابقه -----------------------------
  const persistResult = useCallback(
    (end: EndPayload, sid: string) => {
      if (persistedRef.current) return;
      persistedRef.current = true;
      const mine = end.players.find((p) => p.sid === sid);
      if (!mine) return;
      const store = useStudy.getState();
      const outcome: "win" | "loss" | "tie" = end.winner === null ? "tie" : end.winner === sid ? "win" : "loss";
      store.recordDuelOutcome(outcome);
      store.trackQuizDone();
      trackEvent("duel_done");
      const percent = end.total > 0 ? Math.round((mine.correct / end.total) * 100) : 0;
      if (mine.answered > 0) {
        store.addResult("duel", {
          correct: mine.correct,
          total: Math.max(mine.answered, end.total),
          percent,
          at: new Date().toISOString(),
        });
      }
      try {
        // Task-36 «جدول نبرد» — the locally arbitrated outcome rides along with
        // the signed attempt so the global leaderboard can rank duel records.
        sendStats({
          lesson: 0,
          category: "duel",
          total: Math.max(mine.answered, end.total),
          correct: mine.correct,
          score: mine.score,
          outcome,
        }).catch(() => {});
      } catch {
        /* ignore */
      }
    },
    []
  );

  const handleEnd = useCallback(
    (end: EndPayload, sid: string) => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (qTimer.current) clearInterval(qTimer.current);
      endedRef.current = true;
      setEndData(end);
      setPlayers(end.players);
      persistResult(end, sid);
      setPhase("done");
    },
    [persistResult]
  );

  const resetToSetup = useCallback(() => {
    setPhase("setup");
    setRoomCode(null);
    setPlayers([]);
    setMySid(null);
    setQuestions([]);
    setQi(0);
    setPicked(-1);
    setFeedback("none");
    setMyDone(false);
    setEndData(null);
    setOppLeft(false);
    setRematchVotes(0);
    setMyFinishAt(0);
    setJoinInput("");
  }, []);

  // ----------------------------- چرخهٔ سوکت -----------------------------
  useEffect(() => {
    // Never use PORT in the URL, always use XTransformPort
    // DO NOT change the path, it is used by Caddy to forward to the mini-service
    const s = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
    socketRef.current = s;

    const onConnect = () => setConn("online");
    const onDisconnect = () => {
      setConn("offline");
      // قطع‌شدن سوکت وسط اتاق = اتاق از دست رفته (rejoin نداریم)
      if (phaseRef.current !== "setup" && phaseRef.current !== "done") {
        toast({ title: "اتصال قطع شد", description: "اتاق مسابقه از دست رفت؛ دوباره تلاش کن.", duration: 4500 });
        resetToSetup();
      }
    };
    const onState = (st: { code: string; status: string; players: PublicPlayer[] }) => {
      setPlayers(st.players);
      setRoomCode(st.code);
      // اگر حریف حین شمارش معکوس رفت، سرور اتاق را به لابی برمی‌گرداند
      if (phaseRef.current === "countdown" && st.status === "lobby") {
        setPhase("waiting");
        toast({ title: "حریف اتاق را ترک کرد", description: "منتظر بازیکن بعدی…", duration: 3500 });
      }
    };
    const onCountdown = (p: { ms: number }) => {
      setOppLeft(false);
      setRematchVotes(0);
      setCountdownLeft(p.ms);
      setPhase("countdown");
      const t0 = Date.now();
      const iv = setInterval(() => {
        const left = p.ms - (Date.now() - t0);
        setCountdownLeft(Math.max(0, left));
        if (left <= 0) clearInterval(iv);
      }, 100);
    };
    const onStart = (p: { perQMs: number; total: number; startedAt: number; questions: DuelQ[] }) => {
      endedRef.current = false;
      persistedRef.current = false;
      setQuestions(p.questions);
      setTotal(p.total);
      setQi(0);
      setPicked(-1);
      setFeedback("none");
      setMyDone(false);
      setTimeLeft(p.perQMs);
      setEndData(null);
      setOppLeft(false);
      trackEvent("duel_start");
      setPhase("play");
    };
    const onProgress = (p: { players: PublicPlayer[] }) => setPlayers(p.players);
    const onOppLeft = () => setOppLeft(true);
    const onRematchVote = (p: { voted: number }) => setRematchVotes(p.voted);
    const onEnd = (end: EndPayload) => handleEnd(end, s.id ?? "");

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("duel:state", onState);
    s.on("duel:countdown", onCountdown);
    s.on("duel:start", onStart);
    s.on("duel:progress", onProgress);
    s.on("duel:opponent-left", onOppLeft);
    s.on("duel:rematch-vote", onRematchVote);
    s.on("duel:end", onEnd);

    return () => {
      try {
        if (phaseRef.current === "waiting" || phaseRef.current === "countdown" || phaseRef.current === "play") {
          s.emit("duel:leave");
        }
      } catch {
        /* ignore */
      }
      s.disconnect();
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      if (qTimer.current) clearInterval(qTimer.current);
      socketRef.current = null;
    };
  }, [handleEnd]);

  // ----------------------------- اقدامات لابی -----------------------------
  const createRoom = useCallback(() => {
    const s = socketRef.current;
    if (!s || conn !== "online") return;
    const store = useStudy.getState();
    s.emit("duel:create", { name: store.userName || "یادگیرنده", color: store.avatarColor }, (res: { ok: boolean; code?: string; state?: { players: PublicPlayer[] }; error?: string }) => {
      if (!res.ok) {
        toast({ title: "ساخت اتاق ناموفق بود", description: res.error, duration: 4000 });
        return;
      }
      setMySid(s.id ?? null);
      setRoomCode(res.code ?? null);
      setPlayers(res.state?.players ?? []);
      setPhase("waiting");
    });
  }, [conn, toast]);

  const joinRoom = useCallback(() => {
    const s = socketRef.current;
    if (!s || conn !== "online") return;
    const code = joinInput.trim().toUpperCase();
    if (code.length < 4) {
      toast({ title: "کد اتاق را کامل وارد کن", duration: 3000 });
      return;
    }
    setJoinBusy(true);
    const store = useStudy.getState();
    s.emit("duel:join", { code, name: store.userName || "یادگیرنده", color: store.avatarColor }, (res: { ok: boolean; error?: string }) => {
      setJoinBusy(false);
      if (!res.ok) {
        toast({ title: "پیوستن ناموفق بود", description: res.error, duration: 4000 });
        return;
      }
      setMySid(s.id ?? null);
      setRoomCode(code);
      setPhase("waiting");
    });
  }, [conn, joinInput, toast]);

  const leaveRoom = useCallback(() => {
    const s = socketRef.current;
    try {
      s?.emit("duel:leave");
    } catch {
      /* ignore */
    }
    resetToSetup();
  }, [resetToSetup]);

  const copyCode = useCallback(async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      toast({ title: "کد اتاق کپی شد 📋", description: `برای دوستت بفرست تا با کد ${roomCode} به نبرد بپیوندد`, duration: 3500 });
    } catch {
      toast({ title: "کپی نشد", duration: 2500 });
    }
  }, [roomCode, toast]);

  // ----------------------------- گیم‌پلی -----------------------------
  const cur = questions[qi] ?? null;
  const curQ = cur ? bank.get(cur.id) ?? null : null;
  const correctIdx = cur && curQ ? cur.perm.indexOf(curQ.answer) : -1;

  const answer = useCallback(
    (i: number) => {
      const s = socketRef.current;
      const q = questions[qiRef.current];
      if (!s || !q || feedbackRef.current !== "none" || endedRef.current || phaseRef.current !== "play") return;
      const qq = bank.get(q.id) ?? null;
      const ok = i >= 0 && qq ? q.perm[i] === qq.answer : false;
      setPicked(i);
      setFeedback(ok ? "right" : "wrong");
      const ms = Date.now() - qStartRef.current;
      s.emit("duel:answer", { qi: qiRef.current, choice: i, ms });
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        if (endedRef.current) return;
        setFeedback("none");
        setPicked(-1);
        const next = qiRef.current + 1;
        setQi(next);
        setTimeLeft(PER_Q_MS);
        if (next >= total) {
          setMyDone(true);
          setMyFinishAt(Date.now());
        }
      }, ok ? 480 : 900);
    },
    [questions, total, bank]
  );

  // تایمر هر سؤال: ۱۵ ثانیه؛ صفر شد = پاسخ خودکار غلط (-۱)
  useEffect(() => {
    if (phase !== "play" || feedback !== "none" || myDone) return;
    qStartRef.current = Date.now();
    const iv = setInterval(() => {
      const left = PER_Q_MS - (Date.now() - qStartRef.current);
      setTimeLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(iv);
        answer(-1);
      }
    }, 100);
    qTimer.current = iv;
    return () => clearInterval(iv);
  }, [phase, qi, feedback, myDone]);

  // کیبورد ۱–۴ حین مسابقه
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key >= "1" && e.key <= "4") {
        e.preventDefault();
        answer(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, answer]);

  const rematch = useCallback(() => {
    const s = socketRef.current;
    if (!s || !oppConnected) return;
    s.emit("duel:rematch");
    setRematchVotes((v) => Math.max(v, 1));
    toast({ title: "درخواست نبرد دوباره فرستادیم ⚔️", description: "تا حریف هم تأیید کند…", duration: 3000 });
  }, [oppConnected, toast]);

  // ----------------------------- SETUP -----------------------------
  if (phase === "setup") {
    return (
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="duel-hero relative overflow-hidden rounded-2xl bg-gradient-to-bl from-violet-600 via-fuchsia-600 to-rose-500 p-6 text-center text-white shadow-lg shadow-fuchsia-600/20 sm:p-10"
        >
          <div className="absolute -left-6 -top-8 opacity-[0.08]" aria-hidden>
            <Swords size={230} />
          </div>
          <div className="relative">
            <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-700 text-white shadow-xl shadow-fuchsia-900/30">
              <Swords size={38} />
            </span>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
              <Sparkles size={13} />
              حالت چندنفرهٔ زنده — واژگان Vision 2
            </span>
            <h1 className="mb-2 text-2xl font-black sm:text-3xl">نبرد دودنفره</h1>
            <p className="mx-auto mb-6 max-w-lg text-[13.5px] leading-7 text-white/85">
              با یک یادگیرندهٔ دیگر همزمان مسابقه بده! هر دو همان ۱۰ سؤال را می‌بینید و داوری روی سرور انجام می‌شود —
              نه تقلبی، نه تأخیری. سریع‌تر جواب بدهی، امتیاز بیشتری می‌گیری.
            </p>

            <div className="mx-auto mb-7 flex flex-wrap items-center justify-center gap-2.5">
              <span className="rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-[13px] font-black backdrop-blur-sm">
                🏆 بردها: {faNum(mounted ? duelWins : 0)}
              </span>
              <span className="rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-[13px] font-black backdrop-blur-sm">
                😔 باخت‌ها: {faNum(mounted ? duelLosses : 0)}
              </span>
              <span className="rounded-xl border border-white/25 bg-white/15 px-4 py-2 text-[13px] font-black backdrop-blur-sm">
                🤝 مساوی: {faNum(mounted ? duelTies : 0)}
              </span>
            </div>

            {/* ساخت اتاق */}
            <div className="mx-auto mb-4 max-w-md rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-center gap-2 text-[13px] font-black">
                <Users size={15} />
                اتاق جدید بساز
              </div>
              <p className="mb-3 text-[12px] leading-6 text-white/80">یک کد ۵حرفی می‌گیریم؛ به دوستت بده تا بپیوندد.</p>
              <button
                onClick={createRoom}
                disabled={conn !== "online"}
                className="duel-cta inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-8 py-3.5 text-[15px] font-black text-fuchsia-700 shadow-xl transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
              >
                <Swords size={18} />
                ساخت اتاق نبرد
              </button>
            </div>

            {/* پیوستن با کد */}
            <div className="mx-auto max-w-md rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-center gap-2 text-[13px] font-black">
                <Target size={15} />
                با کد به نبرد بپیوند
              </div>
              <div className="flex gap-2" dir="ltr">
                <input
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5))}
                  onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                  placeholder="کد اتاق… مثل K7M2X"
                  aria-label="کد اتاق مسابقه"
                  className="duel-input w-full flex-1 rounded-xl border-2 border-white/30 bg-white/90 px-3 py-2.5 text-center font-mono text-lg font-black tracking-[0.3em] text-stone-800 outline-none placeholder:text-stone-400 focus:border-white"
                />
                <button
                  onClick={joinRoom}
                  disabled={conn !== "online" || joinBusy || joinInput.trim().length < 4}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-[13px] font-black text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                >
                  {joinBusy ? <Loader2 size={15} className="animate-spin" /> : <Swords size={15} />}
                  پیوستن
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-white/75">
              {conn === "online" ? <Wifi size={13} /> : conn === "connecting" ? <Loader2 size={13} className="animate-spin" /> : <WifiOff size={13} />}
              {conn === "online" ? "متصل به سرور نبرد" : conn === "connecting" ? "در حال اتصال…" : "اتصال برقرار نیست — چند لحظه صبر کن"}
            </div>
          </div>
        </motion.div>

        {/* چطور کار می‌کند؟ */}
        <section className="duel-card rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-[14px] font-extrabold text-stone-700">
            <ShieldCheck size={17} className="text-fuchsia-600" />
            چطور کار می‌کند؟
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {[
              {
                icon: Users,
                title: "۱. اتاق دو نفره",
                desc: "یکی اتاق می‌سازد و کد ۵حرفی را می‌فرستد؛ دیگری با کد می‌پیوندد و شمارش معکوس ۵ثانیه‌ای شروع می‌شود.",
              },
              {
                icon: Timer,
                title: "۲. ده سؤال، پانزده ثانیه",
                desc: "هر دو همان سؤال‌ها را با همان ترتیب گزینه‌ها می‌بینند؛ اگر تا ۱۵ ثانیه جواب ندهی، آن سؤال غلط حساب می‌شود.",
              },
              {
                icon: Zap,
                title: "۳. داوری روی سرور",
                desc: "هر پاسخ درست ۱۰۰ امتیاز + پاداش سرعت (تا ۱۰۰). نتیجه را سرور اعلام می‌کند؛ غلط‌ها به بانک مرور می‌روند.",
              },
            ].map((r) => (
              <div key={r.title} className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-100 text-fuchsia-700">
                    <r.icon size={14} />
                  </span>
                  <span className="text-[12.5px] font-extrabold text-stone-800">{r.title}</span>
                </div>
                <p className="text-[12px] leading-6 text-stone-500">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // ----------------------------- WAITING -----------------------------
  if (phase === "waiting") {
    return (
      <div className="duel-card mx-auto max-w-lg space-y-4 rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fuchsia-100 text-fuchsia-700">
          <Users size={30} />
        </span>
        <h1 className="text-xl font-black text-stone-800">اتاق آماده است!</h1>
        <p className="text-[13px] leading-6 text-stone-500">این کد را برای حریفت بفرست. با پیوستن او، نبرد خودکار شروع می‌شود.</p>

        <button
          onClick={copyCode}
          className="duel-code group mx-auto flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-fuchsia-300 bg-fuchsia-50 px-4 py-4 transition-all hover:border-fuchsia-400 active:scale-[0.98]"
          aria-label={`کد اتاق ${roomCode} — برای کپی کلیک کن`}
        >
          <span className="font-mono text-3xl font-black tracking-[0.35em] text-fuchsia-700" dir="ltr">
            {roomCode}
          </span>
          <Copy size={18} className="text-fuchsia-500 transition-transform group-hover:scale-110" />
        </button>

        {/* بازیکنان */}
        <div className="flex items-center justify-center gap-3">
          {[0, 1].map((i) => {
            const p = players[i];
            return p ? (
              <motion.div
                key={p.sid}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex min-w-28 flex-col items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5"
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="max-w-28 truncate text-[12.5px] font-extrabold text-stone-700">{p.name}</span>
                <span className="text-[10px] font-bold text-stone-400">{p.sid === mySid ? "تو" : "حریف"}</span>
              </motion.div>
            ) : (
              <div key={`slot-${i}`} className="flex min-w-28 flex-col items-center gap-1 rounded-xl border border-dashed border-stone-200 px-3 py-2.5 text-stone-300">
                <Users size={16} />
                <span className="text-[11px] font-bold">در انتظار…</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-fuchsia-600">
          <Loader2 size={14} className="animate-spin" />
          منتظر پیوستن حریف…
        </div>

        <button
          onClick={leaveRoom}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-4 py-2 text-[12.5px] font-bold text-stone-500 transition-colors hover:border-rose-200 hover:text-rose-600"
        >
          <LogOut size={14} />
          لغو و بازگشت
        </button>
      </div>
    );
  }

  // ----------------------------- COUNTDOWN -----------------------------
  if (phase === "countdown") {
    const secs = Math.ceil(countdownLeft / 1000);
    return (
      <div className="duel-hero flex min-h-[55vh] flex-col items-center justify-center rounded-2xl bg-gradient-to-bl from-violet-600 via-fuchsia-600 to-rose-500 p-8 text-center text-white shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          {[0, 1].map((i) => {
            const p = players[i];
            return p ? (
              <div key={p.sid} className="flex flex-col items-center gap-1 rounded-xl border border-white/25 bg-white/15 px-4 py-2 backdrop-blur-sm">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-[12.5px] font-extrabold">{p.name}</span>
              </div>
            ) : null;
          })}
        </div>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={secs}
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="text-[110px] font-black leading-none drop-shadow-lg"
          >
            {faNum(Math.max(1, secs))}
          </motion.div>
        </AnimatePresence>
        <p className="mt-4 text-[14px] font-bold text-white/85">نبرد تا لحظه‌ای دیگر… آماده باش! ⚔️</p>
      </div>
    );
  }

  // ----------------------------- DONE -----------------------------
  if (phase === "done" && endData) {
    const mine = endData.players.find((p) => p.sid === mySid);
    const other = endData.players.find((p) => p.sid !== mySid);
    const outcome: "win" | "loss" | "tie" = endData.winner === null ? "tie" : endData.winner === mySid ? "win" : "loss";
    const forfeit = endData.reason === "forfeit";

    return (
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`duel-done relative overflow-hidden rounded-2xl border-2 p-6 text-center shadow-sm sm:p-8 ${
            outcome === "win"
              ? "border-emerald-300 bg-gradient-to-bl from-emerald-50 to-teal-50"
              : outcome === "tie"
                ? "border-amber-300 bg-gradient-to-bl from-amber-50 to-orange-50"
                : "border-rose-300 bg-gradient-to-bl from-rose-50 to-orange-50"
          }`}
        >
          <div className="relative">
            <motion.span
              initial={{ rotate: -12, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}
              className={`mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-xl ${
                outcome === "win"
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30"
                  : outcome === "tie"
                    ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30"
                    : "bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/30"
              }`}
            >
              {outcome === "win" ? <Trophy size={38} /> : outcome === "tie" ? <Handshake size={38} /> : <Swords size={38} />}
            </motion.span>
            <h1 className="mb-2 text-2xl font-black text-stone-800 sm:text-3xl">
              {outcome === "win" ? (forfeit ? "برد با ضربهٔ فنی!" : "پیروزی در نبرد! 🏆") : outcome === "tie" ? "مساوی — رقابت نزدیک!" : forfeit ? "حریف خارج شد" : "این دور را باختی"}
            </h1>
            <p className="mx-auto max-w-md text-[13px] leading-7 text-stone-600">
              {outcome === "win"
                ? forfeit
                  ? "حریف وسط نبرد قطع شد؛ امتیازت سالم ثبت شد."
                  : "سرعتمان خوب بود! حریف تازه‌ای را پیدا کن و زنجیرهٔ بردها را ادامه بده."
                : outcome === "tie"
                  ? "امتیازها برابر شد؛ دوباره مبارزه کن تا برنده مشخص شود."
                  : "ناراحت نباش — غلط‌های این نبرد به بانک مرور رفت‌اند تا دفعهٔ بعد قوی‌تر برگردی."}
            </p>
          </div>
        </motion.div>

        {/* کارت مقایسه */}
        <div className="duel-card rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-[14px] font-extrabold text-stone-700">
            <Crown size={16} className="text-amber-600" />
            کارنامهٔ نبرد
          </h2>
          <div className="space-y-2.5">
            {[
              { p: mine, label: "تو", highlight: outcome === "win" },
              { p: other, label: "حریف", highlight: outcome === "loss" },
            ].map(
              ({ p, label, highlight }) =>
                p && (
                  <div
                    key={p.sid}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      highlight ? "border-emerald-300 bg-emerald-50/70" : "border-stone-200 bg-stone-50/70"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: p.color }}>
                      <Users size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13px] font-extrabold text-stone-800">{p.name}</span>
                        <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-500">{label}</span>
                        {p.disconnected && <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">خارج شد</span>}
                      </div>
                      <div className="mt-0.5 text-[11.5px] font-bold text-stone-400">
                        {faNum(p.correct)} درست از {faNum(Math.max(p.answered, endData.total))} · پیشروی {faNum(p.qi)}/{faNum(endData.total)}
                        {p.sid === mySid && myFinishAt > 0 && endData.startedAt
                          ? ` · زمان تو ${faNum(Math.max(1, Math.round((myFinishAt - endData.startedAt) / 1000)))} ثانیه`
                          : ""}
                      </div>
                    </div>
                    <span className="shrink-0 text-xl font-black text-stone-800">{faNum(p.score)}</span>
                  </div>
                )
            )}
          </div>
          <p className="mt-3 text-center text-[11.5px] leading-6 text-stone-400">
            نتیجهٔ این نبرد با امضای هویتی‌ات در آمار سرور ثبت شد — غلط‌هایت در کارت «بانک اشتباهات» خانه منتظرت هستند.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {oppConnected ? (
            <button
              onClick={rematch}
              className="duel-cta inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-l from-violet-600 to-fuchsia-600 px-8 py-3.5 text-[15px] font-black text-white shadow-xl shadow-fuchsia-600/25 transition-all hover:opacity-95 active:scale-95"
            >
              <RotateCcw size={18} />
              نبرد دوباره
            </button>
          ) : null}
          <button
            onClick={leaveRoom}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-stone-200 bg-white px-6 py-3 text-[14px] font-black text-stone-600 transition-all hover:border-stone-300 active:scale-95"
          >
            <Swords size={16} />
            {oppConnected && rematchVotes > 0 ? "منتظر حریف… یا حریف جدید" : "حریف جدید"}
          </button>
        </div>
        {oppConnected && rematchVotes > 0 && (
          <p className="text-center text-[12px] font-bold text-fuchsia-600">
            <Loader2 size={12} className="ml-1 inline animate-spin" />
            منتظر تأیید حریف برای نبرد دوباره…
          </p>
        )}
      </div>
    );
  }

  // ----------------------------- PLAY (یا انتظار برای پایان حریف) -----------------------------
  const totalSecs = Math.ceil(timeLeft / 1000);
  const ring = 2 * Math.PI * 26;
  const qProgress = timeLeft / PER_Q_MS;
  const myAnswered = me?.answered ?? 0;
  const myCorrect = me?.correct ?? 0;

  return (
    <div className="space-y-4">
      {/* بنر خروج حریف */}
      {oppLeft && phase === "play" && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-center text-[12.5px] font-bold text-rose-700"
        >
          حریف وسط نبرد قطع شد — اگر تا پایان مهلت برنگردد، برد با ضربهٔ فنی ثبت می‌شود.
        </motion.div>
      )}

      {/* HUD دو نفره */}
      <div className="duel-hud rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { p: me, label: "تو", isMe: true },
            { p: opp, label: "حریف", isMe: false },
          ].map(
            ({ p, label, isMe }) =>
              p && (
                <div key={p.sid} className={`rounded-xl border p-2.5 ${isMe ? "border-fuchsia-200 bg-fuchsia-50/60" : "border-stone-200 bg-stone-50/60"}`}>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-extrabold text-stone-700">
                      {label === "تو" ? label : p.name}
                    </span>
                    {p.done && <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />}
                    {p.disconnected && <WifiOff size={13} className="shrink-0 text-rose-400" />}
                    <span className="shrink-0 text-[15px] font-black text-stone-800">{faNum(p.score)}</span>
                  </div>
                  {/* خانه‌های پیشرفت */}
                  <div className="mt-2 flex gap-1" dir="ltr">
                    {Array.from({ length: total }).map((_, k) => {
                      const correctCount = p.correct;
                      const wrongCount = Math.max(0, p.answered - p.correct);
                      const cls =
                        k < correctCount
                          ? "bg-emerald-500"
                          : k < correctCount + wrongCount
                            ? "bg-rose-400"
                            : "bg-stone-200";
                      return <span key={k} className={`h-1.5 flex-1 rounded-full ${cls} ${k === p.qi && !p.done && !p.disconnected ? "animate-pulse bg-fuchsia-400" : ""}`} />;
                    })}
                  </div>
                  <div className="mt-1 text-[10.5px] font-bold text-stone-400">
                    {faNum(p.correct)} درست · سؤال {faNum(Math.min(p.qi + 1, total))} از {faNum(total)}
                  </div>
                </div>
              )
          )}
        </div>
      </div>

      {/* انتظار برای حریف پس از اتمام من */}
      {myDone && phase === "play" ? (
        <div className="duel-card rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <Loader2 size={34} className="mx-auto mb-3 animate-spin text-fuchsia-500" />
          <h2 className="mb-1 text-lg font-black text-stone-800">همهٔ سؤال‌هایت تمام شد!</h2>
          <p className="text-[13px] text-stone-500">منتظر حریف می‌مانیم تا مسابقه تمام شود…</p>
        </div>
      ) : (
        cur &&
        curQ && (
          <AnimatePresence mode="wait">
            <motion.div
              key={qi}
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.18 }}
              className={`duel-card rounded-2xl border-2 bg-white p-5 shadow-md sm:p-6 ${
                feedback === "right" ? "border-emerald-400" : feedback === "wrong" ? "border-rose-400" : "border-fuchsia-200"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-fuchsia-50 px-2.5 py-1 text-[11px] font-bold text-fuchsia-700">
                  {questionSourceLesson(curQ) === 0 ? "بانک ۳۶۰ تستی" : `درس ${questionSourceLesson(curQ) === 1 ? "اول" : questionSourceLesson(curQ) === 2 ? "دوم" : "سوم"}`}
                </span>
                {/* حلقهٔ زمان هر سؤال */}
                <div className={`relative h-12 w-12 ${totalSecs <= 5 ? "duel-time-low" : ""}`}>
                  <svg viewBox="0 0 60 60" className="h-full w-full -rotate-90">
                    <circle cx="30" cy="30" r="26" fill="none" strokeWidth="5" className="stroke-stone-100" />
                    <circle
                      cx="30"
                      cy="30"
                      r="26"
                      fill="none"
                      strokeWidth="5"
                      strokeLinecap="round"
                      className={`transition-[stroke-dashoffset] duration-100 ${totalSecs <= 5 ? "stroke-rose-500" : "stroke-fuchsia-500"}`}
                      strokeDasharray={ring}
                      strokeDashoffset={ring * (1 - qProgress)}
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-[13px] font-black ${totalSecs <= 5 ? "text-rose-600" : "text-fuchsia-600"}`}>
                    {faNum(totalSecs)}
                  </span>
                </div>
              </div>
              <p className="en-text mb-5 text-[16px] font-semibold leading-8 text-stone-800" dir="ltr">
                {curQ.question}
              </p>
              <div className="space-y-2.5" dir="ltr">
                {cur.perm.map((origIdx, i) => {
                  const isCorrect = feedback !== "none" && i === correctIdx;
                  const isWrong = feedback === "wrong" && picked === i;
                  return (
                    <button
                      key={i}
                      onClick={() => answer(i)}
                      disabled={feedback !== "none"}
                      data-duel-option={i}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all active:scale-[0.99] ${
                        isCorrect
                          ? "border-emerald-500 bg-emerald-50"
                          : isWrong
                            ? "border-rose-400 bg-rose-50"
                            : "border-stone-200 bg-white hover:border-fuchsia-300 hover:bg-fuchsia-50/50"
                      } ${feedback !== "none" && !isCorrect && !isWrong ? "opacity-50" : ""}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-black ${
                          isCorrect ? "bg-emerald-500 text-white" : isWrong ? "bg-rose-500 text-white" : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {isCorrect ? <CheckCircle2 size={14} /> : isWrong ? <XCircle size={14} /> : LETTERS[i]}
                      </span>
                      <span className="en-text text-[14.5px] font-medium text-stone-800">{curQ.options[origIdx]}</span>
                    </button>
                  );
                })}
              </div>

              {feedback === "wrong" && curQ.translation && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-xl bg-rose-50/70 p-3 text-[13px] leading-7 text-stone-600">
                  {curQ.translation}
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>
        )
      )}

      <p className="text-center text-[11px] font-bold text-stone-400" suppressHydrationWarning>
        امتیاز زنده: تو {faNum(myCorrect)} درست از {faNum(myAnswered)} — داوری روی سرور انجام می‌شود؛ تقلب ممکن نیست ⚔️
      </p>
    </div>
  );
}
