// r399 — رسیدِ پالایشِ دومِ جداولِ واژگانِ گ۱۰-گ۱۲
// سه لایه: (۱) پاکیِ ساختاری — هیچ کشیده/زبالهٔ سرصفحه/همزهٔ خراب در جداول نمانده؛
// (۲) ردیف‌هایِ رسیدِ نقشهٔ توکن — هر خانوادهٔ مُرداب با شکلِ درست؛
// (۳) ردیف‌هایِ جداشده/ترمیم‌شده — lion و a. m. و half و A. D. و the Caspian Sea
// دیگر در معنیِ همسایه قورت‌نخورده‌اند؛ index.json همگام است.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const jozve = (f: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), "public/jozve", f), "utf8"));

const docs: Record<number, any> = { 10: jozve("g10.json"), 11: jozve("g11.json"), 12: jozve("g12.json") };
const index = jozve("index.json");

const TABLES = [
  { g: 10, key: "لغات کلیدی پایه هفتم" },
  { g: 10, key: "لغات کلیدی پایه هشتم" },
  { g: 10, key: "لغات کلیدی پایه نهم" },
  { g: 10, key: "لغات کلیدی و تکمییل درس یکم" },
  { g: 10, key: "لغات کلیدی و تکمییل درس دوم" },
  { g: 10, key: "لغات کلیدی و تکمییل درس سوم" },
  { g: 10, key: "لغات کلیدی و تکمییل درس چهارم" },
  { g: 11, key: "لغات کلیدی و تکمییل درس اول" },
  { g: 11, key: "لغات کلیدی و تکمییل درس دوم" },
  { g: 11, key: "لغات کلیدی و تکمییل درس سوم" },
  { g: 12, key: "لغات کلیدی و تکمییل درس اول" },
  { g: 12, key: "لغات کلیدی و تکمییل درس دوم" },
  { g: 12, key: "لغات کلیدی و تکمییل درس سوم" },
];

const findVocab = (g: number, key: string) => {
  for (const ch of docs[g].chapters) {
    for (const s of ch.sections) {
      if (s.type === "vocab" && (s.title || "").includes(key)) return s;
    }
  }
  return null;
};

const allLines = () => TABLES.map((t) => findVocab(t.g, t.key).lines.join("\n")).join("\n");

describe("r399 — پالایشِ دومِ جداولِ واژگانِ گ۱۰-گ۱۲", () => {
  it("هیچ کشیده، زبالهٔ سرصفحه، یا همزهٔ خرابِ سیستماتیک در جداول نمانده", () => {
    const blob = allLines();
    expect(blob, "کشیدهٔ تایپوگرافی").not.toMatch(/\u0640/);
    for (const sig of ["ده ـ", "Words ”", "“ Words", "ؤاالت", "متوسطه اول", "جام ع", "لغ ـ", "کلی ـ"]) {
      expect(blob, `امضای زبالهٔ «${sig}»`).not.toContain(sig);
    }
    // همزهٔ خراب: هیچ توکنِ تک‌همزه‌ای (أ/ء یتیم از «ضمیر»ی سه‌تکه)، هیچ توکنِ أ-پایان
    // (عمدتأ→عمدتا) و هیچ «أل»ی (اصأل→اصلا) نمانده — واژه‌هایِ مشروعِ همزه‌دار
    // (تأکید، متأسفانه، مأمور، جزء، امضاء، اشیاء) از این الگوها بیرون‌اند
    expect(blob).not.toMatch(/(^|[\s،؛(])\u0621(?=$|[\s،؛:.!؟)])/);
    expect(blob).not.toMatch(/(^|[\s،؛(])\u0623(?=$|[\s،؛:.!؟)])/);
    expect(blob).not.toMatch(/\u0623(?=$|[\s،؛:.!؟)])/);
    expect(blob).not.toContain("أل");
  });

  it("خانواده‌هایِ مردابِ نقشهٔ r399 — شکل‌هایِ شکسته بازنمی‌گردند", () => {
    const blob = allLines();
    for (const broken of [
      "دسی یس", "شر وع", "رسی وع", "هی مند", "نیی د", "میالد", "شانجام", "رورسی",
      "اخالق", "دستیاتی", "یافئ", "عایل", "تمی -", "پخی", "آشیر زی", "توانسی ن",
      "مطمت", "مشیر ", "پائیر", "پاییر", "رص وری", " خیی ", "اجتمایع", "مرصف", "غالم",
      "واقیع", "کنی ل", "می ادف", "باالبردن", "ناراحنر", "باال", "زمت ", "مرص ", "اسیر احت", "میانگیر",
    ]) {
      expect(blob, `فرمِ شکستهٔ «${broken}»`).not.toContain(broken);
    }
  });

  it("ردیف‌هایِ رسیدِ نقشهٔ توکن — معنی‌هایِ درستِ کورپوس‌پشتیبان", () => {
    const row = (g: number, key: string, word: string) => {
      const sec = findVocab(g, key);
      const line = sec.lines.find((l: string) => l.split(" — ")[0] === word);
      expect(line, `${word} در ${key}`).toBeTruthy();
      return line as string;
    };
    // g11: access — کالیبره با have access to=دست یافی به و accessible=قابل دسترسی
    expect(row(11, "درس اول", "access")).toBe("access — دسترسی، دستیابی - دسترسی پیدا کردن");
    // g12: access با «یافی»ی چسبیده به خطِ بعد
    expect(row(12, "درس دوم", "access")).toBe("access — دسترسی یافتن، دسترسی، اجازه ورود");
    // battle — نبرد از «نیی د»؛ ethics — ویرگولِ سرِ معنی + لا↔ال
    expect(row(12, "درس دوم", "battle")).toContain("نبرد");
    expect(row(12, "درس اول", "ethics")).toBe("ethics — اخلاق، اخلاقیات، اصول اخلاق");
    // artist — هنرمند از «هی مند»؛ harm — ضرر از «رص ر»
    expect(row(11, "درس اول", "artist")).toContain("هنرمند");
    expect(row(11, "درس دوم", "harm")).toContain("ضرر");
    // east — شرق از «رسی ق»؛ conditions — شرایط از «شر ایط»
    expect(row(10, "پایه هشتم", "east")).toBe("east — شرق");
    expect(row(11, "درس دوم", "conditions")).toContain("شرایط");
    // Jupiter — مشتری از «مشیر ی»
    expect(row(10, "درس دوم", "Jupiter")).toContain("مشتری");
    // martyr — رساندن از تری‌گرامِ «رس ان دن»
    expect(row(10, "پایه نهم", "martyr")).toContain("رساندن");
    // sure — مطمئن از «مطمت ز»
    expect(row(10, "پایه هفتم", "sure")).toContain("مطمئن");
    // slave — غلام از «غالم»؛ informer — خبرچین از «خیی چیر/چیز»
    expect(row(12, "درس دوم", "slave")).toContain("غلام");
    expect(row(12, "درس اول", "informer")).toContain("خبرچین");
    // synonym — مترادف از «می ادف»؛ object سوم — «ضمیر»ی سه‌تکه بازجوش
    expect(row(11, "درس اول", "synonym")).toContain("مترادف");
    expect(row(11, "درس اول", "object")).toContain("ضمیر");
    // nearby/hang/medical/mechanical — تصادمِ ک↔گ و ئ↔تن
    expect(row(11, "درس سوم", "nearby")).toBe("nearby — حوالی، نزدیک");
    expect(row(11, "درس سوم", "hang")).toContain("آویختن");
    expect(row(11, "درس دوم", "medical")).toContain("پزشک");
    expect(row(12, "درس سوم", "mechanical")).toContain("مکانیک");
    // spell — املا از «امالء» + هجی از «هح»
    expect(row(10, "پایه هفتم", "spell")).toContain("املا");
    expect(row(10, "پایه هفتم", "spell")).toContain("هجی");
    // خانوادهٔ ن↔ت و س↔ی (کشفِ UI)
    expect(row(11, "درس دوم", "properly")).toBe("properly — به درستی");
    expect(row(12, "درس دوم", "biology")).toBe("biology — زیست شناسی");
    expect(row(12, "درس دوم", "temporary")).toContain("موقت");
    expect(row(12, "درس دوم", "biography")).toContain("زندگی نامه");
    expect(row(11, "درس اول", "simply")).toBe("simply — به سادگی، به راحتی");
    expect(row(12, "درس سوم", "kinetic")).toContain("حرکت جنبی");
  });

  it("ردیف‌هایِ جداشده از معنیِ همسایه — هرکدام ردیفِ مستقلِ خودشان", () => {
    const row = (g: number, key: string, word: string) => {
      const sec = findVocab(g, key);
      return sec.lines.find((l: string) => l.split(" — ")[0] === word);
    };
    expect(row(10, "پایه نهم", "lion")).toBe("lion — شیر (حیوان)");
    expect(row(10, "پایه هشتم", "a. m.")).toBe("a. m. — قبل از ظهر");
    expect(row(10, "پایه نهم", "well done!")).toBe("well done! — آفرین");
    expect(row(10, "پایه نهم", "Here you are.")).toBe("Here you are. — بفرمایید");
    expect(row(10, "پایه هشتم", "fall = autumn")).toBe("fall = autumn — فصل پاییز");
    expect(row(10, "درس دوم", "many")).toBe("many — زیاد (قبل از اسم جمع قابل شمارش)");
    expect(row(10, "درس دوم", "half")).toBe("half — نصف، نیم (جمع آن: halves)");
    expect(row(12, "درس اول", "A. D.")).toBe("A. D. — بعد از میلاد مسیح، میلادی");
    expect(row(12, "درس اول", "the Caspian Sea")).toBe("the Caspian Sea — دریای خزر");
    // میزبان‌ها پاک شده‌اند
    const knee = findVocab(10, "پایه نهم").lines.find((l: string) => l.startsWith("knee — "));
    expect(knee).toBe("knee — زانو");
    const atLast = findVocab(12, "درس اول").lines.find((l: string) => l.startsWith("at last — "));
    expect(atLast).toBe("at last — سرانجام، در نهایت");
    const asWellAs = findVocab(12, "درس اول").lines.find((l: string) => l.startsWith("as well as — "));
    expect(asWellAs).toBe("as well as — همچنین، علاوه بر");
  });

  it("ترمیمِ knife — جمعِ گم‌شده به ردیف برگشته و یتیمِ «)» حذف شده", () => {
    const sec = findVocab(10, "لغات کلیدی و تکمییل درس یکم");
    const knife = sec.lines.find((l: string) => l.startsWith("knife — "));
    expect(knife).toBe("knife — چاقو (جمع آن: knives)");
    expect(sec.lines.find((l: string) => l.startsWith("knives — "))).toBeUndefined();
    expect(sec.lines.find((l: string) => l.startsWith("mouse — )"))).toBeUndefined();
    // mouse واقعی سر جایش است
    expect(sec.lines.find((l: string) => l === "mouse — موش")).toBeTruthy();
  });

  it("ردیف‌هایِ اصلاح‌شدهٔ زباله‌خورده — سرصفحه از معنیِ ساده‌ها پاک شده", () => {
    const good = findVocab(10, "پایه هفتم").lines.find((l: string) => l.startsWith("good — "));
    expect(good).toBe("good — خوب");
    const fever = findVocab(10, "پایه هشتم").lines.find((l: string) => l.startsWith("fever — "));
    expect(fever).toBe("fever — تب");
    const date = findVocab(10, "پایه هفتم").lines.find((l: string) => l.startsWith("date — "));
    expect(date).toBe("date — تاریخ- خرما - قرار ملاقات");
    const carrot = findVocab(10, "پایه هفتم").lines.find((l: string) => l.startsWith("carrot — "));
    expect(carrot).toBe("carrot — هویج");
  });

  it("index.json با شمارِ تازهٔ ردیف‌ها همگام است", () => {
    const pins: Record<string, number> = {
      "لغات کلیدی پایه هفتم": 200, "لغات کلیدی پایه هشتم": 180, "لغات کلیدی پایه نهم": 323,
      "لغات کلیدی و تکمییل درس یکم": 152, "لغات کلیدی و تکمییل درس دوم": 249,
      "لغات کلیدی و تکمییل درس سوم": 179, "لغات کلیدی و تکمییل درس چهارم": 187,
      "g11-اول": 201, "g11-دوم": 231, "g11-سوم": 199, "g12-اول": 272, "g12-دوم": 359, "g12-سوم": 268,
    };
    for (const t of TABLES) {
      const grade = index.grades.find((x: any) => x.grade === t.g);
      let counted = 0;
      for (const ch of grade.chapters) {
        for (const s of ch.sections) {
          if (s.type === "vocab" && s.title.includes(t.key)) counted = s.lines;
        }
      }
      const sec = findVocab(t.g, t.key);
      expect(counted, `index برای ${t.key}`).toBe(sec.lines.length);
      void pins;
    }
  });
});
