"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { faNum } from "@/lib/study-theme";
import AvatarDot from "./avatar-dot";

/**
 * Podium — the shared top-3 ranking podium (audit §10 R-6).
 *
 * تا گام ۶ سه نسخهٔ ساختاری یکسان وجود داشت: جدول آزمون‌ها (کهربایی)،
 * جدول نبردها (فوشیا) و برد رش (نارنجی) — هر کدام ~۴۰ خط با تفاوت‌های
 * صرفاً ظاهری. اکنون یک مؤلفه با رکورد واریانت؛ همهٔ تفاوت‌های کلاس‌ها
 * داخل رکورد نگه داشته شده‌اند تا پیکسل‌ها دقیقاً همان بمانند.
 *
 * ردیف‌ها به ترتیب بهترین می‌آیند؛ سکوها با ترتیب نمایشی دوم-اول-سوم
 * چیده می‌شوند (PODIUM_ORDER). ردیف‌های ۴ به بعد همچنان در خودِ صفحه
 * رندر می‌شوند (ستون‌های آماری‌شان متفاوت است).
 */

export const PODIUM_ORDER = [1, 0, 2]; // second, first, third

export interface PodiumRow {
  userId: string;
  name: string;
  color: string;
}

interface RankMeta {
  h: string;
  medal: string;
  ring: string;
  grad: string;
  label: string;
}

export interface PodiumVariant {
  /** tinted strip behind the podium (call-site card keeps its own border) */
  strip: string;
  container: string;
  metas: [RankMeta, RankMeta, RankMeta];
  primary: number;
  secondary: number;
  avatarWrap: string;
  medalPos: string;
  meBadge: string;
  nameCls: string;
  metricCls: string;
  /** optional third line (rush shows the rank label under the metric) */
  labelCls: string | null;
  podiumCls: string;
  rankCls: string;
  delay: number;
  rise: number;
}

export const PODIUM_VARIANTS = {
  amber: {
    strip: "border-b border-stone-100 bg-gradient-to-b from-amber-50/60 to-transparent px-4 pb-4 pt-6",
    container: "mx-auto flex max-w-md items-end justify-center gap-3 sm:gap-5",
    metas: [
      { h: "h-20", medal: "🥇", ring: "ring-amber-400", grad: "from-amber-300 to-amber-500", label: "قهرمان" },
      { h: "h-14", medal: "🥈", ring: "ring-stone-300", grad: "from-stone-200 to-stone-400", label: "دوم" },
      { h: "h-11", medal: "🥉", ring: "ring-orange-300", grad: "from-orange-200 to-orange-400", label: "سوم" },
    ],
    primary: 52,
    secondary: 42,
    avatarWrap: "relative mb-2",
    medalPos: "absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-base drop-shadow-sm",
    meBadge: "bg-emerald-600",
    nameCls: "mb-1 max-w-full truncate text-center text-[12.5px] font-extrabold text-stone-800",
    metricCls: "mb-2 text-[11px] font-bold text-emerald-700",
    labelCls: null,
    podiumCls: "flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-2 shadow-inner",
    rankCls: "text-lg font-black text-white/90",
    delay: 0.1,
    rise: 20,
  },
  fuchsia: {
    strip: "border-b border-fuchsia-100 bg-gradient-to-b from-fuchsia-50/60 to-transparent px-4 pb-4 pt-6",
    container: "mx-auto flex max-w-md items-end justify-center gap-3 sm:gap-5",
    metas: [
      { h: "h-20", medal: "⚔️", ring: "ring-fuchsia-400", grad: "from-fuchsia-300 to-fuchsia-600", label: "قهرمان نبرد" },
      { h: "h-14", medal: "🗡️", ring: "ring-violet-300", grad: "from-violet-200 to-violet-500", label: "دوم" },
      { h: "h-11", medal: "🛡️", ring: "ring-purple-300", grad: "from-purple-200 to-purple-400", label: "سوم" },
    ],
    primary: 52,
    secondary: 42,
    avatarWrap: "relative mb-2",
    medalPos: "absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-base drop-shadow-sm",
    meBadge: "bg-fuchsia-600",
    nameCls: "mb-1 max-w-full truncate text-center text-[12.5px] font-extrabold text-stone-800",
    metricCls: "mb-2 text-[11px] font-bold text-fuchsia-700",
    labelCls: null,
    podiumCls: "flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-2 shadow-inner",
    rankCls: "text-lg font-black text-white/90",
    delay: 0.1,
    rise: 20,
  },
  orange: {
    strip: "rush-board-podium bg-gradient-to-b from-orange-50/50 to-transparent px-4 pb-3 pt-5",
    container: "mx-auto flex max-w-sm items-end justify-center gap-3",
    metas: [
      { h: "h-16", grad: "from-amber-400 to-orange-500", medal: "🏆", ring: "ring-amber-400", label: "قهرمان چالش" },
      { h: "h-11", grad: "from-stone-300 to-stone-400", medal: "🥈", ring: "ring-stone-300", label: "دوم" },
      { h: "h-9", grad: "from-orange-200 to-orange-400", medal: "🥉", ring: "ring-orange-300", label: "سوم" },
    ],
    primary: 46,
    secondary: 38,
    avatarWrap: "relative mb-1.5",
    medalPos: "absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm drop-shadow-sm",
    meBadge: "bg-emerald-600",
    nameCls: "mt-2.5 max-w-full truncate text-center text-[12px] font-extrabold text-stone-800",
    metricCls: "flex items-center gap-1 text-[12px] font-black text-orange-600",
    labelCls: "mb-1.5 text-[10px] font-bold text-stone-400",
    podiumCls: "flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-1.5 shadow-inner",
    rankCls: "text-base font-black text-white/90",
    delay: 0.09,
    rise: 16,
  },
} satisfies Record<string, PodiumVariant>;

export type PodiumVariantKey = keyof typeof PODIUM_VARIANTS;

interface PodiumProps<T extends PodiumRow> {
  /** ranked best-first (rows[0] = champion) */
  rows: T[];
  meId?: string | null;
  variant?: PodiumVariantKey;
  /** stat line under each name (e.g. «۸۷٪ میانگین») — color comes from the variant */
  metric?: (row: T, rankIdx: number) => ReactNode;
  /** render the variant's rank label under the metric (rush-style third line) */
  showLabel?: boolean;
}

export default function Podium<T extends PodiumRow>({
  rows,
  meId = null,
  variant = "amber",
  metric,
  showLabel = false,
}: PodiumProps<T>) {
  const v = PODIUM_VARIANTS[variant];
  const top3: T[] = [rows[0], rows[1], rows[2]].filter(Boolean);
  return (
    <div className={v.strip}>
      <div className={v.container}>
        {PODIUM_ORDER.map((rankIdx, i) => {
          const row = top3[rankIdx];
          if (!row) return <div key={i} className="flex-1" />;
          const meta = v.metas[rankIdx];
          const isMe = row.userId === meId;
          return (
            <motion.div
              key={row.userId}
              initial={{ opacity: 0, y: v.rise }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * v.delay }}
              className="flex min-w-0 flex-1 flex-col items-center"
            >
              <div className={v.avatarWrap}>
                {isMe && (
                  <span
                    className={`absolute -top-2 left-1/2 z-10 -translate-x-1/2 rounded-full px-1.5 py-0.5 text-[9px] font-black text-white shadow ${v.meBadge}`}
                  >
                    شما
                  </span>
                )}
                <span className={`rounded-full ring-2 ${meta.ring} ring-offset-2`}>
                  <AvatarDot color={row.color} name={row.name} size={rankIdx === 0 ? v.primary : v.secondary} />
                </span>
                <span className={v.medalPos}>{meta.medal}</span>
              </div>
              <div className={v.nameCls}>{row.name}</div>
              {metric && <div className={v.metricCls}>{metric(row, rankIdx)}</div>}
              {showLabel && v.labelCls && <div className={v.labelCls}>{meta.label}</div>}
              <div className={`${v.podiumCls} bg-gradient-to-b ${meta.grad} ${meta.h}`}>
                <span className={v.rankCls}>{faNum(rankIdx + 1)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
