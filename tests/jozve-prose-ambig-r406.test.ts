// r406 — رسیدِ حکمِ بافتیِ خانواده‌هایِ مبهمِ نثرِ گ۱۰-گ۱۲
// (شی/نیم/ری/طوالت/همکالش/عقالت + معت) — ۲۶۴ جایگزینی با نمونه‌هایِ چاپیِ کورپوس.
// لایه‌ها: (۱) صفرِ فرمِ شکسته؛ (۲) نگه‌داشته‌هایِ مستندِ نیم (ساعت/ضرب‌المثل/نصف) و شی (قطعه/نام)؛
// (۳) ردیف‌هایِ شاخصِ ترمیم‌شده؛ (۴) مصونیتِ نام‌ها و شهر ری؛ (۵) همگامیِ index.json؛ (۶) رسید.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const jozve = (f: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), "public/jozve", f), "utf8"));

const docs: Record<number, any> = { 10: jozve("g10.json"), 11: jozve("g11.json"), 12: jozve("g12.json") };
const index = jozve("index.json");
const receipt = JSON.parse(readFileSync(path.join(process.cwd(), "scripts/r406-receipt.json"), "utf8"));

const FA_LETTER = "[\\u0600-\\u06FF\\u200c]";

const proseBlob = (g: number) => {
  const parts: string[] = [];
  for (const ch of docs[g].chapters) {
    parts.push(ch.title);
    for (const s of ch.sections) {
      parts.push(s.title, ...s.lines);
    }
  }
  return parts.join("\n");
};

/** هر رخدادِ الگو با جایگاهِ دقیقش (همان قالبِ whereِ موتور) */
function* occurrences(g: number, rxSource: string): Generator<{ where: string; line: string }> {
  const rx = new RegExp(`(?<!${FA_LETTER})(?:${rxSource})(?!${FA_LETTER})`, "g");
  for (const [ci, ch] of docs[g].chapters.entries()) {
    for (const [si, s] of ch.sections.entries()) {
      const base = `g${g}:${ch.id}:${si}:${s.type ?? ""}`;
      const items: Array<[string, string]> = [[`${base}:title,0`, s.title]];
      s.lines.forEach((ln: string, li: number) => items.push([`${base}:L${li}`, ln]));
      for (const [where, text] of items) {
        if (rx.test(text)) yield { where, line: text };
        rx.lastIndex = 0;
      }
    }
  }
}

const NIM_KEEP = new Set([
  "g10:c5:0:vocab:L133", // half — نصف، نیم
  "g10:c5:1:notes:L19", // half نصف ،نیم
  "g10:c16:34:translation:L0", // ساعت هشت و نیم
  "g10:c16:37:translation:L1", // ساعت هفت و نیم
  "g10:c17:20:translation:title,0", // صبح های جمعه ساعت هفت و نیم
  "g10:c17:25:translation:L13", // ساعت شش و نیم
  "g10:c17:26:translation:L5", // چهار و نیم
  "g10:c20:34:translation:L3", // ساعت ده و نیم
  "g10:c20:36:translation:title,0", // ساعت دو و نیم
  "g12:c5:3:vocab:L14", // دو صد گفته چون نیم کردار نیست
  "g12:c5:3:vocab:L152", // کاسه ای زیر نیم کاسه است
  "g12:c5:3:vocab:L165", // کاسه ای زیر نیم کاسه است
  "g12:c5:3:vocab:L235", // پیشکیس را نیم شمارند دندان اسب
  "g12:c6:1:grammar:L14", // ساعت یک و نیم
]);

const SHE_KEEP = new Set([
  "g10:c19:38:translation:L6", // «شی ن» — قطعهٔ میانه‌واژه‌ایِ شیرینیِ بریدهٔ ستونی
  "g12:c16:1:tests:L4902", // «شیﻼ» — نامِ شخص با لیگاتورِ عربی
]);

describe("r406 — حکمِ بافتیِ خانواده‌هایِ مبهمِ نثر", () => {
  it("صفرِ فرمِ شکستهٔ حکم‌شده در هر سه سند", () => {
    const broken = [
      "\\bمعت\\b", "\\bطوالت\\b", "\\bطوالتتر\\b", "\\bهمکالش\\b", "\\bعقالت\\b",
      "\\bپذیراب\\b", "\\bمتفاوب\\b", "\\bنامعت\\b", "\\bمعتن\\b", "شی زین", "بیش ری", "غ ری", "منطف و عقالت",
    ];
    for (const g of [10, 11, 12]) {
      const blob = proseBlob(g);
      for (const b of broken) {
        const hits = blob.match(new RegExp(b, "g")) || [];
        expect(hits, `«${b}» در گ${g}: ${hits.slice(0, 2).join("،")}`).toHaveLength(0);
      }
    }
  });

  it("نیمِ باقی‌مانده فقط در نگه‌داشته‌هایِ مستند (ساعتِ «و نیم»/نصف/سه ضرب‌المثل)", () => {
    for (const g of [10, 11, 12]) {
      for (const { where, line } of occurrences(g, "نیم")) {
        expect(NIM_KEEP.has(where), `نیمِ نگه‌داشته‌نشدگی در ${where}: ${line.slice(0, 80)}`).toBe(true);
      }
    }
    // شمارشِ کل: ۱۳ رخداد در ۱۳ خطِ نگه‌داشته
    let n = 0;
    for (const g of [10, 11, 12]) for (const _ of occurrences(g, "نیم")) n++;
    expect(n).toBe(13);
  });

  it("شیِ باقی‌مانده فقط دو نگه‌داشتهٔ مستند: قطعهٔ «شی ن» و نامِ «شیﻼ»", () => {
    let n = 0;
    for (const g of [10, 11, 12]) {
      for (const { where } of occurrences(g, "شی")) {
        expect(SHE_KEEP.has(where), `شیِ نگه‌داشته‌نشدگی در ${where}`).toBe(true);
        n++;
      }
    }
    expect(n).toBe(2);
  });

  it("ردیف‌هایِ شاخصِ ترمیم‌شده در نثر", () => {
    // نمی (جابجاییِ نیم)
    expect(proseBlob(10)).toMatch(/صحبت نمی کنند/);
    expect(proseBlob(11)).toMatch(/بکار نمی روند/);
    expect(proseBlob(12)).toMatch(/اگه باران نمی بارید/);
    // r407: میس/میش نیمشود → میسر نمی‌شود (ضرب‌المثل با شکلِ درست)
    expect(proseBlob(10)).toMatch(/نابرده رنج گنج میسر نمی شود/);
    // شیر (حذفِ الف)
    expect(proseBlob(10)).toContain("شیر - شیر دوشیدن");
    expect(proseBlob(11)).toMatch(/شیر میل دارید/);
    expect(proseBlob(12)).toMatch(/شیر گاو وجود دارد/);
    // سری (series + یک سری اطلاعات)
    expect(proseBlob(12)).toMatch(/سری ،مجموعه/);
    expect(proseBlob(12)).toContain("یک سری اطلاعات");
    // شیرینی (شی زین/ینز)
    expect(proseBlob(10)).toContain("قصد خریدن شیرینی");
    // همکلاس (کالش)
    expect(proseBlob(12)).toMatch(/همکلاس من است/);
    expect(proseBlob(12)).toMatch(/همکلاس من بود/);
    // طولانی (طوالت)
    expect(proseBlob(11)).toContain("برای مدت طولانی ورزش نکرده");
    expect(proseBlob(12)).toContain("عمر انسان را طولانی");
    // عقلایی (عقالت در عبارتِ بافتی)
    expect(proseBlob(12)).toContain("منطقی و عقلایی");
    // طولانی‌تر (طوالتتر)
    expect(proseBlob(10)).toContain("طولانی‌تر ،بلندتر");
    expect(proseBlob(11)).toMatch(/طولانی‌تر داشته باشند/);
    // نامعین (نامعت — حرف تعریف نامعین؛ کورپوس L4398/L11129 هر دو شکل)
    expect(proseBlob(10)).toMatch(/نامعین \(با اسامی مفرد\)|نامعین \(با اسا/);
    // بیشتر/غیر (ری)
    expect(proseBlob(10)).toMatch(/بیشتر از هزار/);
    expect(proseBlob(12)).toMatch(/غیر انسان/);
    // پذیرایی/متفاوت/معنی (امواجِ همسایه)
    expect(proseBlob(10)).toMatch(/از خودتان پذیرایی کنید/);
    expect(proseBlob(10)).toContain("معنی متفاوت خواهند داشت");
    expect(proseBlob(10)).toContain("معنی صفت برتری");
    expect(proseBlob(11)).toContain("پیشوند معنی مثال");
  });

  it("واژه‌ها و نام‌هایِ مشروع مصون مانده‌اند", () => {
    const b10 = proseBlob(10);
    const b12 = proseBlob(12);
    // ضرب‌المثل‌ها و ساعت‌ها
    expect(b12).toContain("دو صد گفته چون نیم کردار نیست");
    expect(b12).toContain("کاسه ای زیر نیم کاسه است");
    expect(b12).toContain("پیشکیس را نیم شمارند دندان اسب");
    expect(b10).toContain("half — نصف، نیم");
    expect(b10).toMatch(/ساعت هشت و نیم/);
    expect(b10).toMatch(/قطار من ساعت ده و نیم/);
    // شهر ری و نامِ استاد و شیﻼ
    expect(b10).toContain("بیمارستان شهر ری");
    expect(proseBlob(11)).toContain("استاد شه ری احساب");
    expect(b12).toMatch(/شیﻼ/);
    // قطعهٔ بریدهٔ «شی ن» حفظ شده (سندِ لایهٔ خراب)
    expect(b10).toContain("پذیرایی کنید. شی ن");
    // نیمکت/نیم‌سوز و نهایی دست‌نخورده
    expect(b10).toContain("bench — نیمکت");
    expect(proseBlob(11)).toMatch(/نهایی/);
  });

  it("index.json همگام با سندها (عنوان‌ها و شمارِ خط‌ها)", () => {
    for (const g of [10, 11, 12]) {
      const grade = index.grades.find((x: any) => x.grade === g);
      grade.chapters.forEach((ch: any, ci: number) => {
        expect(ch.title, `عنوانِ فصل g${g}#${ci}`).toBe(docs[g].chapters[ci].title);
        ch.sections.forEach((s: any, si: number) => {
          expect(s.title, `عنوانِ سکشن g${g} ch${ci}#${si}`).toBe(docs[g].chapters[ci].sections[si].title);
          expect(s.lines, `شمارِ خط g${g} ch${ci}#${si}`).toBe(docs[g].chapters[ci].sections[si].lines.length);
        });
      });
    }
  });

  it("رسیدِ r406: مجموعِ ۲۷۱ با توزیعِ پین‌شدهٔ قواعد", () => {
    expect(receipt.round).toBe("r406");
    const r = receipt.replacements;
    const sum = Object.values(r).reduce((a: number, b: any) => a + b, 0) as number;
    expect(sum).toBe(271);
    expect(r["معت→معنی"]).toBe(114);
    expect(r["نیم→نمی"]).toBe(97);
    expect(r["شی→شیر"]).toBe(22);
    expect(r["طوالت→طولانی"]).toBe(13);
    expect(r["همکالش→همکلاس"]).toBe(5);
    expect(r["متفاوب→متفاوت"]).toBe(4);
    expect(r["طوالتتر→طولانی‌تر"]).toBe(3);
    expect(r["منطف و عقالت→منطقی و عقلایی"]).toBe(3);
    expect(r["نامعت→نامعین"]).toBe(2);
    expect(r["پذیراب→پذیرایی"]).toBe(2);
    expect(r["شی→سری"]).toBe(2);
    expect(r["بیش ری→بیشتر"]).toBe(1);
    expect(r["معتن→معنی"]).toBe(1);
    expect(r["شی زین→شیرینی"]).toBe(1);
    expect(r["غ ری→غیر"]).toBe(1);
  });
});
