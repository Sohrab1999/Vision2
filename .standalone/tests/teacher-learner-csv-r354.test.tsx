// @vitest-environment jsdom
// ------------------------------------------------------------------
// r354 — «کارنامهٔ یادگیرنده» — هفتمین عضوِ خانوادهٔ CSV، خروجی از
// خودِ دیالوگِ جزئیاتِ r353:
//   ① ساختارِ چندبخشی: خلاصه/روندِ ۱۴روزه/پوششِ درسها/مهارتها/
//     آخرین تلاشها — هر بخشِ سرِ خود tidy؛ بخشها با سطرِ خالی.
//     [درسِ راند: قراردادِ خانواده گویش است نه شکلِ تختِ واحد —
//     جدولِ تختِ مشترک ستونِ «تلاشها» را بی‌معنا میکرد و جمعِ
//     اکسل را دروغگو.]
//   ② گویشِ محفوظ: CRLFِ خالص (هیچ LFِ لخت)، اعدادِ ASCII،
//     سلولِ خالیِ صادق برایِ ناموجود، تاریخِ ISOِ پایدار.
//   ③ sanitationِ نامِ کاربر (بدترینِ نام ممکن) در سطرِ خلاصه و
//     نامِ فایل — ویرگول/نقل‌قول/شکستِ خط/مسیر بیرونکشی میشود.
//   ④ برچسبِ مهارت از تکحقیقتِ coverage-map؛ ناشناخته = کلیدِ خام.
//   ⑤ COU سبز/سرخ (idiomِ r344/r352) + رجیستری (رویدادِ ۵۰م) +
//     قفلهایِ ساختاری + رندرِ زندهٔ دکمهٔ دانلود در دیالوگ.
// ------------------------------------------------------------------

import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import TeacherView from "@/components/study/teacher/teacher-view";
import {
  buildLearnerCardCsv,
  downloadLearnerCardCsv,
  learnerFileName,
  learnerSkillLabel,
  LEARNER_CARD_TITLE,
  LEARNER_SUMMARY_COLUMNS,
} from "@/lib/teacher-learner-csv";
import { csvSafe } from "@/lib/teacher-csv";
import type { LearnerDetail } from "@/lib/teacher-report";
import { EVENT_NAMES, EVENT_LABELS_FA, EVENT_CATEGORIES } from "@/lib/analytics-events";
import { trackEvent } from "@/lib/analytics";

const trackMock = trackEvent as unknown as ReturnType<typeof vi.fn>;

const HOUR = 3600 * 1000;
const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
const day = (n: number) => new Date(now - n * 86_400_000).toISOString().slice(0, 10);

// ------------------------------------------------------------------
// فیکسچرها — همان شکلِ payloadِ واقعیِ /api/teacher/learner
// ------------------------------------------------------------------
const fullDetail: LearnerDetail = {
  name: "آرش",
  color: "emerald",
  joinedAt: iso(9 * 86_400_000),
  attempts: 3,
  avgPercent: 63,
  bestPercent: 80,
  lessons: 2,
  lastActive: iso(HOUR),
  byDay: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), attempts: i === 13 ? 2 : i === 12 ? 1 : 0 })),
  byLesson: [
    { lesson: 0, attempts: 1, avgPercent: 30 }, // خارجیِ دفاعی (rushِ درسِ صفر)
    ...Array.from({ length: 12 }, (_, i) => ({
      lesson: i + 1,
      attempts: i < 2 ? 1 : 0,
      avgPercent: i === 0 ? 80 : i === 1 ? 45 : null,
    })),
  ],
  bySkill: [
    { category: "dictation", attempts: 2, avgPercent: 45, bestPercent: 45 },
    { category: "vocab", attempts: 1, avgPercent: 80, bestPercent: 80 },
  ],
  recent: [
    { category: "vocab", lesson: 1, percent: 80, createdAt: iso(HOUR) },
    { category: "dictation", lesson: 2, percent: 45, createdAt: iso(2 * HOUR) },
    { category: "weird-key", lesson: 0, percent: 30, createdAt: iso(3 * HOUR) }, // ناشناخته = خودش
  ],
};

const worstDetail: LearnerDetail = {
  ...fullDetail,
  name: 'آرش, "طلا",\nدو', // بدترینِ نامِ ممکن — sanitation اجباری
};

const emptyDetail: LearnerDetail = {
  name: "نگار",
  color: "violet",
  joinedAt: iso(2 * 86_400_000),
  attempts: 0,
  avgPercent: null,
  bestPercent: null,
  lessons: 0,
  lastActive: null,
  byDay: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), attempts: 0 })),
  byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 0, avgPercent: null })),
  bySkill: [],
  recent: [],
};

const sectionOf = (csv: string[], title: string): number =>
  csv.findIndex((l) => l === title);

// ------------------------------------------------------------------
// ① ساختارِ چندبخشی + گویشِ خانواده
// ------------------------------------------------------------------
describe("buildLearnerCardCsv — کارنامهٔ چندبخشی", () => {
  it("عنوانِ کارت + خلاصه + پنج بخشِ ترتیبی با سرستونهایِ دقیق", () => {
    const csv = buildLearnerCardCsv(fullDetail);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(LEARNER_CARD_TITLE);
    expect(lines[1]).toBe(LEARNER_SUMMARY_COLUMNS.join(","));
    // سطرِ خلاصه: نامِ سالم + عضویتِ روزانه + اعدادِ ASCII + ISOِ پایدار
    expect(lines[2]).toBe(
      `آرش,emerald,${fullDetail.joinedAt.slice(0, 10)},3,63,80,2,${fullDetail.lastActive}`
    );
    const t = sectionOf(lines, "روندِ 14 روز");
    expect(t).toBeGreaterThan(0);
    expect(lines[t + 1]).toBe("روز,تلاشها");
    expect(lines[t + 2]).toBe(`${day(13)},0`); // کهنهترین روز = صفرِ واقعی
    expect(lines[t + 15]).toBe(`${day(0)},2`); // امروز
    const l = sectionOf(lines, "پوششِ درسها");
    expect(lines[l + 1]).toBe("درس,تلاشها,میانگین");
    expect(lines[l + 2]).toBe("0,1,30"); // خارجیِ دفاعی سربلند
    expect(lines[l + 3]).toBe("1,1,80");
    expect(lines[l + 4]).toBe("2,1,45");
    expect(lines[l + 5]).toBe("3,0,"); // درسِ لمسنشده = خالیِ صادق نه صفر
    const s = sectionOf(lines, "مهارتها — ضعیفترینِ اول");
    expect(lines[s + 1]).toBe("مهارت,تلاشها,میانگین,بهترین");
    expect(lines[s + 2]).toBe("دیکته,2,45,45"); // ضعیفترینِ اول + برچسبِ رجیستری
    expect(lines[s + 3]).toBe("تست واژگان,1,80,80");
    const r = sectionOf(lines, "آخرین تلاشها");
    expect(lines[r + 1]).toBe("تاریخ,مهارت,درس,درصد");
    expect(lines[r + 2]).toBe(`${iso(HOUR)},تست واژگان,1,80`);
    expect(lines[r + 4]).toBe(`${iso(3 * HOUR)},weird-key,0,30`); // ناشناخته = کلیدِ خام
    expect(lines[lines.length - 1]).toBe(""); // CRLFِ پایانیِ خانواده
  });

  it("گویشِ خانواده: هیچ LFِ لخت، هیچ نقل‌قولی در سلول، سلولهایِ عددی فقط ASCII — ۲ِ برند در عنوان مشمولِ قانونِ عددی نیست", () => {
    const csv = buildLearnerCardCsv(fullDetail);
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n");
    const lines = csv.split("\r\n").filter((l) => l.length > 0);
    expect(lines[0]).toBe(LEARNER_CARD_TITLE);
    expect(lines[0]).toContain("۲"); // نامِ برند — متن است نه داده
    for (const line of lines) {
      for (const cell of line.split(",")) {
        expect(cell).not.toContain('"');
        // سلولِ عددیِ خالص فقط ارقامِ لاتین — هیچ ارقامِ فارسیِ داده‌ای
        if (/^[\d\u06F0-\u06F9]+$/.test(cell)) expect(cell).toMatch(/^\d+$/);
      }
    }
  });

  it("sanitation: بدترینِ نام در سطرِ خلاصه و نامِ فایل بیخطر میشود", () => {
    const csv = buildLearnerCardCsv(worstDetail);
    const lines = csv.split("\r\n");
    expect(lines[2].startsWith("آرش طلادو,")).toBe(true); // ویرگول/نقل/شکستِ خط بیرونکشی‌شده
    expect(csvSafe('a,b"c\nd\r\ne')).toBe("abcde"); // قراردادِ تکحقیقتِ teacher-csv
    const fname = learnerFileName(worstDetail.name, "2026-10-24");
    expect(fname).toBe("vision2-learner-آرش-طلادو-2026-10-24.csv");
  });

  it("یادگیرندهٔ بیتلاش: خلیهایِ صادق + ۱۴ صفرِ واقعی + بخشهایِ سرِ خالی", () => {
    const csv = buildLearnerCardCsv(emptyDetail);
    const lines = csv.split("\r\n");
    expect(lines[2]).toBe(
      `نگار,violet,${emptyDetail.joinedAt.slice(0, 10)},0,,,0,` // میانگین/بهترین/آخرین خالیِ صادق
    );
    const t = sectionOf(lines, "روندِ 14 روز");
    expect(lines.slice(t + 2, t + 16)).toHaveLength(14);
    expect(lines[t + 2]).toBe(`${day(13)},0`);
    const l = sectionOf(lines, "پوششِ درسها");
    expect(lines[l + 2]).toBe("1,0,"); // هر دوازده درس، میانگینِ خالی
    expect(lines[l + 13]).toBe("12,0,");
    const s = sectionOf(lines, "مهارتها — ضعیفترینِ اول");
    expect(lines[s + 1]).toBe("مهارت,تلاشها,میانگین,بهترین");
    expect(lines[s + 2]).toBe(""); // بخشِ سرِ خالی — صادق نه ساختگی
    const r = sectionOf(lines, "آخرین تلاشها");
    expect(lines[r + 2]).toBe("");
  });

  it("برچسبِ مهارت از تکحقیقتِ coverage-map؛ ناشناخته = کلیدِ خام", () => {
    expect(learnerSkillLabel("dictation")).toBe("دیکته");
    expect(learnerSkillLabel("vocab")).toBe("تست واژگان");
    expect(learnerSkillLabel("weird-key")).toBe("weird-key");
  });

  it("نامِ فایل: اسلاگِ سالم + سقفِ ۳۲ + فروپاشیِ خطِ تیره + fallbackِ بی‌نام", () => {
    expect(learnerFileName("آرش طلا", "2026-10-24")).toBe("vision2-learner-آرش-طلا-2026-10-24.csv");
    expect(learnerFileName('a/b\\c,,,  d', "2026-10-24")).toBe("vision2-learner-abc-d-2026-10-24.csv");
    expect(learnerFileName("   ", "2026-10-24")).toBe("vision2-learner-learner-2026-10-24.csv");
    expect(learnerFileName("ن".repeat(60), "2026-10-24")).toBe(`vision2-learner-${"ن".repeat(32)}-2026-10-24.csv`);
  });
});

// ------------------------------------------------------------------
// ② COU سبز/سرخ — idiomِ r344/r352
// ------------------------------------------------------------------
describe("downloadLearnerCardCsv — COU", () => {
  const originalCOU = globalThis.URL.createObjectURL;
  const originalRevoke = globalThis.URL.revokeObjectURL;
  afterEach(() => {
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    cleanup();
  });

  it("COU سبز: لنگرِ vision2-learner-<نام>-<روز>.csv با BOMِ خانواده (اثباتِ بایتی)", async () => {
    let captured: Blob | null = null;
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: (b: Blob) => { captured = b; return "blob:r354"; },
      writable: true, configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => { appended.push(el); return el; }) as typeof document.body.appendChild;
    try {
      expect(downloadLearnerCardCsv(fullDetail, "2026-10-24")).toBe(true);
      const anchor = appended.find((el) => (el as HTMLAnchorElement).download === "vision2-learner-آرش-2026-10-24.csv");
      expect(anchor).toBeDefined();
      // BOMِ صریحِ خانواده — بایت‌به‌بایت (FileReader طبقِ spec امضا را میبلعد؛
      // پس اثبات فقط با بایلتهایِ خامِ blob ممکن است)
      const buf = new Uint8Array(await (captured as unknown as Blob).arrayBuffer());
      expect([buf[0], buf[1], buf[2]]).toEqual([0xef, 0xbb, 0xbf]); // EF BB BF
      const text = new TextDecoder("utf-8").decode(buf.slice(3));
      expect(text.startsWith(LEARNER_CARD_TITLE)).toBe(true);
      expect(text).toContain("\r\n");
    } finally {
      document.body.appendChild = orig;
    }
  });

  it("COU سرخ: false و بدونِ هیچ لنگری", () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: () => { throw new TypeError("r354-cou"); },
      writable: true, configurable: true,
    });
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => { appended.push(el); return el; }) as typeof document.body.appendChild;
    try {
      expect(downloadLearnerCardCsv(fullDetail, "2026-10-24")).toBe(false);
      expect(appended).toHaveLength(0);
    } finally {
      document.body.appendChild = orig;
    }
  });
});

// ------------------------------------------------------------------
// ③ رجیستری (رویدادِ ۵۰م) + قفلهایِ ساختاری
// ------------------------------------------------------------------
describe("رجیستری و سیمکشیِ r354", () => {
  it("teacher_learner_csv در خروجی و هم‌رسانی — رجیستریِ ۵۰ بیرهبر نیست", () => {
    expect(EVENT_NAMES).toContain("teacher_learner_csv");
    expect(EVENT_LABELS_FA.teacher_learner_csv).toBe("خروجی CSV کارنامهٔ یادگیرنده");
    expect(EVENT_CATEGORIES.teacher_learner_csv).toBe("خروجی و هم‌رسانی");
    expect(Object.keys(EVENT_CATEGORIES).length).toBe(EVENT_NAMES.length);
  });

  it("قفلهایِ ساختاری: سیمکشیِ دیالوگ + allowlistِ پاکسازی + تکحقیقتِ BOM", () => {
    const detail = readFileSync(join(process.cwd(), "src/components/study/teacher/teacher-detail.tsx"), "utf8");
    expect(detail).toContain('trackEvent("teacher_learner_csv")');
    expect(detail).toContain('data-testid="teacher-detail-csv"');
    expect(detail).toContain('downloadLearnerCardCsv');
    expect(detail).toContain("کارنامهٔ این یادگیرنده");
    const lib = readFileSync(join(process.cwd(), "src/lib/teacher-learner-csv.ts"), "utf8");
    expect(lib).toContain('from "./teacher-csv"'); // BOM/csvSafe تکحقیقت — نه نسخهٔ موازی
    expect(lib).not.toContain('export const CSV_BOM'); // عضوِ هفتم BOM را نمیسازد، قرض میگیرد
    const cleanupScript = readFileSync(join(process.cwd(), "scripts/qa-db-cleanup-r101.cjs"), "utf8");
    expect(cleanupScript).toContain('"teacher_learner_csv"'); // allowlistِ پاکسازی
  });
});

// ------------------------------------------------------------------
// ④ رندرِ زنده — دکمهٔ دانلود در دیالوگِ واقعی
// ------------------------------------------------------------------
const learnerDetailPayload = {
  ok: true,
  windowDays: 14,
  learner: fullDetail,
};

const rosterPayload = (handles: boolean) => ({
  ok: true,
  generatedAt: new Date(now).toISOString(),
  summary: {
    learners: 1, attempts: 3, avgPercent: 63, last24h: 2,
    byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 2 : 0 })),
    byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: i === 0 ? 3 : 0, avgPercent: i === 0 ? 63 : null })),
  },
  roster: [
    { name: "آرش", color: "emerald", attempts: 3, avgPercent: 63, bestPercent: 80, lessons: 2, lastActive: iso(HOUR), weakest: { category: "dictation", avgPercent: 45 }, ...(handles ? { handle: "a".repeat(16) } : {}) },
  ],
});

vi.mock("@/lib/study-store", () => ({
  useStudy: (sel: (s: { setView: (v: unknown) => void }) => unknown) => sel({ setView: vi.fn() }),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const stubFetchRouted = (learnerRes: (() => unknown) | null) => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    if (typeof url === "string" && url.includes("/api/teacher/learner")) {
      if (!learnerRes) return { ok: false, status: 500, statusText: "boom", json: async () => ({}) };
      return learnerRes();
    }
    return { ok: true, status: 200, json: async () => rosterPayload(true) };
  });
  vi.stubGlobal("fetch", fetchMock);
  return calls;
};

describe("TeacherView — دکمهٔ کارنامهٔ CSV در دیالوگ (r354)", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.unstubAllGlobals();
    delete process.env.TEACHER_ACCESS_CODE;
  });

  it("بازشدنِ دیالوگ ⇒ دکمهٔ CSV کنارِ تازهسازی؛ کلیک ⇒ لنگرِ دانلود + teacher_learner_csv", async () => {
    Object.defineProperty(globalThis.URL, "createObjectURL", { value: () => "blob:r354-live", writable: true, configurable: true });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    stubFetchRouted(() => ({ ok: true, status: 200, json: async () => learnerDetailPayload }));
    sessionStorage.setItem("vision2-teacher-code", "edu-1404");
    process.env.TEACHER_ACCESS_CODE = "edu-1404";
    const utils = render(<TeacherView />);
    await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
    const before = trackMock.mock.calls.length;
    fireEvent.click(utils.getAllByTestId("teacher-row")[0]);
    await waitFor(() => expect(utils.getByTestId("teacher-detail-dialog")).toBeDefined());
    await waitFor(() => expect(utils.getByTestId("teacher-detail-cards")).toBeDefined());
    const btn = utils.getByTestId("teacher-detail-csv");
    expect(btn.getAttribute("aria-label")).toBe("دانلود کارنامهٔ این یادگیرنده (CSV)");
    const today = new Date().toISOString().slice(0, 10); // کامپوننت «امروز» را خودش میسازد — آزمون هم همان
    const appended: HTMLElement[] = [];
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => { appended.push(el); return el; }) as typeof document.body.appendChild;
    try {
      fireEvent.click(btn);
      const anchor = appended.find((el) => (el as HTMLAnchorElement).download === `vision2-learner-آرش-${today}.csv`);
      expect(anchor).toBeDefined();
    } finally {
      document.body.appendChild = orig;
    }
    const csvCalls = trackMock.mock.calls.slice(before).filter((c: unknown[]) => c[0] === "teacher_learner_csv");
    expect(csvCalls).toHaveLength(1);
  });
});
