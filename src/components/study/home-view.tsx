"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import HomeHero from "./home/home-hero";
import HomeToday from "./home/home-today";
import { ListenBanner, RushBanner } from "./home/home-banners";
import HomeStarter from "./home/home-starter";
import HomeBookshelf from "./home/home-bookshelf";
import HomeTools from "./home/home-tools";
import HomeFeed from "./home/home-feed";
import HomeRecent from "./home/home-recent";
import DailyQuests from "./daily-quests";
import WeeklyChart from "./weekly-chart";
import Leaderboard from "./leaderboard";
import Badges from "./badges";
import SrsPanel from "./srs-panel";
import SkillPanel from "./skill-panel";

// ------------------------------------------------------------------
// صفحهٔ خانه — گام ۷ §12: این فایل فقط «سازندهٔ صفحه» است؛ هر بخش یک
// نمای مستقل در home/ دارد (خودبسنده با subscribe اختصاصی به استور) و
// آمار جهانی با useGlobalStats (G-3: abort در unmount) خوانده می‌شود.
//
// Task 44 (roadmap step 3): word-of-day + vocab-donut need the real
// vocabulary content (@/data ≈ 371 KB). They render below the fold, so
// they load as async chunks after first paint instead of blocking it.
// ------------------------------------------------------------------

const CardFallback = (
  <div className="flex h-56 items-center justify-center rounded-2xl border border-stone-200 c-veil-60">
    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-600" />
  </div>
);
const WordOfDay = dynamic(() => import("./word-of-day"), {
  ssr: false,
  loading: () => CardFallback,
});
const VocabDonut = dynamic(() => import("./vocab-donut"), {
  ssr: false,
  loading: () => CardFallback,
});
// danger-words pulls quiz-engine → word-risk → the full data layer; it only
// renders for learners with progress (below the fold) — keep it out of the
// eager bundle for the same reason as word-of-day/vocab-donut.
const DangerWords = dynamic(() => import("./danger-words"), {
  ssr: false,
  loading: () => CardFallback,
});

export default function HomeView() {
  const known = useStudy((s) => s.known);
  const results = useStudy((s) => s.results);
  const srs = useStudy((s) => s.srs);
  const mounted = useMounted();

  // Phase-2 «تجربه»: fresh learners get a focused starter path instead of six
  // dashed-empty analytics panels. Any real progress switches the full view on.
  // (هم‌ارز summarize().knownCount — فقط valueهای true شمرده می‌شوند)
  const hasProgress =
    mounted &&
    (Object.values(known).some(Boolean) || Object.keys(results).length > 0 || Object.keys(srs).length > 0);

  // شعار نقل‌قولی پایین صفحه — بیدارشدن تدریجی (fade)
  const [quoteIn, setQuoteIn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setQuoteIn(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-10">
      <HomeHero />
      <HomeToday />
      <DailyQuests />
      <WordOfDay />
      <ListenBanner />
      <RushBanner />

      {/* نمودارها و تحلیل‌ها فقط برای یادگیرندهٔ دارای پیشرفت */}
      {hasProgress && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <WeeklyChart />
          <VocabDonut />
        </div>
      )}
      {hasProgress && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <SrsPanel />
          <SkillPanel />
        </div>
      )}
      {hasProgress && <DangerWords />}

      {/* مسیر شروع فقط برای تازه‌وارد */}
      {mounted && !hasProgress && <HomeStarter />}

      <HomeBookshelf />
      <HomeTools />
      <Badges />
      <Leaderboard />
      <HomeFeed />
      <HomeRecent />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: quoteIn ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="quote-band rounded-2xl border border-amber-200 bg-gradient-to-l from-amber-50 to-orange-50 p-6 text-center"
      >
        <p className="en-text mb-2 text-lg font-semibold text-stone-700" dir="ltr">
          “Failure is a part of life. If you don&apos;t fail, you won&apos;t learn. If you don&apos;t learn, you will never succeed.”
        </p>
        <p className="text-[13px] font-bold text-amber-800">
          شکست بخشی از زندگیست. اگر شکست نخوری، یاد نمی‌گیری. اگر یاد نگیری، هرگز موفق نخواهی شد.
        </p>
      </motion.section>
    </div>
  );
}
