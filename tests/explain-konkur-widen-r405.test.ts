// ------------------------------------------------------------------
// r405 — بانک کنکور دهم (examBankG10، ۸۶۲ سؤالِ g10-N) به خانوادهٔ
// خطا/مرور/معلم پیوست. تا r404 سه شکافِ واقعی داشت:
//   ۱) ایندکسِ باندلِ کلاینت (explain-source) فقط ۸۱۲ سؤال باندلِ قدیم
//      را می‌شناخت → خطاهای کنکور در «مرور سریع» بی‌صدا ناپدید می‌شدند.
//   ۲) /api/explain و /api/exam-review روی g10-N با 404/400 رد می‌شدند.
//   ۳) mistakeTargetOf کنکور را به سطلِ 0 می‌فرستاد در حالی که exam-view
//      با سطلِ "g10" می‌نوشت — پاسخِ درستِ بعدی هرگز خطا را پاک نمی‌کرد.
// پیمان‌های این فایل هر سه لایه را می‌بندند.
// ------------------------------------------------------------------
import { describe, expect, it } from "vitest";
import { findQuestion, questionIndex } from "@/lib/explain-source";
import { findQuestionAny, wideQuestionIndex } from "@/lib/teacher-bank.server";
import { examBankG10 } from "@/data/exam-g10";
import { examBank } from "@/data/exam";
import { lessons } from "@/data";
import {
  isKonkurG10,
  jozveBucketOf,
  jozveFileOf,
  JOZVE_BUCKET_LABELS,
  KONKUR_BUCKET,
  mistakeTargetOf,
  sortBucketChips,
} from "@/lib/jozve-bank.client";

describe("r405 — konkur bank joins the bundled client index", () => {
  it("PACT — first, middle and last konkur ids resolve synchronously via findQuestion", () => {
    for (const id of ["g10-1", "g10-358", "g10-862"]) {
      const q = findQuestion(id);
      expect(q, id).toBeDefined();
      expect(q!.options.length).toBeGreaterThan(0);
      expect(q!.options[q!.answer]).toBeTruthy(); // key within range
    }
  });

  it("every one of the 862 konkur questions resolves in the bundled index (no dead keys)", () => {
    for (const q of examBankG10) {
      const found = findQuestion(q.id);
      expect(found, q.id).toBeDefined();
      expect(found!.id).toBe(q.id);
    }
  });

  it("bundled index = lessons + 360 exam + 862 konkur (live truth after the r456 reset reconciliation), no id collision", () => {
    const lessonCount = lessons.reduce((s, l) => s + l.quizzes.length, 0);
    // r456 — پس از ریستِ محیط، درختِ نجات‌یافته بانکهایِ درسِ نسخهٔ موازی را
    // دارد (۲۷۰۸ سؤال به‌جای ۴۵۲)؛ سرشماری به حقیقتِ زندهٔ همین درخت قفل شد.
    expect(lessonCount).toBe(2708);
    expect(examBank).toHaveLength(360);
    expect(examBankG10).toHaveLength(862);
    expect(questionIndex().size).toBe(2708 + 360 + 862);
  });

  it("wide server index = bundled live truth + 6222 jozve (live file-truth)", () => {
    expect(wideQuestionIndex().size).toBe(2708 + 360 + 862 + 6222);
    // teacher/explain services now judge konkur ids too
    expect(findQuestionAny("g10-1")).toBeDefined();
    expect(findQuestionAny("g10-862")).toBeDefined();
  });

  it("konkur ids never leak into jozve routing (r404 pact still holds)", () => {
    expect(jozveFileOf("g10-358")).toBeNull();
    expect(jozveBucketOf("g10-358")).toBeNull();
    // ...but jozve tests-g10 ids are NOT konkur ids
    expect(isKonkurG10("g10-l1-1")).toBe(false);
    expect(isKonkurG10("x-12")).toBe(false);
    expect(isKonkurG10("l1-v1")).toBe(false);
  });
});

describe("r405 — the kg10 mistake bucket is written and cleared consistently", () => {
  it("mistakeTargetOf routes konkur ids to the dedicated kg10 bucket", () => {
    expect(KONKUR_BUCKET).toBe("kg10");
    expect(isKonkurG10("g10-358")).toBe(true);
    expect(mistakeTargetOf({ id: "g10-358" })).toBe("kg10");
    expect(mistakeTargetOf({ id: "g10-1" })).toBe("kg10");
    // legacy buckets untouched:
    expect(mistakeTargetOf({ id: "x-12" })).toBe(0);
    expect(mistakeTargetOf({ id: "l2-30" })).toBe(2);
    expect(mistakeTargetOf({ id: "g7-l1-1" })).toBe("g7");
  });

  it("kg10 has an honest Persian chip label", () => {
    expect(JOZVE_BUCKET_LABELS["g10"]).toBe("جزوهٔ پایهٔ دهم");
    expect(JOZVE_BUCKET_LABELS[KONKUR_BUCKET]).toBe("بانک کنکور دهم");
  });

  it("sortBucketChips orders numerics → grades → konkur → unknowns (no NaN territory)", () => {
    const out = sortBucketChips([
      ["kg10", 3],
      ["g12", 2],
      ["zz", 1],
      ["g7", 4],
      ["1", 5],
      ["0", 6],
      ["g10", 7],
    ]);
    expect(out.map(([b]) => b)).toEqual(["0", "1", "g7", "g10", "g12", "kg10", "zz"]);
    // a copy, not a live view of the caller's array
    const src: [string, number][] = [["kg10", 1]];
    const sorted = sortBucketChips(src);
    expect(sorted).not.toBe(src);
    expect(src[0][0]).toBe("kg10");
  });
});
