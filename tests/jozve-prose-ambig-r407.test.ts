// r407 — رسیدِ دومین موجِ حکمِ بافتیِ نثر (خانواده‌هایِ مستندِ nextRoundCandidates رَ r406).
// ۳۴۶ اصلاح روی g10-g12: گیی→گیری (۸۲ شاملِ دُمِ واژه‌ها: یادگیی/بگیید/ماهیگیی)، یم→می‌ (۸۵)، کیم→کمی (۴۴)،
// یگ→یکی (۲۷)، مطمی→مطمئن (۱۶)، نیم+فعل→نمی‌ (۱۳)، احتماأل→احتمالاً (۱۱)، منطف→منطقی (۸)،
// دخی-خانواده (۱۴)، معتی→معتبر (۵) + موقعیتی‌ها (بزرگترین/انگیز/غلط‌گیری/میسر/خط مشی/می‌رسید/فروشی…).
// لایه‌ها: (۱) صفرِ فرمِ شکسته؛ (۲) نگه‌داشته‌هایِ مستند (کیمیا/جدولِ g9/میشه/میشود/ساعت‌ها)؛
// (۳) ردیف‌هایِ شاخصِ ترمیم‌شده؛ (۴) بازسازیِ موقعیتی؛ (۵) همگامیِ index.json؛ (۶) رسید.

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
const receipt = JSON.parse(readFileSync(path.join(process.cwd(), "scripts/r407-receipt.json"), "utf8"));

const FA = "[\\u0600-\\u06FF\\u200c]";

const allTexts = () => {
  const parts: string[] = [];
  for (const g of [7, 8, 9, 10, 11, 12]) {
    for (const ch of docs[g].chapters) {
      parts.push(ch.title);
      for (const s of ch.sections) parts.push(s.title, ...s.lines);
    }
  }
  return parts.join("\n");
};

describe("r407 — حکمِ بافتیِ خانواده‌هایِ مستندِ نثر", () => {
  it("صفرِ فرمِ شکسته روی هر شش سند (عناوین + خط‌ها)", () => {
    const blob = allTexts();
    const rxOf = (src: string) => new RegExp(`(?<![\\u0621-\\u064A\\u0670-\\u06D3\\u200c])(?:${src})(?![\\u0621-\\u064A\\u0670-\\u06D3\\u200c])`);
    const forbidden: Array<[string, RegExp]> = [
      ["یم-فعل", rxOf(`یم(?=${FA})`)],
      ["کیم", rxOf("کیم(?!یا)")],
      ["مطمی", rxOf("مطمی")],
      ["منطف", rxOf("منطف")],
      ["معتی", /معتی/],
      ["دخی", rxOf("دخ(ی|یر|یش|یم)")],
      ["شییت", rxOf("شییت")],
      ["فرویس", rxOf("فرویس")],
      ["گییح", /گییح/],
      ["گیی", /گیی/],
      ["نیم+فعل", rxOf("نیم(?=شود|کن|دان|سوز)")],
      ["میسید", rxOf("میسید")],
      ["میسه", rxOf("میسه")],
      ["گنج میس", /گنج میس(?!ر)/],
      ["گنج میش", /گنج میش/],
      ["خط میس", /خط میس/],
      ["میش نشسته", /میش نشسته/],
      ["نیسیتم", /نیسیتم/],
      ["احتماأل", /احتماأل/],
      ["یگ", rxOf("یگ")],
      ["شیدزد", /شیدزد/],
      ["پیاده کت", /پیاده کت/],
    ];
    for (const [name, rx] of forbidden) {
      expect(rx.test(blob), `فرمِ شکستهٔ ${name} باید صفر باشد`).toBe(false);
    }
    // شکل‌هایِ ترمیمِ نیمه‌کاره: بزرگیین نباید به «بزرگیرین» بیفتد
    expect(blob).not.toContain("بزرگیرین");
    expect((blob.match(/بزرگترین/g) || []).length).toBeGreaterThanOrEqual(5);
  });

  it("نگه‌داشته‌هایِ مستند دست‌نخورده ماندند", () => {
    // نامِ شخصیِ کیمیا (دیالوگِ معرفیِ پایهٔ هفتم)
    const g7blob = docs[7].chapters
      .flatMap((c: any) => c.sections.flatMap((s: any) => [s.title, ...s.lines]))
      .join("\n");
    expect(g7blob).toContain("سلام کیمیا");
    expect(g7blob).toContain("من کیمیا کمیجانی هستم");
    expect((g7blob.match(/کیمیا/g) || []).length).toBeGreaterThanOrEqual(6);
    // جدولِ صرفیِ «شو» در g9 — تکه‌هایِ ستونیِ بی‌چاپِ معتبر (نگه‌داشت)
    const g9sec = docs[9].chapters[1].sections[12];
    expect(g9sec.lines[20]).toBe("می  ش   ودI");
    expect(g9sec.lines[35]).toBe("می میش    ودWe");
    expect(g9sec.lines[37]).toBe("می میش    ودYou");
    expect(g9sec.lines[40]).toBe("میش      ودThey");
    // «میشه»یِ محاوره‌ای (می‌شه) سالم — فقط «میسه»(س) اصلاح می‌شود
    expect(allTexts()).toMatch(/میشه لطفا کنار آن مغازه/);
    // ساعت‌ها و نیم‌دایره — قاعدهٔ نیمِ r407 فقط فعل‌ها را می‌گیرد
    expect(allTexts()).toMatch(/ساعت هفت و نیم/);
    expect(allTexts()).toMatch(/نیم دایره/);
    expect(allTexts()).toMatch(/دو صد گفته چون نیم کردار نیست/);
  });

  it("ردیف‌هایِ شاخصِ ترمیم‌شده (قهرمان‌ها)", () => {
    const blob = allTexts();
    // یم→می‌
    expect(blob).toContain("من الان دارم درسهایم را مطالعه می‌کنم.");
    expect(blob).toContain("صحبت می‌کنند");
    expect(blob).toContain("حمل می‌کند");
    expect(blob).toMatch(/عمر انسان را طولانی می‌کند/);
    // کیم→کمی
    expect(blob).toContain("تعداد کمی");
    expect(blob).toContain("مقدار کم");
    expect(blob).toMatch(/یه کمی یا یه خورده/);
    expect(blob).toContain("برگشت،کمی بعد"); // کیمِ چسبیده به «،»
    // مطمی→مطمئن
    expect(blob).toMatch(/مطمئن نیستم/);
    expect(blob).toContain("مطمئن نیستیم. احتمالاً خانواده ما");
    // دخی-خانواده
    expect(blob).toContain("daughter — (فرزند ) دختر");
    expect(blob).toContain("girl — دختر");
    expect(blob).toContain("یک پسر و سه دختر .پسر 7ساله دارد");
    expect(blob).toMatch(/برای دخترم می گردم|دخترم می گردم/);
    // منطف→منطقی / معتی→معتبر
    expect(blob).toMatch(/reasonable — منطقی، معقول/);
    expect(blob).toContain("مؤسسات معتبر کنکوری");
    expect(blob).toMatch(/صلاحیت، اختیار، معتبر/);
    // یگ→یکی
    expect(blob).toContain("یکی پس از دیگری");
    expect(blob).toMatch(/یکی به یکی/);
    expect(blob).toContain("یکی از مهمیین بخش های بدنمان");
    expect(blob).toContain("،یکی از پرکاربرد"); // یگِ چسبیده به «،»
    // احتماأل
    expect(blob).toMatch(/احتمالاً/);
    // گیی→گیری — دُمِ واژه‌ها (یادگیری/بگیرید/ماهیگیری/پیشگیری) + توکنِ مستقل
    // (پین به‌روزِ r408: «انگلییس» در همین ردیف توسطِ خانوادهٔ انگلییس→انگلیسیِ r408 ترمیم شد)
    expect(blob).toMatch(/یادگیری زبان انگلیسی/);
    expect(blob).toMatch(/ماهیگیری و شنا/);
    expect(blob).toMatch(/پیشگیری بهی از درمان|پیشگیری/);
    expect(blob).toContain("بگیرید");
    expect(blob).toMatch(/اندازه‌گیری طول/);
    expect(blob).toMatch(/تصمیم‌گیری سخت بود|گیری سخت بود/);
    // موقعیتی‌هایِ گیی-خانواده
    expect(blob).toContain("انگیزی که نزدیک");
    expect(blob).toContain("انگیز!");
    expect((blob.match(/غلط‌گیری/g) || []).length).toBe(3);
    expect(blob).toContain("ده هزار متری");
    expect(blob).toContain("معانی یک لغت");
    expect(blob).toContain("و لذت ببریم");
  });

  it("میس/میش — میسر و به نظر می‌رسید و خط مشی و پشت میز", () => {
    const blob = allTexts();
    expect(blob).toContain("نابرده رنج گنج میسر نمی شود."); // g10
    expect(blob).toMatch(/گنج میسر نمی‌شود؛ مزد آن گرفت جان برادر/); // g12 (نیم+فعل)
    expect(blob).toMatch(/می‌رسید که تصادف به طور کامل اعتماد به نفس/);
    expect(blob).toContain("policy — ، رویه سیاست، خط مشی");
    expect(blob).toContain("میز نشسته است. ترجمه تست :الف :مینا الان کجا است ؟");
    expect(blob).toMatch(/تخم مرغ دزد شتر دزد می‌شود/);
  });

  it("شییت/فرویس — دیالوگِ خریدِ سحر (شاهدِ چاپ: مغازه شیرینی‌فروشی)", () => {
    expect(allTexts()).toContain("شیرینی بخرم");
    expect(allTexts()).toContain("شیرینی فروشی من را پیاده کنی؟");
    expect(allTexts()).toMatch(/مغازه کادو فروشی/);
    expect(allTexts()).toMatch(/فروشی وجود داشتند/);
  });

  it("بازسازیِ موقعیتیِ جفتِ خطِ «مشتری بزرگترین سیاره» — بدونِ از دست رفتنِ سطرِ واژگان", () => {
    // سکشنِ ترجمهٔ مکالمه (chapters[4] id=c5): L40 تخلیه، L41 بازسازی
    const conv = docs[10].chapters[4].sections[2];
    expect(conv.lines[40]).toBe("");
    expect(conv.lines[41]).toBe(
      "خانم تابش :سیاره مشتری بزرگترین سیاره است .بیش از 60قمر داره .میخوای بهش نگاه کن؟",
    );
    expect(conv.lines[42]).toBe("Alireza: I really like that.");
    // جدولِ واژگانِ همان درس (chapters[5] id=c6) سالم — دو سطرِ ترمیم‌شده در رانِ اولِ معیوب برگردانده شدند
    const vocab = docs[10].chapters[5].sections[2];
    expect(vocab.lines[40]).toBe("change into — تبدیل شدن به، تبدیل کردن به");
    expect(vocab.lines[41]).toBe("grow up — رشد کردن، بزرگ شدن");
    expect(vocab.lines.filter((l: string) => !l.trim()).length).toBe(0);
    for (const l of vocab.lines) expect(l).toContain(" — ");
  });

  it("همگامیِ index.json با عناوینِ به‌روزشدهٔ اسناد", () => {
    for (const gg of [7, 8, 9, 10, 11, 12]) {
      const doc = docs[gg];
      const ix = index.grades.find((x: any) => x.grade === gg);
      expect(ix, `index g${gg}`).toBeTruthy();
      expect(ix.title).toBe(doc.title);
      for (const [ci, ch] of doc.chapters.entries()) {
        expect(ix.chapters[ci].title).toBe(ch.title);
        for (const [si, s] of ch.sections.entries()) {
          expect(ix.chapters[ci].sections[si].title, `g${gg}:${ch.id}:${si}`).toBe(s.title);
        }
      }
    }
  });

  it("رسیدِ r407 — مجموع، توزیعِ قواعد و ایدمپوتنسی", () => {
    const reps = receipt.replacements;
    const total = Object.values(reps).reduce((a: number, b: any) => a + (b as number), 0);
    expect(total).toBe(346); // ۳۴۳ قاعده/موقعیتی + 2 بازسازیِ خط + 1 اندازه‌گیری
    // توزیعِ قهرمانِ قواعد
    expect(reps["یم→می‌"]).toBe(85);
    expect(reps["گیی→گیری (بی‌گارد — همیشه دُمِ گیری)"]).toBe(82);
    expect(reps["کیم→کمی"]).toBe(44);
    expect(reps["یگ→یکی"]).toBe(27);
    expect(reps["مطمی→مطمئن"]).toBe(16);
    expect(reps["نیم+فعل→نمی‌"]).toBe(13);
    expect(reps["احتماأل→احتمالاً"]).toBe(11);
    expect(reps["منطف→منطقی"]).toBe(8);
    expect(reps["دخی→دختر"]).toBe(7);
    expect(reps["معتی→معتبر"]).toBe(4);
    expect(reps["فرویس→فروشی"]).toBe(4);
    expect(reps["غلطگیی→غلط‌گیری"]).toBe(3);
    // leftAfter باید خالی باشد (به‌جز نگه‌داشته‌هایِ مستثناشده)
    expect(Object.keys(receipt.leftAfter ?? {}).length).toBe(0);
    // نگه‌داشته‌هایِ مستند در رسید ثبت‌اند
    expect(receipt.keptDocumented["kimiya-personal-name"]).toContain("کیم(?!یا)");
    expect(receipt.keptDocumented["g9-sho-conjugation-fragments"].length).toBe(4);
  });
});
