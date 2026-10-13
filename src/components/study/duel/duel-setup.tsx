"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Swords, Users, Timer, Zap, Wifi, WifiOff, Loader2, Target, ShieldCheck, History, Flame, Percent, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum, timeAgoFa, avatarClasses } from "@/lib/study-theme";
import { percent } from "@/lib/domain/percent";
import {
  duelWinStreak,
  duelBestScore,
  duelForm,
  duelVerifiedCount,
  filterDuelLedger,
  duelLedgerDigest,
  normalizeDuelQuery,
  sortDuelLedger,
  type DuelOutcome,
  type DuelLedgerOutcomeFilter,
  type DuelLedgerSortKey,
} from "@/lib/duel-history";
import type { Conn } from "./duel-types";

// فاز SETUP — قهرمان نبرد: آمار بردها، ساخت اتاق و پیوستن با کد

export default function DuelSetup({ conn, createRoom, joinRoom, joinInput, setJoinInput, joinBusy }: {
  conn: Conn;
  createRoom: () => void;
  joinRoom: () => void;
  joinInput: string;
  setJoinInput: (v: string) => void;
  joinBusy: boolean;
}) {
  const mounted = useMounted();
  const duelWins = useStudy((s) => s.duelWins);
  const duelLosses = useStudy((s) => s.duelLosses);
  const duelTies = useStudy((s) => s.duelTies);
  const duelHistory = useStudy((s) => s.duelHistory);

  const winRate = percent(duelWins, duelWins + duelLosses + duelTies);
  const streak = duelWinStreak(duelHistory);
  const best = duelBestScore(duelHistory);
  const form = duelForm(duelHistory, 5);
  // Task 96 — زیرمجموعهٔ صادق: چند نبردِ دفترچه رسیدِ امضاشدهٔ داور دارند
  const verified = duelVerifiedCount(duelHistory);
  // Task 98 — دفترچهٔ قابلِ کاویدن: جست‌وجوی حریف + فیلترِ نتیجه + فقطِ داورگواه؛
  // Task 100 — «دفترچهٔ مرتب»: سه کلیدِ مرتب‌سازی روی نتیجهٔ فیلتر (ANDِ ابزارها)
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState<DuelLedgerOutcomeFilter>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<DuelLedgerSortKey>("newest");
  const [expanded, setExpanded] = useState(false);
  const filtered = filterDuelLedger(duelHistory, { query, outcome, verifiedOnly });
  // جست‌وجو/فیلتر = «کدام‌ها»؛ مرتب‌سازی = «با چه ترتیبی» — دو ابزارِ مستقل که
  // ترکیب می‌شوند. هرکدام فعال باشد، نمایش به «همهٔ یافته‌ها» باز می‌شود
  // (قراردادِ ۹۸): مرتب‌کردنِ پنج‌تایِ بریده بی‌معناست.
  const isSearching = normalizeDuelQuery(query) !== "" || outcome !== "all" || verifiedOnly;
  const isSorting = sortKey !== "newest";
  const isCaving = isSearching || isSorting;
  const rows = isCaving
    ? sortDuelLedger(filtered, sortKey)
    : expanded
      ? duelHistory
      : duelHistory.slice(0, 5);
  const digest = duelLedgerDigest(rows);
  const clearFilters = () => {
    setQuery("");
    setOutcome("all");
    setVerifiedOnly(false);
    setSortKey("newest");
  };
  const outcomeChip: Record<DuelOutcome, string> = {
    win: "bg-emerald-500",
    loss: "bg-rose-500",
    tie: "bg-amber-500",
  };
  const outcomeLabel: Record<DuelOutcome, string> = { win: "برد", loss: "باخت", tie: "مساوی" };

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

      {/* Task 65 — تاریخچهٔ نبردها: خلاصه + فرم + ۵ رکورد آخر */}
      {mounted && duelHistory.length > 0 && (
        <section className="duel-card rounded-2xl border border-stone-200 c-card-elevated p-5 shadow-sm" aria-label="تاریخچهٔ نبردها">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[14px] font-extrabold text-stone-700">
              <History size={17} className="text-fuchsia-600" />
              آخرین نبردها
              <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-black text-stone-400">
                {faNum(duelHistory.length)} نبرد
              </span>
            </h2>
            <div className="flex items-center gap-1.5" role="img" aria-label="فرم پنج نبرد آخر">
              {form.map((o, i) => (
                <span
                  key={`${form.length - i}-${i}`}
                  title={outcomeLabel[o]}
                  className={`h-2.5 w-2.5 rounded-full ${outcomeChip[o]} ${i === 0 ? "ring-2 ring-stone-200 ring-offset-1" : ""}`}
                />
              ))}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {[
              { icon: Percent, label: "نرخ برد", value: `${faNum(winRate)}٪` },
              { icon: Flame, label: "برد متوالی", value: faNum(streak) },
              { icon: Zap, label: "بهترین امتیاز", value: faNum(best) },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-stone-100 c-stone-70 p-2.5 text-center">
                <m.icon size={14} className="mx-auto mb-1 text-fuchsia-600" aria-hidden />
                <div className="text-[15px] font-black text-stone-800">{m.value}</div>
                <div className="text-[10.5px] font-bold text-stone-400">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Task 98 — نوارِ کاویدن: جست‌وجوی نامِ حریف + چیپ‌های نتیجه + فقطِ داورگواه */}
          <div className="mb-3 space-y-2.5">
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جست‌وجوی نام حریف…"
                aria-label="جست‌وجو در تاریخچهٔ نبردها"
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-9 text-[12.5px] font-bold text-stone-800 outline-none transition-colors placeholder:text-stone-400 focus:border-fuchsia-400"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="پاک‌کردن جست‌وجو"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                >
                  <X size={13} aria-hidden />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  ["all", "همه"],
                  ["win", "برد"],
                  ["loss", "باخت"],
                  ["tie", "مساوی"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setOutcome(k)}
                  aria-pressed={outcome === k}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition-colors ${
                    outcome === k
                      ? "bg-fuchsia-600 text-white"
                      : "border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="mx-0.5 h-4 w-px bg-stone-200" aria-hidden />
              <button
                onClick={() => setVerifiedOnly((v) => !v)}
                aria-pressed={verifiedOnly}
                title="فقط نبردهایی که رسیدِ امضاشدهٔ داور دارند"
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-black transition-colors ${
                  verifiedOnly
                    ? "border border-emerald-200 bg-emerald-50/60 text-emerald-700"
                    : "border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100"
                }`}
              >
                <ShieldCheck size={12} aria-hidden />
                فقط داورگواه
              </button>
              {isSearching && (
                <button
                  onClick={clearFilters}
                  className="ms-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black text-fuchsia-600 transition-colors hover:bg-stone-100"
                >
                  <X size={12} aria-hidden />
                  پاک‌کردن فیلترها
                </button>
              )}
            </div>
            {/* Task 100 — مرتب‌سازیِ دفترچه: سه کلید با همان دستورِ چیپ‌های نتیجه؛
                مرتب‌سازی روی نتیجهٔ فیلتر اعمال می‌شود (ترکیبِ ابزارها) */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="مرتب‌سازی نبردها">
              <span className="text-[10.5px] font-black text-stone-400">ترتیب:</span>
              {(
                [
                  ["newest", "جدیدترین"],
                  ["myScore", "بیشترین امتیاز"],
                  ["margin", "بیشترین اختلاف"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setSortKey(k)}
                  aria-pressed={sortKey === k}
                  title={
                    k === "newest"
                      ? "ترتیبِ همیشگی: تازه‌ترین نبرد بالا"
                      : k === "myScore"
                        ? "نبردهایی که بیشترین امتیازِ شخصی را گرفتی"
                        : "نبردها بر اساس اختلافِ امتیاز با حریف — سنگین‌ترین‌ها بالا"
                  }
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition-colors ${
                    sortKey === k
                      ? "bg-fuchsia-600 text-white"
                      : "border border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100"
                  }`}
                >
                  {label}
                </button>
              ))}
              {isSorting && !isSearching && (
                <button
                  onClick={clearFilters}
                  className="ms-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black text-fuchsia-600 transition-colors hover:bg-stone-100"
                >
                  <X size={12} aria-hidden />
                  پاک‌کردن فیلترها
                </button>
              )}
            </div>
            {isSearching && (
              <p className="text-[11px] font-bold text-stone-400" role="status">
                {faNum(rows.length)} نبرد یافت شد · {faNum(digest.win)} برد، {faNum(digest.loss)} باخت، {faNum(digest.tie)} مساوی
              </p>
            )}
          </div>

          <div className="space-y-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/70 p-3 transition-colors hover:bg-stone-100/70"
              >
                <span className={`shrink-0 rounded-lg px-2 py-1 text-[10.5px] font-black text-white ${outcomeChip[r.outcome]}`}>
                  {outcomeLabel[r.outcome]}
                </span>
                {/* Task 96 — سپرِ داورگواه روی ردیف‌های دفترچه (خانوادهٔ ۹۴/۹۵:
                    bg-emerald-50/60 + text-emerald-700 + border-emerald-200 —
                    هر دو کلاس قانونِ تاریکِ سراسری دارند، صفر CSS تازه) */}
                {r.receiptSig && (
                  <span
                    role="img"
                    aria-label="داورگواه"
                    title="رسیدِ امضاشدهٔ داور — این نبرد با امضای سرور تأیید شد"
                    className="flex shrink-0 items-center rounded-md border border-emerald-200 bg-emerald-50/60 px-1 py-0.5 text-emerald-700"
                  >
                    <ShieldCheck size={11} aria-hidden />
                  </span>
                )}
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${avatarClasses[r.opponentColor] ?? "bg-stone-400"}`}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[12.5px] font-extrabold text-stone-800">{r.opponent}</span>
                    {r.reason === "forfeit" && (
                      <span className="shrink-0 rounded-md bg-stone-200 px-1.5 py-0.5 text-[9.5px] font-black text-stone-600">ضربهٔ فنی</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] font-bold text-stone-400">
                    {faNum(r.myCorrect)} از {faNum(Math.max(r.answered, r.total))} درست · {faNum(r.durationSec)} ثانیه
                  </div>
                </div>
                <div className="shrink-0 text-left">
                  <div className="text-[13.5px] font-black text-stone-800" dir="ltr">
                    {faNum(r.myScore)}–{faNum(r.oppScore)}
                  </div>
                  <div className="text-[10.5px] font-bold text-stone-400">{timeAgoFa(r.day)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Task 98 — حالتِ خالیِ فیلتر: پیامِ صادق + خروجِ یک‌ضربه‌ای؛
              مرتب‌سازیِ تنها هیچ‌وقت خالی نمی‌شود (دیتا همان است، ترتیب عوض می‌شود) */}
          {isSearching && rows.length === 0 && (
            <div className="mt-3 rounded-xl border border-dashed border-stone-300 py-6 text-center">
              <Search size={18} className="mx-auto mb-2 text-stone-300" aria-hidden />
              <p className="mb-2.5 text-[12px] font-bold text-stone-400">نبردی با این مشخصات پیدا نشد.</p>
              <button
                onClick={clearFilters}
                className="rounded-lg bg-stone-100 px-3 py-1.5 text-[11px] font-black text-stone-600 transition-colors hover:bg-stone-200"
              >
                پاک‌کردن فیلترها
              </button>
            </div>
          )}

          {/* Task 96 — پانوشتِ زیرمجموعهٔ صادق (الگوی تسک ۹۵): نیمی‌داورگواه
              باید نیمی دیده شود؛ فقط وقتی دست‌کم یک رسید هست رندر می‌شود */}
          {verified > 0 && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-stone-400">
              {/* 700 نه ۶۰۰ — قاعدهٔ تاریکِ سراسریِ 700 را می‌گیرد (قاعدهٔ 600 اسکوپ‌دار است) */}
              <ShieldCheck size={12} className="text-emerald-700" aria-hidden />
              <span>
                {faNum(verified)} از {faNum(duelHistory.length)} نبردِ دفترچه با رسیدِ امضاشدهٔ داور تأیید می‌شود
              </span>
            </p>
          )}

          {/* Task 98 — بازکردنِ دفترچه: جملهٔ ثابتِ «قدیمی‌تر» حالا دکمه است؛
              با کاویدنِ فعال (فیلتر یا مرتب‌سازی) همهٔ یافته‌ها خودکار رندر می‌شوند */}
          {!isCaving && duelHistory.length > 5 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 py-2 text-[11.5px] font-black text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600"
            >
              {expanded ? <ChevronUp size={13} aria-hidden /> : <ChevronDown size={13} aria-hidden />}
              {expanded ? "نمایش کمتر" : `نمایش همهٔ ${faNum(duelHistory.length)} نبرد`}
            </button>
          )}
        </section>
      )}

      {/* چطور کار می‌کند؟ */}
      <section className="duel-card rounded-2xl border border-stone-200 c-card-elevated p-5 shadow-sm">
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
            <div key={r.title} className="rounded-xl border border-stone-100 c-stone-70 p-3.5">
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
