"use client";

// r410 — «جست‌وجو در کتاب‌ها» — نمای جست‌وجوی متنیِ سراسریِ کتابخانه.
// موتورِ تطبیق سمتِ سرور است (/api/jozve-search روی ۴۳ هزار رکورد:
// ۳۶٬۷۹۱ خطِ متنِ شش جزوه + ۶٬۲۲۲ سؤالِ نُه بانک)؛ این نما فقط
// پرس‌وجو می‌سازد، گروه‌بندی می‌کند و هایلایتِ هم‌ارزِ نویسه‌ای
// (ی/ي، ک/ك، ا/أ/آ، ارقام، نیم‌فاصله) را با همان موتورِ خالصِ
// lib/jozve-search می‌کشد. کلیکِ نتیجهٔ متن → پرشِ عمیق به فصل در
// کتابخانهٔ جزوه‌ها؛ کلیکِ نتیجهٔ سؤال → باز شدن خودِ کارت با
// گزینه‌ها و کلید — بدونِ جابه‌جایی.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  LibraryBig,
  ListChecks,
  Loader2,
  RefreshCw,
  Search,
  SearchX,
  Sparkle,
} from "lucide-react";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { BOOKS, bookMetaByGrade } from "@/lib/books";
import { buildHighlightRegex, buildPhraseRegex, searchGroupKind, type JozveSearchResult } from "@/lib/jozve-search";
import { LIBSEARCH_Q_KEY, clearStringPrefill, readStringPrefill } from "@/lib/nav-prefill";

type KindFilter = "text" | "question" | null;

interface SearchPayload {
  total: number;
  took: number;
  results: JozveSearchResult[];
  /** r415 — اسنادِ عبارت‌دار در کلِ تطبیق‌ها (از سرور) — منبعِ چیپِ سرگروه */
  phraseDocs?: string[];
}

const SUGGESTIONS = ["حال کامل", "passive", "صفت ملکی", "library", "irregular verbs", "آزمون نهایی"];

// ---------------------------------------------------------- هایلایت

type HitKind = 0 | 1 | 2; // 0 عادی · 1 واژه · 2 عبارتِ پیوسته (r412)

function Highlight({ text, phrase, terms }: { text: string; phrase: RegExp | null; terms: RegExp | null }) {
  const parts = useMemo(() => {
    const out: { hit: HitKind; s: string }[] = [];
    // عبارت‌هایِ پیوسته یک‌بارِ کلِ متن را می‌پیمایند و بازه‌ها را
    // اشغال می‌کنند؛ لایهٔ واژه فقط رویِ شکاف‌ها زندگی می‌کند تا
    // هایلایتِ درونِ عبارت دوباره رنگی نشود.
    const spans: [number, number][] = [];
    if (phrase) {
      const pre = new RegExp(phrase.source, "gi");
      for (let m = pre.exec(text); m; m = pre.exec(text)) {
        if (m[0].length === 0) {
          pre.lastIndex += 1;
          continue;
        }
        spans.push([m.index, m.index + m[0].length]);
      }
    }
    const pushTerms = (slice: string) => {
      if (!terms) {
        if (slice) out.push({ hit: 0 as HitKind, s: slice });
        return;
      }
      const re = new RegExp(terms.source, "gi");
      let last = 0;
      for (let m = re.exec(slice); m; m = re.exec(slice)) {
        if (m[0].length === 0) {
          re.lastIndex += 1;
          continue;
        }
        if (m.index > last) out.push({ hit: 0 as HitKind, s: slice.slice(last, m.index) });
        out.push({ hit: 1 as HitKind, s: m[0] });
        last = m.index + m[0].length;
      }
      if (last < slice.length) out.push({ hit: 0 as HitKind, s: slice.slice(last) });
    };
    let cursor = 0;
    for (const [a, b] of spans) {
      if (a > cursor) pushTerms(text.slice(cursor, a));
      out.push({ hit: 2 as HitKind, s: text.slice(a, b) });
      cursor = b;
    }
    pushTerms(text.slice(cursor));
    if (!out.length) out.push({ hit: 0 as HitKind, s: text });
    return out;
  }, [text, phrase, terms]);
  return (
    <>
      {parts.map((p, i) =>
        p.hit === 2 ? (
          <mark
            key={i}
            className="rounded-[4px] bg-emerald-300/90 px-1 text-emerald-950 ring-1 ring-emerald-600/50"
          >
            {p.s}
          </mark>
        ) : p.hit === 1 ? (
          <mark key={i} className="rounded-[3px] bg-amber-200/80 px-0.5 font-black text-stone-900">
            {p.s}
          </mark>
        ) : (
          <span key={i}>{p.s}</span>
        ),
      )}
    </>
  );
}

// ------------------------------------------------------ کارت نتیجه

function TextResultCard({ r, phrase, terms }: { r: JozveSearchResult; phrase: RegExp | null; terms: RegExp | null }) {
  const setView = useStudy((s) => s.setView);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition-[border-color,box-shadow] hover:border-emerald-300 hover:shadow-md"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-black text-amber-700 ring-1 ring-amber-200">
          <BookOpen size={10} />
          متن
        </span>
        {r.phraseHit && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200">
            <Sparkle size={10} />
            عبارت کامل
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[10.5px] font-bold text-stone-400">
          {[r.chapterTitle, r.sectionTitle].filter(Boolean).join(" › ")}
        </span>
      </div>
      <p dir="auto" className="text-[13px] font-bold leading-6 text-stone-800">
        <Highlight text={r.snippet} phrase={phrase} terms={terms} />
      </p>
      {r.chapterId && (
        <div className="mt-2 flex justify-start">
          <button
            onClick={() => setView({ type: "jozve", grade: r.grade, chapterId: r.chapterId })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-extrabold text-emerald-800 transition hover:bg-emerald-100 active:scale-95"
          >
            <LibraryBig size={12} />
            باز کردن «{r.chapterTitle}» در کتابخانه
          </button>
        </div>
      )}
    </motion.div>
  );
}

const OPTION_LETTERS = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

function QuestionResultCard({ r, phrase, terms }: { r: JozveSearchResult; phrase: RegExp | null; terms: RegExp | null }) {
  const [open, setOpen] = useState(false);
  const safeAnswer =
    typeof r.answer === "number" && r.answer >= 0 && r.answer < (r.options?.length ?? 0) ? r.answer : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm transition-[border-color,box-shadow] hover:border-violet-300 hover:shadow-md"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[10px] font-black text-violet-700 ring-1 ring-violet-200">
          <ListChecks size={10} />
          تست
        </span>
        {r.phraseHit && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200">
            <Sparkle size={10} />
            عبارت کامل
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[10.5px] font-bold text-stone-400">{r.bankTitle}</span>
      </div>
      <button onClick={() => setOpen((v) => !v)} className="block w-full text-right" aria-expanded={open}>
        <p dir="auto" className="text-[13px] font-bold leading-6 text-stone-800">
          <Highlight text={r.snippet} phrase={phrase} terms={terms} />
        </p>
      </button>
      {open && r.options && (
        <div className="mt-2 space-y-1 border-t border-stone-100 pt-2">
          {r.options.map((opt, i) => {
            const correct = i === safeAnswer;
            return (
              <div
                key={i}
                dir="auto"
                className={`flex items-start gap-2 rounded-lg px-2 py-1 text-[12.5px] font-bold ${
                  correct ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200" : "text-stone-600"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-black ${
                    correct ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {OPTION_LETTERS[i] ?? i + 1}
                </span>
                <span className="min-w-0 flex-1">{opt}</span>
                {correct && <span className="shrink-0 text-[10px] font-black text-emerald-700">پاسخ درست</span>}
              </div>
            );
          })}
          {r.translation && (
            <p
              dir="auto"
              className="rounded-lg bg-stone-50 px-2 py-1.5 text-[11.5px] font-bold leading-5 text-stone-500"
            >
              ترجمه: {r.translation}
            </p>
          )}
          {r.questionId && (
            <p className="text-left text-[9.5px] font-bold text-stone-300" dir="ltr">
              {r.questionId}
            </p>
          )}
        </div>
      )}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-black text-violet-600 transition hover:text-violet-800"
        >
          <ChevronDown size={13} />
          گزینه‌ها و پاسخ
        </button>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------- نمای اصلی

export default function LibrarySearchView({ initialGrade }: { initialGrade?: number }) {
  const goHome = useStudy((s) => s.goHome);

  // prefillِ پالت فرمان — خواندنِ غیرمخرب در initializer (هم‌الگوی
  // loadRecents پالت؛ node-safe) تا رندرِ نخست همان پرس‌وجو را دارد
  const [prefill] = useState(() => readStringPrefill(LIBSEARCH_Q_KEY));
  const [q, setQ] = useState(prefill ?? "");
  const [debounced, setDebounced] = useState(prefill ?? "");
  const [grade, setGrade] = useState<number | null>(initialGrade ?? null);
  const [kind, setKind] = useState<KindFilter>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState<SearchPayload | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const fetchSeq = useRef(0);

  // مصرفِ یک‌بارمصرفِ prefill (بدونِ setState — حالت‌ها initializer شدند)
  // + رویدادِ «همین‌حالا-باز» برای وقتی که نما از پیش باز است
  useEffect(() => {
    if (prefill) clearStringPrefill(LIBSEARCH_Q_KEY);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const handler = (e: Event) => {
      const d = (e as CustomEvent<{ q?: string; grade?: number }>).detail;
      if (!d) return;
      if (typeof d.grade === "number" && d.grade >= 7 && d.grade <= 12) setGrade(d.grade);
      if (typeof d.q === "string" && d.q.trim().length >= 2) {
        setQ(d.q);
        setDebounced(d.q.trim());
      }
    };
    window.addEventListener("library-search-open", handler);
    return () => {
      clearTimeout(t);
      window.removeEventListener("library-search-open", handler);
    };
  }, [prefill]);

  // debounce ۳۵۰ms — تایپِ روان بدونِ رگبارِ درخواست
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  // واکشی — هر تغییرِ پرس‌وجو/فیلتر با AbortController لغوِ قبلی؛
  // ریستِ پرس‌وجوی کوتاه هم در تایمرِ صفر می‌نشیند (نه setState همگام)
  useEffect(() => {
    if (debounced.length < 2) {
      const t = setTimeout(() => {
        setData(null);
        setLoading(false);
        setError(false);
      }, 0);
      return () => clearTimeout(t);
    }
    const seq = ++fetchSeq.current;
    const params = new URLSearchParams({ q: debounced });
    if (grade != null) params.set("grade", String(grade));
    if (kind != null) params.set("kind", kind);
    const ac = new AbortController();
    // شروعِ واکشی در تایمرِ صفر — setState همگام در بدنهٔ اثر ممنوع است
    const start = setTimeout(() => {
      setLoading(true);
      setError(false);
      fetch(`/api/jozve-search?${params.toString()}`, { signal: ac.signal })
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<SearchPayload>;
        })
        .then((payload) => {
          if (fetchSeq.current !== seq) return;
          setData(payload);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          if (fetchSeq.current !== seq) return;
          setError(true);
          setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(start);
      ac.abort();
    };
  }, [debounced, grade, kind]);

  // همان تقسیمِ موتور سرور — برای هایلایتِ هم‌قرارداد
  const terms = useMemo(
    () =>
      debounced
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length >= 2)
        .slice(0, 8),
    [debounced],
  );

  // regexِ واژه‌ها و عبارتِ پیوسته — هر دو همگام با terms تا هایلایتِ
  // memo بی‌دلیل دوباره نسازد؛ عبارت لایهٔ قوی‌تر و اولویت‌دارِ رنگ است
  const regex = useMemo(() => buildHighlightRegex(terms), [terms]);
  const phraseRe = useMemo(() => buildPhraseRegex(terms), [terms]);

  // گروه‌بندی نتایج بر پایهٔ کتاب/منبع (bookTitle) — جزوه‌ها به رنگِ خودشان،
  // بانک‌هایِ باندلِ ویژن ۲/کنکور گروه‌هایِ مستقل (r411)؛ r415 — هر گروه
  // اگر حتی یکی از اسنادش در phraseDocsِ سرور باشد «عبارتِ کامل در این
  // کتاب» می‌گیرد — مستقل از کپِ نمایش، منبعِ صداقتش سرور است
  const grouped = useMemo(() => {
    if (!data?.results.length) return [];
    const order: string[] = [];
    const map = new Map<string, JozveSearchResult[]>();
    for (const r of data.results) {
      const arr = map.get(r.bookTitle);
      if (arr) arr.push(r);
      else {
        map.set(r.bookTitle, [r]);
        order.push(r.bookTitle);
      }
    }
    const phraseSet = new Set(data.phraseDocs ?? []);
    return order.map((t) => {
      const items = map.get(t)!;
      return { title: t, items, hasPhrase: items.some((r) => phraseSet.has(r.doc)) };
    });
  }, [data]);

  const hasQuery = debounced.length >= 2;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6" dir="rtl">
      {/* سرصفحه */}
      <header className="mb-5">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="h-1.5 w-full bg-gradient-to-l from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="flex items-start justify-between gap-3 p-5">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-teal-700 text-white shadow-sm">
                <Search size={20} />
              </span>
              <div>
                <span className="mb-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-black text-emerald-800">
                  جست‌وجوی سراسری
                </span>
                <h1 className="text-lg font-black leading-7 text-stone-800">جست‌وجو در کتاب‌ها</h1>
                <p className="mt-1 text-[12px] leading-6 text-stone-500">
                  {faNum(36791)} خطِ متن و {faNum(7896)} سؤال — شش جزوه، سه درسِ ویژن ۲، آزمونِ جامع و بانکِ کنکور
                </p>
              </div>
            </div>
            <button
              onClick={goHome}
              className="mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-[12.5px] font-bold text-stone-600 shadow-sm transition hover:bg-stone-50 active:scale-95"
              aria-label="بازگشت به خانه"
            >
              <ArrowRight size={15} />
              خانه
            </button>
          </div>
        </div>
      </header>

      {/* جعبهٔ جست‌وجو */}
      <div className="sticky top-2 z-10 mb-4">
        <div className="flex items-center gap-2.5 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-md shadow-stone-900/5">
          <Search size={18} className="shrink-0 text-emerald-600" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQ("");
            }}
            role="searchbox"
            aria-label="جست‌وجو در متن کتاب‌ها و سؤال‌ها"
            placeholder="مثلاً «حال کامل»، «passive» یا «صفت ملکی»…"
            className="min-w-0 flex-1 rounded-md bg-transparent text-[15px] font-bold text-stone-800 outline-none focus:ring-2 focus:ring-emerald-500/30"
            autoComplete="off"
            spellCheck={false}
          />
          {loading ? (
            <Loader2 size={16} className="shrink-0 animate-spin text-stone-400" />
          ) : q ? (
            <button
              onClick={() => setQ("")}
              className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-black text-stone-400 transition hover:bg-stone-50 hover:text-stone-600"
              aria-label="پاک کردن جست‌وجو"
            >
              پاک
            </button>
          ) : null}
        </div>
      </div>

      {/* فیلترها */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5" role="group" aria-label="فیلتر کتاب و نوع نتیجه">
        <button
          onClick={() => setGrade(null)}
          className={`rounded-full border px-3 py-1 text-[11.5px] font-extrabold transition active:scale-95 ${
            grade == null
              ? "border-stone-800 bg-stone-800 text-white shadow-sm"
              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
          }`}
        >
          همهٔ کتاب‌ها
        </button>
        {BOOKS.map((b) => (
          <button
            key={b.grade}
            onClick={() => setGrade(grade === b.grade ? null : b.grade)}
            className={`rounded-full border px-3 py-1 text-[11.5px] font-extrabold transition active:scale-95 ${
              grade === b.grade
                ? `${b.chip} shadow-sm ring-2 ring-stone-300/60`
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
            }`}
          >
            پایهٔ {b.label}
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-stone-200" aria-hidden />
        <button
          onClick={() => setKind(kind === "text" ? null : "text")}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11.5px] font-extrabold transition active:scale-95 ${
            kind === "text"
              ? "border-amber-300 bg-amber-100 text-amber-900 shadow-sm"
              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
          }`}
        >
          <BookOpen size={11} />
          متن
        </button>
        <button
          onClick={() => setKind(kind === "question" ? null : "question")}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11.5px] font-extrabold transition active:scale-95 ${
            kind === "question"
              ? "border-violet-300 bg-violet-100 text-violet-900 shadow-sm"
              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
          }`}
        >
          <ListChecks size={11} />
          تست
        </button>
      </div>

      {/* بدنه */}
      {!hasQuery && (
        <section aria-label="پیشنهاد جست‌وجو" className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-[13.5px] font-extrabold text-stone-700">از کجا شروع کنم؟</h2>
          <p className="mb-3 text-[12px] leading-6 text-stone-500">
            هر واژه، قاعده یا عبارتی را بپرس — نتیجه‌ها از متنِ هر شش جزوه و کلِ بانک‌های تست می‌آیند؛
            کلیک روی نتیجهٔ متن، همان فصل را در کتابخانه باز می‌کند و روی تست، گزینه‌ها و کلید همان‌جا نشان داده می‌شود.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setQ(s)}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11.5px] font-bold text-stone-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 active:scale-95"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      {hasQuery && loading && !data && (
        <div className="flex justify-center py-12">
          <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-stone-200 border-t-stone-500" />
        </div>
      )}

      {hasQuery && error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
          <p className="text-[13px] font-bold text-rose-700">جست‌وجو ناموفق بود — دوباره تلاش کن.</p>
          <button
            onClick={() => setDebounced((v) => `${v}`)}
            className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-[12px] font-extrabold text-rose-700 transition hover:bg-rose-100 active:scale-95"
          >
            <RefreshCw size={13} />
            تلاش دوباره
          </button>
        </div>
      )}

      {hasQuery && !loading && !error && data && data.results.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-10 text-center shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <SearchX size={22} />
          </span>
          <p className="text-[13.5px] font-extrabold text-stone-800">نتیجه‌ای برای «{debounced}» یافت نشد</p>
          <p className="text-[11.5px] font-bold text-stone-500">کوتاه‌تر بنویس یا یکی از این‌ها را امتحان کن:</p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SUGGESTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => setQ(s)}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11.5px] font-bold text-stone-600 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasQuery && data && data.results.length > 0 && (
        <>
          <p className="mb-3 text-[11.5px] font-bold text-stone-400">
            {faNum(data.total)} نتیجه{data.total > data.results.length ? ` (نمایش ${faNum(data.results.length)})` : ""} ·{" "}
            {faNum(data.took)} میلی‌ثانیه
          </p>
          {grouped.map((g) => {
            // سرگروه: جزوه → رنگِ کتاب؛ باندلِ ویژن ۲/کنکور → تمِ مستقل
            const kind = searchGroupKind(g.items[0]?.doc ?? "");
            const meta = bookMetaByGrade(g.items[0]?.grade ?? 7);
            const spine =
              kind === "vision2"
                ? "from-violet-500 to-purple-700"
                : kind === "konkur"
                  ? "from-orange-500 to-amber-700"
                  : (meta?.spine ?? "from-stone-400 to-stone-600");
            return (
              <section key={g.title} aria-label={`نتایج ${g.title}`} className="mb-5">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex h-1.5 w-1.5 rounded-full bg-gradient-to-b ${spine}`}
                    aria-hidden
                  />
                  <h3 className="min-w-0 flex-1 truncate text-[13px] font-black text-stone-700">{g.title}</h3>
                  <span className="shrink-0 rounded-full bg-stone-100 px-1.5 text-[10px] font-black text-stone-500">
                    {faNum(g.items.length)}
                  </span>
                  {g.hasPhrase && (
                    <span
                      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200"
                      title="دست‌کم یک تطبیقِ این کتاب، عبارتِ شما را پیوسته دارد — حتی اگر در سقفِ نمایش نیفتاده باشد"
                    >
                      <Sparkle size={10} aria-hidden />
                      عبارت کامل در این کتاب
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {g.items.map((r, i) =>
                    r.kind === "text" ? (
                      <TextResultCard key={`t-${r.doc}-${r.lineIdx ?? i}-${i}`} r={r} phrase={phraseRe} terms={regex} />
                    ) : (
                      <QuestionResultCard key={`q-${r.questionId ?? i}`} r={r} phrase={phraseRe} terms={regex} />
                    ),
                  )}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
