"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, UserRound, ShieldCheck } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { avatarClasses } from "./header";

interface LeaderRow {
  userId: string;
  name: string;
  color: string;
  attempts: number;
  avgPercent: number;
  bestPercent: number;
}

const podiumOrder = [1, 0, 2]; // second, first, third
const podiumMeta = [
  { h: "h-20", medal: "🥇", ring: "ring-amber-400", grad: "from-amber-300 to-amber-500", label: "قهرمان" },
  { h: "h-14", medal: "🥈", ring: "ring-stone-300", grad: "from-stone-200 to-stone-400", label: "دوم" },
  { h: "h-11", medal: "🥉", ring: "ring-orange-300", grad: "from-orange-200 to-orange-400", label: "سوم" },
];

function AvatarDot({ color, name, size = 36 }: { color: string; name: string; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-black text-white shadow-md ${avatarClasses[color] ?? "bg-gradient-to-br from-stone-400 to-stone-600 shadow-stone-500/30"}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {name ? name.trim().charAt(0) : <UserRound size={size * 0.5} />}
    </span>
  );
}

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderRow[] | null>(null);
  const userId = useStudy((s) => s.userId);
  const userName = useStudy((s) => s.userName);
  const mounted = useMounted();

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/leaderboard")
        .then((r) => r.json())
        .then((d) => {
          if (alive && Array.isArray(d.learners)) setRows(d.learners);
        })
        .catch(() => {});
    load();
    // Phase-2 «تجربه» — adaptive polling: skip while the tab is hidden and
    // refresh immediately when the learner comes back.
    const t = setInterval(() => {
      if (document.hidden) return;
      load();
    }, 30_000);
    const onVisible = () => {
      if (!document.hidden && alive) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  if (!mounted || !rows) return null;

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3, 8);
  const meInTop = userId && top3.some((r) => r.userId === userId);

  const openProfile = () => window.dispatchEvent(new CustomEvent("open-profile"));

  return (
    <section aria-label="جدول امتیازات کلاس" className="leaderboard">
      <div className="mb-4 flex items-end justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
          <Trophy size={19} className="text-amber-500" />
          جدول امتیازات کلاس
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-stone-500">
          <ShieldCheck size={13} className="text-emerald-600" aria-hidden />
          <span className="hidden sm:inline">نمرات تأییدشدهٔ سمت سرور</span>
          <span className="sm:hidden">تأییدشده</span>
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center">
          <Medal size={28} className="mx-auto mb-2 text-stone-300" />
          <p className="text-sm font-bold text-stone-500">
            هنوز کسی در جدول نیست — اولین نفر باش!
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {/* podium */}
          <div className="border-b border-stone-100 bg-gradient-to-b from-amber-50/60 to-transparent px-4 pb-4 pt-6">
            <div className="mx-auto flex max-w-md items-end justify-center gap-3 sm:gap-5">
              {podiumOrder.map((rankIdx, i) => {
                const row = top3[rankIdx];
                if (!row) return <div key={i} className="flex-1" />;
                const meta = podiumMeta[rankIdx];
                const isMe = row.userId === userId;
                return (
                  <motion.div
                    key={row.userId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex min-w-0 flex-1 flex-col items-center"
                  >
                    <div className="relative mb-2">
                      {isMe && (
                        <span className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
                          شما
                        </span>
                      )}
                      <span className={`rounded-full ring-2 ${meta.ring} ring-offset-2`}>
                        <AvatarDot color={row.color} name={row.name} size={rankIdx === 0 ? 52 : 42} />
                      </span>
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-base drop-shadow-sm">
                        {meta.medal}
                      </span>
                    </div>
                    <div className="mb-1 max-w-full truncate text-center text-[12.5px] font-extrabold text-stone-800">
                      {row.name}
                    </div>
                    <div className="mb-2 text-[11px] font-bold text-emerald-700">
                      {faNum(row.avgPercent)}٪ میانگین
                    </div>
                    <div
                      className={`w-full rounded-t-xl bg-gradient-to-b ${meta.grad} ${meta.h} flex items-start justify-center pt-2 shadow-inner`}
                    >
                      <span className="text-lg font-black text-white/90">{faNum(rankIdx + 1)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

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
                    <span className="w-6 shrink-0 text-center text-[13px] font-black text-stone-400">
                      {faNum(i + 4)}
                    </span>
                    <AvatarDot color={row.color} name={row.name} size={30} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-stone-700">
                      {row.name}
                      {isMe && <span className="mr-1.5 text-[10px] font-black text-emerald-600">(شما)</span>}
                    </span>
                    <span className="hidden text-[11px] text-stone-400 sm:block">
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
      )}

      {/* CTA for unnamed users */}
      {mounted && !userName && (
        <button
          onClick={openProfile}
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-gradient-to-l from-emerald-50 to-teal-50 p-4 text-right shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
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
      {meInTop && mounted && (
        <p className="mt-3 text-center text-[12px] font-bold text-amber-700">
          🎉 تو جزو ۳ نفر برتر کلاس هستی — جایگاهت را حفظ کن!
        </p>
      )}
    </section>
  );
}
