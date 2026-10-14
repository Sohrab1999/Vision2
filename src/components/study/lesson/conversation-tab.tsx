"use client";

import { useRef, useState } from "react";
import { Play, Square, Languages } from "lucide-react";
import type { LessonData } from "@/lib/study-types";
import { themeOf } from "@/lib/study-theme";
import SpeakButton from "../shared/speak-button";
import { speak, stopSpeaking } from "@/lib/speak";

export default function ConversationTab({ lesson }: { lesson: LessonData }) {
  const [showFa, setShowFa] = useState(true);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const cancelRef = useRef(false);
  const t = themeOf(lesson.color);

  const playAll = async () => {
    if (playingAll) {
      cancelRef.current = true;
      stopSpeaking();
      setPlayingAll(false);
      setPlayingIdx(null);
      return;
    }
    cancelRef.current = false;
    setPlayingAll(true);
    for (let i = 0; i < lesson.conversation.lines.length; i++) {
      if (cancelRef.current) break;
      setPlayingIdx(i);
      await new Promise<void>((resolve) => {
        speak(
          lesson.conversation.lines[i].en,
          0.95,
          () => resolve(),
          () => resolve()
        );
      });
      await new Promise((r) => setTimeout(r, 350));
    }
    setPlayingAll(false);
    setPlayingIdx(null);
  };

  return (
    <div className="space-y-4">
      {/* intro */}
      <div className="rounded-xl border c-card p-4">
        <p className="en-text mb-2 text-[14px] leading-7 text-stone-700" dir="ltr">
          {lesson.conversation.introEn}
        </p>
        <p className="text-[13px] leading-7 text-stone-500">{lesson.conversation.introFa}</p>
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border c-card px-4 py-3">
        <button
          onClick={playAll}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-[background-color,color,border-color,box-shadow,transform] active:scale-[0.96] ${
            playingAll ? "bg-rose-600" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          {playingAll ? <Square size={15} /> : <Play size={15} />}
          {playingAll ? "توقف پخش" : "پخش کل مکالمه"}
        </button>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] font-bold text-stone-600">
          <Languages size={15} className="text-stone-500" />
          نمایش ترجمهٔ فارسی
          <button
            role="switch"
            aria-checked={showFa}
            onClick={() => setShowFa((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${showFa ? "bg-emerald-500" : "bg-stone-300"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[background-color,color,border-color,box-shadow] ${
                showFa ? "right-0.5" : "right-[22px]"
              }`}
            />
          </button>
        </label>
      </div>

      {/* dialogue */}
      <div className="max-h-[58vh] space-y-3 overflow-y-auto pl-1 nice-scroll">
        {lesson.conversation.lines.map((line, i) => {
          const isA = i % 2 === 0;
          const speaking = playingIdx === i;
          return (
            <div key={i} className={`flex ${isA ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[88%] rounded-2xl border p-3.5 transition-[background-color,color,border-color,box-shadow] sm:max-w-[75%] ${
                  speaking
                    ? `${t.border} ${t.bgSoft} shadow-md`
                    : "border-stone-200 bg-white"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className={`text-[12px] font-extrabold ${t.text}`}>
                    {line.speakerFa}
                    <span className="en-text mr-1 font-medium text-stone-500" dir="ltr">
                      {" "}
                      ({line.speaker})
                    </span>
                  </span>
                  <SpeakButton text={line.en} />
                </div>
                <p className="en-text text-[14.5px] leading-7 text-stone-800" dir="ltr">
                  {line.en}
                </p>
                {showFa && (
                  <p className="mt-1.5 border-t border-dashed border-stone-200 pt-1.5 text-[13px] leading-7 text-stone-500">
                    {line.fa}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
