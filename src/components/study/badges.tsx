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
  Gamepad2,
  Trophy,
  Zap,
  Sparkles,
  Crown,
  Snowflake,
  ShieldCheck,
  Shield,
  Package,
  Flag,
  CalendarDays,
  CalendarRange,
  Sun,
  Bird,
  Feather,
  Repeat,
  SpellCheck2,
} from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { faNum } from "@/lib/study-theme";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BADGES,
  TIER_STYLE,
  buildEvalInput,
  newBadgeIds,
  unlockedBadgeIds,
  type BadgeEvalInput,
} from "@/lib/achievements";

// Task 81 — صادرشده برای گاردِ تست: هر iconِ رجیستری باید این‌جا کلید باشد
// (وگرنه کاشی به Medal برمی‌گردد — سکوتِ بصری که تست نمی‌بیند)
export const BADGE_ICONS: Record<string, React.ElementType> = {
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
  Gamepad2,
  Trophy,
  Zap,
  Sparkles,
  Crown,
  Snowflake,
  ShieldCheck,
  Shield,
  Package,
  // خانوادهٔ هدف (Task 82)
  Flag,
  CalendarDays,
  CalendarRange,
  Sun,
  // هفتهٔ بی‌قفسه (Task 83)
  Bird,
  // نشان‌های رویدادیِ هفته (Task 84)
  Feather,
  Repeat,
  // رانِ ترکیبی (Task 85)
  SpellCheck2,
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
  const rushBest = useStudy((s) => s.rushBest);
  const rushBestCorrect = useStudy((s) => s.rushBestCorrect);
  const rushGames = useStudy((s) => s.rushGames);
  const freezeCount = useStudy((s) => s.freezeCount);
  const freezeUsedDays = useStudy((s) => s.freezeUsedDays);
  const freezeEarnedDay = useStudy((s) => s.freezeEarnedDay);
  const goalMetDays = useStudy((s) => s.goalMetDays);
  const dayHistory = useStudy((s) => s.dayHistory);
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
        rushBest,
        rushBestCorrect,
        rushGames,
        freezeCount,
        freezeUsedDays,
        freezeEarnedDay,
        goalMetDays,
        dayHistory,
      }),
    [known, results, history, dayStat, streak, bestStreak, mistakes, rushBest, rushBestCorrect, rushGames, freezeCount, freezeUsedDays, freezeEarnedDay, goalMetDays, dayHistory]
  );

  const unlocked = useMemo(() => unlockedBadgeIds(input), [input]);
  const unlockedCount = unlocked.size;

  // detect newly earned badges → toast once per badge
  // (تعریفِ «تازه» از قراردادِ مشترک newBadgeIds — هم‌منبع با حلقهٔ آواتار)
  useEffect(() => {
    if (!mounted || markingRef.current) return;
    const fresh = newBadgeIds(input, seenBadges);
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
          const Icon = BADGE_ICONS[b.icon] ?? Medal;
          const isUnlocked = unlocked.has(b.id);
          const tier = TIER_STYLE[b.tier];
          const hint = !isUnlocked && b.progress ? b.progress(input) : undefined;
          const badgeCard = (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className={`badge-card group relative flex h-full w-full flex-col items-center rounded-2xl border-2 p-3.5 text-center transition-all ${
                isUnlocked
                  ? `border-transparent bg-gradient-to-b ${tier.grad} text-white shadow-lg ${tier.glow} badge-shine`
                  : "border-stone-200 bg-white text-stone-400"
              }`}
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
          return (
            <Popover key={b.id}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`جزئیات نشان ${b.title}`}
                  className="cursor-pointer text-right transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 rounded-2xl"
                >
                  {badgeCard}
                </button>
              </PopoverTrigger>
              <PopoverContent className="badge-popover w-64 rounded-2xl border-stone-200 p-4" side="top">
                <div className="mb-2 flex items-center gap-2.5">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isUnlocked ? `bg-gradient-to-b ${tier.grad} text-white shadow-md` : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <div>
                    <div className="text-[13px] font-black text-stone-800">{b.title}</div>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${isUnlocked ? tier.chip : "bg-stone-100 text-stone-400"}`}>
                      {isUnlocked ? `کسب شد — نشان ${tierFa[b.tier]}` : `نشان ${tierFa[b.tier]} — قفل`}
                    </span>
                  </div>
                </div>
                <p className="mb-2 text-[12px] leading-6 text-stone-600">{b.desc}</p>
                {isUnlocked ? (
                  <div className="rounded-xl bg-emerald-50 px-3 py-2 text-[11.5px] font-bold text-emerald-700">
                    ✓ آفرین! این نشان را باز کردی.
                  </div>
                ) : hint ? (
                  <div>
                    <div className="mb-1 text-[11px] font-bold text-stone-500">پیشرفت تو: {hint}</div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${badgeProgressPct(b.id, input)}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-stone-50 px-3 py-2 text-[11.5px] font-bold text-stone-500">
                    این نشان با انجام شرایطش به‌صورت خودکار باز می‌شود.
                  </div>
                )}
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </section>
  );
}

/** numeric 0..100 progress for known badge ids (for the popover bars) */
function badgeProgressPct(id: string, s: BadgeEvalInput): number {
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));
  switch (id) {
    case "word-starter":
      return clamp((s.knownCount / 10) * 100);
    case "word-scholar":
      return clamp((s.knownCount / 50) * 100);
    case "word-master":
      return clamp((s.knownCount / 150) * 100);
    case "quiz-5":
      return clamp((s.totalQuizzes / 5) * 100);
    case "quiz-20":
      return clamp((s.totalQuizzes / 20) * 100);
    case "review-50":
      return clamp((s.totalReviews / 50) * 100);
    case "streak-3":
      return clamp((s.bestStreak / 3) * 100);
    case "streak-7":
      return clamp((s.bestStreak / 7) * 100);
    case "high-scorer":
      return clamp((s.bestPercent / 85) * 100);
    case "perfect":
      return clamp((s.bestPercent / 100) * 100);
    case "rush-combo":
      return clamp((s.rushBestCorrect / 15) * 100);
    // خانوادهٔ هدف (Task 82)
    case "goal-five":
      return clamp((s.goalDays / 5) * 100);
    case "goal-week":
      return clamp((s.goalDays / 7) * 100);
    case "goal-fortnight":
      return clamp((s.goalDays / 14) * 100);
    default:
      return 0;
  }
}
