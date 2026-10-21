// Task 290 «کتاب‌خانهٔ داستان‌ها» — قراردادِ دادهٔ سه کتابِ Hill + سطرِ
// SyncField «libraryDone» (پاک‌سازیِ ابرمهاجرتی + ادغامِ «بیشترین نمره»).

import { describe, it, expect } from "vitest";
import {
  HILL_BOOKS,
  HILL_STORIES,
  HILL_TOTAL_STORIES,
  storiesOfBook,
  storyById,
} from "@/data/hill-stories";
import { SYNC_FIELDS } from "@/lib/persist/schema";

describe("Task 290 — hill library data contract", () => {
  it("سه کتاب با شناسه‌های ثابت و سطح‌های سه‌گانه", () => {
    expect(HILL_BOOKS.map((b) => b.id)).toEqual(["s1", "s2", "s3"]);
    expect(HILL_BOOKS.map((b) => b.level)).toEqual(["750 headwords", "1,000 headwords", "1,500 headwords"]);
  });

  it("۲۴ داستان: s1×12، s2×6، s3×6 — همهٔ کلیدها یکتا و با الگوی id", () => {
    expect(HILL_STORIES.length).toBe(24);
    expect(HILL_TOTAL_STORIES).toBe(24);
    const ids = HILL_STORIES.map((s) => s.id);
    expect(new Set(ids).size).toBe(24);
    for (const id of ids) expect(id).toMatch(/^s[123]-\d{1,3}$/);
    expect(storiesOfBook("s1").length).toBe(12);
    expect(storiesOfBook("s2").length).toBe(6);
    expect(storiesOfBook("s3").length).toBe(6);
    for (const s of HILL_STORIES) {
      expect(s.num).toBeGreaterThan(0);
      expect(s.title.length).toBeGreaterThan(3);
    }
  });

  it("هر داستان: متنِ چندپاراگراف + آزمونِ صحیح/غلطِ معتبر + بخش B + واژه‌نامه", () => {
    for (const s of HILL_STORIES) {
      const paras = s.text.split("\n\n").filter((p) => p.trim().length > 0);
      expect(paras.length, `${s.id} paragraphs`).toBeGreaterThanOrEqual(2);
      expect(s.text.length, `${s.id} text length`).toBeGreaterThan(300);
      expect(s.tf.length, `${s.id} tf count`).toBeGreaterThanOrEqual(4);
      expect(s.tf.length, `${s.id} tf count max`).toBeLessThanOrEqual(8);
      for (const q of s.tf) {
        expect(typeof q.a, `${s.id} answer boolean`).toBe("boolean");
        expect(q.q.length).toBeGreaterThan(10);
      }
      expect(s.bq.length, `${s.id} bq count`).toBeGreaterThanOrEqual(3);
      expect(s.glossary.length, `${s.id} glossary`).toBeGreaterThanOrEqual(3);
      for (const g of s.glossary) {
        expect(g.en.length).toBeGreaterThan(0);
        expect(g.fa.length).toBeGreaterThan(0);
      }
    }
  });

  it("storyById گردشِ کامل — موجود و ناهم‌خوانِ کتاب نه", () => {
    expect(storyById("s1-1")?.title).toBe("Mr Jones's Hat");
    expect(storyById("s3-6")?.book).toBe("s3");
    expect(storyById("s9-1")).toBeUndefined();
  });

  it("پاراگرافِ داستان شمارهٔ ۱ هر کتاب، داستانِ درستِ کتاب است", () => {
    for (const b of HILL_BOOKS) {
      const first = storiesOfBook(b.id).find((s) => s.num === 1);
      expect(first, `${b.id} story #1 exists`).toBeDefined();
      expect(first!.book).toBe(b.id);
    }
  });
});

describe("Task 290 — libraryDone SyncField contract", () => {
  const sanitize = SYNC_FIELDS.libraryDone.sanitize;
  const merge = SYNC_FIELDS.libraryDone.merge!;

  it("sanitize: رکوردِ معتبر می‌ماند، کلیدِ بیگانه و score>total می‌افتد", () => {
    const good = { "s1-1": { score: 5, total: 6, day: "2026-10-21" } };
    expect(sanitize(good)).toEqual(good);
    const dirty = {
      "s1-2": { score: 9, total: 6, day: "2026-10-21" }, // score > total → drop
      "hack-x": { score: 1, total: 6, day: "2026-10-21" }, // bad key → drop
      "s2-1": { score: "4", total: 6 }, // bad score → drop
    };
    expect(sanitize(dirty)).toBeUndefined();
    expect(sanitize(undefined)).toBeUndefined();
    expect(sanitize({ "s3-1": { score: 6, total: 6 } })).toEqual({
      "s3-1": { score: 6, total: 6, day: "" },
    });
  });

  it("merge: بیشترین نمره پیروز است، تساوی با روزِ تازه‌تر", () => {
    const ctx = { local: {}, remote: {} } as Parameters<typeof merge>[2];
    const local = { "s1-1": { score: 4, total: 6, day: "2026-10-20" } };
    const remote = { "s1-1": { score: 6, total: 6, day: "2026-10-19" } };
    const merged = merge(local, remote, ctx) ?? {};
    expect(merged["s1-1"]!.score).toBe(6);
    const tieL = { "s1-1": { score: 5, total: 6, day: "2026-10-20" } };
    const tieR = { "s1-1": { score: 5, total: 6, day: "2026-10-21" } };
    expect(merge(tieL, tieR, ctx)!["s1-1"]!.day).toBe("2026-10-21");
    expect(merge(undefined, remote, ctx)).toEqual(remote);
    expect(merge(local, undefined, ctx)).toEqual(local);
  });
});
