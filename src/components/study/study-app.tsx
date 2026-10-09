"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStudy } from "@/lib/study-store";
import { useMounted } from "@/lib/use-mounted";
import { stopSpeaking } from "@/lib/speak";
import Header from "./header";
import Footer from "./footer";
import HomeView from "./home-view";
import LessonView from "./lesson-view";
import DictionaryView from "./dictionary-view";
import ExamView from "./exam-view";
import AppendixView from "./appendix-view";

export default function StudyApp() {
  const view = useStudy((s) => s.view);
  const hydrated = useMounted();

  // rehydrate persisted progress from localStorage (zustand -> external system)
  useEffect(() => {
    useStudy.persist.rehydrate();
  }, []);

  // stop any playing audio when switching views
  useEffect(() => {
    stopSpeaking();
  }, [view]);

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
      <Footer />
    </div>
  );
}
