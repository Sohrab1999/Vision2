// r408 — رسیدِ سوییپِ سومِ نثر: خانواده‌هایِ جابجاییِ حرفِ کشف‌شده با پروبِ r408.
// ۲۸۶ اصلاح در ۳۲ قاعده روی g7-g12 + tests-g11 + index: انگلییس→انگلیسی (۱۱۸ با ضمیرِ چسبیده)،
// داشی→داشتن (۳۴)، ربیون/بیون→بیرون (۳۴)، رس→سر (۱۸)، حارص/حا نرص→حاضر (۱۵)، رصوری/نرصوری→ضروری (۸)،
// رسگریم→سرگرمی (۷)، گسیش→گسترش (۵)، تنهاب→تنهایی (۱۱)، یرسکت→شرکت (۵)، خوشحایل→خوشحالی (۵)،
// برگشی→برگشتن (۳)، گشی→گشتن/برگشتن (۴)، خانوادهٔ «رسد»یِ سرد (۷) + موقعیتی‌ها.
// لایه‌ها: (۱) صفرِ فرمِ شکسته؛ (۲) نگه‌داشته‌هایِ مستند (ضرب‌المثل/به نظر می‌رسد/شدی-کردی/quirks/کیمیا/می میش ود)؛
// (۳) ردیف‌هایِ شاخص؛ (۴) بانکِ tests-g11؛ (۵) همگامیِ index.json؛ (۶) رسید.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const jozve = (f: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), "public/jozve", f), "utf8"));

const docs: Record<number, any> = {
  7: jozve("g7.json"),
  8: jozve("g8.json"),
  9: jozve("g9.json"),
  10: jozve("g10.json"),
  11: jozve("g11.json"),
  12: jozve("g12.json"),
};
const index = jozve("index.json");
const testsG11 = jozve("tests-g11.json");
const testsG10 = jozve("tests-g10.json");
const receipt = JSON.parse(readFileSync(path.join(process.cwd(), "scripts/r408-receipt.json"), "utf8"));

const LET_INNER = "\\u0621-\\u064A\\u0670-\\u06D3\\u200c";
const rxOf = (src: string) =>
  new RegExp(`(?<![${LET_INNER}])(?:${src})(?![${LET_INNER}])`);

const allTexts = () => {
  const parts: string[] = [];
  for (const g of [7, 8, 9, 10, 11, 12]) {
    for (const ch of docs[g].chapters) {
      parts.push(ch.title);
      for (const s of ch.sections) parts.push(s.title, ...s.lines);
    }
  }
  // بانکِ آزمونِ g11 — همان دامنهٔ موتور (question/options/translation؛ نه source)
  for (const le of testsG11.lessons) {
    for (const q of le.questions ?? []) {
      parts.push(String(q.question ?? ""), ...(q.options ?? []).map(String), String(q.translation ?? ""));
    }
  }
  return parts.join("\n");
};

describe("r408 — سوییپِ سومِ نثر: خانواده‌هایِ جابجاییِ حرف", () => {
  it("صفرِ فرمِ شکسته روی میدانِ پیموده‌شده (شش سند + بانکِ g11)", () => {
    const blob = allTexts();
    const forbidden: Array<[string, RegExp]> = [
      ["رسگریم", rxOf("رسگریم")],
      ["گسیش", rxOf("گسیش")],
      ["حارص", rxOf("حارص")],
      ["حا نرص", /حا نرص/],
      ["نرصوری", /نرصوری/],
      ["رصوری", rxOf("رصوری")],
      ["رس", rxOf("رس")],
      ["برگشی", rxOf("برگشی")],
      ["عجیت", rxOf("عجیت")],
      ["داشی", rxOf("داشی")],
      ["ربیون", /ربیون/],
      ["بیون", rxOf("بیون")],
      ["همکالیس", /همکالیس/],
      ["کالیس", rxOf("کالیس")],
      ["یرسکت", rxOf("یرسکت")],
      ["تنهاب", rxOf("تنهاب")],
      ["خوشحایل", rxOf("خوشحایل")],
      ["انگلییس", rxOf("انگلییس")],
      ["یافین", rxOf("یافین")],
      ["بپویس", rxOf("بپویس")],
      ["گشی", rxOf("گشی")],
      ["بررسی ک .نیم", /بررسی ک ?\. ?نیم/],
      ["هوا رسد", /هوا رسد/],
      ["رسد است", /رسد است/],
      ["رسد خواهد بود", /رسد خواهد بود/],
      ["cold — رسد", /cold — رسد/],
      ["sounds great — رسد", /That sounds great — رسد/],
    ];
    for (const [name, rx] of forbidden) {
      expect(rx.test(blob), `فرمِ شکستهٔ ${name} باید صفر باشد`).toBe(false);
    }
  });

  it("نگه‌داشته‌هایِ مستند: ضرب‌المثل، «به نظر می رسد»، شدی/کردیِ مشروع، quirks، کیمیا، «می میش ود»", () => {
    const blob = allTexts();
    // ضرب‌المثلِ رسددار — «رسد» اینجا مشروع است و نباید خورده شود
    expect(blob).toContain("چو فردا رسد فکر فردا کنیم");
    // «به نظر می رسد»یِ سالم — قاعدهٔ رس نباید به آن چسبیده باشد
    expect(blob).toContain("به نظر می رسد");
    // دوم‌شخصِ مشروع — بدونِ قاعده (شدی/کردی)
    expect(JSON.stringify(docs[12])).toContain("متولد شدی");
    expect(JSON.stringify(docs[12])).toContain("ملاقات کردی");
    // «تو بردی»یِ تک‌موردِ مبهم — نگه‌داشته‌شده
    expect(JSON.stringify(docs[11])).toContain("تو بردی");
    // printQuirksِ tests-g10 — مستندسازیِ تاریخی، خارج از دامنهٔ موتور و دست‌نخورده
    const quirks = JSON.stringify(testsG10.source);
    expect(quirks).toContain("همکالیس هایت");
    expect(quirks).toContain("«تنهاب»→تنهایی");
    expect(quirks).toContain("«رسگریم»→سرگرمی");
    expect(quirks).toContain("«رس کار»→سرکار");
    // کیمیا (نگه‌داشتِ r407) و «می میش ود»یِ g9 (نگه‌داشتِ دائمی — شکلِ پینِ r407 با فاصله‌هایِ ستونی)
    expect(JSON.stringify(docs[7])).toContain("کیمیا");
    expect(JSON.stringify(docs[9])).toContain("می میش    ودWe");
  });

  it("ردیف‌هایِ شاخصِ ترمیم‌شده — قهرمان‌هایِ هر خانواده", () => {
    const s10 = JSON.stringify(docs[10]);
    const s11 = JSON.stringify(docs[11]);
    const s12 = JSON.stringify(docs[12]);
    const s8 = JSON.stringify(docs[8]);
    // رسگریم→سرگرمی
    expect(s10).toContain("hobby — سرگرمی");
    expect(s10).toContain("entertainment — سرگرمی");
    // رس→سر
    expect(s10).toContain("headache — سر درد");
    expect(s10).toContain("hair — موی سر");
    expect(s10).toContain("evening — سر شب");
    expect(s10).toContain("قول میدم سر وقت به مدرسه برسم");
    expect(s10).toContain("به مادربزرگم سر می‌زنم");
    expect(s10).toContain("نکته، سر نخ");
    expect(s10).toContain("noise — سر و صدا");
    // حارص→حاضر + محارصه→محاصره + موقعیتی
    expect(s10).toContain("حاضریم به حیوانات غذا می دهیم");
    expect(s10).toContain("من و همکلاس ام در حال حاضر با هم انگلیسی صحبت می کنیم");
    expect(s12).toContain("surround — احاطه کردن، محاصره کردن");
    expect(s12).toContain("محاصره کردند");
    expect(s11).toContain("ready — آماده، حاضر");
    expect(s12).toContain("هدیه حال - حاضر");
    expect(s10).toContain("at the moment — در حال حاضر");
    expect(s10).toContain("ready — آماده، مهیا، حاضر");
    // رصوری→ضروری
    expect(s11).toContain("necessary essential ضروری،لازم");
    expect(s10).toContain("در حال گسترش است");
    // ربیون/بیون→بیرون + سطرِ چهارگانه
    expect(s10).toContain("بپوش وقت که می خواهی بروی بیرون زیرا (هوای بیرون) سرد است");
    expect(s10).toContain("بیرون پرید بر سر خواهر ترسیده اش");
    expect(s10).toContain("بنابراین بیرون خیلی سرد خواهد بود");
    // داشی→داشتن — «نگه داشتن»یِ سالم هم سالم بماند
    expect(s10).toContain("داشتن )4مصاحبه کردن )3شرکت کردن ،مشارکت");
    expect(s10).toContain("keep — نگه داشتن - نگه داری کردن");
    // تنهاب/خوشحایل/یرسکت
    // لطفأ→لطفاً (پین به‌روز r409: کلاسِ أ/اً)
    expect(s10).toContain("لطفاً خودت به تنهایی این تمرین را انجام بده");
    expect(s10).toContain("happily با خوشحالی polite مؤدب");
    expect(s10).toContain(")3شرکت کردن در ، ...در ...حضور یافتن");
    // برگشی→برگشتن + گشی→گشتن
    expect(s12).toContain("come back — برگشتن");
    expect(s12).toContain("look for — گشتن به دنبال، جستجو کردن برای");
    // خانوادهٔ cold + بازسازیِ That sounds great + بررسی کنیم
    expect(s10).toContain("The weather got cold. هوا سرد شد");
    expect(s10).toContain("در زمستان آنقدر هوا سرد است که");
    expect(s8).toContain("That sounds great — عالی به نظر می‌رسد");
    expect(s8).toContain("نکات گرامری بررسی کنیم");
    expect(JSON.stringify(docs[9])).toContain("نکات گرامری بررسی کنیم");
    // عجیت→عجیب
    expect(s10).toContain("سر و صدای عجیب که در خیابان بود");
    // انگلییستان→انگلیسی‌تان — با نیم‌فاصله، نه چسبیده (ردیف در g11 است)
    expect(s11).toContain("زبان انگلیسی\u200cتان");
    expect(s11).not.toContain("انگلیسیتان");
  });

  it("بانکِ tests-g11 — پرسشِ فقرِ ضروری‌تر ترمیم شده", () => {
    let hit = false;
    for (const le of testsG11.lessons) {
      for (const q of le.questions ?? []) {
        if (String(q.translation ?? "").includes("فقر یک مشکل ضروری تر است")) hit = true;
      }
    }
    expect(hit).toBe(true);
  });

  it("همگامیِ index.json — عنوان‌هایِ ترمیم‌شده همگام و شمارشِ خط‌ها دست‌نخورده", () => {
    const blob = JSON.stringify(index);
    expect(blob).toContain("من و همکلاس ام در حال حاضر با هم انگلیسی صحبت می کنیم");
    expect(blob).toContain("سر و صدای عجیب که در خیابان بود بیدار شدم");
    expect(blob).not.toContain("رسگریم");
    // ساختار: شش پایه با همان فصل‌ها/سکشن‌ها
    expect(index.grades).toHaveLength(6);
    for (const gr of index.grades) {
      const doc = docs[gr.grade];
      expect(gr.chapters).toHaveLength(doc.chapters.length);
      for (let ci = 0; ci < gr.chapters.length; ci++) {
        expect(gr.chapters[ci].sections).toHaveLength(doc.chapters[ci].sections.length);
        for (let si = 0; si < gr.chapters[ci].sections.length; si++) {
          expect(gr.chapters[ci].sections[si].title).toBe(doc.chapters[ci].sections[si].title);
          expect(gr.chapters[ci].sections[si].lines).toBe(doc.chapters[ci].sections[si].lines.length);
        }
      }
    }
  });

  it("رسیدِ r408 — مجموع ۲۸۹ در ۳۳ قاعده، توزیعِ خانواده‌ها، leftAfterِ خالی", () => {
    expect(receipt.round).toBe("r408");
    expect(receipt.total).toBe(289);
    expect(Object.keys(receipt.rules)).toHaveLength(33);
    expect(receipt.rules["انگلییس→انگلیسی"]).toBe(117);
    expect(receipt.rules["انگلییستان→انگلیسی‌تان (ضمیرِ چسبیده)"]).toBe(1);
    expect(receipt.rules["داشی→داشتن"]).toBe(34);
    expect(receipt.rules["ربیون→بیرون"]).toBe(23);
    expect(receipt.rules["رس→سر (standalone)"]).toBe(18);
    expect(receipt.rules["حارص→حاضر"]).toBe(12);
    expect(receipt.rules["حاضز→حاضر (جابجاییِ ض↔ز؛ ready/at the moment)"]).toBe(3);
    expect(receipt.rules["محارصه→محاصره (همان کلاسِ ص↔ر؛ surround/محاصرهٔ قاتل)"]).toBe(2);
    expect(receipt.rules["حارص داریم به→حاضریم به (تک‌خوانشِ دستوریِ سطرِ تغذیهٔ حیوانات)"]).toBe(1);
    expect(receipt.rules["رسگریم→سرگرمی"]).toBe(7);
    expect(receipt.rules["رصوری→ضروری"]).toBe(7);
    expect(receipt.rules["تنهاب→تنهایی"]).toBe(11);
    expect(Object.values(receipt.rules).reduce((a: number, b: any) => a + b, 0)).toBe(289);
    expect(receipt.leftAfter).toEqual({});
    // هر قاعده حداکثر ۵ نمونهٔ مستند دارد
    for (const [name, s] of Object.entries(receipt.samples as Record<string, string[]>)) {
      expect(s.length, `نمونه‌هایِ ${name}`).toBeLessThanOrEqual(5);
      expect(s.length).toBeGreaterThan(0);
    }
  });
});
