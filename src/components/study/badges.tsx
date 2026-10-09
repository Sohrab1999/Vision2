"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import {
  Footprints,
  BookA,
  BookOpenCheck,
  GraduationCap,
  ListChecks,
  ClipboardCheck,
  RefreshCcw,
  Flame,
  CalendarCheck,
  Ear,
  PenLine,
  Star,
  Target,
  BookMarked,
  Award,
  Eraser,
  Lock,
  Medal,
} from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { useToast } from "@/hooks/use-toast";
import {
  BADGES,
  TIER_STYLE,
  buildEvalInput,
  unlockedBadgeIds,
} from "@/lib/achievements";

const ICONS: Record<string, React.ElementType> = {
  Footprints,
  BookA,
  BookOpenCheck,
  GraduationCap,
  ListChecks,
  ClipboardCheck,
  RefreshCcw,
  Flame,
  CalendarCheck,
  Ear,
  PenLine,
  Star,
  Target,
  BookMarked,
  Award,
  Eraser,
};

const tierFa: Record<string, string> = {
  bronze: "برنزی",
  silver: "نقره‌ای",
  gold: "طلایی",
};

/**
 * نشان‌ها و دستاوردها — badge grid for the home page.
 * Shows unlocked/locked states and fires a toast when a new badge is earned.
 */
export default function Badges() {
  const known = useStudy((s) => s.known);
  const results = useStudy((s) => s.results);
  const history = useStudy((s) => s.history);
  const dayStat = useStudy((s) => s.dayStat);
  const streak = useStudy((s) => s.streak);
  const bestStreak = useStudy((s) => s.bestStreak);
  const mistakes = useStudy((s) => s.mistakes);
  const seenBadges = useStudy((s) => s.seenBadges);
  const markBadgesSeen = useStudy((s) => s.markBadgesSeen);
  const mounted = useMounted();
  const { toast } = useToast();
  const markingRef = useRef(false);

  const input = useMemo(
    () =>
      buildEvalInput({
        known,
        results,
        history,
        dayStat,
        streak,
        bestStreak,
        mistakes,
      }),
    [known, results, history, dayStat, streak, bestStreak, mistakes]
  );

  const unlocked = useMemo(() => unlockedBadgeIds(input), [input]);
  const unlockedCount = unlocked.size;

  // detect newly earned badges → toast once per badge
  useEffect(() => {
    if (!mounted || markingRef.current) return;
    const fresh = [...unlocked].filter((id) => !seenBadges.includes(id));
    if (fresh.length === 0) return;
    markingRef.current = true;
    markBadgesSeen(fresh);
    for (const id of fresh.slice(0, 2)) {
      const b = BADGES.find((x) => x.id === id);
      if (!b) continue;
      const tier = TIER_STYLE[b.tier];
      toast({
        title: `🎖 نشان جدید: ${b.title}`,
        description: `${b.desc} — نشان ${tierFa[b.tier]}`,
        duration: 5000,
      });
    }
    setTimeout(() => (markingRef.current = false), 1200);
  }, [unlocked, mounted, seenBadges, markBadgesSeen, toast]);

  if (!mounted) return null;

  const ordered = [...BADGES].sort((a, b) => {
    const ua = unlocked.has(a.id) ? 0 : 1;
    const ub = unlocked.has(b.id) ? 0 : 1;
    return ua - ub;
  });

  return (
    <section aria-label="نشان‌ها و دستاوردها" className="badge-section">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
          <Medal size={19} className="text-amber-500" />
          نشان‌ها و دستاوردها
        </h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-black text-amber-800">
          {faNum(unlockedCount)} از {faNum(BADGES.length)}
        </span>
      </div>

      {/* progress track */}
      <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-stone-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-amber-400 via-orange-500 to-rose-500"
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / BADGES.length) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {ordered.map((b, i) => {
          const Icon = ICONS[b.icon] ?? Medal;
          const isUnlocked = unlocked.has(b.id);
          const tier = TIER_STYLE[b.tier];
          const hint = !isUnlocked && b.progress ? b.progress(input) : undefined;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className={`badge-card group relative flex flex-col items-center rounded-2xl border-2 p-3.5 text-center transition-all ${
                isUnlocked
                  ? `border-transparent bg-gradient-to-b ${tier.grad} text-white shadow-lg ${tier.glow} badge-shine`
                  : "border-stone-200 bg-white text-stone-400"
              }`}
              title={b.desc}
            >
              {!isUnlocked && (
                <span className="absolute left-2.5 top-2.5 text-stone-300">
                  <Lock size={13} />
                </span>
              )}
              <span
                className={`mb-2 flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ${
                  isUnlocked ? "bg-white/20 text-white" : "bg-stone-100 text-stone-400"
                }`}
              >
                <Icon size={23} />
              </span>
              <span className={`text-[12.5px] font-black ${isUnlocked ? "text-white" : "text-stone-600"}`}>
                {b.title}
              </span>
              <span className={`mt-1 hidden text-[10.5px] leading-4 sm:block ${isUnlocked ? "text-white/85" : "text-stone-400"}`}>
                {b.desc}
              </span>
              {isUnlocked ? (
                <span className="mt-2 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold text-white">
                  نشان {tierFa[b.tier]}
                </span>
              ) : (
                <span className="mt-2 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-400">
                  {hint ? `قفل — ${hint}` : "قفل"}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
