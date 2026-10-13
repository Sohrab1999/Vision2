"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { QuizQuestion } from "@/lib/study-types";
import { useStudy } from "@/lib/study-store";
import { percent as percentOf } from "@/lib/domain/percent";
import { useCountdown } from "@/hooks/use-countdown";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { sendStats } from "@/lib/identity";
import { duelDisplayName } from "@/lib/duel-receipt";
import { buildDuelRecord } from "@/lib/duel-history";
import {
  buildDuelBank,
  type Conn,
  type DuelQ,
  type EndPayload,
  type Feedback,
  type Phase,
  type PublicPlayer,
} from "./duel-types";
import { DEFAULT_PACE_MS, DUEL_PACES } from "@/lib/duel-pace";

// ------------------------------------------------------------------
// ماشین حالت کامل «نبرد دودنفره»: چرخهٔ سوکت، لابی، گیم‌پلی و ثبت نتیجه.
// تمام سطح دستوری (emit/timer/ref) اینجاست؛ نمای‌های فاز صرفاً رندرند.
// ------------------------------------------------------------------

export interface DuelMachine {
  conn: Conn;
  phase: Phase;
  roomCode: string | null;
  players: PublicPlayer[];
  mySid: string | null;
  joinInput: string;
  setJoinInput: (v: string) => void;
  joinBusy: boolean;
  /** Task 107 — ریتمِ برگزیدهٔ لابی (فقط در فازِ setup قابلِ تغییر) */
  chosenPace: number;
  paceChoices: typeof DUEL_PACES;
  choosePace: (ms: number) => void;
  /** ریتمِ مؤثر — داور در duel:state/duel:start می‌فرستد؛ تایمرِ play ملاکِ همین است */
  paceMs: number;
  createRoom: () => void;
  joinRoom: () => void;
  leaveRoom: () => void;
  copyCode: () => void;
  countdownLeft: number;
  me: PublicPlayer | null;
  opp: PublicPlayer | null;
  oppConnected: boolean;
  endData: EndPayload | null;
  myFinishAt: number;
  rematch: () => void;
  rematchVotes: number;
  oppLeft: boolean;
  total: number;
  qi: number;
  picked: number;
  feedback: Feedback;
  myDone: boolean;
  cur: DuelQ | null;
  curQ: QuizQuestion | null;
  correctIdx: number;
  answer: (i: number) => void;
  timeLeft: number;
}

export function useDuelSocket(): DuelMachine {
  const { toast } = useToast();

  // ----------------------------- اتصال -----------------------------
  const socketRef = useRef<Socket | null>(null);
  const [conn, setConn] = useState<Conn>("connecting");
  const [phase, setPhase] = useState<Phase>("setup");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PublicPlayer[]>([]);
  const [mySid, setMySid] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);
  // Task 107 «ریتمِ نبرد» — دو عددِ جداشده، دو نقشِ جداشده:
  //  • chosenPace: انتخابِ کاربر در لابی (به duel:create سفر می‌کند)
  //  • paceMs: ریتمِ مؤثر — فقط داور آن را تعیین می‌کند (duel:state در لابی
  //    و duel:start در شروع). کلاینتِ بی‌انتخاب هم پیش‌فرضِ ۱۵ثانیه را می‌فرستد
  //    و سرویسِ قدیمیِ بی‌فیلد هم همین پیش‌فرض را می‌ماند — نه صفر، نه NaN.
  const [chosenPace, setChosenPace] = useState(DEFAULT_PACE_MS);
  const [paceMs, setPaceMs] = useState(DEFAULT_PACE_MS);
  const [countdownMs, setCountdownMs] = useState(0);
  const [countdownSeq, setCountdownSeq] = useState(0);
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
  const [myDone, setMyDone] = useState(false);

  const bank = useMemo(() => buildDuelBank(), []);

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
  const myFinishAtRef = useRef(myFinishAt);
  useEffect(() => {
    myFinishAtRef.current = myFinishAt;
  }, [myFinishAt]);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // شمارش معکوس لابی تا شروع مسابقه — رویدادسوختگی سوکت با restartKey (گام ۶)
  const countdownLeft = useCountdown({
    duration: countdownMs,
    active: phase === "countdown",
    tickMs: 100,
    restartKey: countdownSeq,
  });

  // ----------------------------- پایان مسابقه -----------------------------
  const persistResult = useCallback(
    (end: EndPayload, sid: string) => {
      if (persistedRef.current) return;
      persistedRef.current = true;
      const mine = end.players.find((p) => p.sid === sid);
      if (!mine) return;
      const store = useStudy.getState();
      const outcome: "win" | "loss" | "tie" = end.winner === null ? "tie" : end.winner === sid ? "win" : "loss";
      // Task 65 — علاوه بر شمارنده‌ها، رکورد کامل نبرد به دفترچهٔ «تاریخچهٔ نبردها» می‌رود
      // Task 96 — sig رسیدِ داور هم داخلِ رکورد می‌نشیند تا دفترچه هم «داورگواه» را نشان دهد
      const record = buildDuelRecord(end, sid, Date.now(), myFinishAtRef.current, end.receipt?.sig);
      store.recordDuelOutcome(outcome, record ?? undefined);
      store.trackQuizDone();
      trackEvent("duel_done");
      const percent = percentOf(mine.correct, end.total);
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
        // Task 94 «رسیدِ داوری» — outcome without the judge's HMAC receipt is
        // rejected server-side; duelName lets the API find THIS player inside
        // the receipt (mirrors the service's readProfile slicing exactly).
        sendStats({
          lesson: 0,
          category: "duel",
          total: Math.max(mine.answered, end.total),
          correct: mine.correct,
          score: mine.score,
          outcome,
          receipt: end.receipt,
          duelName: duelDisplayName(useStudy.getState().userName),
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
    // Task 105 — polling-first (socket.io's own default order): the ws handshake
    // must never gate the connection. In the dev sandbox the local rewrite
    // (next.config.ts) bridges /socket.io but hangs the ws UPGRADE — a hanging
    // upgrade stalls a websocket-first client for its full 10s timeout, while
    // polling connects instantly and the ws upgrade is then a graceful
    // best-effort probe (fail → stay on polling, session unaffected).
    // Production gateway routes both transports identically, so this order is
    // safe there too.
    const s = io("/?XTransformPort=3003", {
      transports: ["polling", "websocket"],
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
    const onState = (st: { code: string; status: string; perQMs?: number; players: PublicPlayer[] }) => {
      setPlayers(st.players);
      setRoomCode(st.code);
      // Task 107 — ریتمِ اتاق از داور می‌آید؛ سرویسِ قدیمیِ بی‌فیلد نادیده (پیش‌فرض می‌ماند)
      if (typeof st.perQMs === "number") setPaceMs(st.perQMs);
      // اگر حریف حین شمارش معکوس رفت، سرور اتاق را به لابی برمی‌گرداند
      if (phaseRef.current === "countdown" && st.status === "lobby") {
        setPhase("waiting");
        toast({ title: "حریف اتاق را ترک کرد", description: "منتظر بازیکن بعدی…", duration: 3500 });
      }
    };
    const onCountdown = (p: { ms: number }) => {
      setOppLeft(false);
      setRematchVotes(0);
      setCountdownMs(p.ms);
      setCountdownSeq((s) => s + 1);
      setPhase("countdown");
    };
    const onStart = (p: { perQMs: number; total: number; startedAt: number; questions: DuelQ[] }) => {
      endedRef.current = false;
      persistedRef.current = false;
      setQuestions(p.questions);
      setTotal(p.total);
      // Task 107 — تایمرِ سؤال فقط حرفِ داور را می‌شنود؛ سرویسِ قدیمیِ بی‌فیلد → پیش‌فرض
      setPaceMs(typeof p.perQMs === "number" ? p.perQMs : DEFAULT_PACE_MS);
      setQi(0);
      setPicked(-1);
      setFeedback("none");
      setMyDone(false);
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
      socketRef.current = null;
    };
  }, [handleEnd]);

  // ----------------------------- اقدامات لابی -----------------------------
  // Task 107 — انتخابِ ریتم فقط در setup؛ پس از آن عددِ داور مرجع است
  const choosePace = useCallback(
    (ms: number) => {
      if (phaseRef.current !== "setup") return;
      setChosenPace(ms);
      setPaceMs(ms); // پیش‌نمایشِ همان انتخاب در لابیِ خودم
    },
    []
  );

  const createRoom = useCallback(() => {
    const s = socketRef.current;
    if (!s || conn !== "online") return;
    const store = useStudy.getState();
    s.emit("duel:create", { name: store.userName || "یادگیرنده", color: store.avatarColor, perQMs: chosenPace }, (res: { ok: boolean; code?: string; state?: { players: PublicPlayer[] }; error?: string }) => {
      if (!res.ok) {
        toast({ title: "ساخت اتاق ناموفق بود", description: res.error, duration: 4000 });
        return;
      }
      setMySid(s.id ?? null);
      setRoomCode(res.code ?? null);
      setPlayers(res.state?.players ?? []);
      setPhase("waiting");
    });
  }, [conn, toast, chosenPace]);

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
      // SEC: ms گزارشی حذف شد — پاداش سرعت از تایمینگ مرجع-سرور می‌آید (scoring.ts)
      s.emit("duel:answer", { qi: qiRef.current, choice: i });
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        if (endedRef.current) return;
        setFeedback("none");
        setPicked(-1);
        const next = qiRef.current + 1;
        setQi(next);
        if (next >= total) {
          setMyDone(true);
          setMyFinishAt(Date.now());
        }
      }, ok ? 480 : 900);
    },
    [questions, total, bank]
  );

  // تایمر هر سؤال: ریتمِ مؤثرِ اتاق از داور (Task 107)؛ صفر شد = پاسخ خودکار غلط (-۱) — useCountdown گام ۶
  const timeLeft = useCountdown({
    duration: paceMs,
    active: phase === "play" && feedback === "none" && !myDone,
    tickMs: 100,
    onEnd: () => answer(-1),
  });

  // Task 106 «زمانِ فکر» — وقتی سؤال واقعاً رندر شد (ورود به play و هر
  // پیشرویِ qi) یک‌بار duel:seen می‌فرستیم؛ داور ساعتش را خودش می‌زند تا
  // پنجرهٔ دیدن→پاسخ گزارشِ صادقِ سرور باشد. امتیاز همچنان فقط از
  // qStartAtِ سرور محاسبه می‌شود — seen هیچ راهی به امتیاز ندارد.
  // qi پس از پاک‌کردن بازخورد جلو می‌رود؛ یعنی seen دقیقاً وقتی سؤالِ
  // بعدی نمایان شد شلیک می‌شود نه حینِ نمایشِ درست/غلط.
  useEffect(() => {
    if (phase !== "play") return;
    try {
      socketRef.current?.emit("duel:seen", { qi });
    } catch {
      /* ignore */
    }
  }, [phase, qi]);

  const rematch = useCallback(() => {
    const s = socketRef.current;
    if (!s || !oppConnected) return;
    s.emit("duel:rematch");
    setRematchVotes((v) => Math.max(v, 1));
    toast({ title: "درخواست نبرد دوباره فرستادیم ⚔️", description: "تا حریف هم تأیید کند…", duration: 3000 });
  }, [oppConnected, toast]);

  return {
    conn,
    phase,
    roomCode,
    players,
    mySid,
    joinInput,
    setJoinInput,
    joinBusy,
    chosenPace,
    paceChoices: DUEL_PACES,
    choosePace,
    paceMs,
    createRoom,
    joinRoom,
    leaveRoom,
    copyCode,
    countdownLeft,
    me,
    opp,
    oppConnected,
    endData,
    myFinishAt,
    rematch,
    rematchVotes,
    oppLeft,
    total,
    qi,
    picked,
    feedback,
    myDone,
    cur,
    curQ,
    correctIdx,
    answer,
    timeLeft,
  };
}
