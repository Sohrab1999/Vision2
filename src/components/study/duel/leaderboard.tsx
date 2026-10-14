"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Trophy, Medal, UserRound, ShieldCheck, Swords, Flame } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { usePolling } from "@/hooks/use-polling";
import Podium from "../shared/podium";
import AvatarDot from "../shared/avatar-dot";
import { faNum } from "@/lib/study-theme";

interface LeaderRow {
  userId: string;
  name: string;
  color: string;
  attempts: number;
  avgPercent: number;
  bestPercent: number;
}

interface DuelerRow {
  userId: string;
  name: string;
  color: string;
  duels: number;
  wins: number;
  losses: number;
  ties: number;
  /** Task 95 — wins carrying the judge's HMAC receipt (subset of wins). */
  verifiedWins: number;
  bestScore: number;
  avgPercent: number;
  winRate: number;
}

type Tab = "exams" | "duels";

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const [duelers, setDuelers] = useState<DuelerRow[] | null>(null);
  const [duelsTotal, setDuelsTotal] = useState(0);
  const [tab, setTab] = useState<Tab>("exams");
  const userId = useStudy((s) => s.userId);
  const userName = useStudy((s) => s.userName);
  const mounted = useMounted();
  // alive-guard: a response that lands after unmount must not setState
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const load = useCallback(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (!aliveRef.current) return;
        if (Array.isArray(d.learners)) setRows(d.learners);
        if (Array.isArray(d.duelers)) setDuelers(d.duelers);
        if (Number.isFinite(d.duelsTotal)) setDuelsTotal(d.duelsTotal);
      })
      .catch(() => {});
  }, []);

  // Phase-2 «تجربه» — adaptive polling: skip while the tab is hidden and
  // refresh immediately when the learner comes back (usePolling گام ۶)
  usePolling(load, 30_000);

  if (!mounted || !rows || !duelers) return null;

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3, 8);
  const meInTop = userId && top3.some((r) => r.userId === userId);

  const duelTop3 = duelers.slice(0, 3);
  const duelRest = duelers.slice(3, 8);
  const meInDuelTop = userId && duelTop3.some((r) => r.userId === userId);
  const meDueler = userId ? duelers.find((d) => d.userId === userId) : undefined;

  const openProfile = () => window.dispatchEvent(new CustomEvent("open-profile"));
  const openDuel = () => window.dispatchEvent(new CustomEvent("open-duel"));

  const tabBtn = (key: Tab, label: string, Icon: typeof Trophy, activeCls: string) => {
    const active = tab === key;
    return (
      <button
        role="tab"
        aria-selected={active}
        onClick={() => setTab(key)}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12.5px] font-extrabold transition-[background-color,color,border-color,box-shadow] ${
          active ? `bg-white shadow-md ${activeCls}` : "text-stone-500 hover:text-stone-700"
        }`}
      >
        <Icon size={15} aria-hidden />
        {label}
      </button>
    );
  };

  const recordBadge = (d: DuelerRow) => (
    <span className="flex shrink-0 items-center gap-1 font-mono text-[11.5px] font-bold" dir="ltr">
      <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-emerald-700">{faNum(d.wins)}W</span>
      {/* Task 95 — judge-attested wins (Task 94 receipts); honest subset display:
          shows HOW MANY of the wins carry the :3003 judge's HMAC receipt. */}
      {d.verifiedWins > 0 && (
        <span
          title={`${faNum(d.verifiedWins)} بردِ داورگواه — با رسیدِ امضاشدهٔ سرور`}
          className="flex items-center gap-0.5 rounded-md border border-emerald-200 bg-emerald-50/60 px-1 py-0.5 text-emerald-700"
        >
          <ShieldCheck size={11} aria-hidden />
          <span className="text-[10.5px] font-black">{faNum(d.verifiedWins)}</span>
        </span>
      )}
      <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-rose-700">{faNum(d.losses)}L</span>
      {d.ties > 0 && (
        <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-stone-600">{faNum(d.ties)}T</span>
      )}
    </span>
  );

  return (
    <section
      aria-label="جدول امتیازات کلاس"
      className={`leaderboard ${tab === "duels" ? "duel-mode" : ""}`}
    >
      <div className="mb-4 flex items-end justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
          {tab === "exams" ? (
            <Trophy size={19} className="text-amber-500" />
          ) : (
            <Swords size={19} className="text-fuchsia-600" />
          )}
          {tab === "exams" ? "جدول امتیازات کلاس" : "رتبه‌بندی نبردها"}
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-stone-500">
          <ShieldCheck size={13} className="text-emerald-600" aria-hidden />
          {tab === "duels" ? (
            <>
              <span className="hidden sm:inline">بردها با رسیدِ امضاشدهٔ داور تأیید می‌شوند</span>
              <span className="sm:hidden">داورگواه</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">نمرات تأییدشدهٔ سمت سرور</span>
              <span className="sm:hidden">تأییدشده</span>
            </>
          )}
        </span>
      </div>

      {/* Task-36 — dimension switcher */}
      <div
        role="tablist"
        aria-label="انتخاب نوع جدول"
        className="mb-4 flex w-full rounded-full border border-stone-200 bg-stone-100/80 p-1"
      >
        {tabBtn("exams", "نمرات آزمون", Trophy, "text-amber-600")}
        {tabBtn("duels", "نبردهای دودنفره", Swords, "text-fuchsia-700")}
      </div>

      {tab === "exams" ? (
        rows.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-stone-300 c-veil-60 p-8 text-center">
            <Medal size={28} className="mx-auto mb-2 text-stone-300" />
            <p className="text-sm font-bold text-stone-500">
              هنوز کسی در جدول نیست — اولین نفر باش!
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border c-card shadow-sm">
            {/* podium — shared component (variant: amber) */}
            <Podium
              rows={top3}
              meId={userId}
              variant="amber"
              metric={(row) => (
                <>
                  {faNum(row.avgPercent)}٪ میانگین
                </>
              )}
            />

            {/* ranks 4+ */}
            {rest.length > 0 && (
              <ul className="divide-y divide-stone-100 px-2 py-1">
                {rest.map((row, i) => {
                  const isMe = row.userId === userId;
                  return (
                    <li
                      key={row.userId}
                      className={`flex items-center gap-3 rounded-xl px-2.5 py-2.5 ${isMe ? "bg-emerald-50 ring-1 ring-emerald-200" : ""}`}
                    >
                      <span className="w-6 shrink-0 text-center text-[13px] font-black text-stone-500">
                        {faNum(i + 4)}
                      </span>
                      <AvatarDot color={row.color} name={row.name} size={30} />
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-stone-700">
                        {row.name}
                        {isMe && <span className="mr-1.5 text-[10px] font-black text-emerald-600">(شما)</span>}
                      </span>
                      <span className="hidden text-[11px] text-stone-500 sm:block">
                        {faNum(row.attempts)} آزمون
                      </span>
                      <span className="w-14 shrink-0 text-left text-[13px] font-black text-stone-800">
                        {faNum(row.avgPercent)}٪
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )
      ) : duelers.length === 0 ? (
        /* ---------- duel empty state ---------- */
        <div className="rounded-2xl border-2 border-dashed border-fuchsia-200 bg-fuchsia-50/40 p-8 text-center">
          <Swords size={28} className="mx-auto mb-2 text-fuchsia-300" />
          <p className="text-sm font-bold text-stone-600">هنوز نبردی ثبت نشده — تاریخ‌ساز باش!</p>
          <p className="mt-1 text-[12px] leading-5 text-stone-500">
            دو نفر با هم روی یک کتاب ۱۰ سؤال مسابقه می‌دهند؛ هر برد در همین جدول می‌درخشد.
          </p>
          <button
            onClick={openDuel}
            className="mx-auto mt-4 flex items-center justify-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-2.5 text-[13px] font-extrabold text-white shadow-md shadow-fuchsia-600/25 transition-[background-color,color,border-color,box-shadow,transform] hover:bg-fuchsia-700 active:scale-[0.96]"
          >
            <Swords size={15} aria-hidden />
            شروع اولین نبرد
          </button>
        </div>
      ) : (
        /* ---------- duel standings ---------- */
        <div className="overflow-hidden rounded-2xl border border-fuchsia-200 bg-white shadow-sm">
          {/* podium — shared component (variant: fuchsia) */}
          <Podium
            rows={duelTop3}
            meId={userId}
            variant="fuchsia"
            metric={(row) => (
              <>
                {faNum(row.wins)} برد از {faNum(row.duels)} نبرد
                {row.verifiedWins > 0 && (
                  <ShieldCheck
                    size={12}
                    aria-label="داورگواه"
                    // 700 نه ۶۰۰ — قاعدهٔ تاریکِ سراسریِ 700 (#6ee7b7) را می‌گیرد و
                    // با جوهرِ چیپ‌های ردیف هم‌خانواده می‌شود (قاعدهٔ 600 اسکوپ‌دار است)
                    className="mr-1 inline text-emerald-700"
                  />
                )}
              </>
            )}
          />
          {duelsTotal > 0 && (
            <p className="mt-3 text-center text-[11px] font-bold text-stone-500">
              تاکنون {faNum(duelsTotal)} نبرد در کلاس برگزار شده
            </p>
          )}

          {duelRest.length > 0 && (
            <ul className="divide-y divide-stone-100 px-2 py-1">
              {duelRest.map((row, i) => {
                const isMe = row.userId === userId;
                return (
                  <li
                    key={row.userId}
                    className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 sm:gap-3 ${isMe ? "bg-fuchsia-50 ring-1 ring-fuchsia-200" : ""}`}
                  >
                    <span className="w-6 shrink-0 text-center text-[13px] font-black text-stone-500">
                      {faNum(i + 4)}
                    </span>
                    <AvatarDot color={row.color} name={row.name} size={30} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-stone-700">
                      {row.name}
                      {isMe && <span className="mr-1.5 text-[10px] font-black text-fuchsia-600">(شما)</span>}
                    </span>
                    {recordBadge(row)}
                    <span className="w-12 shrink-0 text-left text-[12px] font-black text-stone-700">
                      {faNum(row.winRate)}٪
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {meDueler && (
            <div className="flex items-center justify-center gap-2 border-t border-fuchsia-100 bg-fuchsia-50/50 px-4 py-3">
              <Flame size={14} className="text-fuchsia-600" aria-hidden />
              <p className="text-[12px] font-bold text-stone-600">
                رکورد تو: {faNum(meDueler.wins)} برد · {faNum(meDueler.losses)} باخت
                {meDueler.ties > 0 && <> · {faNum(meDueler.ties)} مساوی</>} — نرخ برد {faNum(meDueler.winRate)}٪
              </p>
            </div>
          )}
        </div>
      )}

      {/* CTA for unnamed users (exam standings only) */}
      {tab === "exams" && mounted && !userName && (
        <button
          onClick={openProfile}
          className="name-cta mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-gradient-to-l from-emerald-50 to-teal-50 p-4 text-right shadow-sm transition-[background-color,color,border-color,box-shadow,transform] hover:shadow-md active:scale-[0.96]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-900/25">
              <UserRound size={18} />
            </span>
            <span>
              <span className="block text-[13px] font-extrabold text-stone-800">
                دیده شو! نام خود را انتخاب کن
              </span>
              <span className="block text-[11.5px] text-stone-500">
                با انتخاب نام، نتیجهٔ آزمون‌هایت در جدول امتیازات و فید کلاس نمایش داده می‌شود
              </span>
            </span>
          </span>
          <span className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-[12px] font-bold text-white shadow-md shadow-emerald-600/25">
            انتخاب نام
          </span>
        </button>
      )}
      {tab === "exams" && meInTop && mounted && (
        <p className="mt-3 text-center text-[12px] font-bold text-amber-700">
          🎉 تو جزو ۳ نفر برتر کلاس هستی — جایگاهت را حفظ کن!
        </p>
      )}
      {tab === "duels" && meInDuelTop && mounted && (
        <p className="mt-3 text-center text-[12px] font-bold text-fuchsia-700">
          ⚔️ تو جزو شکارچیان سکوی نبردها هستی — شمشیرت را تیز نگه دار!
        </p>
      )}
    </section>
  );
}
