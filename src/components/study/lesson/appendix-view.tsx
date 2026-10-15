"use client";

import { useState } from "react";
import { Library, Volume2, SpellCheck2, BookA, Table2, BookOpenCheck } from "lucide-react";
import { irregularVerbs, vowelPhonemes, consonantPhonemes, abbreviations, partsOfSpeech } from "@/data/appendix";
import BookletGrammarView from "./booklet-grammar-view";

type SubTab = "verbs" | "phonetics" | "pos" | "abbrev" | "grammar";

const subTabs: { key: SubTab; label: string; icon: React.ElementType }[] = [
  { key: "grammar", label: "درسنامهٔ جامع", icon: BookOpenCheck },
  { key: "verbs", label: "افعال بی‌قاعده", icon: SpellCheck2 },
  { key: "phonetics", label: "جدول تلفظ (IPA)", icon: Volume2 },
  { key: "pos", label: "اجزای کلام", icon: BookA },
  { key: "abbrev", label: "نشانه‌های اختصاری", icon: Table2 },
];

export default function AppendixView() {
  const [tab, setTab] = useState<SubTab>("grammar");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border c-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Library size={22} />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-stone-800">ضمیمهٔ کتاب</h1>
            <p className="text-[13px] text-stone-500">ابزارهای مرجع جزوه: درسنامهٔ جامع، افعال بی‌قاعده، تلفظ بین‌المللی و واژه‌شناسی</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {subTabs.map((st) => {
            const Icon = st.icon;
            const active = tab === st.key;
            return (
              <button
                key={st.key}
                onClick={() => setTab(st.key)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-[background-color,color,border-color,box-shadow] ${
                  active ? "bg-violet-600 text-white shadow-sm" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Icon size={15} />
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "grammar" && <BookletGrammarView />}

      {tab === "verbs" && (
        <div className="rounded-2xl border c-card p-4">
          <p className="mb-3 text-[13px] leading-7 text-stone-500">
            افعال در زبان انگلیسی سه شکل دارند: ۱) شکل ساده ۲) شکل دوم یا گذشته ۳) شکل سوم (اسم مفعول - p.p.).
            افعال بی‌قاعده به‌جای گرفتن «ed» تغییر شکل می‌دهند و باید حفظ شوند.
          </p>
          <div className="max-h-[58vh] overflow-auto rounded-xl border border-stone-200 nice-scroll">
            <table className="verbs-table w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-violet-600 text-white">
                  <th className="px-3 py-2.5 text-right">معنی فارسی</th>
                  <th className="px-3 py-2.5">شکل اول (ساده)</th>
                  <th className="px-3 py-2.5">شکل دوم (گذشته)</th>
                  <th className="px-3 py-2.5">شکل سوم (p.p.)</th>
                </tr>
              </thead>
              <tbody>
                {irregularVerbs.map((v, i) => (
                  <tr key={v.base} className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
                    <td className="px-3 py-2 text-stone-700">{v.fa}</td>
                    <td className="en-text px-3 py-2 font-bold text-violet-700" dir="ltr">{v.base}</td>
                    <td className="en-text px-3 py-2 text-stone-600" dir="ltr">{v.past}</td>
                    <td className="en-text px-3 py-2 font-semibold text-stone-800" dir="ltr">{v.pp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "phonetics" && (
        <div className="space-y-4">
          {[
            { title: "حروف صدادار (Vowels)", data: vowelPhonemes, color: "bg-emerald-600" },
            { title: "حروف بی‌صدا (Consonants)", data: consonantPhonemes, color: "bg-rose-600" },
          ].map((group) => (
            <div key={group.title} className="rounded-2xl border c-card p-4">
              <h2 className="mb-3 text-[15px] font-extrabold text-stone-800">{group.title}</h2>
              <div className="grid max-h-[38vh] gap-2 overflow-y-auto nice-scroll sm:grid-cols-2 lg:grid-cols-4">
                {group.data.map((p) => (
                  <div key={p.symbol + p.example} className="rounded-xl border border-stone-100 bg-stone-50 p-3">
                    <div className="en-text mb-1 text-xl font-black text-stone-800" dir="ltr">
                      /{p.symbol}/
                    </div>
                    <div className="text-[12px] text-stone-500">{p.fa}</div>
                    <div className="en-text mt-1 text-[12.5px] font-semibold text-emerald-700" dir="ltr">
                      {p.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] leading-7 text-amber-900">
            💡 <b>نکته:</b> علامت r در ساختارهایی مثل ɜːr و ɪər نشان می‌دهد این حرف در انگلیسی آمریکایی تلفظ می‌شود اما در
            بریتانیایی تلفظ نمی‌گردد. سیستم IPA مخفف <b>International Phonetic Alphabet</b> (الفبای آوایی بین‌المللی) است.
          </div>
        </div>
      )}

      {tab === "pos" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {partsOfSpeech.map((p, i) => (
            <div key={p.name} className="rounded-2xl border c-card p-4">
              <h2 className="mb-1 flex items-center gap-2 text-[14px] font-extrabold text-violet-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-[12px] font-black">
                  {i + 1}
                </span>
                {p.name}
              </h2>
              <p className="text-[13px] leading-7 text-stone-600">{p.desc}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "abbrev" && (
        <div className="rounded-2xl border c-card p-4">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {abbreviations.map((a) => (
              <div key={a.sym} className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50 p-3">
                <span className="en-text flex h-9 w-14 items-center justify-center rounded-lg bg-violet-600 text-[13px] font-black text-white" dir="ltr">
                  {a.sym}
                </span>
                <div>
                  <div className="en-text text-[12px] text-stone-500" dir="ltr">{a.full}</div>
                  <div className="text-[13px] font-bold text-stone-700">{a.fa}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
