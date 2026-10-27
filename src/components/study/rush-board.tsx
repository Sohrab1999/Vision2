"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Zap, Flame, Medal, UserRound, RefreshCcw, ShieldCheck } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { usePolling } from "@/hooks/use-polling";
import Podium from "./shared/podium";
import { faNum, timeAgoFa } from "@/lib/study-theme";
import { avatarClasses } from "@/lib/study-theme";

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

export default function RushBoard({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<RushRow[] | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const userId = useStudy((s) => s.userId);
  const mounted = useMounted();
  // alive-guard: a response that lands after unmount/refresh must not setState
  const aliveRef = useRef(true);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const load = useCallback(() => {
    fetch("/api/rush-leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (!aliveRef.current) return;
        setRows(Array.isArray(d.learners) ? d.learners : []);
        setTotalPlayers(d.totalPlayers ?? 0);
      })
      .catch(() => {});
  }, []);

  // Phase-2 «تجربه» — adaptive polling: skip while the tab is hidden and
  // refresh immediately when the learner comes back (usePolling گام ۶)
  usePolling(load, 30_000);
  // immediate refresh when a rush round ends (refreshKey bump)
  useEffect(() => {
    load();
  }, [refreshKey, load]);

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
      <div className="rush-board-strip flex items-center justify-between gap-2 border-b border-orange-100 bg-gradient-to-l from-orange-50 via-amber-50 to-transparent px-4 py-3">
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

      {/* podium — shared component (variant: orange, rush shows the rank label) */}
      <Podium
        rows={top3}
        meId={userId}
        variant="orange"
        showLabel
        metric={(row) => (
          <span title="بهترین امتیاز">
            <Zap size={12} />
            {faNum(row.bestScore)}
          </span>
        )}
      />

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
        <div className="rush-board-hint border-t border-orange-100 bg-gradient-to-l from-orange-50/60 to-transparent px-4 py-2.5 text-center text-[11.5px] font-bold text-stone-500">
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
