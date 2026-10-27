import { describe, expect, it } from "vitest";
import { normalizeTypedAnswer, typedAnswerIndex } from "@/lib/typed-answer";
import type { QuizQuestion } from "@/lib/study-types";

// r400 — پیمانِ پاسخِ تایپی: باگِ «هر ورودیِ غلط در سؤالِ تک‌گزینه‌ایِ تایپی درست
// ثبت می‌شد» (از r285) بسته شد — بازگشتِ (answer+1)%length برای options.length=1
// همیشه خودِ answer را می‌داد. اکنون نشانِ -1 = «نادرستِ بی‌گزینه» برمی‌گردد.

const typedQ = (over: Partial<QuizQuestion>): QuizQuestion => ({
  id: "tq-1",
  category: "grammar",
  question: "stem",
  options: ["be kept"],
  answer: 0,
  kind: "typed",
  accepted: ["be kept"],
  ...over,
});

describe("r400 — typedAnswerIndex: نشانِ -1 برای نادرستِ بی‌گزینه", () => {
  it("تک‌گزینه‌ای: شکلِ accepted (با نرمال‌سازی) → answer؛ ورودیِ غلط → -1 (نه answer!)", () => {
    const q = typedQ({});
    expect(typedAnswerIndex(q, "be kept")).toBe(0);
    expect(typedAnswerIndex(q, "  Be   Kept. ")).toBe(0); // نرمال‌سازیِ حروف‌بزرگی/فاصله/نقطه
    expect(typedAnswerIndex(q, "be  kept")).toBe(0);
    expect(typedAnswerIndex(q, "totally wrong answer")).toBe(-1);
    expect(typedAnswerIndex(q, "was kept")).toBe(-1);
    expect(typedAnswerIndex(q, "0")).toBe(-1); // دورزدنِ با رقم نباید درست شود
  });

  it("دوشکلِ accepted (had got/gotten — الگویِ l142) هر دو → answer", () => {
    const q = typedQ({ accepted: ["had got", "had gotten"] });
    expect(typedAnswerIndex(q, "had got")).toBe(0);
    expect(typedAnswerIndex(q, "had gotten")).toBe(0);
    expect(typedAnswerIndex(q, "had got ten")).toBe(-1);
  });

  it("چندگزینه‌ای: ورودیِ عینِ گزینهٔ نادرست → همان اندیس؛ ورودیِ ناشناخته → نخستین نادرست پس از answer", () => {
    const q = typedQ({
      options: ["model answer", "distractor one", "distractor two"],
      accepted: ["model answer"],
    });
    expect(typedAnswerIndex(q, "model answer")).toBe(0);
    expect(typedAnswerIndex(q, "distractor one")).toBe(1); // عینِ گزینهٔ نادرست
    expect(typedAnswerIndex(q, "distractor two")).toBe(2);
    expect(typedAnswerIndex(q, "something else")).toBe(1); // (0+1)%3
  });

  it("بدونِ accepted (mcqِ تایپی‌نما): گزینهٔ درست و نادرستِ چاپی همان‌طور که بود", () => {
    const q = typedQ({ accepted: undefined });
    expect(typedAnswerIndex(q, "be kept")).toBe(0);
    expect(typedAnswerIndex(q, "wrong")).toBe(-1);
  });

  it("normalizeTypedAnswer: آپوستروف‌های خمیده/بریده و اسلش و نشانه‌گذاریِ پایانی", () => {
    expect(normalizeTypedAnswer("Didn’t she?")).toBe("didn't she");
    expect(normalizeTypedAnswer("hadn`t")).toBe("hadn't");
    expect(normalizeTypedAnswer("We / You")).toBe("we you");
  });
});
