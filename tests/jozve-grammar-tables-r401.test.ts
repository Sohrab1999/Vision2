// r401 — رسیدِ جدول‌هایِ گرامریِ کوچکِ گ۱۰-گ۱۲
// لایه‌ها: (۱) افعالِ سه‌شکل — هر سه نسخه (گ۱۰/گ۱۱/گ۱۲) اکنون ۸۹ ردیفِ استانداردِ
// «v1 / v2 / v3 — معنی» با معنی‌هایِ راستی‌آزمایی‌شده علیه لایهٔ عمودیِ کورپوس؛
// (۲) افعالِ لازمِ دوازدهم — ۳۰ ردیفِ جفت‌شدهٔ موضعی؛
// (۳) ضمایرِ گ۱۰ — فاعلی ۸ / to-be ۳۲ (چهار زمان) / ملکی ۸ / مفعولی ۸؛
// (۴) بهداشتِ گلیف — هیچ فرمِ شکستهٔ مستند در ردیف‌هایِ تازه؛ index.json همگام.

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const jozve = (f: string) =>
  JSON.parse(readFileSync(path.join(process.cwd(), "public/jozve", f), "utf8"));

const docs: Record<number, any> = { 10: jozve("g10.json"), 11: jozve("g11.json"), 12: jozve("g12.json") };
const index = jozve("index.json");

// (فایل، فصل، سکشن) جدول‌هایِ این راند
const IRREGULAR = [
  { g: 10, ch: 14, sec: 1 },
  { g: 11, ch: 9, sec: 1 },
  { g: 12, ch: 10, sec: 1 },
];

const findSec = (g: number, ch: number, sec: number) => docs[g].chapters[ch].sections[sec];

describe("r401 — جدول‌هایِ گرامریِ کوچکِ گ۱۰-گ۱۲", () => {
  it("هر سه نسخهٔ افعالِ سه‌شکل: ۸۹ ردیفِ استاندارد با متادیتای pairedFrom", () => {
    for (const t of IRREGULAR) {
      const sec = findSec(t.g, t.ch, t.sec);
      expect(sec.pairedFrom, `رسیدِ ${t.g}`).toMatch(/r401/);
      const rows = sec.lines.filter((l: string) => /^[\w']+( \/ [^—]+)? — /.test(l));
      expect(rows.length, `ردیف‌هایِ سه‌شکلِ ${t.g}`).toBe(89);
      for (const r of rows) {
        expect(r, `قالبِ ردیف در ${t.g}: ${r}`).toMatch(/^[A-Za-z' /]+ — [(]?[\u0600-\u06FF]/);
      }
    }
  });

  it("ردیف‌هایِ شاخصِ سه‌شکل — ترمیم‌هایِ مستند سرجایشان‌اند", () => {
    const rowsOf = (g: number) => findSec(g, g === 10 ? 14 : g === 11 ? 9 : 10, 1).lines;
    for (const g of [10, 11, 12]) {
      const L: string[] = rowsOf(g);
      const map = new Map(L.map((l) => [l.split(" — ")[0], l]));
      expect(map.get("begin / began / begun"), `begin در ${g}`).toBe("begin / began / begun — شروع کردن");
      expect(map.get("bet / bet / bet"), `bet در ${g}`).toBe("bet / bet / bet — شرط بستن");
      expect(map.get("fall / fell / fallen"), `fall در ${g}`).toBe("fall / fell / fallen — زمین خوردن، سقوط کردن");
      expect(map.get("meet / met / met"), `meet در ${g}`).toBe("meet / met / met — ملاقات کردن");
      expect(map.get("go / went / gone"), `go در ${g}`).toBe("go / went / gone — رفتن");
      expect(map.get("hit / hit / hit"), `hit در ${g}`).toBe("hit / hit / hit — زدن، ضربه زدن");
      expect(map.get("write / wrote / written"), `write در ${g}`).toBe("write / wrote / written — نوشتن");
      expect(map.get("be / was / were / been"), `be در ${g}`).toBe("be / was / were / been — بودن");
    }
  });

  it("زباله‌هایِ جدولِ سه‌شکل (رز/ن/جج/سربرگِ معت فاریس) از بازهٔ جدول حذف شده‌اند", () => {
    for (const t of IRREGULAR) {
      const L: string[] = findSec(t.g, t.ch, t.sec).lines;
      for (const ln of L) {
        expect(ln.trim(), `قطعهٔ زباله در ${t.g}: «${ln}»`).not.toBe("رز");
        expect(ln.trim(), `قطعهٔ زباله در ${t.g}: «${ln}»`).not.toBe("جج");
        expect(ln, `سربرگِ شکسته در ${t.g}`).not.toMatch(/^معت\s*فار/);
      }
    }
  });

  it("افعالِ لازمِ دوازدهم: ۳۰ ردیفِ مرتب و سرِ جدولِ «افعال لازم عبارتند از:»", () => {
    const sec = findSec(12, 2, 6);
    expect(sec.title).toBe("افعال لازم عبارتند از:");
    expect(sec.pairedFrom).toMatch(/r401/);
    const rows = sec.lines.slice(0, 30);
    for (const r of rows) expect(r).toMatch(/^[A-Za-z ]+ — [\u0600-\u06FF]/);
    const map = new Map(rows.map((l: string) => [l.split(" — ")[0], l]));
    expect(map.get("sit")).toBe("sit — نشستن");
    expect(map.get("rise")).toBe("rise — بالا آمدن");
    expect(map.get("party")).toBe("party — مهمانی گرفتن");
    expect(map.get("get up")).toBe("get up — از خواب بیدار شدن");
    expect(map.get("take place")).toBe("take place — اتفاق افتادن");
    expect(rows[29]).toBe("cry — گریه کردن");
    // نثرِ بعد از جدول سر جایش است
    expect(sec.lines.join("\n")).toContain("مجهول جملات زمان حال ساده");
  });

  it("ضمایرِ چهارگانهٔ گ۱۰ — فاعلی ۸، to-be ۳۲ با سه سربرگِ زمان، ملکی ۸، مفعولی ۸", () => {
    const subj = findSec(10, 1, 7);
    expect(subj.title).toBe("ضمایر فاعلی مفرد / ضمایر فاعلی جمع");
    expect(subj.lines.slice(0, 8)).toEqual([
      "I — من", "we — ما", "you — تو", "you — شما",
      "he — او (مذکر)", "she — او (مؤنث)", "it — آن (غیر انسان)", "they — آنها",
    ]);

    const tobe = findSec(10, 1, 9);
    expect(tobe.title).toBe("رابطه ضمایر فاعلی با افعال to be");
    const headers = tobe.lines.filter((l: string) => l.startsWith("رابطه ضمایر فاعلی"));
    expect(headers.length).toBe(3);
    expect(tobe.lines).toContain("I am — من ...هستم.");
    expect(tobe.lines).toContain("You are — تو ...هستی.");
    expect(tobe.lines).toContain("You will be — تو ...خواهی بود.");
    expect(tobe.lines).toContain("You would be — تو میخواستی ...باشی.");
    expect(tobe.lines).toContain("It would be — آن میخواست ...باشد (غیر انسان).");
    const rowRe = /^[A-Za-z ]+ — [\u0600-\u06FF]/;
    const tobeRows = tobe.lines.filter((l: string) => rowRe.test(l));
    expect(tobeRows.length).toBe(32);

    const poss = findSec(10, 1, 11);
    expect(poss.title).toBe("ضمایر ملکی مفرد / ضمایر ملکی جمع");
    expect(poss.lines.slice(0, 8)).toEqual([
      "mine — مال من", "ours — مال ما", "yours — مال تو", "yours — مال شما",
      "his — مال او (مذکر)", "hers — مال او (مؤنث)", "its — مال آن (غیر انسان)", "theirs — مال آنها",
    ]);

    const obj = findSec(10, 1, 12);
    expect(obj.title).toBe("ضمایر مفعولی مفرد / ضمایر مفعولی جمع");
    expect(obj.lines.slice(0, 8)).toEqual([
      "me — به من، من را", "us — به ما، ما را", "you — به تو، تو را", "you — به شما، شما را",
      "him — به او، او را (مذکر)", "her — به او، او را (مؤنث)",
      "it — به آن، آن را (غیر انسان)", "them — به آنها، آنها را",
    ]);
  });

  it("بهداشتِ گلیف — هیچ فرمِ شکستهٔ مستندی در ردیف‌هایِ تازهٔ این راند", () => {
    const all = [
      ...IRREGULAR.map((t) => findSec(t.g, t.ch, t.sec).lines),
      findSec(12, 2, 6).lines.slice(0, 30),
      findSec(10, 1, 7).lines.slice(0, 8),
      findSec(10, 1, 9).lines.filter((l: string) => /^[A-Za-z]/.test(l)),
      findSec(10, 1, 11).lines.slice(0, 8),
      findSec(10, 1, 12).lines.slice(0, 8),
    ]
      .flat()
      .join("\n");
    for (const bad of [
      "رسی وع", "یرسوع", "شر ط بسی", "شکستر", "ساختر", "سوختر", "گرفتر",
      "رانندگ کردن", "زضبه", "رهیی", "معنز", "مالقات", "فروختر", "کشتر", "بستر ز", "دستگی کردن",
      "نشستر", "گفتر", "انداختر", "رپیوز", "پیوز", "نوشئ", "نوشی", "مهمات",
      "زندیک", "نشسی", "کمگ", "ضمایر فاعیل", "ضمایر مفعویل", "ضمایر ملگ", "افعال الزم",
    ]) {
      expect(all, `فرمِ شکستهٔ «${bad}» بازگشته`).not.toContain(bad);
    }
  });

  it("index.json با شمارِ تازهٔ سکشن‌هایِ این راند همگام است", () => {
    const targets: Array<[number, number, number]> = [
      [10, 14, 1], [11, 9, 1], [12, 10, 1], [12, 2, 6],
      [10, 1, 7], [10, 1, 9], [10, 1, 11], [10, 1, 12],
    ];
    for (const [g, ch, si] of targets) {
      const grade = index.grades.find((x: any) => x.grade === g);
      const counted = grade.chapters[ch].sections[si].lines;
      expect(counted, `index g${g} ch${ch} sec${si}`).toBe(
        docs[g].chapters[ch].sections[si].lines.length
      );
    }
  });
});
