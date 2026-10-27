// r409 — رسیدِ سوییپِ چهارمِ نثر: کلاسِ أ/اً (همان احتماألِ r407) + کشف‌هایِ اسکنِ فرکانسی.
// ۴۸۲ اصلاح در ۴۶ قاعده روی g7-g12 + هر ۸ بانکِ tests-*/grammar-* + index:
// معموأل/معموآل→معمولاً (۶۰)، واقعأ→واقعاً (۲۷)، کامأل→کاملاً (۱۹)، حتمأ→حتماً (۲۰)، لطفأ→لطفاً (۱۵)؛
// ملیک→ملکی (۲۲)، طبییع→طبیعی (۲۲)، قدییم→قدیمی (۲۱)، انگی→انگیز (۲۱)، مهماب→مهمانی (۲۱)؛
// زمی/زمات/زماب→زمان (۴۶)، زماتز→زمانی (۵)، بخیس→بخش/بخشی (۲۲)، تاری خ→تاریخ (۱۹)؛
// پرانتز: «داخل پر ن»→«داخل پرانتز» (۹) + حذفِ تکهٔ «انی» (۲۱ — شاهد لایه چاپ «پرانی ن»).
// لایه‌ها: (۱) صفرِ فرمِ شکسته؛ (۲) نگه‌داشته‌ها (رصفأ/نآب/خیزان-افتان/تأثیِ جدولی/مبدأ/رأی/متأسفانه)؛
// (۳) قهرمان‌ها؛ (۴) پوششِ بانک‌ها؛ (۵) همگامیِ index؛ (۶) رسید.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const jozve = (f: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), "public/jozve", f), "utf8"));

const docs: Record<number, any> = {
  7: jozve("g7.json"), 8: jozve("g8.json"), 9: jozve("g9.json"),
  10: jozve("g10.json"), 11: jozve("g11.json"), 12: jozve("g12.json"),
};
const index = jozve("index.json");
const banks = ["tests-g7", "tests-g8", "tests-g9", "tests-g10", "tests-g11", "tests-g12",
  "grammar-g11", "grammar-g11-konkur", "grammar-g12-topic"].map((b) => jozve(`${b}.json`));
const testsG10 = jozve("tests-g10.json");
const testsG10raw = readFileSync(path.join(process.cwd(), "public/jozve/tests-g10.json"), "utf8");
const receipt = JSON.parse(readFileSync(path.join(process.cwd(), "scripts/r409-receipt.json"), "utf8"));

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
  for (const bank of banks) {
    for (const le of bank.lessons ?? []) {
      for (const q of le.questions ?? []) {
        parts.push(String(q.question ?? ""), ...(q.options ?? []).map(String),
          String(q.translation ?? ""), ...(q.accepted ?? []).map(String),
          String(q.explanation ?? ""));
      }
    }
  }
  return parts.join("\n");
};

describe("r409 — سوییپِ چهارمِ نثر: کلاسِ أ/اً و کشف‌هایِ اسکنِ فرکانسی", () => {
  it("صفرِ فرمِ شکسته رویِ میدانِ پیموده‌شده (شش سند + هر ۹ بانک)", () => {
    const blob = allTexts();
    const forbidden: Array<[string, RegExp]> = [
      // کلاسِ أ/اً
      ["معموأل", /معموأل/], ["معموآل", /معموآل/], ["واقعأ", /واقعأ/],
      ["کامأل", /کامأل/], ["حتمأ", /حتمأ/], ["قبأل", /قبأل/],
      ["لطفأ", /لطفأ/], ["فورأ", /فورأ/], ["فورآ", /فورآ/],
      ["اکثرأ", /اکثرأ/], ["اصأل", /اصأل/], ["عمومأ", /عمومأ/],
      ["اخیأ", /اخیأ/], ["اخیرأ", /اخیرأ/], ["مخصوصأ", /مخصوصأ/],
      ["بعدأ", /بعدأ/], ["مثأل", /مثأل/], ["دقیقأ", /دقیقأ/],
      ["تقریبأ", /تقریبأ/], ["منحصرأ", /منحصرأ/], ["منحرصأ", /منحرصأ/],
      ["عمدتأ", /عمدتأ/], ["مطمئنأ", /مطمئنأ/], ["حقیقتأ", /حقیقتأ/],
      ["صرفأ", /صرفأ/],
      // جابجایی‌هایِ تازه
      ["طبییع", rxOf("طبییع")], ["ملیک", rxOf("ملیک")], ["قدییم", rxOf("قدییم")],
      ["زمی", rxOf("زمی")], ["زمات", rxOf("زمات")], ["زماب", rxOf("زماب")],
      ["زماتز", rxOf("زماتز")], ["گسیر ش", /گسیر ش/], ["انگی", rxOf("انگی")],
      ["تأخی", rxOf("تأخی")], ["بخیس", rxOf("بخیس")], ["مهماب", rxOf("مهماب")],
      ["تاری خ", /تاری خ/], ["داخل پر ن", /داخل پر ن/], ["جدا نشدب", /جدا نشدب/],
      // خانواده‌هایِ r408 — رویِ بانک‌هایِ تازه‌پیموده هم صفر بمانند
      ["رسگریم", rxOf("رسگریم")], ["داشی", rxOf("داشی")], ["ربیون", /ربیون/],
      ["تنهاب", rxOf("تنهاب")], ["انگلییس", rxOf("انگلییس")], ["حارص", rxOf("حارص")],
    ];
    for (const [name, rx] of forbidden) {
      expect(rx.test(blob), `فرمِ شکستهٔ ${name} باید صفر باشد`).toBe(false);
    }
  });

  it("نگه‌داشته‌هایِ مستند: رصفأ/نآب مبهم، خیزان-افتانِ مشروع، أهایِ مشروع، تکه‌هایِ جدولی", () => {
    const blob = allTexts();
    // رصفأ (۸) و نآب (۲) — تک‌خوانشِ مطمئن ندارند؛ مستند و نگه‌داشته
    expect(blob).toContain("رصفأ");
    expect(blob).toContain("نآب");
    // خیزان/افتان — اصطلاحِ درستِ آهنگِ جمله (rising/falling)
    expect(blob).toContain("آهنگ خیزان");
    expect(blob).toContain("افتان");
    // أ/آهایِ مشروع — نباید لطمه خورده باشند (سه‌رأی در فیلدِ مستندسازیِ sourceِ tests-g12 است)
    expect(JSON.stringify(jozve("tests-g12.json"))).toContain("سه‌رأی");
    expect(blob).toContain("مبدأ");
    expect(blob).toContain("تأکیدی");
    expect(blob).toContain("متأسفانه");
    expect(blob).toContain("مأموریت");
    expect(testsG10raw).toContain("می‌آیند");
    // تکه‌هایِ ستونیِ جدولِ واژگان — «تأثی»+«ر» (بازسازیِ ساختاری نمی‌خواهند)
    expect(JSON.stringify(docs[11])).toContain("influence تأثی");
    // سبکِ نیم‌فاصله‌دارِ محاوره — آسیبِ گلیف نیست
    expect(JSON.stringify(docs[10])).toContain("میکنیم");
    // quirk-noteهایِ مستندِ source — دست‌نخورده
    expect(testsG10raw).toContain("«تنهاب»→تنهایی");
  });

  it("قهرمان‌هایِ ترمیم‌شده — هر خانواده با شاهد", () => {
    const s10 = JSON.stringify(docs[10]);
    const s11 = JSON.stringify(docs[11]);
    const s12 = JSON.stringify(docs[12]);
    // کلاسِ أ/اً
    expect(s10).toContain("کاملاً فراموش کردم");
    expect(s10).toContain("مهمانی بهم واقعاً خوش گذشت");
    expect(s10).toContain("حتماً باید قبل از اسم");
    expect(s10).toContain("اخیراً و به تازگ");
    expect(s10).toContain("later (بعداً) soon");
    expect(s11).toContain("کنکور منحصراً زبان");
    expect(s12).toContain("مثلاً");
    // جابجایی‌ها
    expect(s10).toContain("natural — طبیعی");
    expect(s10).toContain("کاربرد صفات ملکی");
    expect(s10).toContain("ساعت سوئییس سیاه قدیمی");
    expect(s10).toContain("زمین خوردم");
    expect(s10).toContain("جدول زمانی");
    expect(s10).toContain("when — چه زمانی، گ- زمانیکه");
    expect(s10).toContain("بخش الف) صفت یک");
    expect(s10).toContain("بخشی از زندگیست");
    expect(s10).toContain("بخش (یا یک‌بخشی) صفت دو");
    expect(s10).toContain("history — تاریخ");
    expect(s10).toContain("یک معلم تاریخ");
    expect(s10).toContain("develop — توسعه دادن، گسترش دادن");
    // مهماب دو-خوانش
    expect(s10).toContain("مهمان‌هایی که آنها دعوت کردند اهل کشور آلمان بود");
    expect(s12).toContain("مهمانی بزرگ برگزار کند");
    expect(s11).toContain("به این مهمانی دعوت کردید");
    // انگی→انگیز
    expect(s10).toContain("شگفت");
    // پرانتز-پرانتز
    expect(s10).toContain("شکل صحیح افعال داخل پرانتز:تمرین");
    expect(s10).toContain("شکل صحیح صفات داخل پرانتز.1");
    expect(s11).toContain("تأخیر داشتند");
    // جدا نشدب→جدا نشدنی
    expect(s11).toContain("جدا نشدنی");
  });

  it("پوششِ بانک‌هایِ ناپیموده — اخیرأِ tests-g10 و مهماب‌هایِ grammar-g12-topic ترمیم شده", () => {
    expect(JSON.stringify(testsG10)).toContain("او اخیراً یک ماشین سفید بزرگ قشنگ خریده است");
    let h12 = 0;
    for (const bank of banks) {
      for (const le of bank.lessons ?? []) {
        for (const q of le.questions ?? []) {
          if (String(q.translation ?? "").includes("مهمانی")) h12++;
        }
      }
    }
    expect(h12).toBeGreaterThanOrEqual(2);
    // هیچ بانکی دیگر فرمِ شکسته ندارد
    for (const bank of banks) {
      const b = JSON.stringify(bank);
      expect(b).not.toContain("معموأل");
      expect(b).not.toContain("مهماب ");
      expect(b).not.toContain("طبییع");
    }
  });

  it("همگامیِ index.json — عنوان‌هایِ پرانتزی ترمیم و شمارشِ خط‌ها پایدار", () => {
    const blob = JSON.stringify(index);
    expect(blob).toContain("شکل صحیح افعال داخل پرانتز");
    expect(blob).not.toContain("داخل پر ن");
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

  it("رسیدِ r409 — مجموع ۴۸۲ در ۴۶ قاعده، توزیعِ خانواده‌ها، leftAfterِ خالی", () => {
    expect(receipt.round).toBe("r409");
    expect(receipt.total).toBe(482);
    expect(Object.keys(receipt.rules)).toHaveLength(46);
    expect(receipt.rules["معموأل→معمولاً"]).toBe(53);
    expect(receipt.rules["واقعأ→واقعاً"]).toBe(27);
    expect(receipt.rules["ملیک→ملکی (ی↔ک؛ صفات ملکی)"]).toBe(22);
    expect(receipt.rules["انی→حذف (تکهٔ پرانتز — آخرین قاعده)"]).toBe(21);
    expect(receipt.rules["مهماب→مهمانی (ن→ب؛ پس از تک‌خوانشِ مهمان)"]).toBe(20);
    expect(receipt.rules["داخل پر ن→داخل پرانتز (شاهد لایهٔ چاپ: «پرانی ن»)"]).toBe(9);
    expect(Object.values(receipt.rules).reduce((a: number, b: any) => a + b, 0)).toBe(482);
    expect(receipt.leftAfter).toEqual({});
    for (const [name, s] of Object.entries(receipt.samples as Record<string, string[]>)) {
      expect(s.length, `نمونه‌هایِ ${name}`).toBeLessThanOrEqual(5);
      expect(s.length).toBeGreaterThan(0);
    }
  });
});
