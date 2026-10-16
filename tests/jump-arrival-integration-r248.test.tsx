// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۴۸ — بندِ ② پیشنهادِ ۲۴۷: تستِ یکپارچهٔ «پرشِ واقعی → نوشتنِ رسیدن»
//
// یافتهٔ بزرگِ r247: قراردادهایِ jsdom اجراکنندهٔ پرش را ایزوله رندر
// می‌کردند، نه جدول‌هایی که effectِ رسیدن‌شان می‌نویسد — برای همین
// «پرش ≠ نوشتن» از r239 بیش‌تعمیم یافته بود و هیچ گاردی ندید. این فایل
// همان نقطهٔ کور را در CI می‌بندد: کلِ زنجیرهٔ واقعی —
//   اکشنِ واقعیِ store (openAppendixVerb/…) → فیلدهایِ واقعیِ view →
//   AppendixView با دقیقاً همان propsی که study-app می‌گذرد (قفلِ منبع) →
//   effectهایِ واقعیِ رسیدنِ جدول‌ها → نوشتنِ واقعیِ رکورد.
//
// گاردها:
//   ① قفلِ سیم‌کشی: study-app.tsx هر پنج لنگر را به AppendixView می‌گذرداند
//   ② زنجیرهٔ verbs: openAppendixVerb("eat") → رکورد = verbs «eat · ate · eaten»
//   ③ زنجیرهٔ pos: openAppendixPosTable → رکورد = pos «دهم · درس اول»
//   ④ زنجیرهٔ grammar: openAppendixTopic → رکورد + آینهٔ writeBgLastTopic
//   ⑤ منفیِ صادقانهٔ لایهٔ شنیدنی (phonetics): رکوردِ seed با هویتِ مرجعِ
//      دست‌نخورده می‌ماند (رسیدن ثبت نمی‌کند — r235) ولی زیرتبِ درست می‌نشیند
//   ⑥ منفیِ صادقانهٔ لایهٔ شنیدنی (abbrev): همان قرارداد
//   ⑦ رسیدنِ بی‌لنگر: هیچ — ضمیمهٔ ساده چیزی نمی‌نویسد
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import AppendixView from "@/components/study/lesson/appendix-view";
import {
  readAppendixResume,
  readBgLastTopic,
  writeAppendixResume,
  type AppendixResumeItem,
} from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import { faNum } from "@/lib/study-theme";
import { WORD_FAMILY_TABLES, wordFamilyTableId } from "@/data/word-families";
import { BOOKLET_GRAMMAR_TOPICS } from "@/data/booklet-grammar";
import { irregularVerbs, vowelPhonemes, abbreviations } from "@/data/appendix";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
// قراردادِ واقعیِ speak همیشه یک تابعِ توقف برمی‌گرداند (حتی در مسیرِ خطا) —
// mock باید همان وفاداری را داشته باشد وگرنه unmountِ حینِ پخش می‌شکند.
vi.mock("@/lib/speak", () => ({ speak: vi.fn(async () => () => {}) }));

// IntersectionObserver برای whileInView (فریمرموشنِ درسنامه)
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  (window as { IntersectionObserver?: unknown }).IntersectionObserver = IOStub;
}

// هیچ عنوانِ ساختگی — همه از خودِ دادهٔ منجمد مشتق می‌شوند (ایدئومِ r234)
const verb = irregularVerbs.find((v) => v.base === "eat")!;
const posTable = WORD_FAMILY_TABLES[0];
const posId = wordFamilyTableId(posTable);
const topic = BOOKLET_GRAMMAR_TOPICS[0];
const phoneme = vowelPhonemes[0].symbol;
const abbrevSym = abbreviations[0].sym;

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    results: {},
    flashIntent: "none",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

/** کلِ زنجیرهٔ واقعی: اکشنِ store → فیلدهایِ view → همان propsی که
 * study-app می‌گذرد (shapeِ عینِ خطوطِ ۲۲۹-۲۳۴ study-app.tsx). */
function jumpAndMount(
  jump: (s: ReturnType<typeof useStudy.getState>) => void,
): void {
  jump(useStudy.getState());
  const view = useStudy.getState().view;
  expect(view.type).toBe("appendix");
  if (view.type !== "appendix") return;
  render(
    <AppendixView
      topicId={view.topicId}
      posTableId={view.posTableId}
      verbBase={view.verbBase}
      phonemeId={view.phonemeId}
      abbrevSym={view.abbrevSym}
    />,
  );
}

describe("real jump → real arrival write (r248 integration)", () => {
  it("source lock: study-app wires all five anchors into AppendixView", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/study/study-app.tsx"),
      "utf8",
    );
    // mappingِ دقیقِ view→props — اگر کسی نامِ فیلدی را عوض کند، این
    // گارد قرمز می‌شود پیش از آنکه پرشِ واقعی در اپ بی‌صدا بی‌اثر شود
    for (const anchor of [
      "topicId={view.topicId}",
      "posTableId={view.posTableId}",
      "verbBase={view.verbBase}",
      "phonemeId={view.phonemeId}",
      "abbrevSym={view.abbrevSym}",
    ]) {
      expect(src).toContain(anchor);
    }
  });

  it("verbs chain: openAppendixVerb lands the row and the arrival effect writes the record", async () => {
    expect(readAppendixResume()).toBeNull();
    jumpAndMount((s) => s.openAppendixVerb(verb.base));
    // «رسیده»: سطرِ فعلِ واقعی با لنگرِ iv-row-* در DOM است
    await waitFor(() => {
      expect(document.getElementById(`iv-row-${verb.base}`)).toBeTruthy();
    });
    // «نوشته»: رکورد از خودِ effectِ رسیدن — عنوانِ سه‌شکلی از دادهٔ منجمد
    await waitFor(() => {
      expect(readAppendixResume()).toEqual({
        scope: "verbs",
        id: verb.base,
        title: `${verb.base} · ${verb.past} · ${verb.pp}`,
        hint: verb.fa,
      });
    });
  });

  it("pos chain: openAppendixPosTable writes «پایه · درس» from the frozen table data", async () => {
    expect(readAppendixResume()).toBeNull();
    jumpAndMount((s) => s.openAppendixPosTable(posId));
    await waitFor(() => {
      expect(document.getElementById(`wf-table-${posId}`)).toBeTruthy();
    });
    await waitFor(() => {
      expect(readAppendixResume()).toEqual({
        scope: "pos",
        id: posId,
        title: `${posTable.grade} · ${posTable.lesson}`,
        hint: `${faNum(posTable.families.length)} خانوادهٔ واژه`,
      });
    });
  });

  it("grammar chain: openAppendixTopic writes both the record and the writeBgLastTopic mirror", async () => {
    expect(readAppendixResume()).toBeNull();
    jumpAndMount((s) => s.openAppendixTopic(topic.id));
    await waitFor(() => {
      expect(document.getElementById(`bg-topic-${topic.id}`)).toBeTruthy();
    });
    await waitFor(() => {
      expect(readBgLastTopic()).toEqual(
        expect.objectContaining({ id: topic.id, title: topic.title }),
      );
      // آینه — writeBgLastTopic خودش رکوردِ scopeِ grammar را هم می‌نویسد
      expect(readAppendixResume()).toEqual({
        scope: "grammar",
        id: topic.id,
        title: topic.title,
        hint: topic.page,
      });
    });
  });

  it("hear-layer honesty (phonetics): arrival changes the subtab but never the record — reference identity holds", async () => {
    const seed: AppendixResumeItem = {
      scope: "verbs",
      id: verb.base,
      title: `${verb.base} · ${verb.past} · ${verb.pp}`,
      hint: verb.fa,
    };
    writeAppendixResume(seed);
    const before = readAppendixResume();
    jumpAndMount((s) => s.openAppendixPhoneme(phoneme));
    // «رسیده»: کارتِ واکِ واقعی روی زیرتبِ تلفظ
    await waitFor(() => {
      expect(document.getElementById(`ph-${phoneme}`)).toBeTruthy();
    });
    // «ننوشته»: نه مقدارِ عوض‌شده، نه حتی snapshotِ تازه — هویتِ مرجعِ
    // ثابت یعنی صفرِ فراخوانیِ write در کلِ مسیرِ رسیدن (قراردادِ r235)
    expect(readAppendixResume()).toBe(before);
  });

  it("hear-layer honesty (abbrev): arrival changes the subtab but never the record — reference identity holds", async () => {
    const seed: AppendixResumeItem = {
      scope: "grammar",
      id: topic.id,
      title: topic.title,
      hint: topic.page,
    };
    writeAppendixResume(seed);
    const before = readAppendixResume();
    jumpAndMount((s) => s.openAppendixAbbrev(abbrevSym));
    await waitFor(() => {
      expect(document.getElementById(`ab-${abbrevSym}`)).toBeTruthy();
    });
    expect(readAppendixResume()).toBe(before);
  });

  it("anchor-less arrival is an honest nothing: plain appendix view writes nothing", async () => {
    useStudy.getState().setView({ type: "appendix" });
    const view = useStudy.getState().view;
    expect(view.type).toBe("appendix");
    if (view.type !== "appendix") return;
    render(<AppendixView />);
    // درسنامهٔ جامع سالم رندر شد (رسیدیم) ولی هیچ effectِ رسیدنی نوشتن ندارد
    await waitFor(() => {
      expect(document.getElementById(`bg-topic-${topic.id}`)).toBeTruthy();
    });
    expect(readAppendixResume()).toBeNull();
    expect(readBgLastTopic()).toBeNull();
  });
});

describe("resumeDoor family: the smaller result consumers opt in (r248 ①)", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("source wiring: the dictionary drill opts in", () => {
    // دریلِ جفت‌ها (resultKeyStr="0:synant") — نتیجه‌اش حالا درِ برگشت به ضمیمه دارد
    const src = read("src/components/study/lesson/dictionary-view.tsx");
    expect(src).toContain('resultKeyStr="0:synant"');
    // standalone JSX prop — نه در کامنت و نه در نامِ چیزِ دیگر
    expect(src).toMatch(/^\s*resumeDoor\s*$/m);
  });

  it("source wiring: the smart review opts in", () => {
    const src = read("src/components/study/practice/smart-practice-view.tsx");
    expect(src).toContain('resultKeyStr="smart"');
    expect(src).toMatch(/^\s*resumeDoor\s*$/m);
  });

  it("opt-out honesty: the remaining smaller consumers stay opt-out by default", () => {
    // همان قراردادِ r247: opt-inِ مصرف‌کننده — پیش‌فرضِ بقیه دست‌نخورده؛
    // این قفل یعنی اگر فردا کسی ناخواسته opt-in کند، مرورِ راند می‌بیند
    for (const p of [
      "src/components/study/lesson/syn-ant-tab.tsx",
      "src/components/study/grammar/grammar-view.tsx",
      "src/components/study/practice/danger-words.tsx",
      "src/components/study/practice/review-view.tsx",
      "src/components/study/practice/my-words-review.tsx",
    ]) {
      expect(read(p)).not.toMatch(/^\s*resumeDoor\s*$/m);
    }
  });

  it("family census: exactly five opt-ins — lesson-tests, exam, konkur, dictionary, smart", () => {
    // شمارشِ صادقانهٔ خانواده (قراردادِ شمارش‌هایِ r244/r246) — پنج opt-in
    const optedIn = [
      "src/components/study/lesson/lesson-tests-tab.tsx",
      "src/components/study/exam/exam-view.tsx",
      "src/components/study/exam/konkur-view.tsx",
      "src/components/study/lesson/dictionary-view.tsx",
      "src/components/study/practice/smart-practice-view.tsx",
    ];
    for (const p of optedIn) {
      expect(read(p), p).toMatch(/^\s*resumeDoor\s*$/m);
    }
    // و خودِ QuizEngine مسیرِ عبورِ prop را حفظ کرده (r246)
    const engine = read("src/components/study/quiz/quiz-engine.tsx");
    expect(engine).toContain("resumeDoor={resumeDoor}");
  });
});
