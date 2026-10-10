"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { stopSpeaking, setSpeakRateScale } from "@/lib/speak";
import { maybeAutoBackup, collectData, countsOf } from "@/lib/backup";
import { pushSync } from "@/lib/sync";
import { trackEventOncePerSession } from "@/lib/analytics";
import Header from "./header";
import Footer from "./footer";
import HomeView from "./home-view";
import LessonView from "./lesson-view";
import DictionaryView from "./dictionary-view";
import ExamView from "./exam-view";
import AppendixView from "./appendix-view";
import RushView from "./rush-view";
import ListenView from "./listen-view";
import ReviewView from "./review-view";
import ShortcutGuide from "./shortcut-guide";
import ReportCard from "./report-card";
import OfficialReport from "./official-report";
import Onboarding from "./onboarding";
import PwaLayer from "./pwa-layer";

export default function StudyApp() {
  const view = useStudy((s) => s.view);
  const settings = useStudy((s) => s.settings);
  const hydrated = useMounted();
  const [showTop, setShowTop] = useState(false);

  // rehydrate persisted progress from localStorage (zustand -> external system)
  useEffect(() => {
    useStudy.persist.rehydrate();
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
    view.type === "lesson" ? `lesson-${view.id}` : view.type;

  return (
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
              {view.type === "listen" && <ListenView />}
              {view.type === "review" && <ReviewView />}
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

      {/* first-run welcome + personalization (F1) */}
      <Onboarding />

      {/* F4+F9 — PWA install flow, due badge & streak-freeze toasts */}
      <PwaLayer />

      {/* letter-style progress report (opened from tool cards / skill panel) */}
      <ReportCard />

      {/* A4 printable official progress report (teacher/parents) */}
      <OfficialReport />

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
  );
}
