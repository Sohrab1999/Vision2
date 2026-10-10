"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Flame, Medal, UserRound, RefreshCcw, ShieldCheck } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum, timeAgoFa } from "@/lib/study-theme";
import { avatarClasses } from "./header";

// ------------------------------------------------------------------
// RushBoard — class leaderboard for the 60s rush challenge.
// Reads best score per learner from /api/rush-leaderboard (DB).
// ------------------------------------------------------------------

interface RushRow {
  userId: string;
  name: string;
  color: string;
  bestScore: number;
  bestCorrect: number;
  bestPercent: number;
  games: number;
  lastAt: string | null;
}

const podiumOrder = [1, 0, 2]; // second, first, third
const podiumMeta = [
  { h: "h-16", grad: "from-amber-400 to-orange-500", medal: "🏆", ring: "ring-amber-400", label: "قهرمان چالش" },
  { h: "h-11", grad: "from-stone-300 to-stone-400", medal: "🥈", ring: "ring-stone-300", label: "دوم" },
  { h: "h-9", grad: "from-orange-200 to-orange-400", medal: "🥉", ring: "ring-orange-300", label: "سوم" },
];

export default function RushBoard({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<RushRow[] | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const userId = useStudy((s) => s.userId);
  const mounted = useMounted();

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/rush-leaderboard")
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          setRows(Array.isArray(d.learners) ? d.learners : []);
          setTotalPlayers(d.totalPlayers ?? 0);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [refreshKey]);

  if (!mounted || !rows) return null;
  if (rows.length === 0) return null; // keep the setup screen clean until someone plays

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3, 10);
  const meRow = userId ? rows.find((r) => r.userId === userId) : undefined;
  const meRank = meRow ? rows.indexOf(meRow) + 1 : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      aria-label="بهترین‌های چالش برق‌آسا"
      className="rush-board overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm"
    >
      {/* header */}
      <div className="flex items-center justify-between gap-2 border-b border-orange-100 bg-gradient-to-l from-orange-50 via-amber-50 to-transparent px-4 py-3">
        <h2 className="flex items-center gap-2 text-[15px] font-black text-stone-800">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-md shadow-orange-500/30">
            <Trophy size={15} />
          </span>
          بهترین‌های چالش برق‌آسا
        </h2>
        <span className="flex items-center gap-2">
          <span
            className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10.5px] font-bold text-emerald-700 sm:flex"
            title="ثبت نتایج با امضای سرور انجام می‌شود — قابل جعل نیست"
          >
            <ShieldCheck size={12} aria-hidden />
            امضاشده
          </span>
          <span className="rounded-full bg-orange-100/80 px-2.5 py-1 text-[10.5px] font-bold text-orange-700">
            {faNum(totalPlayers)} بازیکن
          </span>
        </span>
      </div>

      {/* podium */}
      <div className="rush-board-podium bg-gradient-to-b from-orange-50/50 to-transparent px-4 pb-3 pt-5">
        <div className="mx-auto flex max-w-sm items-end justify-center gap-3">
          {podiumOrder.map((rankIdx, i) => {
            const row = top3[rankIdx];
            if (!row) return <div key={i} className="flex-1" />;
            const meta = podiumMeta[rankIdx];
            const isMe = row.userId === userId;
            return (
              <motion.div
                key={row.userId}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <div className="relative mb-1.5">
                  {isMe && (
                    <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
                      شما
                    </span>
                  )}
                  <span className={`rounded-full ring-2 ${meta.ring} ring-offset-2`}>
                    <span
                      className={`flex items-center justify-center rounded-full font-black text-white shadow-md ${avatarClasses[row.color] ?? "bg-gradient-to-br from-stone-400 to-stone-600 shadow-stone-500/30"}`}
                      style={{ width: rankIdx === 0 ? 46 : 38, height: rankIdx === 0 ? 46 : 38, fontSize: rankIdx === 0 ? 17 : 14 }}
                    >
                      {row.name ? row.name.trim().charAt(0) : <UserRound size={18} />}
                    </span>
                  </span>
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm drop-shadow-sm">
                    {meta.medal}
                  </span>
                </div>
                <div className="mt-2.5 max-w-full truncate text-center text-[12px] font-extrabold text-stone-800">
                  {row.name}
                </div>
                <div className="flex items-center gap-1 text-[12px] font-black text-orange-600" title="بهترین امتیاز">
                  <Zap size={12} />
                  {faNum(row.bestScore)}
                </div>
                <div className="mb-1.5 text-[10px] font-bold text-stone-400">{meta.label}</div>
                <div
                  className={`w-full rounded-t-xl bg-gradient-to-b ${meta.grad} ${meta.h} flex items-start justify-center pt-1.5 shadow-inner`}
                >
                  <span className="text-base font-black text-white/90">{faNum(rankIdx + 1)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ranks 4+ */}
      {rest.length > 0 && (
        <ul className="divide-y divide-orange-50 px-2 py-1">
          {rest.map((row, i) => {
            const isMe = row.userId === userId;
            return (
              <li
                key={row.userId}
                className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${isMe ? "rush-board-me bg-orange-50 ring-1 ring-orange-200" : ""}`}
              >
                <span className="w-6 shrink-0 text-center text-[12.5px] font-black text-stone-400">
                  {faNum(i + 4)}
                </span>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white shadow-sm ${avatarClasses[row.color] ?? "bg-gradient-to-br from-stone-400 to-stone-600"}`}
                >
                  {row.name ? row.name.trim().charAt(0) : <UserRound size={13} />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold text-stone-700">
                  {row.name}
                  {isMe && <span className="mr-1.5 text-[10px] font-black text-emerald-600">(شما)</span>}
                  {row.lastAt && (
                    <span className="mr-1.5 hidden text-[10px] font-normal text-stone-400 sm:inline">
                      · {timeAgoFa(row.lastAt)}
                    </span>
                  )}
                </span>
                <span className="hidden items-center gap-1 text-[10.5px] text-stone-400 sm:flex" title="تعداد چالش‌ها">
                  <Flame size={11} />
                  {faNum(row.games)}
                </span>
                <span className="flex w-16 shrink-0 items-center justify-end gap-1 text-[13px] font-black text-orange-600">
                  <Zap size={12} />
                  {faNum(row.bestScore)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {/* my rank hint */}
      {mounted && (
        <div className="border-t border-orange-100 bg-gradient-to-l from-orange-50/60 to-transparent px-4 py-2.5 text-center text-[11.5px] font-bold text-stone-500">
          {meRow ? (
            meRank === 1 ? (
              <span className="text-amber-700">🏆 تو قهرمان چالش کلاس هستی — رکوردت را حفظ کن!</span>
            ) : meRank <= 3 ? (
              <span>
                تو روی سکو هستی (رتبهٔ {faNum(meRank)}) — {faNum(rows[0].bestScore - meRow.bestScore)} امتیاز تا قهرمانی
              </span>
            ) : (
              <span>
                رتبهٔ تو: <b className="text-orange-600">{faNum(meRank)}</b> با {faNum(meRow.bestScore)} امتیاز
                {meRow.userId !== rows[0].userId && (
                  <> — {faNum(rows[0].bestScore - meRow.bestScore)} امتیاز تا صدرنشینی</>
                )}
              </span>
            )
          ) : (
            <span>
              <RefreshCcw size={11} className="ml-0.5 inline rotate-180" /> یک چالش کامل کن تا نامت در جدول ثبت شود
            </span>
          )}
        </div>
      )}

      {/* invisible medal anchor for aria */}
      <span className="sr-only">
        <Medal /> جدول بهترین امتیازهای چالش برق‌آسا بین یادگیرندگان
      </span>
    </motion.section>
  );
}
