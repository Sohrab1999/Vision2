// @vitest-environment jsdom
// ------------------------------------------------------------------
// r385 — «قالبِ فارسیِ زمان یک دامنه میشود» — مالک: src/lib/time-fa
//
// سه حکمی که این فایل قفل میکند:
//   ① پله‌سِ واحدِ نسبی (relativeAgeFa): سه گویشِ پیشین (یادگیرنده/معلم/
//      پشتیبان) حالا یک محاسبه دارند با قراردادِ صریحِ کِلاک (گیرهٔ صفر)
//      و بی‌شاهدِ زمانی (null → فالبکِ فراخوان). واژگانِ هر مخاطب عمدی
//      میماند — قفلِ ماتریسِ مرزها.
//   ② دروغِ نیمهشبِ UTC بسته شد: چیپهایِ نبرد کلیدِ روزِ تقویمی را به
//      timeAgoFa میدادند که آن را نیمهشبِ UTC میخواند — مصافِ امشب
//      «X ساعت پیش» خوانده میشد. کلیدِ روز فقط «روز» را شاهد است؛
//      dayKeyAgoFa فقط روز ادعا میکند: امروز/دیروز/N روز پیش.
//   ③ سرشماریِ ارقام: faNum مالِ time-fa است؛ دوقلوی teacher-report مرد؛
//      دوقلوهایِ سیمِ سه‌سرویسی (join-throttle/duel-pace) استثنایِ مستندند
//      — قفلِ «دوقلوی آگاه» با حاشیه، نه قفلِ حذف.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import {
  relativeAgeFa,
  dayKeyAgoFa,
  faNum,
  timeAgoFa as timeAgoFaOf,
  LEARNER_HEAD,
  TEACHER_HEAD,
  BACKUP_HEAD,
} from "@/lib/time-fa";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const dayKeyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const duelRec = (over: Record<string, unknown>) => ({
  id: "d1",
  day: dayKeyOf(new Date(Date.now() - 2 * DAY)),
  outcome: "win" as const,
  reason: "finished" as const,
  opponent: "سینا",
  opponentColor: "sky",
  myScore: 7,
  oppScore: 5,
  myCorrect: 7,
  oppCorrect: 5,
  answered: 10,
  total: 10,
  durationSec: 95,
  ...over,
});

beforeEach(() => {
  localStorage.clear();
  useStudy.setState({
    view: { type: "home" },
    duelHistory: [],
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// ---------------------------------------------------------------
// ① پله‌سِ واحد — ماتریسِ مرزهایِ سه گویش
// ---------------------------------------------------------------
describe("relativeAgeFa — پله‌سِ واحد", () => {
  it("گویشِ یادگیرنده: لحظاتی/دقیقه/ساعت/روز/ماه با مرزهایِ دقیق", () => {
    expect(relativeAgeFa(59_999, LEARNER_HEAD)).toBe("لحظاتی پیش");
    expect(relativeAgeFa(MIN, LEARNER_HEAD)).toBe("۱ دقیقه پیش");
    expect(relativeAgeFa(HOUR - 1, LEARNER_HEAD)).toBe("۵۹ دقیقه پیش");
    expect(relativeAgeFa(HOUR, LEARNER_HEAD)).toBe("۱ ساعت پیش");
    expect(relativeAgeFa(DAY - 1, LEARNER_HEAD)).toBe("۲۳ ساعت پیش");
    expect(relativeAgeFa(DAY, LEARNER_HEAD)).toBe("۱ روز پیش");
    expect(relativeAgeFa(29 * DAY, LEARNER_HEAD)).toBe("۲۹ روز پیش");
    expect(relativeAgeFa(30 * DAY, LEARNER_HEAD)).toBe("۱ ماه پیش");
    expect(relativeAgeFa(75 * DAY, LEARNER_HEAD)).toBe("۲ ماه پیش");
  });

  it("گویشِ معلم: همین حالا تا یک ساعت، بی‌پلهٔ ماه", () => {
    expect(relativeAgeFa(HOUR - 1, TEACHER_HEAD)).toBe("همین حالا");
    expect(relativeAgeFa(HOUR, TEACHER_HEAD)).toBe("۱ ساعت پیش");
    expect(relativeAgeFa(DAY - 1, TEACHER_HEAD)).toBe("۲۳ ساعت پیش");
    expect(relativeAgeFa(DAY, TEACHER_HEAD)).toBe("۱ روز پیش");
    expect(relativeAgeFa(40 * DAY, TEACHER_HEAD)).toBe("۴۰ روز پیش");
    expect(relativeAgeFa(400 * DAY, TEACHER_HEAD)).toBe("۴۰۰ روز پیش");
  });

  it("گویشِ پشتیبان: همین حالا تا یک دقیقه، بی‌پلهٔ ماه", () => {
    expect(relativeAgeFa(MIN - 1, BACKUP_HEAD)).toBe("همین حالا");
    expect(relativeAgeFa(MIN, BACKUP_HEAD)).toBe("۱ دقیقه پیش");
    expect(relativeAgeFa(HOUR, BACKUP_HEAD)).toBe("۱ ساعت پیش");
    expect(relativeAgeFa(40 * DAY, BACKUP_HEAD)).toBe("۴۰ روز پیش");
  });

  it("قراردادِ کِلاک: تفاضلِ منفی گیرهٔ صفر میشود؛ بی‌شاهدِ زمانی null", () => {
    expect(relativeAgeFa(-1, LEARNER_HEAD)).toBe("لحظاتی پیش");
    expect(relativeAgeFa(-3 * HOUR, TEACHER_HEAD)).toBe("همین حالا");
    expect(relativeAgeFa(-MIN, BACKUP_HEAD)).toBe("همین حالا");
    expect(relativeAgeFa(Number.NaN, LEARNER_HEAD)).toBeNull();
    expect(relativeAgeFa(Number.POSITIVE_INFINITY, TEACHER_HEAD)).toBeNull();
  });
});

// ---------------------------------------------------------------
// ② پوشهای عمومی — امضاهای قدیمی، رفتارِ عینِ پیشین (جز حشرهٔ NaN)
// ---------------------------------------------------------------
describe("timeAgoFa / lastActiveFa / autoBackupAgeFa — تفویضِ بیواژگون", () => {
  it("timeAgoFa: پله‌هایِ یادگیرنده + حشرهٔ «NaN ماه پیش» مرده است", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T10:00:00"));
    const iso = (agoMs: number) => new Date(Date.now() - agoMs).toISOString();
    expect(timeAgoFaOf(iso(30_000))).toBe("لحظاتی پیش");
    expect(timeAgoFaOf(iso(5 * MIN))).toBe("۵ دقیقه پیش");
    expect(timeAgoFaOf(iso(3 * HOUR))).toBe("۳ ساعت پیش");
    expect(timeAgoFaOf(iso(2 * DAY))).toBe("۲ روز پیش");
    expect(timeAgoFaOf(iso(45 * DAY))).toBe("۱ ماه پیش");
    // رشتهٔ ناخوانا پیشتر «NaN ماه پیش» میراند — فالبکِ صادقِ r385
    expect(timeAgoFaOf("not-a-date")).toBe("نامشخص");
    // رکوردِ از-آینده: گیرهٔ صفر، نه تفاضلِ منفیِ تصادفی
    expect(timeAgoFaOf(new Date(Date.now() + 10 * MIN).toISOString())).toBe("لحظاتی پیش");
  });

  it("lastActiveFa: چهار طبقهٔ معلم + فالبکِ «هرگز» + ساعتِ تزریقی", async () => {
    const { lastActiveFa } = await import("@/lib/teacher-report");
    const now = Date.parse("2026-10-25T10:00:00");
    const iso = (agoMs: number) => new Date(now - agoMs).toISOString();
    expect(lastActiveFa(iso(5 * MIN), now)).toBe("همین حالا");
    expect(lastActiveFa(iso(5 * HOUR), now)).toBe("۵ ساعت پیش");
    expect(lastActiveFa(iso(3 * DAY), now)).toBe("۳ روز پیش");
    expect(lastActiveFa(null, now)).toBe("هرگز");
    expect(lastActiveFa("garbage", now)).toBe("هرگز");
    // کهنگیِ چندماهه بی‌پلهٔ ماه — گویشِ معلم
    expect(lastActiveFa(iso(75 * DAY), now)).toBe("۷۵ روز پیش");
  });

  it("autoBackupAgeFa: پله‌هایِ پشتیبان + فالبکِ «نامشخص»", async () => {
    const { autoBackupAgeFa } = await import("@/lib/backup");
    expect(autoBackupAgeFa(new Date(Date.now() - 30_000).toISOString())).toBe("همین حالا");
    expect(autoBackupAgeFa(new Date(Date.now() - 5 * MIN).toISOString())).toBe("۵ دقیقه پیش");
    expect(autoBackupAgeFa(new Date(Date.now() - 3 * HOUR).toISOString())).toBe("۳ ساعت پیش");
    expect(autoBackupAgeFa(new Date(Date.now() - 2 * DAY).toISOString())).toBe("۲ روز پیش");
    expect(autoBackupAgeFa("not-a-date")).toBe("نامشخص");
  });
});

// ---------------------------------------------------------------
// ③ برچسبِ روز-گرا — دروغِ نیمهشبِ UTC مرده است
// ---------------------------------------------------------------
describe("dayKeyAgoFa — کلیدِ روز فقط روز ادعا میکند", () => {
  it("امروز/دیروز/روزها/ماه‌ها با مرزِ ۳۰ روز", () => {
    const now = Date.parse("2026-10-25T21:00:00"); // عصر — ساعتی که دروغِ UTC می‌خواند
    expect(dayKeyAgoFa("2026-10-25", now)).toBe("امروز");
    expect(dayKeyAgoFa("2026-10-24", now)).toBe("دیروز");
    expect(dayKeyAgoFa("2026-10-23", now)).toBe("۲ روز پیش");
    expect(dayKeyAgoFa("2026-09-26", now)).toBe("۲۹ روز پیش");
    expect(dayKeyAgoFa("2026-09-25", now)).toBe("۱ ماه پیش");
    expect(dayKeyAgoFa("2026-07-16", now)).toBe("۳ ماه پیش");
  });

  it("قفلِ تلهٔ UTC: کلیدِ «امروز» در هیچ ساعتی برچسبِ ساعتی نمی‌گیرد", () => {
    // همان لحظه‌ای که پله‌سِ قدیم با نیمهشبِ UTC «۱۷ ساعت پیش» میراند
    for (const hour of [1, 8, 12, 17, 21, 23]) {
      const now = new Date(2026, 9, 25, hour, 0, 0).getTime();
      expect(dayKeyAgoFa("2026-10-25", now)).toBe("امروز");
      expect(dayKeyAgoFa("2026-10-25", now)).not.toContain("ساعت پیش");
    }
  });

  it("دادهٔ خراب: رشتهٔ بی‌شکل و کلیدِ از-آینده — هر دو صادق", () => {
    const now = Date.parse("2026-10-25T21:00:00");
    expect(dayKeyAgoFa("", now)).toBe("نامشخص");
    expect(dayKeyAgoFa("garbage", now)).toBe("نامشخص");
    expect(dayKeyAgoFa("2026-10-2", now)).toBe("نامشخص");
    // کلیدِ آینده دادهٔ خراب است — گیرهٔ صفر، همان قراردادِ کِلاکِ پله‌س
    expect(dayKeyAgoFa("2026-10-26", now)).toBe("امروز");
  });
});

// ---------------------------------------------------------------
// ④ ارقام — مالکِ دامنه و دوقلوی آگاهِ سیم
// ---------------------------------------------------------------
describe("faNum — مالکیتِ ارقام", () => {
  it("تبدیلِ پایه + ورودیِ رشته‌ای", () => {
    expect(faNum(12)).toBe("۱۲");
    expect(faNum("345")).toBe("۳۴۵");
    expect(faNum(0)).toBe("۰");
  });
});

// ---------------------------------------------------------------
// ⑤ قفلهایِ منبع — یک دامنه، یک مالک
// ---------------------------------------------------------------
describe("قفلهایِ منبعِ r385", () => {
  it("دو نمایِ نبردی dayKeyAgoFa میخوانند و هیچ فراخوانِ timeAgoFa-روی-روز زنده نیست", () => {
    const resume = read("src/components/study/home/home-duel-resume.tsx");
    const setup = read("src/components/study/duel/duel-setup.tsx");
    expect(resume).toContain('dayKeyAgoFa(latest.day)');
    expect(resume).not.toContain("timeAgoFa");
    expect(setup).toContain("dayKeyAgoFa(r.day)");
    expect(setup).not.toContain("timeAgoFa");
    // کل src: هیچ فراخوانِ timeAgoFa رویِ برچسبِ .day
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) return walk(p);
        return /\.(tsx?|ts)$/.test(f) ? [p] : [];
      });
    const offenders = walk("src").filter((p) =>
      /timeAgoFa\(\s*\w+\.day\b/.test(readFileSync(p, "utf8"))
    );
    expect(offenders).toEqual([]);
  });

  it("قالبهایِ پله‌س فقط در مالکِ دامنهاند (src/lib)", () => {
    const libDir = join(process.cwd(), "src/lib");
    const tierWord = /دقیقه پیش|ماه پیش/;
    const offenders = readdirSync(libDir)
      .filter((f) => /\.ts$/.test(f) && f !== "time-fa.ts")
      .filter((f) => tierWord.test(readFileSync(join(libDir, f), "utf8")));
    expect(offenders).toEqual([]);
  });

  it("teacher-report و backup تفویض میکنند — بدونِ پله‌سِ محلی و بی faDigitsِ زنده", async () => {
    const teacher = read("src/lib/teacher-report.ts");
    const backup = read("src/lib/backup.ts");
    expect(teacher).toContain("relativeAgeFa(now - t, TEACHER_HEAD)");
    expect(teacher).not.toMatch(/const faDigits/);
    expect(teacher).not.toContain("faDigits(");
    expect(teacher).not.toMatch(/Math\.floor\(age/);
    expect(backup).toContain("relativeAgeFa(ms, BACKUP_HEAD)");
    expect(backup).not.toMatch(/Math\.floor\(min|Math\.floor\(h\b/);
    // مالکِ دامنه هر دو شکلِ گویش را صادر میکند
    const owner = read("src/lib/time-fa.ts");
    expect(owner).toContain("export const TEACHER_HEAD");
    expect(owner).toContain("export const BACKUP_HEAD");
    expect(owner).toContain("export const LEARNER_HEAD");
  });

  it("study-theme صادرسلول است — بدنهٔ faNum/timeAgoFa از آن کوچیده", () => {
    const theme = read("src/lib/study-theme.ts");
    expect(theme).toContain('export { faNum, timeAgoFa } from "@/lib/time-fa"');
    expect(theme).not.toContain("function faNum");
    expect(theme).not.toContain("function timeAgoFa");
  });

  it("دوقلوهایِ سیمِ سه‌سرویسی با حاشیهٔ حکم میمانند — دوقلوی آگاه، نه رت", () => {
    const throttle = read("src/lib/join-throttle.ts");
    const pace = read("src/lib/duel-pace.ts");
    // هر دو استثنایِ مستندِ r385 را حمل میکنند
    expect(throttle).toContain("استثنایِ مستندِ سرشماریِ r385");
    expect(pace).toContain("r385 — faDigits عمداً اینجاست");
    // و هیچ‌کدام وارداتِ time-fa ندارند (قراردادِ بیوارداتِ داورِ ۳۰۰۳)
    expect(throttle).not.toContain("from \"@/lib/time-fa\"");
    expect(pace).not.toContain("from \"@/lib/time-fa\"");
  });
});

// ---------------------------------------------------------------
// ⑥ jsdom — چیپِ خانه با کلیدِ روزِ واقعی
// ---------------------------------------------------------------
describe("home-duel-resume — برچسبِ روز-گرا رویِ کارتِ واقعی", () => {
  it("مصافِ امروز ⇒ «امروز» — هرگز برچسبِ ساعتی", async () => {
    useStudy.setState({
      duelHistory: [duelRec({ id: "d1", day: dayKeyOf(new Date()) })],
    } as Partial<ReturnType<typeof useStudy.getState>>);
    const { default: Card } = await import("@/components/study/home/home-duel-resume");
    render(<Card />);
    await waitFor(() => expect(screen.getByLabelText("بازگشت به میدانِ نبرد")).toBeInTheDocument());
    const card = screen.getByLabelText("بازگشت به میدانِ نبرد");
    expect(card.textContent).toContain("برد ·");
    expect(card.textContent).toContain("امروز");
    expect(card.textContent).not.toContain("ساعت پیش");
    expect(card.textContent).not.toContain("لحظاتی پیش");
  });

  it("مصافِ دیروز ⇒ «دیروز» — نه «X ساعت پیش»ِ ساختگی", async () => {
    useStudy.setState({
      duelHistory: [duelRec({ id: "d2", day: dayKeyOf(new Date(Date.now() - DAY)) })],
    } as Partial<ReturnType<typeof useStudy.getState>>);
    const { default: Card } = await import("@/components/study/home/home-duel-resume");
    render(<Card />);
    await waitFor(() => expect(screen.getByLabelText("بازگشت به میدانِ نبرد")).toBeInTheDocument());
    const card = screen.getByLabelText("بازگشت به میدانِ نبرد");
    expect(card.textContent).toContain("دیروز");
    expect(card.textContent).not.toContain("ساعت پیش");
  });

  it("مصافِ دوماهه ⇒ «۲ روز پیش» — قراردادِ r364 پابرجا", async () => {
    useStudy.setState({
      duelHistory: [duelRec({ id: "d3", day: dayKeyOf(new Date(Date.now() - 2 * DAY)) })],
    } as Partial<ReturnType<typeof useStudy.getState>>);
    const { default: Card } = await import("@/components/study/home/home-duel-resume");
    render(<Card />);
    await waitFor(() => expect(screen.getByLabelText("بازگشت به میدانِ نبرد")).toBeInTheDocument());
    expect(screen.getByLabelText("بازگشت به میدانِ نبرد").textContent).toContain("روز پیش");
  });
});
