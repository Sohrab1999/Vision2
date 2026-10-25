// ------------------------------------------------------------------
// r406 — «دریل مثال‌های درسنامهٔ جامع» — پنجمین بانک رویِ نمایِ مشترکِ
// r403 و نخستین بانکِ بیرون از چهار بانکِ جدولیِ ضمیمه.
//
// منبعِ حقیقت: BOOKLET_GRAMMAR_TOPICS (src/data/booklet-grammar.ts) —
// ۳۲ درسنامه، ۲۰۵ مثالِ ترجمه‌دارِ عینِ جزوه‌ها؛ موتور هیچ مثال/ترجمه/
// موضوعی نمی‌سازد (قراردادِ صداقتِ درسنامهٔ r214 در سویچِ تمرین هم
// پابرجاست). آزمونک/تمرینِ تایپی/جمله‌سازیِ خودِ جزوه (TopicDrill و
// همخانواده‌هایش در booklet-grammar-view) پیشتر مصرف بشردهاند — این
// موتور سراغشان نمیرود؛ تنها ستونِ دوبلِ مثال↔ترجمه و نسبتِ مثال↔موضوع
// را پرسیدنی میکند که پیش از این فقط خواندنی بود.
//
// طراحی (همان قوانینِ موتورهایِ فعلِ r400 / واژهٔ r403 / نشانهٔ r404 /
// تلفظِ r405 — مالکِ مشترک: appendix-drill):
//  · سه گونهٔ چرخشی: ترجمه (مثال→فارسی) / جملهٔ انگلیسی (فارسی→مثال) /
//    تشخیصِ موضوع (مثال→عنوانِ درسنامه) — جلسهٔ ۱۰تایی با چرخشِ اندیسِ
//    صادق: ترجمه و جمله چهار بار، موضوع سه بار (fa×۴، ex×۳، topic×۳).
//  · هر مثال حداکثر یک بار در جلسه (سدِ تکرار؛ ۲۰۵ مثال — بازاستفاده
//    فقط در تهشدن، همان قراردادِ r403).
//  · distractorها از همان ستونِ خودِ بانک، استخرِ ارزشی + حذفِ پاسخ
//    (گزینه‌هایِ موضوع: عناوینِ همان جزوهٔ مبدأ — نزدیکترین بدلهایِ صادق).
//  · **درسِ لنگرِ بی‌ابهام (تعمیمِ r403/r405 به دو-سویه):** سرشماریِ
//    r406 نشان داد یک جملهٔ انگلیسی («They were forced…») در دو موضوع
//    با دو ترجمهٔ متفاوت آمده و هشت ترجمه نیز دوبار تکرار شدهاند (جفتهای
//    همسانِ شرطیِ دهم/دوازدهم). پس:
//      - گونهٔ ترجمه فقط با مثالهایی واجد است که enشان در کلِ بانک به
//        دقیقاً یک ترجمه میرسد (دو ترجمه = دو پاسخِ درستِ ساختگی)؛
//      - گونهٔ جملهٔ انگلیسی فقط با ترجمههایی که به دقیقاً یک en
//        میرسند (جفتِ همسانِ تکراری یکتاست و میماند — ابهام نیست)؛
//      - گونهٔ موضوع فقط با مثالهایی که متنِ enشان در کلِ بانک یکتاست
//        (عینِ سدِ نمونهٔ یکتایِ r405 — وگرنه پرامپت دو موضوعِ درست میزاد).
//  · درسِ روخوانیِ r230/r404 قانونِ چیپ را میدهد: جملهٔ انگلیسیِ پرسش
//    شنیدنی است (گونههای ترجمه و موضوع)؛ در گونهٔ جملهٔ انگلیسی خودِ
//    گزینهها انگلیسی‌اند — «شنیدنیِ پرسش هرگز پاسخ نیست»، بیچیپ.
//  · r406 — تکمیلِ درسِ مالکیتِ r403: جهتِ گزینهها (RTL فارسی / LTR
//    انگلیسی) دیگر از رویِ kind حدس زده نمیشود — فیلدِ faOptions در
//    خودِ پرسش زندگی میکند و موتورِ هر بانک مالکش است (گونههای fa و
//    topic گزینههای فارسی دارند؛ ex انگلیسی).
//  · rng تزریقی — جلسهٔ قطعی زیرِ تست، واقعی زیرِ UI. shuffled از مالک.
//  · نمره/مرور از مالک: scoreDrill / buildDrillReplay — برچسبِ نویسی
//    دوباره ممنوع (ضدِ دو-نامِ r385). موتور خالص است — نوشتنیِ جلسه
//    (رکوردِ r412 و بانکِ خطایِ ماندگارِ r413) نزدِ نمایِ مشترک است.
// ------------------------------------------------------------------

import type { BgTopic } from "@/data/booklet-grammar";
import {
  shuffled,
  DRILL_SIZE,
  type DrillQuestion,
  type DrillSession,
} from "./appendix-drill";

/** گونههای دریلِ مثالهای درسنامه (r406 — پنجمین بانک) —
 *  ترجمه (مثال→فارسی) / جملهٔ انگلیسی (فارسی→مثال) / تشخیصِ موضوع */
export type BgExampleDrillKind = "fa" | "ex" | "topic";

/** ترتیبِ چرخشِ گونهها — ۱۰ پرسش = ترجمه×۴، جمله×۳، موضوع×۳ */
export const BG_EXAMPLE_DRILL_KINDS: BgExampleDrillKind[] = ["fa", "ex", "topic"];

/** برچسبِ فارسیِ گونهها — برایِ بازخوانیِ صادق و تست */
export const BG_EXAMPLE_KIND_LABEL: Record<BgExampleDrillKind, string> = {
  fa: "ترجمه",
  ex: "جملهٔ انگلیسی",
  topic: "موضوع",
};

/** یک مثالِ تختشده با لنگرهایِ خودش — هیچ فیلدی بیرونِ جزوه ساخته نمیشود */
export interface BgExampleItem {
  en: string;
  fa: string;
  topicId: string;
  topicTitle: string;
  source: BgTopic["source"];
}

/** تختکردنِ صادقِ موضوعها به مثالها — ترتیبِ بانک = ترتیبِ خودِ داده */
export function flattenBgExamples(topics: readonly BgTopic[]): BgExampleItem[] {
  const bank: BgExampleItem[] = [];
  for (const t of topics) {
    for (const e of t.examples ?? []) {
      bank.push({
        en: e.en,
        fa: e.fa,
        topicId: t.id,
        topicTitle: t.title,
        source: t.source,
      });
    }
  }
  return bank;
}

export function buildBgExampleDrillSession(
  topics: readonly BgTopic[],
  size: number = DRILL_SIZE,
  rng: () => number = Math.random,
): DrillSession {
  const bank = flattenBgExamples(topics);
  if (bank.length === 0) return { questions: [], size: 0 };
  const n = Math.min(Math.max(1, Math.floor(size)), bank.length);

  // یکتاییِ دوسویه — یکبارِ پیشمحاسبه (خالص: هیچ جهشی در داده).
  // en→مجموعهٔ ترجمهها / fa→مجموعهٔ enها / شمارشِ متنِ en.
  const enFas = new Map<string, Set<string>>();
  const faEns = new Map<string, Set<string>>();
  const enCount = new Map<string, number>();
  for (const it of bank) {
    if (!enFas.has(it.en)) enFas.set(it.en, new Set());
    enFas.get(it.en)!.add(it.fa);
    if (!faEns.has(it.fa)) faEns.set(it.fa, new Set());
    faEns.get(it.fa)!.add(it.en);
    enCount.set(it.en, (enCount.get(it.en) ?? 0) + 1);
  }

  // واجدانهایِ هر گونه — گونهٔ بیپیشنهاد جلسه را کوتاه میکند، نه واژگون
  // (درسِ r404)؛ سلولِ تهیِ جزوه پرسیدنی نیست (همان صداقتِ بانکهایِ پیشین).
  const eligible = new Map<BgExampleDrillKind, BgExampleItem[]>();
  eligible.set(
    "fa",
    bank.filter((it) => it.en !== "" && it.fa !== "" && enFas.get(it.en)!.size === 1),
  );
  eligible.set(
    "ex",
    bank.filter((it) => it.en !== "" && it.fa !== "" && faEns.get(it.fa)!.size === 1),
  );
  eligible.set(
    "topic",
    bank.filter((it) => it.en !== "" && it.topicTitle !== "" && enCount.get(it.en) === 1),
  );

  const used = new Set<BgExampleItem>();
  const questions: DrillQuestion[] = [];
  for (let i = 0; i < n; i++) {
    const kind = BG_EXAMPLE_DRILL_KINDS[i % BG_EXAMPLE_DRILL_KINDS.length];
    // ترجیحِ مثالِ بیکاربرد؛ استخرِ تهیشده اجازهٔ بازاستفاده میدهد
    const pool = eligible.get(kind)!;
    const fresh = pool.filter((it) => !used.has(it));
    const pickable = fresh.length > 0 ? fresh : pool;
    if (pickable.length === 0) continue; // جلسهٔ کوتاهترِ صادق
    const it = shuffled(pickable, rng)[0];
    used.add(it);

    if (kind === "fa") {
      // ترجمه: پرسش = جملهٔ انگلیسی (چیپِ شنیدنی)؛ گزینهها فارسی (RTL)
      const correct = it.fa;
      const column = Array.from(new Set(bank.map((x) => x.fa))).filter((v) => v !== correct);
      const distractors = shuffled(column, rng).slice(0, 3);
      const options = shuffled([correct, ...distractors], rng);
      questions.push({
        base: it.en, // جملهٔ هدف برایِ بازخوانی — صادق در هر حال
        fa: it.fa,
        kind,
        prompt: "ترجمهٔ این جملهٔ انگلیسی کدام است؟",
        options,
        answer: options.indexOf(correct),
        speak: it.en, // r230: جملهٔ پرسش شنیدنی است — پاسخ فارسی است و هرگز
        faOptions: true,
      });
    } else if (kind === "ex") {
      // جملهٔ انگلیسی: پرسش فارسیِ ترجمه؛ گزینهها انگلیسی (LTR) — بیچیپ
      // (شنیدنیِ پرسش هرگز پاسخ نیست — خودِ گزینهها جملهٔ انگلیسی‌اند)
      const correct = it.en;
      const column = Array.from(new Set(bank.map((x) => x.en))).filter((v) => v !== correct);
      const distractors = shuffled(column, rng).slice(0, 3);
      const options = shuffled([correct, ...distractors], rng);
      questions.push({
        base: it.en,
        fa: it.fa,
        kind,
        prompt: `کدام جمله معنیِ «${it.fa}» را دارد؟`,
        options,
        answer: options.indexOf(correct),
        speak: undefined,
        faOptions: false,
      });
    } else {
      // موضوع: پرسش = مثال (چیپِ شنیدنی)؛ گزینهها عنوانِ موضوعهایِ
      // همان جزوهٔ مبدأ (استخرِ ارزشی — نزدیکترین بدلهایِ صادق)
      const correct = it.topicTitle;
      const column = Array.from(
        new Set(bank.filter((x) => x.source === it.source).map((x) => x.topicTitle)),
      ).filter((v) => v !== correct);
      const distractors = shuffled(column, rng).slice(0, 3);
      const options = shuffled([correct, ...distractors], rng);
      questions.push({
        base: it.topicId, // موضوعِ هدف برایِ بازخوانی — صادق در هر حال
        fa: it.topicTitle,
        kind,
        prompt: "این مثال از درسنامهٔ کدام موضوع است؟",
        options,
        answer: options.indexOf(correct),
        speak: it.en,
        faOptions: true,
      });
    }
  }
  // size = شمارِ واقعیِ پرسشها — گونهٔ بیپیشنهاد جلسه را کوتاه میکند، نه واژگون
  return { questions, size: questions.length };
}
