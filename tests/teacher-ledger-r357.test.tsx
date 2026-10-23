// @vitest-environment jsdom
// ------------------------------------------------------------------
// r357 — «دفترِ کلاسِ کامل» — هشتمین عضوِ خانوادهٔ CSV — پیشنهادِ ④ِ
// r354 (سه راند باز): پیوندِ روزنامه و کارنامه در یک پروندهٔ آرشیوی.
//
// قراردادهایی که این فایل قفل میکند:
//   • قرض نه رونویسی: بدنهٔ جدولِ کلاس از buildClassCsv (r352) و
//     بدنهٔ هر کارنامه از buildLearnerCardCsv (r354) قرض گرفته
//     میشود — این فایل هیچ ستونی را دوباره نمیسازد
//   • گویشِ خانواده بایت‌به‌بایت: BOM صریح (EF BB BF — بایتی، نه
//     متنی؛ درسِ r354: readAsText خودِ BOM را میبلعد) + CRLF + عددِ
//     ASCII + csvSafe + سلولِ خالیِ صادق + ISOِ پایدار
//   • ترتیبِ آرشیو: کارنامهها به ترتیبِ فهرستِ سرور میآیند — نه
//     مرتبسازیِ لحظهایِ معلم
//   • دوپا/دوقضاوت (r341/r343): شکستِ خواندنِ هر کارنامه ⇒ هیچ
//     پرونده‌ای نمیسازد (دفترِ نصفه = آرشیوِ دروغگو) ≠ شکستِ ساخت
//   • حریم: نه userId و نه secret و نه پاسخِ خام و نه handle
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import { EVENT_NAMES, EVENT_LABELS_FA, EVENT_CATEGORIES } from "@/lib/analytics-events";
import { buildClassLedgerCsv, downloadClassLedgerCsv, LEDGER_TITLE, ledgerIssuedRow } from "@/lib/teacher-class-ledger";
import type { LearnerDetail, RosterRow } from "@/lib/teacher-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

// r362 — هفتهٔ فعال اکنون عضوِ الزامیِ ورودیِ دفتر است (حذفش کامپایل را میشکند)
// روزهایِ ثابتِ ISO — قطعی برایِ سطرِ «پرکارترین»: ۲+۰+۳+۱ = ۶ تلاش، ۳ روزِ فعال
const weekFixture = [
  { day: "2026-10-18", attempts: 0 },
  { day: "2026-10-19", attempts: 2 },
  { day: "2026-10-20", attempts: 0 },
  { day: "2026-10-21", attempts: 3 },
  { day: "2026-10-22", attempts: 1 },
  { day: "2026-10-23", attempts: 0 },
  { day: "2026-10-24", attempts: 0 },
];

// ---------------- فیکسچرها ----------------
const rosterFixture: RosterRow[] = [
  { name: "آرش", color: "emerald", attempts: 3, avgPercent: 73, bestPercent: 90, lessons: 2, lastActive: "2026-10-24T08:30:00.000Z", weakest: { category: "dictation", avgPercent: 55 }, handle: "aaaa1111bbbb2222" },
  { name: "نگار, \"ویژه\"", color: "violet", attempts: 0, avgPercent: null, bestPercent: null, lessons: 0, lastActive: null, weakest: null },
];

const detailOf = (name: string): LearnerDetail => ({
  name,
  color: "emerald",
  joinedAt: "2026-10-01T00:00:00.000Z",
  attempts: 3,
  avgPercent: 73,
  bestPercent: 90,
  lessons: 2,
  lastActive: "2026-10-24T08:30:00.000Z",
  byDay: Array.from({ length: 14 }, (_, i) => ({ day: new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10), attempts: i === 13 ? 1 : 0 })),
  byLesson: [
    { lesson: 1, attempts: 2, avgPercent: 70 },
    { lesson: 2, attempts: 1, avgPercent: 80 },
    ...Array.from({ length: 10 }, (_, i) => ({ lesson: i + 3, attempts: 0, avgPercent: null })),
  ],
  bySkill: [
    { category: "dictation", attempts: 1, avgPercent: 55, bestPercent: 55 },
    { category: "quiz", attempts: 2, avgPercent: 82, bestPercent: 90 },
  ],
  recent: [
    { category: "quiz", lesson: 2, percent: 90, createdAt: "2026-10-24T08:30:00.000Z" },
    { category: "dictation", lesson: 1, percent: 55, createdAt: "2026-10-23T07:00:00.000Z" },
  ],
});

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({ view: { type: "home" } } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------
// ① موتورِ خالص — ساختارِ چندبخشی با قرضِ کامل
// ---------------------------------------------------------------
describe("buildClassLedgerCsv — پیوندِ روزنامه و کارنامه", () => {
  const csv = () =>
    buildClassLedgerCsv({
      generatedAt: "2026-10-24T09:15:00.000Z",
      byDay: weekFixture,
      roster: rosterFixture,
      details: [detailOf("آرش")],
    });

  it("① عنوان + سطرِ صادره + سطرهایِ هفتهٔ فعال + جدولِ کلاسِ قرضی + کارنامهٔ قرضی — به همان ترتیبِ ورودی", () => {
    const out = csv();
    const lines = out.split("\r\n");
    expect(lines[0]).toBe(LEDGER_TITLE);
    expect(lines[1]).toBe("صادره,2026-10-24");
    // r362 — سطرهایِ هفتهٔ فعال بینِ صادره و جدول — ارقامِ ASCIIِ گویشِ خانواده
    expect(lines[2]).toBe("هفتهٔ فعال,6 تلاش در 7 روزِ اخیر · 3 روزِ فعال");
    expect(lines[3]).toBe("پرکارترینِ روز,2026-10-21 · 3 تلاش");
    expect(lines[4]).toBe(""); // جداکنندهٔ بخش
    // جدولِ کلاس از تکحقیقتِ r352 قرض خورده — سرستونِ عینِ روزنامه
    expect(lines[5]).toBe("نام,رنگ,تلاش,میانگین,بهترین,درس‌ها,آخرین فعالیت,ضعیف‌ترین مهارت");
    expect(out).toContain("آرش,emerald,3,73,90,2,");
    // کارنامه از تکحقیقتِ r354 قرض خورده — عنوانِ کارنامه در دفتر هست
    expect(out).toContain("ویژن ۲ — کارنامهٔ یادگیرنده");
    // بخشهایِ کارنامه هم داخلِ دفتر زندهاند — با همان ارقامِ ASCIIِ r354 (قرضِ بایت‌به‌بایت)
    expect(out).toContain("روندِ 14 روز");
    expect(out).toContain("پوششِ درسها");
    expect(out).toContain("مهارتها — ضعیفترینِ اول");
    expect(out).toContain("آخرین تلاشها");
  });

  it("② csvSafe رویِ نامِ ورودیِ کاربر اعمال میشود — ویرگول/نقل‌قول به ستونها آسیب نمیزند", () => {
    const out = csv();
    // نامِ نگار در جدولِ کلاس پالایش شده
    expect(out).toContain("نگار ویژه");
    expect(out).not.toContain('نگار, "ویژه"');
    // تعدادِ ویرگولِ سطرِ نگار = دقیقاً ۷ (هشت ستون)
    const ngLine = out.split("\r\n").find((l) => l.startsWith("نگار"));
    expect(ngLine?.split(",").length).toBe(8);
  });

  it("③ گویشِ خانواده: فقط CRLF — هیچ LFِ برهنه‌ای در کلِ پرونده نیست", () => {
    const out = csv();
    expect(out).not.toMatch(/(?<!\r)\n/);
    expect(out.endsWith("\r\n")).toBe(true);
  });

  it("④ کارنامههایِ چندگانه: هر کدام با سطرِ خالی جدا و به ترتیبِ دادهشده", () => {
    const out = buildClassLedgerCsv({
      generatedAt: "2026-10-24T09:15:00.000Z",
      byDay: weekFixture,
      roster: rosterFixture,
      details: [detailOf("آرش"), detailOf("نگار ویژه")],
    });
    const first = out.indexOf("کارنامهٔ یادگیرنده");
    const second = out.indexOf("کارنامهٔ یادگیرنده", first + 1);
    expect(first).toBeGreaterThan(0);
    expect(second).toBeGreaterThan(first);
    // جداکنندهٔ خالیِ بینِ دو کارنامه (پایانِ NL کارنامهٔ اول + سطرِ خالی)
    expect(out).toContain("\r\n\r\nویژن ۲ — کارنامهٔ یادگیرنده");
  });

  it("⑤ کلاسِ بی‌کارنامه (همه بیتلاش) = فقط عنوان و جدول — صادق، نه جعلی", () => {
    const out = buildClassLedgerCsv({
      generatedAt: "2026-10-24T09:15:00.000Z",
      byDay: weekFixture,
      roster: rosterFixture,
      details: [],
    });
    expect(out).toContain(LEDGER_TITLE);
    expect(out).toContain("نام,رنگ,تلاش");
    expect(out).not.toContain("کارنامهٔ یادگیرنده");
  });

  it("⑥ حریم: نه handle و نه userId و نه secret به پرونده نمیرسد", () => {
    const out = csv();
    expect(out).not.toContain("aaaa1111bbbb2222"); // handle هرگز
    expect(out).not.toContain("userId");
    expect(out).not.toContain("secret");
  });

  it("⑦ سطرِ صادره: روزِ ISOِ پایدار — برچسبِ روانِ کهنهشونده ممنوع", () => {
    expect(ledgerIssuedRow("2026-10-24T09:15:00.000Z")).toBe("صادره,2026-10-24");
  });
});

// ---------------------------------------------------------------
// ② قرض نه رونویسی — تکحقیقتها
// ---------------------------------------------------------------
describe("قفلهایِ قرض — دفتر هیچ ستونی را دوباره نمیسازد", () => {
  it("⑧ از buildClassCsv و buildLearnerCardCsv قرض میگیرد؛ هیچ تعریفِ ستونی ندارد", () => {
    const engine = read("src/lib/teacher-class-ledger.ts");
    expect(engine).toContain('from "./teacher-csv"');
    expect(engine).toContain('from "./teacher-learner-csv"');
    expect(engine).toContain("buildClassCsv(input.roster)");
    expect(engine).toContain("buildLearnerCardCsv(d)");
    // هیچ تعریفِ ستونِ موازی‌ای وجود ندارد
    expect(engine).not.toContain("CLASS_CSV_COLUMNS");
    expect(engine).not.toContain("LEARNER_SUMMARY_COLUMNS");
    expect(engine).not.toContain('"نام,رنگ');
  });

  it("⑨ نما دفتر را از موتور قرض میگیرد + دو دکمه در سربرگ", () => {
    const view = read("src/components/study/teacher/teacher-view.tsx");
    expect(view).toContain('from "@/lib/teacher-class-ledger"');
    expect(view).toContain("downloadClassLedgerCsv");
    expect(view).toContain('data-testid="teacher-ledger"');
    expect(view).toContain('aria-label="دانلود دفترِ کاملِ کلاس (CSV)"');
    expect(view).not.toContain("transition-all");
  });
});

// ---------------------------------------------------------------
// ③ دانلود — لنگر و بایتها
// ---------------------------------------------------------------
describe("downloadClassLedgerCsv — COU و BOM", () => {
  const originalCOU = globalThis.URL.createObjectURL;
  const originalRevoke = globalThis.URL.revokeObjectURL;
  afterEach(() => {
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    vi.restoreAllMocks();
  });

  const capture = () => {
    let captured: Blob | null = null;
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: (b: Blob) => {
        captured = b;
        return "blob:r357";
      },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;
    return { getBlob: () => captured, appended, restore: () => (document.body.appendChild = orig) };
  };

  it("⑩ COU سبز: لنگرِ vision2-class-ledger-<روز>.csv + BOMِ بایتیِ EF BB BF", async () => {
    const cap = capture();
    try {
      const ok = downloadClassLedgerCsv(
        { generatedAt: "2026-10-24T09:15:00.000Z", byDay: weekFixture, roster: rosterFixture, details: [detailOf("آرش")] },
        "2026-10-24"
      );
      expect(ok).toBe(true);
      const anchor = cap.appended.find((el) => (el as HTMLAnchorElement).download === "vision2-class-ledger-2026-10-24.csv");
      expect(anchor).toBeDefined();
      // درسِ r354: BOM فقط بایتی قابلِ اثبات است — readAsText خودش را میبلعد
      const buf = new Uint8Array(await cap.getBlob()!.arrayBuffer());
      expect([buf[0], buf[1], buf[2]]).toEqual([0xef, 0xbb, 0xbf]);
    } finally {
      cap.restore();
    }
  });

  it("⑪ COU سرخ: false بدونِ هیچ لنگری — شکستِ ساخت ≠ شکستِ خواندن", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => {
        throw new TypeError("r357-cou");
      },
      writable: true,
      configurable: true,
    });
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;
    try {
      expect(
        downloadClassLedgerCsv({ generatedAt: "2026-10-24T09:15:00.000Z", byDay: weekFixture, roster: rosterFixture, details: [] }, "2026-10-24")
      ).toBe(false);
      expect(appended).toHaveLength(0);
    } finally {
      document.body.appendChild = orig;
    }
  });
});

// ---------------------------------------------------------------
// ④ رجیستری — ۵۱ام
// ---------------------------------------------------------------
describe("رجیستریِ r357", () => {
  it("⑫ teacher_class_csv پنجاهویکم است — برچسب و خانوادهٔ درست", () => {
    expect(EVENT_NAMES).toContain("teacher_class_csv");
    // [پینِ بهروزشده با اعلانِ r358]: tts_spoken (روخوانیِ تازه، سمتِ سرور) پنجاهودوم شد
    expect(EVENT_NAMES).toHaveLength(52); // ۵۰امِ r354 + ۵۱امِ r357 + این عضوِ r358
    expect(EVENT_LABELS_FA.teacher_class_csv).toBe("خروجی دفترِ کاملِ کلاس");
    expect(EVENT_CATEGORIES.teacher_class_csv).toBe("خروجی و هم‌رسانی");
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
  });

  it("⑬ تسکِ پاکسازی: allowlistِ r357 عضو را میشناسد", () => {
    const script = read("scripts/qa-db-cleanup-r101.cjs");
    expect(script).toContain('"teacher_class_csv"');
  });
});

// ---------------------------------------------------------------
// ⑤ رندرِ زندهٔ نما — دوپا/دوقضاوت
// ---------------------------------------------------------------
describe("TeacherView — دکمهٔ دفترِ کامل", () => {
  const HOUR = 3600_000;
  const now = Date.now();
  const iso = (ms: number) => new Date(ms).toISOString();
  const day = (i: number) => new Date(now - i * 86_400_000).toISOString().slice(0, 10);

  const reportPayload = () => ({
    ok: true,
    generatedAt: new Date(now).toISOString(),
    summary: {
      learners: 2,
      attempts: 1,
      avgPercent: 73,
      last24h: 1,
      byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 1 : 0 })),
      byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: i === 0 ? 1 : 0, avgPercent: i === 0 ? 73 : null })),
    },
    roster: [
      { name: "آرش", color: "emerald", attempts: 1, avgPercent: 73, bestPercent: 73, lessons: 1, lastActive: iso(2 * HOUR), weakest: { category: "dictation", avgPercent: 73 }, handle: "aaaa1111bbbb2222" },
      { name: "نگار", color: "violet", attempts: 0, avgPercent: null, bestPercent: null, lessons: 0, lastActive: null, weakest: null },
    ],
  });

  const learnerPayload = () => ({
    ok: true,
    learner: detailOf("آرش"),
  });

  const wire = (learnerStatus = 200) => {
    return vi.fn(async (url: string) => {
      const u = String(url);
      if (u.includes("/api/teacher/learner")) {
        return new Response(JSON.stringify(learnerPayload()), { status: learnerStatus });
      }
      return new Response(JSON.stringify(reportPayload()), { status: 200 });
    });
  };

  const openPanel = async (fetchMock: ReturnType<typeof vi.fn>) => {
    sessionStorage.setItem("vision2-teacher-code", "edu-1404");
    vi.stubGlobal("fetch", fetchMock);
    const { default: TeacherView } = await import("@/components/study/teacher/teacher-view");
    const utils = render(<TeacherView />);
    await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
    return utils;
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("⑭ سبز: واکشِ پیاپیِ فقطِ ردیفهایِ دارایِ تلاش با کدِ معلم + دانلود + توستِ موفق", async () => {
    const fetchMock = wire();
    const utils = await openPanel(fetchMock);
    // COU را میگیریم تا لنگر را ببینیم
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: () => "blob:r357-live", writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;

    fireEvent.click(utils.getByTestId("teacher-ledger"));
    await waitFor(() => expect(appended.some((el) => (el as HTMLAnchorElement).download?.startsWith("vision2-class-ledger-"))).toBe(true));

    // فقط ردیفِ دارایِ تلاش واکش شده (نگار نه) — و با کدِ معلم
    const learnerCalls = (fetchMock as ReturnType<typeof vi.fn>).mock.calls.filter((c) => String(c[0]).includes("/api/teacher/learner"));
    expect(learnerCalls).toHaveLength(1);
    expect(String(learnerCalls[0][0])).toContain("handle=aaaa1111bbbb2222");
    expect(learnerCalls[0][1].headers["x-teacher-code"]).toBe("edu-1404");
    // کلِ واکشها: ۱ گزارش + ۱ کارنامه
    expect((fetchMock as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(2);
    capRestore(orig);
  });

  it("⑮ سرخِ خواندن: شکستِ کارنامه ⇒ هیچ لنگری نیست — دفترِ نصفه ممنوع + دکمه آزاد میشود", async () => {
    const fetchMock = wire(500);
    const utils = await openPanel(fetchMock);
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: () => "blob:r357-live", writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => {
      appended.push(el);
      return el;
    }) as typeof document.body.appendChild;

    const btn = utils.getByTestId("teacher-ledger") as HTMLButtonElement;
    fireEvent.click(btn);
    await waitFor(() => {
      const calls = (fetchMock as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(calls).toBeGreaterThanOrEqual(2); // گزارش + تلاشِ کارنامه
    });
    await waitFor(() => expect(btn.disabled).toBe(false)); // finally — قفلِ busy آزاد شد
    expect(appended).toHaveLength(0); // هیچ پرونده‌ای ساخته نشد — صداقت
    capRestore(orig);
  });

  it("⑯ کدِ منقضی در میانهٔ راه: گیتِ از نو — کدِ مرده هیچ کاری دیگر نمیتواند بکند", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes("/api/teacher/learner")) {
        return new Response(JSON.stringify({ error: "unauthorized" }), { status: 403 });
      }
      return new Response(JSON.stringify(reportPayload()), { status: 200 });
    });
    const utils = await openPanel(fetchMock);
    fireEvent.click(utils.getByTestId("teacher-ledger"));
    await waitFor(() => expect(utils.getByTestId("teacher-gate")).toBeDefined());
    expect(sessionStorage.getItem("vision2-teacher-code")).toBeNull(); // کدِ مرده بیرون افتاد
  });

  function capRestore(orig: (node: Node) => Node) {
    document.body.appendChild = orig as typeof document.body.appendChild;
  }
});
