// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۳۹۳ — حکمِ سیاستِ دستگاه: کلیدهایِ DEVICE_KEYS از گیتِ sanitize میگذرند
// شاهدِ زندهٔ راند (agent-browser رویِ buildِ درحالِ سرویس):
//   • settings: null ⇒ TypeError «reading 'reduceMotion'» ⇒ مرزِ خطا
//     «این صفحهٔ کتاب باز نشد!» — اپ در هر بارِ بارگذاری آجر میشد.
//   • dailyGoal: 'abc' ⇒ کارتِ «هدف امروز: abc» — سندِ دروغِ کلاسِ r383.
// حکمِ ثبتشدهٔ r386-③ («بیسیاست — قراردادِ قدیم») با شاهد زنده مرد: هر کلیدِ
// دستگاه از DEVICE_FIELDS میگذرد (sanitizeِ فقط — بی merge؛ مالکیتِ دستگاه
// پابرجاست و هرگز سفر نمیکنند). کلیدِ غایب = مقدارِ اولیهٔ اسلایس (r386).
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { rehydrateMerge, DEVICE_FIELDS, DEVICE_KEYS } from "@/lib/persist/schema";
import { DEFAULT_SETTINGS, type StudyState } from "@/lib/study-store";
import { useStudy } from "@/lib/study-store";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const CURRENT = { dailyGoal: 10, onboarded: false, settings: DEFAULT_SETTINGS, syncCode: "" } as unknown as StudyState;
const mergedDevice = (persisted: Record<string, unknown>) => {
  const out = rehydrateMerge(persisted, CURRENT) as unknown as Record<string, unknown>;
  return Object.fromEntries(DEVICE_KEYS.map((k) => [k, out[k]]));
};

beforeEach(() => {
  window.localStorage.clear();
  useStudy.setState({
    onboarded: false,
    settings: { ...DEFAULT_SETTINGS },
    dailyGoal: 10,
    syncCode: "",
  });
});

describe("گیتِ settings — هر فیلدِ خراب به پیشفرضِ خودش میافتد", () => {
  it("غیرِآبجکت (null/رشته/عدد/آرایه) = کاملِ پیشفرض — آجریِ شاهدزنده ناممکن", () => {
    for (const v of [null, "dark", 5, [], true]) {
      expect(DEVICE_FIELDS.settings.sanitize(v)).toEqual(DEFAULT_SETTINGS);
    }
  });

  it("فیلدهایِ گمشده = پیشفرضِ خودشان؛ مقدارِ قانونی دستنخورده میگذرد", () => {
    expect(DEVICE_FIELDS.settings.sanitize({})).toEqual(DEFAULT_SETTINGS);
    expect(DEVICE_FIELDS.settings.sanitize({ reduceMotion: true })).toEqual({
      ttsRate: 1,
      fontScale: 1,
      reduceMotion: true,
    });
  });

  it("ttsRate رویِ ۰٫۷..۱٫۳ clamp میشود — قراردادِ نوع", () => {
    expect(DEVICE_FIELDS.settings.sanitize({ ttsRate: 0.5 }).ttsRate).toBe(0.7);
    expect(DEVICE_FIELDS.settings.sanitize({ ttsRate: 2 }).ttsRate).toBe(1.3);
    expect(DEVICE_FIELDS.settings.sanitize({ ttsRate: 1.1 }).ttsRate).toBe(1.1);
    expect(DEVICE_FIELDS.settings.sanitize({ ttsRate: "x" }).ttsRate).toBe(1);
    expect(DEVICE_FIELDS.settings.sanitize({ ttsRate: NaN }).ttsRate).toBe(1);
  });

  it("fontScale فقط از لیستِ سفیدِ FONT_OPTIONS (۰٫۹۴/۱/۱٫۱) — بقیه پیشفرض", () => {
    expect(DEVICE_FIELDS.settings.sanitize({ fontScale: 1.1 }).fontScale).toBe(1.1);
    expect(DEVICE_FIELDS.settings.sanitize({ fontScale: 0.94 }).fontScale).toBe(0.94);
    expect(DEVICE_FIELDS.settings.sanitize({ fontScale: 0.5 }).fontScale).toBe(1);
    expect(DEVICE_FIELDS.settings.sanitize({ fontScale: 1.5 }).fontScale).toBe(1);
    expect(DEVICE_FIELDS.settings.sanitize({ fontScale: "y" }).fontScale).toBe(1);
  });

  it("reduceMotion فقط boolean واقعی — 1/رشتهٔ حقیقت‌نما دستگاه را خاموش نمیکند", () => {
    expect(DEVICE_FIELDS.settings.sanitize({ reduceMotion: 1 }).reduceMotion).toBe(false);
    expect(DEVICE_FIELDS.settings.sanitize({ reduceMotion: "yes" }).reduceMotion).toBe(false);
    expect(DEVICE_FIELDS.settings.sanitize({ reduceMotion: false }).reduceMotion).toBe(false);
  });
});

describe("گیتِ dailyGoal — همان clampِ setDailyGoal", () => {
  it("غیرِعدد = پیشفرضِ اسلایس (۱۰)؛ بازه ۵..۲۰ با گردِ صحیح", () => {
    expect(DEVICE_FIELDS.dailyGoal.sanitize("abc")).toBe(10);
    expect(DEVICE_FIELDS.dailyGoal.sanitize(null)).toBe(10);
    expect(DEVICE_FIELDS.dailyGoal.sanitize(7.4)).toBe(7);
    expect(DEVICE_FIELDS.dailyGoal.sanitize(2)).toBe(5);
    expect(DEVICE_FIELDS.dailyGoal.sanitize(99)).toBe(20);
    expect(DEVICE_FIELDS.dailyGoal.sanitize(15)).toBe(15);
  });
});

describe("گیتِ onboarded و syncCode", () => {
  it("onboarded فقط true واقعی — 1/'yes' onboarded نمیشود", () => {
    expect(DEVICE_FIELDS.onboarded.sanitize(1)).toBe(false);
    expect(DEVICE_FIELDS.onboarded.sanitize("yes")).toBe(false);
    expect(DEVICE_FIELDS.onboarded.sanitize(true)).toBe(true);
    expect(DEVICE_FIELDS.onboarded.sanitize(false)).toBe(false);
  });

  it("syncCode فقط رشته با سقفِ ۶۴ نویسه — عدد/آبجکت = خالیِ صادق", () => {
    expect(DEVICE_FIELDS.syncCode.sanitize(12345)).toBe("");
    expect(DEVICE_FIELDS.syncCode.sanitize({ x: 1 })).toBe("");
    expect(DEVICE_FIELDS.syncCode.sanitize("ABC123")).toBe("ABC123");
    expect(DEVICE_FIELDS.syncCode.sanitize("x".repeat(100)).length).toBe(64);
  });
});

describe("rehydrateMerge — رفتارِ انتگرال رویِ snapshot واقعی", () => {
  it("آجریِ زنده درمان میشود: {settings:null, dailyGoal:'abc'} ⇒ پیشفرضها", () => {
    const d = mergedDevice({ settings: null, dailyGoal: "abc" });
    expect(d.settings).toEqual(DEFAULT_SETTINGS);
    expect(d.dailyGoal).toBe(10);
  });

  it("ترکیبِ گارbage و قانونی در یک snapshot — هر کلید مستقل پالایش میشود", () => {
    const d = mergedDevice({
      settings: { ttsRate: 1.2, fontScale: 3, reduceMotion: true },
      dailyGoal: 15,
      onboarded: 1,
      syncCode: "CODE-9",
    });
    expect(d.settings).toEqual({ ttsRate: 1.2, fontScale: 1, reduceMotion: true });
    expect(d.dailyGoal).toBe(15);
    expect(d.onboarded).toBe(false);
    expect(d.syncCode).toBe("CODE-9");
  });

  it("کلیدِ غایب = مقدارِ اولیهٔ اسلایس — قراردادِ r386 پابرجا", () => {
    const d = mergedDevice({ known: {} });
    expect(d.settings).toEqual(DEFAULT_SETTINGS);
    expect(d.dailyGoal).toBe(10);
    expect(d.syncCode).toBe("");
  });
});

describe("استورِ واقعیِ jsdom — همان سناریویِ آجریِ شاهدزنده", () => {
  it("بذرِ settings:null ← rehydrate() ← settings پیشفرض و استور زنده", () => {
    const raw = { state: { settings: null, dailyGoal: "abc", onboarded: true }, version: 0 };
    window.localStorage.setItem("vision2-study-v1", JSON.stringify(raw));
    useStudy.persist.rehydrate();
    const s = useStudy.getState();
    expect(s.settings).toEqual(DEFAULT_SETTINGS);
    expect(s.dailyGoal).toBe(10);
    expect(s.onboarded).toBe(true);
  });
});

describe("قفلهایِ منبع (r393)", () => {
  it("rehydrateMerge از DEVICE_TABLE میگذراند — پاسِ خامِ rec[key] منقرض", () => {
    const src = read("src/lib/persist/schema.ts");
    expect(src).toContain("DEVICE_TABLE[key].sanitize(rec[key])");
    expect(src).not.toContain("out[key] = rec[key]");
    expect(src).toContain("export const DEVICE_FIELDS");
    expect(src).toContain('from "@/state/types"');
  });

  it("مالکیتِ دستگاه پابرجا: DEVICE_FIELDS merge ندارد — سفرِ بکاپ/کلاد مممکن نیست", () => {
    const src = read("src/lib/persist/schema.ts");
    const table = src.slice(src.indexOf("export const DEVICE_FIELDS"), src.indexOf("const DEVICE_TABLE"));
    expect(table).not.toContain("merge:");
    // DEVICE_KEYS در SYNC_FIELDS نیست — تکلیفِ سفر با compile-alarmsِ خودِ فایل
    expect(src).not.toMatch(/dailyGoal.*sanitize:.*\n.*merge:/);
  });
});
