// r404 — پیمان‌هایِ بانکِ خطای سراسری: خطاهای جزوه ثبت، حل و مرور می‌شوند
//
// سه لایهٔ این پیمان:
//  ۱) مسیریابیِ شناسه: هر شناسهٔ کتابخانهٔ جزوه به فایلِ صاحبِ خودش و
//     سطلِ پایه‌ایِ خودش (g7..g12) می‌رود؛ شناسه‌هایِ باندل‌شده (l1/x/کنکورِ
//     «g10-358») هرگز واردِ مسیرِ جزوه نمی‌شوند.
//  ۲) پکتِ فایل‌حقیقت: نخستین و آخرین سؤالِ هر ۹ فایلِ واقعیِ public/jozve
//     از پسِ مسیریاب برمی‌آیند — یعنی هیچ فضای‌نامیِ کتابخانه بی‌صاحب نیست.
//  ۳) لودرِ on-demand: فقط فایل‌هایِ لازم fetch می‌شوند، کشِ هر فایل
//     یک‌بارمصرف است و خرابیِ fetch نقشهٔ خالی می‌دهد (قابلِ تلاشِ دوباره).
import { describe, expect, it, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  jozveBucketOf,
  jozveFileOf,
  loadJozveQuestionsFor,
  mistakeTargetOf,
  JOZVE_BUCKET_LABELS,
} from "@/lib/jozve-bank.client";
import { asQuestion } from "@/lib/quiz-question-guard";
import { findQuestion } from "@/lib/explain-source";
import { JOZVE_BANK_FILES } from "@/lib/jozve-bank";

const PUBLIC_JOZVE = path.join(process.cwd(), "public", "jozve");

const firstAndLastId = (file: string): [string, string] => {
  const parsed = JSON.parse(readFileSync(path.join(PUBLIC_JOZVE, file), "utf8")) as {
    lessons?: { questions?: { id?: string }[] }[];
  };
  const ids: string[] = [];
  for (const L of parsed.lessons ?? []) for (const q of L.questions ?? []) if (q.id) ids.push(q.id);
  return [ids[0], ids[ids.length - 1]];
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("r404 — jozve id routing (file + mistake bucket)", () => {
  it("routes every library namespace to its owning file", () => {
    expect(jozveFileOf("g7-l1-1")).toBe("tests-g7.json");
    expect(jozveFileOf("g8-l12-3")).toBe("tests-g8.json");
    expect(jozveFileOf("g9-l5-2")).toBe("tests-g9.json");
    expect(jozveFileOf("g10-l100-4")).toBe("tests-g10.json");
    expect(jozveFileOf("g11-l25-1")).toBe("tests-g11.json");
    expect(jozveFileOf("g12-l142-1")).toBe("tests-g12.json"); // typed review bank
    expect(jozveFileOf("g11-gram-l1-1")).toBe("grammar-g11.json");
    expect(jozveFileOf("g11-kgram-l3-9")).toBe("grammar-g11-konkur.json");
    expect(jozveFileOf("g12-rel-1")).toBe("grammar-g12-topic.json");
    expect(jozveFileOf("g12-fin-7")).toBe("grammar-g12-topic.json"); // finals topic bank
    expect(jozveFileOf("g12-dmcq-44")).toBe("grammar-g12-topic.json");
  });

  it("never claims bundled ids — lessons, exam bank and the konkur g10-NNN family", () => {
    expect(jozveFileOf("l1-v1")).toBeNull();
    expect(jozveFileOf("l2-30")).toBeNull();
    expect(jozveFileOf("l3-77")).toBeNull();
    expect(jozveFileOf("x-12")).toBeNull(); // exam bank 360
    expect(jozveFileOf("g10-358")).toBeNull(); // konkur bank — numeric, NOT jozve
    expect(jozveFileOf("review-1")).toBeNull();
    expect(jozveFileOf("")).toBeNull();
  });

  it("mistake buckets are grade-scoped for jozve ids and legacy for bundled ones", () => {
    expect(jozveBucketOf("g7-l1-1")).toBe("g7");
    expect(jozveBucketOf("g12-fin-7")).toBe("g12");
    expect(jozveBucketOf("g10-358")).toBeNull();
    expect(jozveBucketOf("l1-v1")).toBeNull();
    expect(mistakeTargetOf({ id: "g9-l5-2" })).toBe("g9");
    expect(mistakeTargetOf({ id: "g12-l142-1" })).toBe("g12");
    expect(mistakeTargetOf({ id: "l1-v1" })).toBe(1);
    expect(mistakeTargetOf({ id: "l3-77" })).toBe(3);
    expect(mistakeTargetOf({ id: "x-12" })).toBe(0);
  });

  it("PACT — first and last question of each of the 9 real files route back to that file", () => {
    expect(JOZVE_BANK_FILES).toHaveLength(9);
    for (const file of JOZVE_BANK_FILES) {
      const [first, last] = firstAndLastId(file);
      expect(jozveFileOf(first), `${file} first=${first}`).toBe(file);
      expect(jozveFileOf(last), `${file} last=${last}`).toBe(file);
      const bucket = jozveBucketOf(first);
      expect(bucket, `${file} bucket`).toBeTruthy();
      expect(JOZVE_BUCKET_LABELS[bucket!], `${file} label`).toBeDefined();
    }
  });

  it("PACT — no dead keys: every library question is review-resolvable (not bundled, file-owned)", () => {
    // هر سؤالِ کتابخانه که غلط ثبت شود باید یا در ایندکسِ باندل باشد یا
    // مسیریاب برایش فایل بشناسد — وگرنه در «مرور سریع» ناپدید می‌ماند.
    let checked = 0;
    for (const file of JOZVE_BANK_FILES) {
      const parsed = JSON.parse(readFileSync(path.join(PUBLIC_JOZVE, file), "utf8")) as {
        lessons?: { questions?: { id?: string }[] }[];
      };
      for (const L of parsed.lessons ?? []) {
        for (const q of L.questions ?? []) {
          if (!q.id) continue;
          const bundled = findQuestion(q.id);
          if (bundled) continue; // first-wins: bundled owner is fine too
          expect(jozveFileOf(q.id), `orphan id ${q.id} in ${file}`).toBe(file);
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(6000);
  });

  it("grade buckets sort labels exist for all six grades (+ r405 konkur bucket)", () => {
    expect(Object.keys(JOZVE_BUCKET_LABELS)).toEqual([
      "g7",
      "g8",
      "g9",
      "g10",
      "g11",
      "g12",
      "kg10", // r405 — بانک کنکور دهم (WIDENED)
    ]);
    expect(JOZVE_BUCKET_LABELS.g12).toBe("جزوهٔ پایهٔ دوازدهم");
  });
});

describe("r404 — on-demand jozve loader (fetch + per-file cache)", () => {
  const fakeFile = {
    lessons: [
      {
        lesson: 1,
        questions: [
          { id: "g7-l1-1", category: "vocab", question: "q1", options: ["a", "b"], answer: 0 },
          { id: "g7-l1-2", category: "vocab", question: "q2", options: ["a", "b"], answer: 1, translation: "ترجمه" },
        ],
      },
      {
        lesson: 2,
        questions: [
          { id: "g7-l2-1", category: "vocab", question: "q3", options: ["a", "b", "c"], answer: 2 },
          { id: "broken", question: "no options", options: [], answer: 0 }, // shape-guard drops
        ],
      },
    ],
  };

  it("fetches only the owning files and returns a valid id→question map", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(fakeFile), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const map = await loadJozveQuestionsFor(["g7-l1-1", "g7-l1-2", "g7-l2-1", "x-12", "g10-358"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/jozve/tests-g7.json");
    expect(map.get("g7-l1-1")?.question).toBe("q1");
    expect(map.get("g7-l1-2")?.translation).toBe("ترجمه");
    expect(map.get("g7-l2-1")?.answer).toBe(2);
    expect(map.has("x-12")).toBe(false);
    expect(map.has("g10-358")).toBe(false);
    expect(map.has("broken")).toBe(false); // shape-guard dropped
  });

  it("caches per file — a second batch for the same file triggers no refetch", async () => {
    const g8 = {
      lessons: [
        {
          lesson: 1,
          questions: [
            { id: "g8-l1-1", category: "vocab", question: "a", options: ["x"], answer: 0 },
            { id: "g8-l1-2", category: "vocab", question: "b", options: ["y"], answer: 0 },
          ],
        },
      ],
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(g8), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await loadJozveQuestionsFor(["g8-l1-1"]);
    await loadJozveQuestionsFor(["g8-l1-2"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("a failed fetch resolves empty and stays retryable", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const map = await loadJozveQuestionsFor(["g9-l1-1"]);
    expect(map.size).toBe(0);
    const fetchOk = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ lessons: [{ lesson: 1, questions: [{ id: "g9-l1-1", category: "vocab", question: "ok", options: ["a"], answer: 0 }] }] }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchOk);
    const retried = await loadJozveQuestionsFor(["g9-l1-1"]);
    expect(retried.get("g9-l1-1")?.question).toBe("ok");
  });

  it("a non-200 response also resolves empty (never throws)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("nope", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    const map = await loadJozveQuestionsFor(["g11-kgram-l1-1"]);
    expect(map.size).toBe(0);
  });
});

describe("r404 — shared question shape-guard (quiz-question-guard)", () => {
  const base = { id: "g7-l1-1", category: "vocab", question: "stem", options: ["a", "b"], answer: 1 };

  it("keeps a valid row and its optional fields (kind/accepted/translation)", () => {
    const q = asQuestion({ ...base, kind: "typed", accepted: ["b", "B"], translation: "ترجمه" });
    expect(q).not.toBeNull();
    expect(q!.kind).toBe("typed");
    expect(q!.accepted).toEqual(["b", "B"]);
    expect(q!.translation).toBe("ترجمه");
  });

  it("rejects malformed rows — the same contract the server bank enforces", () => {
    expect(asQuestion(null)).toBeNull();
    expect(asQuestion({ ...base, id: "" })).toBeNull();
    expect(asQuestion({ ...base, id: "x".repeat(61) })).toBeNull();
    expect(asQuestion({ ...base, question: "  " })).toBeNull();
    expect(asQuestion({ ...base, options: [] })).toBeNull();
    expect(asQuestion({ ...base, options: ["a", 3] })).toBeNull();
    expect(asQuestion({ ...base, answer: 2 })).toBeNull();
    expect(asQuestion({ ...base, answer: -1 })).toBeNull();
    expect(asQuestion({ ...base, answer: 1.5 })).toBeNull();
  });
});
