"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { stopSpeaking, setSpeakRateScale } from "@/lib/speak";
import { maybeAutoBackup, collectData, countsOf } from "@/lib/backup";
import { pushSync } from "@/lib/sync";
import { trackEventOncePerSession } from "@/lib/analytics";
import Header from "./shell/header";
import Footer from "./shell/footer";
import HomeView from "./home/home-view";
import CommandPalette from "./shell/command-palette";
import ShortcutGuide from "./shell/shortcut-guide";
import Onboarding from "./shell/onboarding";
import PwaLayer from "./shell/pwa-layer";

// Task 44 (roadmap step 3 — code splitting): every non-home view is a lazy
// chunk. duel-view pulls socket.io-client, exam/konkur pull the 360-question
// bank, lesson/review/dictionary pull the full book content — none of that
// belongs in the first paint of the home screen. HomeView stays eager (the
// landing view); overlays render null when closed but keep only light logic
// eager (report modals are lazy-mounted on first open below).
const ViewFallback = (
  <div className="flex min-h-[40vh] items-center justify-center">
    <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-600" />
  </div>
);

const lazyView = <P extends object>(
  loader: () => Promise<{ default: React.ComponentType<P> }>
) => dynamic(loader, { ssr: false, loading: () => ViewFallback });

const LessonView = lazyView(() => import("./lesson/lesson-view"));
const DictionaryView = lazyView(() => import("./lesson/dictionary-view"));
const ExamView = lazyView(() => import("./exam/exam-view"));
const AppendixView = lazyView(() => import("./lesson/appendix-view"));
const RushView = lazyView(() => import("./duel/rush-view"));
const DuelView = lazyView(() => import("./duel/duel-view"));
const ListenView = lazyView(() => import("./practice/listen-view"));
const ReviewView = lazyView(() => import("./practice/review-view"));
const SmartPracticeView = lazyView(() => import("./practice/smart-practice-view"));
const KonkurView = lazyView(() => import("./exam/konkur-view"));
const GrammarView = lazyView(() => import("./grammar/grammar-view"));
const MyWordsView = lazyView(() => import("./practice/my-words"));
const JozveView = lazyView(() => import("./jozve/jozve-view"));
const BookView = lazyView(() => import("./books/book-view"));
// r410 — جست‌وجوی متنیِ سراسریِ کتابخانه (chunkِ سنگین نیست ولی از
// خانوادهٔ کتابخانه است — lazy تا نقشهٔ کدِ خانه دست‌نخورده بماند)
const LibrarySearchView = lazyView(() => import("./search/library-search-view"));

// Report modals: heavy (official-report pulls per-lesson stats) and computed
// while closed (audit finding G-5). They mount only after the first "open"
// event, then stay mounted; open/close flows through props so the closed
// state costs nothing and the chunk never loads unless actually used.
const ReportCard = dynamic(() => import("./reports/report-card"), { ssr: false });
const OfficialReport = dynamic(() => import("./reports/official-report"), { ssr: false });

export default function StudyApp() {
  const view = useStudy((s) => s.view);
  const settings = useStudy((s) => s.settings);
  const hydrated = useMounted();
  const [showTop, setShowTop] = useState(false);

  // rehydrate persisted progress from localStorage (zustand -> external system)
  useEffect(() => {
    useStudy.persist.rehydrate();
  }, []);

  // Task-36 «جدول نبرد»: global opener — the leaderboard's duel standings
  // tab invites learners straight into the arena from anywhere in the app.
  useEffect(() => {
    const handler = () => useStudy.getState().setView({ type: "duel" });
    window.addEventListener("open-duel", handler);
    return () => window.removeEventListener("open-duel", handler);
  }, []);

  // Phase-0 «اعتماد»: legacy migration — a persisted userId without a secret
  // claims it once on the server (first-claim wins) so stats/profile writes
  // stay signed. Fresh visitors register during onboarding instead.
  useEffect(() => {
    const unsub = useStudy.persist.onFinishHydration(() => {
      const s = useStudy.getState();
      if (s.userId && !s.userSecret) {
        import("@/lib/identity").then(({ ensureIdentity }) => {
          ensureIdentity().catch(() => {});
        });
      }
    });
    const s = useStudy.getState();
    if (useStudy.persist.hasHydrated() && s.userId && !s.userSecret) {
      import("@/lib/identity").then(({ ensureIdentity }) => {
        ensureIdentity().catch(() => {});
      });
    }
    return unsub;
  }, []);

  // apply user settings to the document (F2): root font-size, motion, TTS rate
  useEffect(() => {
    const html = document.documentElement;
    html.style.fontSize = `${Math.round(16 * settings.fontScale * 100) / 100}px`;
    html.classList.toggle("user-reduce-motion", settings.reduceMotion);
    setSpeakRateScale(settings.ttsRate);
  }, [settings]);

  // F10 analytics: one anonymous "app_open" per browser session
  useEffect(() => {
    trackEventOncePerSession("app_open");
  }, []);

  // silent auto-backup: snapshot progress into localStorage after changes
  // (debounced 4s; maybeAutoBackup only rewrites when data actually changed)
  const backupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // initial snapshot right after rehydrate (e.g. progress brought from last session)
    const t = setTimeout(() => maybeAutoBackup(), 2500);
    const unsub = useStudy.subscribe(() => {
      if (backupTimer.current) clearTimeout(backupTimer.current);
      backupTimer.current = setTimeout(() => maybeAutoBackup(), 4000);
    });
    return () => {
      clearTimeout(t);
      if (backupTimer.current) clearTimeout(backupTimer.current);
      unsub();
    };
  }, []);

  // F3 cloud auto-push: while a learner code is attached, debounce-push the
  // snapshot to /api/sync after activity (12s quiet window, fingerprint-guarded)
  const syncCode = useStudy((s) => s.syncCode);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushFp = useRef<string>("");
  useEffect(() => {
    if (!syncCode) return;
    const unsub = useStudy.subscribe(() => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(async () => {
        try {
          const data = collectData();
          const fp = JSON.stringify(countsOf(data));
          if (fp === pushFp.current) return; // nothing changed since last push
          pushFp.current = fp;
          const res = await pushSync(syncCode);
          if (res.ok) {
            try {
              localStorage.setItem("vision2-sync-at", new Date().toISOString());
            } catch {
              /* ignore */
            }
          }
        } catch {
          /* network hiccup — retried on next activity */
        }
      }, 12_000);
    });
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
      unsub();
    };
  }, [syncCode]);

  // stop any playing audio when switching views
  useEffect(() => {
    stopSpeaking();
  }, [view]);

  // reset scroll on view change (book pages always start from the top)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  // back-to-top visibility (subscribed scroll event, async state)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const viewKey =
    view.type === "lesson"
      ? `lesson-${view.id}`
      : view.type === "book"
        ? `book-${view.grade}-${view.bank ?? ""}`
        : view.type;

  // report modals: open state lives here (eager) so the heavy modal chunks
  // only download on first use. The window events keep their names —
  // dispatchers (leaderboard, skill panel, settings, report-card → official)
  // are unchanged.
  const [reportOpen, setReportOpen] = useState(false);
  const [reportMounted, setReportMounted] = useState(false);
  const [officialOpen, setOfficialOpen] = useState(false);
  const [officialMounted, setOfficialMounted] = useState(false);
  useEffect(() => {
    const openReport = () => {
      setReportOpen(true);
      setReportMounted(true);
    };
    const openOfficial = () => {
      setOfficialOpen(true);
      setOfficialMounted(true);
    };
    window.addEventListener("open-report", openReport);
    window.addEventListener("open-official-report", openOfficial);
    return () => {
      window.removeEventListener("open-report", openReport);
      window.removeEventListener("open-official-report", openOfficial);
    };
  }, []);

  // F2 dual-channel for framer-motion (task 168, the CSS side lives in
  // globals F2b): manual toggle → "always" (every motion component skips
  // transform/layout animation), otherwise "user" — the OS
  // prefers-reduced-motion preference is honored automatically, so an
  // OS-reduced visitor no longer needs to find this app's setting.
  const reduceMotion = settings.reduceMotion;

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {hydrated ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={viewKey}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
              >
                {view.type === "home" && <HomeView />}
                {view.type === "lesson" && <LessonView id={view.id} />}
                {view.type === "dictionary" && <DictionaryView />}
                {view.type === "exam" && <ExamView />}
                {view.type === "appendix" && <AppendixView />}
                {view.type === "rush" && <RushView />}
                {view.type === "duel" && <DuelView />}
                {view.type === "listen" && <ListenView />}
                {view.type === "review" && <ReviewView />}
                {view.type === "smart" && <SmartPracticeView />}
                {view.type === "konkur" && <KonkurView />}
                {view.type === "grammar" && <GrammarView />}
                {view.type === "my-words" && <MyWordsView />}
                {view.type === "jozve" && <JozveView />}
                {view.type === "book" && <BookView grade={view.grade} initialBank={view.bank} />}
                {view.type === "search" && <LibrarySearchView initialGrade={view.grade} />}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-stone-400">
                <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-emerald-200 border-t-emerald-600" />
                <span className="text-sm font-bold">در حال باز کردن کتاب...</span>
              </div>
            </div>
          )}
        </main>

        {/* keyboard shortcuts guide + global shortcut engine ("?" opens it) */}
        <ShortcutGuide />

        {/* فرمان‌یاب — جست‌وجوی همه‌جا (Ctrl+K / دکمهٔ هدر) */}
        <CommandPalette />

        {/* first-run welcome + personalization (F1) */}
        <Onboarding />

        {/* F4+F9 — PWA install flow, due badge & streak-freeze toasts */}
        <PwaLayer />

        {/* letter-style progress report (opened from tool cards / skill panel) */}
        {reportMounted && (
          <ReportCard open={reportOpen} onClose={() => setReportOpen(false)} />
        )}

        {/* A4 printable official progress report (teacher/parents) */}
        {officialMounted && (
          <OfficialReport open={officialOpen} onClose={() => setOfficialOpen(false)} />
        )}

        {/* back to top */}
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-5 left-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 transition-transform hover:bg-emerald-700 active:scale-90"
              aria-label="بازگشت به بالای صفحه"
            >
              <ArrowUp size={19} />
            </motion.button>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </MotionConfig>
  );
}
