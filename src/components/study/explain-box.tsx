"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RotateCcw, Zap } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

// ------------------------------------------------------------------
// F8 «چرا غلط شد؟» — the single constrained AI button under the quiz
// feedback. Asks /api/explain with the question id only; the answer
// is cached server-side so every learner gets the same controlled
// explanation. Only shown for real bank questions (l1-/l2-/l3-/x-).
// ------------------------------------------------------------------

const EXPLAINABLE_ID = /^(l[123]-|x-)/;

interface ExplainState {
  status: "idle" | "loading" | "done" | "error";
  text?: string;
  cached?: boolean;
  fallback?: boolean;
}

export default function ExplainBox({ questionId }: { questionId: string }) {
  const [state, setState] = useState<ExplainState>({ status: "idle" });

  if (!EXPLAINABLE_ID.test(questionId)) return null;

  const ask = async () => {
    if (state.status === "loading" || state.status === "done") return;
    trackEvent("explain_open");
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { explanation?: string; cached?: boolean; source?: string };
      if (!data.explanation) throw new Error("empty");
      setState({ status: "done", text: data.explanation, cached: data.cached, fallback: data.source === "fallback" });
    } catch {
      setState({ status: "error" });
    }
  };

  if (state.status === "done" && state.text) {
    const [first, ...rest] = state.text.split("\n");
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 rounded-xl border border-violet-200 bg-violet-50/70 p-3"
        data-ai-explain
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-black text-violet-700">
            <Sparkles size={13} />
            توضیح هوشمند
          </span>
          {state.fallback ? (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-500">حالت آفلاین</span>
          ) : state.cached ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-500">
              <Zap size={10} />
              آماده
            </span>
          ) : null}
        </div>
        <p className="text-[13px] leading-7 text-stone-700">{first}</p>
        {rest.length > 0 && rest.join(" ").trim() !== "" && (
          <p className="mt-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-[12.5px] leading-6 text-stone-600">
            {rest.join(" ").trim()}
          </p>
        )}
      </motion.div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5" data-ai-explain>
        <span className="text-[12px] font-bold text-amber-700">توضیح هوشمند در دسترس نشد.</span>
        <button
          onClick={ask}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-amber-800 transition-all hover:bg-amber-100 active:scale-95"
        >
          <RotateCcw size={12} />
          تلاش دوباره
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3" data-ai-explain>
      <button
        onClick={ask}
        disabled={state.status === "loading"}
        className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300 bg-gradient-to-l from-violet-50 to-fuchsia-50 px-3 py-2 text-[12px] font-black text-violet-700 shadow-sm transition-all hover:from-violet-100 hover:to-fuchsia-100 active:scale-95 disabled:opacity-60"
      >
        {state.status === "loading" ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            در حال فهمیدنِ سؤال…
          </>
        ) : (
          <>
            <Sparkles size={13} />
            چرا این پاسخ درست است؟ توضیح با هوش مصنوعی
          </>
        )}
      </button>
    </div>
  );
}
