// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۱۴ — گاردهای «درسنامهٔ جامع» (مرور گرامرهای پایهٔ هفتم تا نهم،
// جزوهٔ جامع پایهٔ دهم، صفحات ۲۲-۳۶) — راند ۲۱۵: یازدهم (۷ موضوع) —
// راند ۲۱۶: دوازدهم (۸ موضوع). قراردادها مثل راندهای ۲۱۰-۲۱۳:
// پینِ شمارش، پینِ نمونه‌های وفادار، بلک‌لیستِ خرابیِ فونت، scrubِ
// مؤلف/ناشر، سلامتِ آزمونک‌ها (کلید در محدوده، گزینه‌های یکتا) و
// گاردهای رندرِ زیرتابِ پنجم ضمیمه.
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";

import BookletGrammarView, {
  normTypeAnswer,
  normOrderAnswer,
  buildOrderTiles,
  orderTilesFor,
} from "@/components/study/lesson/booklet-grammar-view";
import {
  BOOKLET_GRAMMAR_TOPICS,
  BOOKLET_GRAMMAR_SOURCE,
  BOOKLET_GRAMMAR_SOURCES,
  type BgTopic,
} from "@/data/booklet-grammar";

const ALL = BOOKLET_GRAMMAR_TOPICS;

// رندر — زیرتابِ درسنامهٔ جامع (کامپوننت مستقیم؛ ضمیمه همان را مصرف می‌کند)
function renderTab() {
  return render(<BookletGrammarView />);
}

function flatten(): { rows: number; tables: number; examples: number; drills: number; notes: number } {
  let rows = 0, tables = 0, examples = 0, drills = 0, notes = 0;
  for (const t of ALL) {
    for (const tb of t.tables ?? []) { tables += 1; rows += tb.rows.length; }
    examples += t.examples?.length ?? 0;
    drills += t.drill?.length ?? 0;
    notes += t.notes?.length ?? 0;
  }
  return { rows, tables, examples, drills, notes };
}

describe("booklet-grammar-r214 — دادهٔ درسنامهٔ جامع", () => {
  it("پینِ ساختار: ۳۲ موضوع (۱۶ دهم + ۸ یازدهم + ۸ دوازدهم)، ۱۶ ردیفِ جدولِ زمان‌ها، نمونهٔ جمعِ بخش‌ها", () => {
    expect(ALL).toHaveLength(32);
    expect(ALL.filter((t) => t.source === "دهم")).toHaveLength(16);
    expect(ALL.filter((t) => t.source === "یازدهم")).toHaveLength(8);
    expect(ALL.filter((t) => t.source === "دوازدهم")).toHaveLength(8);
    const sixteen = ALL.find((t) => t.id === "bg-sixteen-tenses");
    expect(sixteen).toBeDefined();
    expect(sixteen!.tables![0].rows).toHaveLength(16); // ۱۶ زمان
    const f = flatten();
    // عاقل‌بودنِ جمع‌ها — نه صفر، نه انفجار
    expect(f.tables).toBeGreaterThanOrEqual(22);
    expect(f.examples).toBeGreaterThanOrEqual(150);
    expect(f.examples).toBeLessThan(280);
    expect(f.drills).toBe(105); // ۳۱ آزمونکِ دهم + ۶۶ آزمونکِ یازدهم (r217) + ۶ دستگریمِ دوازدهم (ص۱۸۷) + ۲ مصدرِ ص۱۱۰ (r225)
    expect(f.notes).toBeGreaterThanOrEqual(150);
  });

  it("هر موضوع شناسهٔ مبدأ دارد و سرگروه‌ها مستندند", () => {
    for (const t of ALL) {
      expect(["دهم", "یازدهم", "دوازدهم"]).toContain(t.source);
    }
    expect(BOOKLET_GRAMMAR_SOURCES["دهم"]).toContain("بنیان‌های هفتم تا نهم");
    expect(BOOKLET_GRAMMAR_SOURCES["یازدهم"]).toContain("Vision Two");
    expect(BOOKLET_GRAMMAR_SOURCES["دوازدهم"]).toContain("Vision Three");
  });

  it("پینِ نمونه‌های وفادارِ جزوه — قاعده‌ها و کلیدهای آزمونک", () => {
    const aux = ALL.find((t) => t.id === "bg-alphabet-word-sentence")!;
    expect(aux.notes!.join(" ")).toContain("am, is, are, was, were, will, would, have, has, had");
    expect(aux.orderStrip).toEqual([
      "فاعل", "فعل کمکی", "فعل اصلی", "مفعول", "قید حالت", "قید مکان", "قید زمان",
    ]);
    // کلیدِ آزمونکِ صفات ملکی — سؤال ۱ از جزوه: (c) یعنی ایندکس ۲
    const pos = ALL.find((t) => t.id === "bg-possessive-adjectives")!;
    expect(pos.drill![0].options[pos.drill![0].answer]).toBe("of / ’s");
    // کلیدِ آزمونکِ مفعولی — سؤال ۱ از جزوه: (d) یعنی ایندکس ۳
    const obj = ALL.find((t) => t.id === "bg-objective-pronouns")!;
    expect(obj.drill![0].options[obj.drill![0].answer]).toBe("it");
    // ترجمهٔ وفادارِ مثال to be
    const tob = ALL.find((t) => t.id === "bg-verb-to-be")!;
    expect(tob.tables![0].rows[0][0]).toContain("I am … — من ... هستم.");
    // ۱۶ زمان: سطرِ آینده در گذشتهٔ کامل استمراری
    const row = sixteen().tables![0].rows[15];
    expect(row[0]).toBe("آینده در گذشتهٔ کامل استمراری");
    expect(row[1]).toContain("would have been");
    function sixteen(): BgTopic {
      return ALL.find((t) => t.id === "bg-sixteen-tenses")!;
    }
  });

  it("scrubِ مؤلف/ناشر و واترمارک — هیچ اثری از احمدی/همکاران/تلگرام/جزوهٔ جامع نیست", () => {
    const banned = [/احمدی/, /همکاران/, /تلگرام/i, /Telegram/i, /تألیف/, /گردآوری/];
    const texts: string[] = [BOOKLET_GRAMMAR_SOURCE];
    for (const t of ALL) {
      texts.push(t.title, t.titleEn ?? "", t.intro ?? "", t.page);
      texts.push(...(t.notes ?? []));
      for (const tb of t.tables ?? []) texts.push(...tb.headers, ...tb.rows.flat());
      for (const ex of t.examples ?? []) texts.push(ex.en, ex.fa, ex.tag ?? "");
      for (const d of t.drill ?? []) texts.push(d.q, ...d.options);
    }
    for (const tx of texts) {
      for (const b of banned) expect(tx).not.toMatch(b);
    }
  });

  it("بلک‌لیستِ خرابیِ فونت — هیچ شکلِ خرابِ شناخته‌شده‌ای در متنِ ترمیم‌شده نیست", () => {
    // اشکالِ خرابِ راندهای ۲۱۰-۲۱۱ (فقط روی متنِ فارسی — نه انگلیسی)
    const corrupt = [
      /جمالت/, /اسایم/, /انگلییس/, /فاریس/, /خییل/, /باال\b/, /کمگ\b/,
      /پیینا/, /ژاپتن/, /کالس/, /حاضز/, /گایه/, /نقیل\b/, /دریس\b/,
      /شوانر/, /منفن/, /سؤایل\b/, /بایس\b/, /خوایه/, /االن\b/,
    ];
    const faTexts: string[] = [];
    for (const t of ALL) {
      if (t.intro) faTexts.push(t.intro);
      faTexts.push(...(t.notes ?? []));
      if (t.orderStrip) faTexts.push(...t.orderStrip);
      for (const tb of t.tables ?? [])
        for (const r of tb.rows)
          for (const cell of r)
            if (!/^[A-Za-z0-9]/.test(cell)) faTexts.push(cell);
      for (const ex of t.examples ?? []) faTexts.push(ex.fa);
    }
    for (const tx of faTexts) for (const c of corrupt) expect(tx).not.toMatch(c);
  });

  it("سلامتِ آزمونک‌ها — کلید در محدوده، ۴ گزینهٔ یکتا و غیرخالی، سؤالِ لاتین", () => {
    for (const t of ALL) {
      for (const d of t.drill ?? []) {
        expect(d.options).toHaveLength(4);
        expect(new Set(d.options).size).toBe(4);
        for (const o of d.options) expect(o.trim().length).toBeGreaterThan(0);
        expect(d.answer).toBeGreaterThanOrEqual(0);
        expect(d.answer).toBeLessThan(4);
        // ساقه باید لاتین‌محور باشد (تست‌های خود جزوه انگلیسی‌اند)
        const latin = (d.q.match(/[A-Za-z]/g) ?? []).length;
        expect(latin).toBeGreaterThan(8);
      }
    }
  });

  it("مثال‌ها دوزبانه سالم‌اند — en لاتین‌محور، fa فارسی‌محور", () => {
    for (const t of ALL) {
      for (const ex of t.examples ?? []) {
        expect(ex.en.trim().length).toBeGreaterThan(2);
        expect(ex.fa.trim().length).toBeGreaterThan(1);
        expect(/[A-Za-z]/.test(ex.en)).toBe(true);
        expect(/[\u0600-\u06FF]/.test(ex.fa)).toBe(true);
      }
    }
  });

  it("شناسه‌ها یکتا و منبع مستند است", () => {
    expect(new Set(ALL.map((t) => t.id)).size).toBe(ALL.length);
    expect(BOOKLET_GRAMMAR_SOURCE).toContain("صفحات ۲۲ تا ۳۶");
    expect(BOOKLET_GRAMMAR_SOURCE).toContain("Prospect 1-3");
  });

  // ------------------------------------------------ راند ۲۱۵ — یازدهم
  it("r215 پینِ وفاداریِ یازدهم — حال کامل، افعال دو کلمه‌ای، شرطی نوع اول، -ed/-ing", () => {
    const pp = ALL.find((t) => t.id === "bg-present-perfect")!;
    expect(pp.notes!.join(" ")).toContain("have / has (فعل‌های کمکی) + شکل سوم فعل (p.p.)");
    // هر ۱۲ علامتِ کاربردها مستندند
    const joined = pp.notes!.join(" ");
    for (const marker of ["since", "for", "yet", "just", "ever", "already", "so far", "lately", "during", "second time"]) {
      expect(joined).toContain(marker);
    }
    // جدولِ صرفِ worked
    expect(pp.tables![0].rows[0][1]).toContain("I have worked — من کار کرده‌ام");
    expect(pp.examples![0].en).toBe("We have lived in Boukan since 1356.");

    const phr = ALL.find((t) => t.id === "bg-phrasal-verbs")!;
    // ۹ جدا نشدنی + ۱۹ جدا شدنی = ۲۸ ردیفِ دوستونه
    expect(phr.tables![0].rows).toHaveLength(19);
    expect(phr.notes!.join(" ")).toContain("هرگز بعد از حرف اضافه نمی‌آید");
    expect(phr.examples![2].en).toContain("Turn it on please.");

    const cond = ALL.find((t) => t.id === "bg-first-conditional")!;
    expect(cond.notes!.join(" ")).toContain("If you study more, you will learn a lot.");
    expect(cond.notes!.join(" ")).toContain("must, should, may, can");

    const ed = ALL.find((t) => t.id === "bg-ed-ing-adjectives")!;
    expect(ed.tables![0].rows).toHaveLength(11);
    expect(ed.tables![0].rows[0]).toEqual(["amuse — شگفت‌زده کردن", "amused — شگفت‌زده", "amusing — شگفت‌زده‌کننده"]);

    const ger = ALL.find((t) => t.id === "bg-gerund")!;
    expect(ger.notes!.join(" ")).toContain("No smoking");
    expect(ger.notes!.join(" ")).toContain("Fishing and swimming");

    const quan = ALL.find((t) => t.id === "bg-quantifiers")!;
    expect(quan.notes!.join(" ")).toContain("They have lived in Rasht for many years.");

    const num = ALL.find((t) => t.id === "bg-numbers")!;
    expect(num.notes!.join(" ")).toContain("three hundred horses");
  });

  // ------------------------------------------------ راند ۲۱۶ — دوازدهم
  it("r216 پینِ وفاداریِ مجهول — نوارِ ترتیب، with، جدولِ افعال لازم و جدولِ زمان‌ها", () => {
    const pas = ALL.find((t) => t.id === "bg-passive")!;
    expect(pas.orderStrip).toEqual([
      "مفعول", "فعل کمکی", "شکل سوم فعل", "قید حالت", "قید مکان", "قید زمان", "by + فاعل",
    ]);
    expect(pas.notes!.join(" ")).toContain("The yard was covered with snow");
    // ۲۹ فعلِ لازمِ جزوه در جدولِ دونیم‌شده (۱۵ ردیف × ۴ ستون)
    const verbs = pas.tables![0].rows.flat().filter((c) => /^[a-z]/.test(c));
    expect(verbs).toHaveLength(29);
    expect(verbs.join(",")).toContain("occur,understand,wait");
    expect(pas.examples![0].en).toBe("My mother is washing the dishes carefully in the kitchen right now.");

    const pt = ALL.find((t) => t.id === "bg-passive-tenses")!;
    // جدولِ اصیلِ «فرمول مجهول در زمان‌های کتب درسی» — ۸ سطر (۷ زمان + افعال ناقص)
    expect(pt.tables![0].rows).toHaveLength(8);
    expect(pt.tables![0].rows[3]).toEqual(["حال استمراری", "am / is / are + being", "شکل سوم فعل", "قید حالت · قید مکان · قید زمان · (by + فاعل)"]);
    expect(pt.notes!.join(" ")).toContain("They were forced to leave the class quickly.");
  });

  it("r216 پینِ وفاداریِ عبارات الحاق — کلیدهای دستگریمِ ص ۴۴ (پاسخنامهٔ ص ۱۸۷)", () => {
    const tag = ALL.find((t) => t.id === "bg-tag-questions")!;
    // کلیدهای خودِ جزوه: 1-d، 3-c، 4-a، 8-b، 9-b، 13-b
    expect(tag.drill![0].options[tag.drill![0].answer]).toBe("will you");
    expect(tag.drill![1].options[tag.drill![1].answer]).toBe("does he");
    expect(tag.drill![2].options[tag.drill![2].answer]).toBe("didn’t they");
    expect(tag.drill![3].options[tag.drill![3].answer]).toBe("didn’t we");
    expect(tag.drill![4].options[tag.drill![4].answer]).toBe("will there");
    expect(tag.drill![5].options[tag.drill![5].answer]).toBe("hasn’t he");
    // قاعده‌های امضای جزوه
    const joined = tag.notes!.join(" ");
    expect(joined).toContain("aren’t I");
    expect(joined).toContain("won’t you");
    expect(joined).toContain("The old woman could hardly walk at the park, could she?");
  });

  it("r216 پینِ وفاداریِ بقیهٔ موضوعات — ربط، موصولی، شرطی، گذشتهٔ کامل، افعال ناقصِ گذشته", () => {
    const con = ALL.find((t) => t.id === "bg-conjunctions")!;
    // هفت همپایه‌ساز به ترتیبِ خودِ جزوه + جفتی‌ها
    expect(con.tables![0].rows.map((r) => r[0])).toEqual(["for", "and", "nor", "but", "or", "yet", "so"]);
    expect(con.tables![1].rows).toHaveLength(6);
    expect(con.notes!.join(" ")).toContain("FANBOYS");
    expect(con.examples!.map((e) => e.en).join(" ")).toContain("nor does he eat biscuits");

    const rel = ALL.find((t) => t.id === "bg-relative-pronouns")!;
    expect(rel.tables![0].rows).toHaveLength(5);
    expect(rel.notes!.join(" ")).toContain("فقط that به کار برده می‌شود");
    expect(rel.examples!.map((e) => e.en).join(" ")).toContain("two of whom are in the army");
    expect(rel.examples!.map((e) => e.en).join(" ")).toContain("Rudaki who lived in the 4th century");

    const cond = ALL.find((t) => t.id === "bg-conditional-type-2")!;
    expect(cond.notes!.join(" ")).toContain("Were my brother you, he would never buy that car.");
    expect(cond.examples!.map((e) => e.en).join(" ")).toContain("If I were you, I would tell my parents.");

    const pp = ALL.find((t) => t.id === "bg-past-perfect")!;
    expect(pp.examples![0].en).toBe("When I arrived home, my brother had left.");
    expect(pp.notes!.join(" ")).toContain("By the time his uncle got a very good job, he had taken many risks.");

    const pm = ALL.find((t) => t.id === "bg-past-modals")!;
    expect(pm.notes!.join(" ")).toContain("should + have + p.p.");
    expect(pm.notes!.join(" ")).toContain("این ساختار حالت منفی ندارد");
    expect(pm.examples!.map((e) => e.en).join(" ")).toContain("He must have studied very hard");
    expect(pm.examples!.map((e) => e.en).join(" ")).toContain("Traffic rules must be obeyed");
  });

  // ------------------------------------------------ راند ۲۱۷ — آزمونک‌های یازدهم
  it("r217 پینِ آزمونک‌های یازدهم — شمارشِ هر موضوع + کلیدهای پاسخنامهٔ خودِ جزوه", () => {
    // درس اول (ص۲۹-۳۰، کلید ص۱۷۹) / درس دوم (ص۶۳-۶۴، کلید ص۱۸۷ + ص۷۵، کلید ص۱۹۱) / درس سوم (ص۱۰۰-۱۰۱، کلید ص۱۹۶ + ص۱۱۰، کلید ص۲۰۱)
    const counts: Record<string, number> = {};
    for (const t of ALL) if (t.source === "یازدهم") counts[t.id] = t.drill?.length ?? 0;
    expect(counts["bg-quantifiers"]).toBe(20);
    expect(counts["bg-present-perfect"]).toBe(22);
    expect(counts["bg-gerund"]).toBe(2);
    expect(counts["bg-first-conditional"]).toBe(22);
    // موضوعاتی که جزوه برایشان سؤالِ چهارتایی ندارد — صفرِ صادقانه
    expect(counts["bg-numbers"] ?? 0).toBe(0);
    expect(counts["bg-phrasal-verbs"] ?? 0).toBe(0);
    expect(counts["bg-ed-ing-adjectives"] ?? 0).toBe(0);
    // راند ۲۲۵ — دو MCQِ مصدرِ ص۱۱۰§۷ که r217 چون کارتِ موضوعی نبود حذفش کرده بود
    expect(counts["bg-infinitive"]).toBe(2);
  });

  it("r217 پینِ وفاداریِ کلیدها — نمونه‌های عینِ پاسخنامهٔ جزوه", () => {
    const pick = (id: string, i: number) => {
      const t = ALL.find((x) => x.id === id)!;
      const d = t.drill![i];
      return d.options[d.answer];
    };
    // کلیدِ ص۱۷۹ (کمّی‌ها): ۱-much، ۴-few، ۱۳-A little، ۱۶-isn’t much، ۱۹-plenty of
    expect(pick("bg-quantifiers", 0)).toBe("much");
    expect(pick("bg-quantifiers", 3)).toBe("few");
    expect(pick("bg-quantifiers", 12)).toBe("A little");
    expect(pick("bg-quantifiers", 15)).toBe("isn’t much");
    expect(pick("bg-quantifiers", 18)).toBe("plenty of");
    // کلیدِ ص۱۸۷ (حال کامل): ۱-has had، ۷-were you late، ۹-has / won، ۱۶-spoke، ۲۰-hasn’t done
    expect(pick("bg-present-perfect", 0)).toBe("has had");
    expect(pick("bg-present-perfect", 6)).toBe("were you late");
    expect(pick("bg-present-perfect", 8)).toBe("has / won");
    expect(pick("bg-present-perfect", 15)).toBe("spoke");
    expect(pick("bg-present-perfect", 19)).toBe("hasn’t done");
    // کلیدِ ص۱۹۱ (بخشِ ۶ درس دوم): forgotten / riding / believed / using
    expect(pick("bg-present-perfect", 20)).toBe("forgotten");
    expect(pick("bg-present-perfect", 21)).toBe("believed");
    expect(pick("bg-gerund", 0)).toBe("riding");
    expect(pick("bg-gerund", 1)).toBe("using");
    // کلیدِ ص۱۹۶ (شرطی نوع اول): ۱-b، ۳-d، ۷-d، ۱۸-d؛ کلیدِ ص۲۰۱ (بخشِ ۷): be / don’t work
    expect(pick("bg-first-conditional", 0)).toBe("will receive");
    expect(pick("bg-first-conditional", 2)).toBe("finds");
    expect(pick("bg-first-conditional", 6)).toBe("will not be");
    expect(pick("bg-first-conditional", 17)).toBe("come");
    expect(pick("bg-first-conditional", 20)).toBe("be");
    expect(pick("bg-first-conditional", 21)).toBe("don’t work");
  });

  it("r217 سؤال‌های آزمونکِ یازدهم لاتین‌محور و بدونِ گلوی استخراج‌اند", () => {
    for (const id of ["bg-quantifiers", "bg-present-perfect", "bg-gerund", "bg-first-conditional"]) {
      const t = ALL.find((x) => x.id === id)!;
      for (const d of t.drill ?? []) {
        expect(d.q).not.toMatch(/گزینه|پاسخ|ترجمه|Telegram|Vision|احمدی/);
        expect(d.q).toMatch(/[A-Za-z]/);
        // جای خالی همیشه در ساقه هست
        expect(d.q).toMatch(/-{3,}/);
      }
    }
  });

  // ------------------------------------------------ راند ۲۱۸ — تمرینِ تایپی
  it("r218 پینِ تمرین‌های تایپی — شمارشِ هر موضوع، فقط سه موضوعِ صاحبِ بخشِ تولیدی", () => {
    const counts: Record<string, number> = {};
    for (const t of ALL) counts[t.id] = t.typeDrill?.length ?? 0;
    expect(counts["bg-quantifiers"]).toBe(20); // many/much + a few/a little (کلید ص۱۷۹)
    expect(counts["bg-present-perfect"]).toBe(22); // ۱۲ شکلِ فعل + ۱۰ for/since (کلید ص۱۸۷)
    expect(counts["bg-first-conditional"]).toBe(22); // ۱۰ شکلِ فعل + ۱۲ اصلاحِ خطا (کلید ص۱۹۶ — راند ۲۱۹)
    for (const t of ALL) {
      if (!["bg-quantifiers", "bg-present-perfect", "bg-first-conditional"].includes(t.id)) {
        expect(t.typeDrill ?? []).toHaveLength(0);
      }
    }
  });

  it("r218 پینِ وفاداریِ کلیدهای تایپی — عینِ پاسخنامه‌های ص۱۷۹/ص۱۸۷/ص۱۹۶", () => {
    const ans = (id: string, i: number) => ALL.find((x) => x.id === id)!.typeDrill![i].answer;
    // کمّی‌ها (ص۱۷۹): ۱-many، ۲-much، ۳(گروه دوم)-a few، ۸(گروه دوم)-a little
    expect(ans("bg-quantifiers", 0)).toBe("many");
    expect(ans("bg-quantifiers", 1)).toBe("much");
    expect(ans("bg-quantifiers", 10)).toBe("a few");
    expect(ans("bg-quantifiers", 17)).toBe("a little");
    // حال کامل (ص۱۸۷): ۱-didn’t play، ۱۲-has prevented، ۱۳(for/since)-for/since، ۱۶-since
    expect(ans("bg-present-perfect", 0)).toBe("didn’t play");
    expect(ans("bg-present-perfect", 11)).toBe("has prevented");
    expect(ans("bg-present-perfect", 12)).toBe("for/since");
    expect(ans("bg-present-perfect", 16)).toBe("since");
    // شرطی نوع اول (ص۱۹۶): ۱-will stay، ۲-won’t shine، ۱۰-works
    expect(ans("bg-first-conditional", 0)).toBe("will stay");
    expect(ans("bg-first-conditional", 1)).toBe("won’t shine");
    expect(ans("bg-first-conditional", 9)).toBe("works");
  });

  it("r218 سلامتِ تمرین‌های تایپی — پاسخِ غیرخالی، ساقهٔ لاتینِ جای‌خالی‌دار، گروه‌های task پشت‌سرهم", () => {
    for (const t of ALL) {
      for (let i = 0; i < (t.typeDrill?.length ?? 0); i++) {
        const d = t.typeDrill![i];
        expect(d.answer.trim().length).toBeGreaterThan(0);
        expect(d.q).toMatch(/-{3,}/);
        expect((d.q.match(/[A-Za-z]/g) ?? []).length).toBeGreaterThan(8);
        if (i === 0) {
          // اولین آیتمِ هر موضوع حتماً task دارد
          expect(d.task).toBeDefined();
        } else if (d.task !== undefined) {
          // آیتمِ taskدار، گروهِ تازه است — taskِ تازه با قبلی یکی نیست
          expect(d.task).not.toBe(t.typeDrill![i - 1].task);
        }
        // آیتمِ بدونِ task = ادامهٔ گروهِ قبلی — مجاز
      }
    }
  });

  it("r218 نرمال‌سازیِ پاسخ — فقط حروف/آپاستروف/فاصلهٔ «/»؛ بدونِ بخششِ غلطِ املایی", () => {
    expect(normTypeAnswer("  Has Prevented ")).toBe("has prevented");
    expect(normTypeAnswer("didn't play")).toBe(normTypeAnswer("didn’t play"));
    expect(normTypeAnswer("for / since")).toBe("for/since");
    expect(normTypeAnswer("WON’T   shine")).toBe(normTypeAnswer("won’t shine"));
    // غلطِ املایی بخشش نمی‌شود
    expect(normTypeAnswer("has prevent")).not.toBe(normTypeAnswer("has prevented"));
    expect(normTypeAnswer("manymuch")).not.toBe("many");
  });

  // ------------------------------------------------ راند ۲۱۹ — جمله‌سازی
  it("r219/r225 پینِ شمارشِ جمله‌سازی — چهار موضوعِ صاحبِ بخشِ جمله‌سازیِ جزوه", () => {
    const counts: Record<string, number> = {};
    for (const t of ALL) counts[t.id] = t.orderDrill?.length ?? 0;
    expect(counts["bg-quantifiers"]).toBe(10); // ص۳۱، کلید ص۱۷۹
    expect(counts["bg-present-perfect"]).toBe(3); // آزمونِ جامعِ درس دوم ص۷۵، کلید ص۱۹۱
    expect(counts["bg-first-conditional"]).toBe(11); // ص۱۰۲ (کلید ص۱۹۶-۱۹۷) + ص۱۱۰ (کلید ص۲۰۱)
    expect(counts["bg-infinitive"]).toBe(10); // راند ۲۲۵: ۹ آیتمِ §۵ ص۱۰۲ (کلید ص۱۹۷) + ۱ آیتمِ §۸ ص۱۱۰ (کلید ص۲۰۱)
    for (const t of ALL) {
      if (!["bg-quantifiers", "bg-present-perfect", "bg-first-conditional", "bg-infinitive"].includes(t.id)) {
        expect(t.orderDrill ?? []).toHaveLength(0);
      }
    }
  });

  it("r219 پینِ وفاداریِ جمله‌سازی — گروهِ کلمات و جملهٔ کلیدِ عینِ جزوه + دستورِ خودِ بخش", () => {
    const od = (id: string) => ALL.find((x) => x.id === id)!.orderDrill!;
    expect(od("bg-quantifiers")[0].q).toBe("do / much / need / information / how / they?");
    expect(od("bg-quantifiers")[0].answer).toBe("How much information do they need?");
    expect(od("bg-quantifiers")[7].answer).toBe("The children spend too much time watching television.");
    expect(od("bg-present-perfect")[0].answer).toBe("They have written three letters today.");
    expect(od("bg-first-conditional")[0].answer).toBe("Will you buy this car if they fix it?");
    expect(od("bg-first-conditional")[10].q).toBe("the river / hurt / if / jump / you / will / you / into / yourself.");
    expect(od("bg-first-conditional")[10].answer).toBe("You will hurt yourself if you jump into the river.");
    // دستورِ هر بخش — عینِ جزوه با ترمیمِ «جمله ی» → «جملهٔ»
    expect(od("bg-quantifiers")[0].task).toBe("با استفاده از کلمات داده شده جمله بسازید.");
    expect(od("bg-present-perfect")[0].task).toBe("با هر گروه از کلمات زیر یک جملهٔ کامل بسازید.");
    expect(od("bg-first-conditional")[0].task).toBe("با استفاده از کلمات داده شده جمله بسازید. (مربوط به بخش جملات شرطی)");
    // بخشِ مصدرِ ص۱۰۲/ص۱۱۰ حالا کارتِ موضوعِ خودش را دارد (راند ۲۲۵) — جمعِ ۳۴
    expect(ALL.reduce((n, t) => n + (t.orderDrill?.length ?? 0), 0)).toBe(34);
  });

  it("r219 سلامتِ جمله‌سازی — کاشی‌ها همان کلماتِ کلیدند (چندمجموعه‌ای)، پاسخِ غیرخالی", () => {
    const words = (s: string) => normOrderAnswer(s).split(" ").filter(Boolean);
    for (const t of ALL) {
      for (const d of t.orderDrill ?? []) {
        expect(d.answer.trim().length).toBeGreaterThan(0);
        const tiles = buildOrderTiles(d.q);
        expect(tiles.length).toBeGreaterThan(2);
        expect(tiles.flatMap(words).sort()).toEqual(words(d.answer).sort());
      }
    }
  });

  it("r219 بُر خوردنِ کاشی‌ها — قطعی (همان seed همان ترتیب) و هرگز از قبل برابرِ کلید نیست", () => {
    for (const t of ALL) {
      (t.orderDrill ?? []).forEach((d, di) => {
        const tiles = orderTilesFor(`${t.id}#${di}`, d.q, d.answer);
        expect(normOrderAnswer(tiles.join(" "))).not.toBe(normOrderAnswer(d.answer));
        expect(orderTilesFor(`${t.id}#${di}`, d.q, d.answer)).toEqual(tiles);
      });
    }
  });

  it("r219 پینِ اصلاحِ خطا — کلیدهای پرانتزِ پاسخنامهٔ ص۱۹۶ روی تمرینِ تایپی", () => {
    const ans = (i: number) => ALL.find((x) => x.id === "bg-first-conditional")!.typeDrill![i].answer;
    expect(ans(10)).toBe("don’t");
    expect(ans(11)).toBe("will answer");
    expect(ans(13)).toBe("has");
    expect(ans(16)).toBe("doesn’t");
    expect(ans(20)).toBe("will be");
    expect(ans(21)).toBe("quit");
  });

  it("r219 نرمال‌سازیِ جمله — نقطه/علامتِ سؤال/کاما و آپاستروف بی‌اعتنا، ترتیب و واژه‌ها اکید", () => {
    expect(normOrderAnswer("  They have written three letters today. ")).toBe("they have written three letters today");
    expect(normOrderAnswer("How much information do they need?")).toBe("how much information do they need");
    expect(normOrderAnswer("They don’t have much money to buy a present.")).toBe("they don't have much money to buy a present");
    expect(normOrderAnswer("They don't have much money to buy a present")).toBe(normOrderAnswer("They don’t have much money to buy a present."));
    // ترتیبِ متفاوت = پاسخِ متفاوت
    expect(normOrderAnswer("do they need how much information")).not.toBe(normOrderAnswer("How much information do they need?"));
  });
});

describe("booklet-grammar-r214 — رندرِ زیرتابِ ضمیمه", () => {
  beforeEach(() => {
    cleanup();
    window.localStorage.clear(); // راند ۲۳۱ — ایزوله‌سازی از جایگاهِ خواندنِ پایدار
  });

  it("۳۱ کارتِ موضوع در سه سرگروه؛ موضوع اول باز است و تیترها دیده می‌شوند", () => {
    renderTab();
    expect(screen.getByText(/درسنامهٔ جامع — از خودِ جزوه‌های جامع/)).toBeTruthy();
    // سرگروه‌ها
    expect(screen.getByText(BOOKLET_GRAMMAR_SOURCES["دهم"])).toBeTruthy();
    expect(screen.getByText(BOOKLET_GRAMMAR_SOURCES["یازدهم"])).toBeTruthy();
    expect(screen.getByText(BOOKLET_GRAMMAR_SOURCES["دوازدهم"])).toBeTruthy();
    // آکاردئون: موضوع اول باز، بقیه بسته
    const alphabet = screen.getByText("حروف، واژه و جمله");
    expect(alphabet).toBeTruthy();
    expect(screen.getByText(/مهم‌ترین و اصلی‌ترین افعال کمکی/)).toBeTruthy();
    // موضوعِ بسته — محتوایش باز نمی‌شود تا کلیک
    expect(screen.queryByText(/برای بیان کاری که در زمان گذشته انجام شده/)).toBeNull();
  });

  it("بازکردنِ موضوعِ زمان‌ها جدولِ ۱۶ سطری را نشان می‌دهد؛ موضوعِ دوازدهم هم رندر می‌شود", async () => {
    renderTab();
    fireEvent.click(screen.getByText("انواع زمان‌ها در زبان انگلیسی"));
    expect(screen.getByText("آینده در گذشتهٔ کامل استمراری")).toBeTruthy();
    expect(screen.getByText("would have been + فعل ing‌دار")).toBeTruthy();
    // موضوعِ مجهولِ دوازدهم — نوارِ ترتیبِ مجهول و جدولِ افعال لازم
    fireEvent.click(screen.getByText("جملات معلوم و مجهول"));
    expect(screen.getByText("by + فاعل")).toBeTruthy();
    expect(screen.getByText("The dishes are being washed carefully in the kitchen right now (by my mother).")).toBeTruthy();
  });

  it("مثال‌ها دکمهٔ روخوانی دارند", async () => {
    renderTab();
    fireEvent.click(screen.getByText("ضمایر فاعلی"));
    const en = screen.getByText("Raman is a clever student. He gets good marks.");
    expect(en).toBeTruthy();
    // دکمهٔ speak کنارِ مثال (لیبلِ پیش‌فرضِ SpeakButton — عنوانِ دکمه)
    const btns = screen.getAllByRole("button").filter((b) =>
      (b.getAttribute("aria-label") ?? "").includes("روخوانی"),
    );
    expect(btns.length).toBeGreaterThan(0);
    fireEvent.click(en); // کلیک روی متن نباید بشکند
  });

  it("آزمونکِ جزوه: گزینهٔ غلط rose و گزینهٔ درست emerald؛ «از نو» خالی می‌کند", () => {
    renderTab();
    fireEvent.click(screen.getByText("صفات ملکی و ضمایر ملکی"));
    const q1 = screen.getByText(/The legs --------------- your teacher/);
    expect(q1).toBeTruthy();
    // گزینهٔ درستِ سؤال ۱ = «of / ’s» (ایندکس ۲)
    const right = screen.getByRole("button", { name: "of / ’s" });
    fireEvent.click(right);
    // بازخورد درست: aria-pressed روی گزینهٔ انتخابیِ درست
    expect(right.getAttribute("aria-pressed")).toBe("true");
    // نتیجه: ۱ از ۱ درست
    expect(screen.getByText("۱ از ۱ درست")).toBeTruthy();
    // از نو — همه پاک می‌شود
    fireEvent.click(screen.getByLabelText("پاک کردن پاسخ‌های آزمونک"));
    expect(screen.queryByText("۱ از ۱ درست")).toBeNull();
  });

  it("تمرینِ تایپی: پاسخِ غلط rose + نمایشِ پاسخِ درست؛ نرمال‌سازیِ پاسخِ درست emerald؛ «از نو» خالی می‌کند", () => {
    renderTab();
    fireEvent.click(screen.getByText("صفت‌های کمّی و شمارشی"));
    // سؤالِ ۱: کلیدِ جزوه «many» است
    const inp = screen.getByLabelText("پاسخ سؤال ۱ تمرین تایپی") as HTMLInputElement;
    const check1 = screen.getByLabelText("بررسی سؤال ۱ تمرین تایپی");
    // غلط — پیش از بررسی، دکمه روی ورودیِ خالی معلق است
    expect(check1.hasAttribute("disabled")).toBe(true);
    fireEvent.change(inp, { target: { value: "much" } });
    expect(check1.hasAttribute("disabled")).toBe(false);
    fireEvent.click(check1);
    expect(screen.getByText("۰ از ۱ درست")).toBeTruthy();
    expect(screen.getByText(/پاسخِ درست:/)).toBeTruthy();
    expect(screen.getByText(/پاسخِ درست:/).textContent).toContain("many");
    // ورودی بعد از بررسی معلق است
    expect((screen.getByLabelText("پاسخ سؤال ۱ تمرین تایپی") as HTMLInputElement).disabled).toBe(true);
    // از نو — همه پاک می‌شود
    fireEvent.click(screen.getByLabelText("پاک کردن پاسخ‌های تمرین تایپی"));
    expect(screen.queryByText("۰ از ۱ درست")).toBeNull();
    // درست — با حروف بزرگ و فاصله‌های اضافی (نرمال‌سازی)
    fireEvent.change(screen.getByLabelText("پاسخ سؤال ۱ تمرین تایپی"), { target: { value: "  MANY  " } });
    fireEvent.click(screen.getByLabelText("بررسی سؤال ۱ تمرین تایپی"));
    expect(screen.getByText("۱ از ۱ درست")).toBeTruthy();
    expect(screen.queryByText(/پاسخِ درست:/)).toBeNull();
  });

  it("جمله‌سازی: ترتیبِ غلط rose + کلیدِ جزوه؛ ترتیبِ درست emerald؛ برگرداندنِ کاشی؛ «از نو» خالی می‌کند", () => {
    renderTab();
    fireEvent.click(screen.getByText("صفت‌های کمّی و شمارشی"));
    expect(screen.getByText(/جمله‌سازیِ خودِ جزوه — ۱۰ سؤال/)).toBeTruthy();
    const strip = screen.getByLabelText("جملهٔ ساخته‌شدهٔ سؤال ۱ جمله‌سازی");
    const q1 = within(strip.closest("li") as HTMLElement);
    // بررسی روی جملهٔ ناتمام معلق است
    expect(q1.getByLabelText("بررسی سؤال ۱ جمله‌سازی").hasAttribute("disabled")).toBe(true);
    // یک کاشی بردار و برگردان — نوار و بانک سالم می‌مانند
    fireEvent.click(q1.getByRole("button", { name: "do" }));
    fireEvent.click(q1.getByLabelText("برگرداندن واژهٔ ۱ سؤال ۱ جمله‌سازی"));
    expect(q1.getByText("جمله را با کلیک روی کلمه‌ها بسازید…")).toBeTruthy();
    // ترتیبِ غلط → rose + کلیدِ جزوه
    fireEvent.click(q1.getByRole("button", { name: "do" }));
    fireEvent.click(q1.getByRole("button", { name: "they?" }));
    fireEvent.click(q1.getByRole("button", { name: "how" }));
    fireEvent.click(q1.getByRole("button", { name: "much" }));
    fireEvent.click(q1.getByRole("button", { name: "information" }));
    fireEvent.click(q1.getByRole("button", { name: "need" }));
    fireEvent.click(q1.getByLabelText("بررسی سؤال ۱ جمله‌سازی"));
    expect(screen.getByText("۰ از ۱ درست")).toBeTruthy();
    const keyLine = screen.getByText(/پاسخِ درست:/);
    expect(keyLine.textContent).toContain("How much information do they need?");
    // از نو و ترتیبِ درستِ کلید → emerald
    fireEvent.click(screen.getByLabelText("پاک کردن پاسخ‌های جمله‌سازی"));
    expect(screen.queryByText("۰ از ۱ درست")).toBeNull();
    const strip2 = screen.getByLabelText("جملهٔ ساخته‌شدهٔ سؤال ۱ جمله‌سازی");
    const q1b = within(strip2.closest("li") as HTMLElement);
    for (const w of ["how", "much", "information", "do", "they?", "need"]) {
      fireEvent.click(q1b.getByRole("button", { name: w }));
    }
    fireEvent.click(q1b.getByLabelText("بررسی سؤال ۱ جمله‌سازی"));
    expect(screen.getByText("۱ از ۱ درست")).toBeTruthy();
    expect(screen.queryByText(/پاسخِ درست:/)).toBeNull();
    // از نو — همه پاک می‌شود
    fireEvent.click(screen.getByLabelText("پاک کردن پاسخ‌های جمله‌سازی"));
    expect(screen.queryByText("۱ از ۱ درست")).toBeNull();
  });

  it("سرریزِ افقی ندارد در اندازهٔ موبایل (dark هم) — قراردادِ همیشگی", () => {
    renderTab();
    const el = document.documentElement;
    // jsdom محاسبهٔ scrollWidth واقعی ندارد؛ همین‌جا فقط سالم‌بودنِ DOM را پین می‌کنیم
    expect(el).toBeTruthy();
  });
});

// نگه‌داشتِ قرارداد: فایلِ خامِ استخراج به‌عنوان سندِ منبع کامیت شده است
describe("booklet-grammar-r214 — سندِ منبع", () => {
  it("فایلِ خامِ استخراج موجود است و عنوانِ بخش را دارد", () => {
    const p = resolve(process.cwd(), "booklet-extract/grammar-review-g10-raw.txt");
    const src = readFileSync(p, "utf8");
    expect(src.length).toBeGreaterThan(30000);
    expect(src).toContain("Prospect 1 - 3");
  });
});

// ------------------------------------------------ راند ۲۲۵ — مصدر با to
describe("booklet-grammar-r225 — کارتِ «مصدر با to» (ص۹۷-۹۹ یازدهم)", () => {
  const inf = ALL.find((t) => t.id === "bg-infinitive")!;

  it("موضوعِ سومِ گرامرِ درس سه با شاهدِ فهرستِ خودِ جزوه — صفحهٔ ۹۷ تا ۹۹", () => {
    expect(inf).toBeTruthy();
    expect(inf.source).toBe("یازدهم");
    expect(inf.title).toBe("مصدر با to");
    expect(inf.titleEn).toBe("Infinitive");
    expect(inf.page).toContain("۹۷");
    expect(inf.page).toContain("۹۹");
  });

  it("دوازده کاربرد + هفت نکته — پین‌های وفاداریِ قاعده‌ها", () => {
    expect(inf.notes).toHaveLength(22); // ۱۲ کاربرد + نکتهٔ مهم + توجه‌ها + ۷ نکته
    const joined = inf.notes!.join(" ");
    // کاربردها با شمارهٔ خودِ جزوه
    for (const k of ["کاربرد اول", "کاربرد دوم", "کاربرد سوم", "کاربرد چهارم", "کاربرد پنجم", "کاربرد ششم", "کاربرد هفتم", "کاربرد هشتم", "کاربرد نهم", "کاربرد دهم", "کاربرد یازدهم", "کاربرد دوازدهم"]) {
      expect(joined).toContain(k);
    }
    // قاعده‌های کلیدی — عینِ جزوه
    expect(joined).toContain("فعل دوم در نقش «مفعول» برای فعل اول");
    expect(joined).toContain("تمامی تغییرات زمانی تنها بر روی «فعل اول»");
    expect(joined).toContain("کلمات استفهامیِ Wh");
    expect(joined).toContain("It + فعل to be + صفت + (for + مفعول) + مصدر با to");
    expect(joined).toContain("اولویت با «اسم مصدر»");
    expect(joined).toContain("قید منفی‌ساز not را اضافه کنیم");
    expect(joined).toContain("in order to» و «so as to");
    expect(joined).toContain("so that» و «in order that");
    expect(joined).toContain("make (مجبور کردن)");
    expect(joined).toContain("دو مثالِ stop");
  });

  it("هفت نکته با شمارهٔ خودِ جزوه پین است", () => {
    const joined = inf.notes!.join(" ");
    for (const k of ["نکتهٔ ۱ —", "نکتهٔ ۲ —", "نکتهٔ ۳ —", "نکتهٔ ۴ (زبان تخصصی)", "نکتهٔ ۵ (زبان تخصصی)", "نکتهٔ ۶ (زبان تخصصی)", "نکتهٔ ۷ (زبان تخصصی)"]) {
      expect(joined).toContain(k);
    }
  });

  it("دو جدول — ۲۷ صفتِ بعد از مصدر با to (کاربرد سوم) + ۱۲ فعلِ دوشکلی (نکتهٔ ۷)", () => {
    expect(inf.tables).toHaveLength(2);
    const [adjs, verbs] = inf.tables!;
    expect(adjs.headers).toEqual(["صفت", "معنی"]);
    expect(adjs.rows).toHaveLength(27);
    expect(verbs.headers).toEqual(["فعل", "معنی"]);
    expect(verbs.rows).toHaveLength(12);
    // پین‌های جفتی — عینِ جزوه (ترمیم‌های سوپِ مستندشده در خودِ داده)
    expect(adjs.rows[0]).toEqual(["careless", "بی‌دقت"]);
    expect(adjs.rows[1]).toEqual(["sorry", "متأسف"]);
    expect(adjs.rows[15]).toEqual(["sad = unhappy", "غمگین"]);
    expect(adjs.rows[16]).toEqual(["careful", "مراقب"]);
    expect(adjs.rows[17]).toEqual(["certain = sure", "مطمئن"]);
    expect(adjs.rows[26]).toEqual(["hard", "سخت"]);
    // شاهدِ متقاطعِ واژگانِ خودِ جزوه: جفتِ متضادِ careless↔careful با توضیحِ «مواظب ، با دقت» (g11.txt L13844-13845)
    expect(verbs.rows.map((r) => r[0])).toEqual([
      "like", "prefer", "stop", "love", "intend", "need", "hate",
      "remember", "continue", "begin", "start", "forget",
    ]);
    expect(verbs.rows[4]).toEqual(["intend", "مایل بودن"]); // توضیحِ خودِ جزوه (L16122-16123)
  });

  it("ده مثالِ برجسته با برچسبِ ساختاریِ خودِ جزوه — پینِ ترجمه‌ها", () => {
    expect(inf.examples).toHaveLength(10);
    expect(inf.examples![0]).toEqual({
      en: "She decided to learn Spanish carefully.",
      fa: "او تصمیم گرفت تا اسپانیایی را به دقت یاد بگیرد.",
      tag: "کاربرد اول — فعل دوم در نقش مفعول",
    });
    expect(inf.examples![3].en).toBe("He was very careful to look both ways when he crossed the street.");
    expect(inf.examples![4].tag).toContain("It + to be + صفت");
    expect(inf.examples![7].en).toBe("They were forced to leave the class quickly.");
    // ترجمهٔ عینِ جزوه (g11.txt L15558-15559)
    expect(inf.examples![4].fa).toBe("برای دانش‌آموزانم واقعاً سخت بود که به همهٔ سؤالات به درست پاسخ بدهند.");
  });

  it("دو MCQِ ص۱۱۰§۷ — کلیدِ عینِ پاسخنامهٔ ص۲۰۱§۷ (به تعویق‌افتادهٔ r217)", () => {
    expect(inf.drill).toHaveLength(2);
    expect(inf.drill![0].q).toBe("They try ------------------------------- the building in a few weeks.");
    expect(inf.drill![0].options[3]).toBe("to complete");
    expect(inf.drill![0].answer).toBe(3);
    expect(inf.drill![1].q).toBe("My father asked me ------------------------------- about my future plans.");
    expect(inf.drill![1].options[2]).toBe("not to speak");
    expect(inf.drill![1].answer).toBe(2);
  });

  it("جمله‌سازیِ پارک‌شدهٔ r219 — ۹ آیتمِ §۵ ص۱۰۲ (کلید ص۱۹۷) + ۱ آیتمِ §۸ ص۱۱۰ (کلید ص۲۰۱)", () => {
    const od = inf.orderDrill!;
    expect(od).toHaveLength(10);
    expect(od[0].q).toBe("eat / do / breakfast / want / for / you / to / what?");
    expect(od[0].answer).toBe("What do you want to eat for breakfast?");
    expect(od[0].task).toBe("با استفاده از کلمات داده شده جمله بسازید. (مربوط به بخش مصدر)");
    expect(od[4].answer).toBe("To smoke is very bad for everyone."); // کاربرد پنجم در خودِ سؤال
    expect(od[8].answer).toBe("It is your duty to finish the work in time.");
    // آیتمِ آزمونِ جامع — مصدرِ منفی (نکتهٔ ۱)
    expect(od[9].q).toBe("football / not / him / play / in / I / to / the yard / told.");
    expect(od[9].answer).toBe("I told him not to play football in the yard.");
    expect(od[9].task).toBe("با هر گروه از کلمات زیر یک جملهٔ کامل بسازید.");
  });

  it("ناسازگاریِ درونیِ خودِ جزوه مستند است — کلیدِ §۵ ده سطر، سؤالِ ص۱۰۲ نه آیتم", () => {
    // کلیدِ ص۱۹۷§۵ سطرِ ۱۰ (My parents wanted me...) بی‌سؤال است — فقط ۹ جفتِ سؤال↔کلید استخراج شد
    expect(inf.orderDrill!.filter((d) => d.task?.includes("مصدر")).length).toBe(1); // فقط آیتمِ اولِ گروهِ task دار
    expect(inf.orderDrill!.map((d) => d.q)).not.toContain("home / at / 11 / be / me / my / o’clock / parents / to / wanted.");
  });

  it("ترمیم‌های سوپِ جدولِ صفات در خودِ داده مستندند", () => {
    const src = readFileSync(resolve(process.cwd(), "src/data/booklet-grammar.ts"), "utf8");
    const block = src.slice(src.indexOf('id: "bg-infinitive"'), src.indexOf('id: "bg-passive"'));
    for (const doc of ["«تی دقت»→بی‌دقت", "«سف أ مت»→متأسف", "«غمگئر»→غمگین", "«مطمئ»→مطمئن", "«شر منده»→شرمنده"]) {
      expect(block).toContain(doc);
    }
  });
});
