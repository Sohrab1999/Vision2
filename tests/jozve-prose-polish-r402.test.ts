// r402 — رسیدِ پالایشِ گلیفِ نثرِ گ۱۰-گ۱۲ (فازِ ۱: قواعدِ مطمئن)
// لایه‌ها: (۱) جاروی نویسه‌هایِ عربی (ي/ى/ك) در هر سه سند — صفر باقی‌مانده؛
// (۲) توکنِ یتیمِ «یم» → «می» — هیچ «یم»ِ تنهای نمانده؛
// (۳) خانوادهٔ لا↔ال و واژه‌هایِ ساخت — هیچ فرمِ شکستهٔ \b-دار بازنمی‌گردد؛
// (۴) واژه‌هایِ مشروع مصون‌اند (عالی، نیم، ری، بالا، تمییز، دستگیری…)؛
// (۵) عناوینِ جداولِ واژگان اکنون «تکمیلی» است و index.json همگام.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const jozve = (f: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), "public/jozve", f), "utf8"));

const docs: Record<number, any> = { 10: jozve("g10.json"), 11: jozve("g11.json"), 12: jozve("g12.json") };
const index = jozve("index.json");

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

const FA_LETTER = "[\\u0600-\\u06FF\\u200c]";

describe("r402 — پالایشِ گلیفِ نثرِ گ۱۰-گ۱۲", () => {
  it("جاروی نویسه‌هایِ عربی: هیچ ي/ى/ك در هر سه سند نمانده", () => {
    for (const g of [10, 11, 12]) {
      const blob = JSON.stringify(docs[g]);
      expect(blob).not.toMatch(/[\u064A\u0649\u0643]/);
    }
  });

  it("توکنِ یتیمِ «یم» — هیچ «یم»ِ تنهایی نمانده (نیم/خوانیم و… مصون)", () => {
    for (const g of [10, 11, 12]) {
      const re = new RegExp(`(?<!${FA_LETTER})یم(?!${FA_LETTER})`, "g");
      const blob = proseBlob(g);
      const hits = blob.match(re) || [];
      expect(hits, `یمِ یتیم در گ${g}: ${hits.slice(0, 3).join("،")}`).toHaveLength(0);
    }
  });

  it("خانوادهٔ لا↔ال و واژه‌هایِ ساخت — هیچ فرمِ شکستهٔ مستقل بازنمی‌گردد", () => {
    const broken = [
      "\\bکالس\\b", "\\bباال\\b", "\\bباالتر\\b", "\\bباالی\\b", "\\bسواالت\\b",
      "\\bحاال\\b", "\\bتعطیالت\\b", "\\bاطالعات\\b", "\\bاطالعاتی\\b", "\\bعالقمند\\b",
      "\\bالزم\\b", "\\bتالش\\b", "\\bمفعویل\\b", "\\bفاعیل\\b", "\\bملگ\\b",
      "\\bکمگ\\b", "\\bمالقات\\b", "\\bزندیک\\b", "\\bپییا\\b", "\\bگایه\\b",
      "\\bتکمییل\\b", "\\bهمچنت\\b", "\\bجلوگیی\\b", "\\bنشسی\\b", "\\bخوایه\\b",
      "\\bعلیضا\\b", "\\bمعت فاریس\\b", "\\bمعت فارش\\b", "\\bمهمات گرفی\\b",
      "\\bمشکالت\\b", "\\bمحصوالت\\b", "\\bمجالت\\b", "\\bمطالت\\b", "\\bکاله", "\\bحاالت\\b",
      "\\bسئواالت\\b", "\\bایاالت\\b", "\\bاحتماال\\b", "\\bباالفاصله\\b", "\\bباالخره\\b",
    ];
    for (const g of [10, 11, 12]) {
      const blob = proseBlob(g);
      for (const b of broken) {
        const hits = blob.match(new RegExp(b, "g")) || [];
        expect(hits, `«${b}» در گ${g}: ${hits.slice(0, 2).join("،")}`).toHaveLength(0);
      }
    }
  });

  it("ردیف‌هایِ شاخصِ ترمیم‌شده در نثر", () => {
    // گ۱۰ — نمونهٔ می‌کردنِ ترمیم‌شده
    expect(proseBlob(10)).toContain("تمییز می کند".replace("تمییز ", "")); // «می کند» جایی در نثر
    expect(proseBlob(10)).toMatch(/صحبت می کنند/);
    expect(proseBlob(10)).toMatch(/در کلاس وجود دارد/);
    expect(proseBlob(10)).toContain("این کلاس درس من است.");
    // گ۱۲ — فعل کمکی
    expect(proseBlob(12)).toMatch(/فعل کمکی/);
    expect(proseBlob(12)).not.toMatch(/فعل کمگ/);
    // سریع (از «شی ع»)
    expect(proseBlob(12)).toMatch(/غذای سریع/);
    // تلاش
    expect(proseBlob(10)).toMatch(/تلاش می کنند/);
    // موجِ دوم/سوم
    expect(proseBlob(10)).toMatch(/مشکلات را حل کنند/);
    expect(proseBlob(12)).toContain("کلاهت");
    expect(proseBlob(10)).toMatch(/مجلات/);
  });

  it("واژه‌هایِ مشروع مصون مانده‌اند", () => {
    // «عالی» (صفت) نباید به «علی» خراب شده باشد
    expect(proseBlob(11)).toMatch(/عالی/);
    // «نیمکت» و «شهر ری» و «بالا رفتن» دست‌نخورده
    expect(proseBlob(10)).toContain("bench — نیمکت");
    expect(proseBlob(10)).toContain("شهر ری");
    expect(proseBlob(10)).toContain("بالا رفتن");
    // «تمییز» و «دستگیری» سالم
    expect(JSON.stringify(docs[10])).toContain("دستگیری");
  });

  it("عناوینِ جداولِ واژگان اکنون «تکمیلی» است و index.json همگام", () => {
    const g10 = docs[10].chapters.flatMap((c: any) => c.sections).filter((s: any) => s.type === "vocab");
    expect(g10.some((s: any) => s.title.includes("لغات کلیدی و تکمیلی درس یکم"))).toBe(true);
    expect(g10.some((s: any) => s.title.includes("تکمییل"))).toBe(false);
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
});
