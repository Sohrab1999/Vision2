// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۳۷۰ — «پیوندِ دو داشبورد»: ردیفهایِ کارتِ «واژههایِ خطرناک من»
// از دیدِ چرخهٔ مرور هم حرف میزنند (بندِ ④ پیشنهادِ r369).
//
//   ① ریاضیاتِ خالصِ srsWordStatus: نردبانِ دسته‌بندی (یادگیری/مستحکم/
//     وارفته) + مقدمبودنِ سررسید برِ هر پلهای — عینِ داشبوردِ مرور
//   ② ورودیِ خراب = null (الگویِ Task 293) — رندرِ نداشتن، نه دروغ
//   ③ چیپِ ردیف با دادهٔ سالم — «در چرخه · سطح N از ۶» + رنگِ حالت
//   ④ واریانتِ سررسید — «سررسید · سطح N از ۶» + رز
//   ⑤ واریانتِ وارفته — «در چرخه · سطح ۶ از ۶» + teal (رنگِ پنلِ مرور)
//   ⑥ صداقتِ نداشتن: بیورودی = بیچیپ + بیپل؛ خطِ پاورقیِ پیوند حاضر
//   ⑦ چیپِ پل: «X از Y در چرخهٔ مرور» — فقط وقتیِ X > 0
//   ⑧ ورودیِ خراب از پل و چیپ حذف میشود — شمارش فقط سالمها
//   ⑨ حالتِ خالیِ کارت با ورودیهایِ srs حاضر: باز هم بیپل (فهرستِ تهی)
//   ⑩ قفلِ تکمنبع: چیپ از srsWordStatus میخواند، «از ۶» از
//     SRS_INTERVALS.length میآید (نه رقمِ دستنویس) + رجیستریِ ۵۲
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import DangerWords from "@/components/study/practice/danger-words";
import { srsWordStatus } from "@/lib/srs-due";
import { EVENT_NAMES } from "@/lib/analytics-events";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  useStudy.setState({
    view: { type: "home" },
    known: {},
    wordMistakes: {},
    wordSeen: {},
    starredWords: [],
    srs: {},
  } as never);
  cleanup();
});

const NOW = Date.now();
const future = (ms: number, level: number) => ({ level, dueAt: NOW + ms });
const past = (level: number) => ({ level, dueAt: NOW - 60_000 });

// سه واژهٔ واجدِ شرطِ خطر (قاعدهٔ شاهد: mistakes≥2 یا seen≥2)
const DANGER_SEED = {
  wordMistakes: { "1:ability": 2, "1:absolutely": 1, "1:access": 2 },
  wordSeen: { "1:ability": 3, "1:absolutely": 3, "1:access": 3 },
};

describe("srsWordStatus — ریاضیاتِ خالصِ پیوند — r370", () => {
  it("① نردبانِ دستهبندی: ۰–۲ یادگیری، ۳–۴ مستحکم، ۵ وارفته — و سررسید برِ هر پله مقدم", () => {
    expect(srsWordStatus(future(60_000, 0), NOW)).toMatchObject({ state: "learning", level: 0 });
    expect(srsWordStatus(future(60_000, 2), NOW)).toMatchObject({ state: "learning", level: 2 });
    expect(srsWordStatus(future(60_000, 3), NOW)).toMatchObject({ state: "strong", level: 3 });
    expect(srsWordStatus(future(60_000, 4), NOW)).toMatchObject({ state: "strong", level: 4 });
    expect(srsWordStatus(future(60_000, 5), NOW)).toMatchObject({ state: "mastered", level: 5 });
    // زمان، مقدم برِ پله — وارفتهٔ سررسیده هم «سررسید» است (عینِ داشبورد)
    expect(srsWordStatus(past(5), NOW)).toMatchObject({ state: "due", level: 5 });
    expect(srsWordStatus(past(0), NOW)).toMatchObject({ state: "due", level: 0 });
  });

  it("② ورودیِ خراب/ناقص = null — مرزِ بیرونِ نردبان هم خراب است", () => {
    expect(srsWordStatus(undefined, NOW)).toBeNull();
    expect(srsWordStatus(null, NOW)).toBeNull();
    expect(srsWordStatus({} as never, NOW)).toBeNull();
    expect(srsWordStatus({ level: 1 } as never, NOW)).toBeNull();
    expect(srsWordStatus({ dueAt: NOW } as never, NOW)).toBeNull();
    expect(srsWordStatus({ level: NaN, dueAt: NOW }, NOW)).toBeNull();
    expect(srsWordStatus({ level: 1, dueAt: NaN }, NOW)).toBeNull();
    expect(srsWordStatus({ level: 7, dueAt: NOW + 1 }, NOW)).toBeNull();
    expect(srsWordStatus({ level: -1, dueAt: NOW + 1 }, NOW)).toBeNull();
    expect(srsWordStatus({ level: 1.5, dueAt: NOW + 1 }, NOW)).toBeNull();
  });
});

describe("DangerWords × SRS — چیپهایِ پیوند — r370", () => {
  it("③ چیپِ یادگیری: «در چرخه · سطح ۱ از ۶» + کهربا + titleِ همزبانِ پنل", () => {
    useStudy.setState({ ...DANGER_SEED, srs: { "1:ability": future(14 * 60_000, 0) } } as never);
    render(<DangerWords />);
    const chip = screen.getByTestId("danger-srs-chip-ability");
    expect(chip.textContent).toMatch(/در چرخه\s*·\s*سطح ۱ از ۶/);
    expect(chip.className).toContain("bg-amber-50");
    expect(chip.getAttribute("title")).toContain("در حال یادگیری");
    // همسایههایِ بیچرخه چیپ ندارند — نداشتن، خودش حرف است
    expect(screen.queryByTestId("danger-srs-chip-absolutely")).toBeNull();
    expect(screen.queryByTestId("danger-srs-chip-access")).toBeNull();
  });

  it("④ واریانتِ سررسید: «سررسید · سطح ۱ از ۶» + رز", () => {
    useStudy.setState({ ...DANGER_SEED, srs: { "1:ability": past(0) } } as never);
    render(<DangerWords />);
    const chip = screen.getByTestId("danger-srs-chip-ability");
    expect(chip.textContent).toMatch(/سررسید\s*·\s*سطح ۱ از ۶/);
    expect(chip.className).toContain("bg-rose-50");
    expect(chip.getAttribute("title")).toContain("سررسیدِ مرور");
  });

  it("⑤ واریانتِ وارفته: «در چرخه · سطح ۶ از ۶» + teal — رنگِ خودِ داشبوردِ مرور", () => {
    useStudy.setState({ ...DANGER_SEED, srs: { "1:ability": future(86_400_000, 5) } } as never);
    render(<DangerWords />);
    const chip = screen.getByTestId("danger-srs-chip-ability");
    expect(chip.textContent).toMatch(/در چرخه\s*·\s*سطح ۶ از ۶/);
    expect(chip.className).toContain("bg-teal-50");
    expect(chip.getAttribute("title")).toContain("وارفته");
  });

  it("⑥ بیورودی: بیچیپ + بیپل + خطِ پاورقیِ پیوند حاضر", () => {
    useStudy.setState({ ...DANGER_SEED } as never);
    render(<DangerWords />);
    const card = screen.getByLabelText("واژه‌های خطرناک من");
    expect(card.querySelector('[data-testid^="danger-srs-chip-"]')).toBeNull();
    expect(screen.queryByTestId("danger-srs-bridge")).toBeNull();
    expect(card.textContent).toContain("چیپِ «در چرخه» از داشبوردِ مرورِ هوشمند می‌آید");
  });

  it("⑦ چیپِ پل: «۲ از ۳ در چرخهٔ مرور» — فقط با چرخهٔ واقعی", () => {
    useStudy.setState({
      ...DANGER_SEED,
      srs: { "1:ability": future(14 * 60_000, 0), "1:access": future(30 * 60_000, 2) },
    } as never);
    render(<DangerWords />);
    const bridge = screen.getByTestId("danger-srs-bridge");
    expect(bridge.textContent).toMatch(/۲ از ۳ در چرخهٔ مرور/);
    expect(bridge.className).toContain("bg-teal-50");
    expect(bridge.getAttribute("title")).toContain("داشبوردِ مرورِ هوشمند");
  });

  it("⑧ ورودیِ خراب از چیپ و پل حذف میشود — شمارش فقط سالمها", () => {
    useStudy.setState({
      ...DANGER_SEED,
      srs: {
        "1:ability": future(14 * 60_000, 0),
        "1:absolutely": { level: 9, dueAt: NOW + 1 },
        "1:access": {} as never,
      },
    } as never);
    render(<DangerWords />);
    expect(screen.getByTestId("danger-srs-chip-ability")).toBeInTheDocument();
    expect(screen.queryByTestId("danger-srs-chip-access")).toBeNull();
    expect(screen.getByTestId("danger-srs-bridge").textContent).toMatch(/۱ از ۳ در چرخهٔ مرور/);
  });

  it("⑨ کارتِ خالی با srsِ حاضر: باز هم بیپل — فهرستِ تهی هیچ نمیگوید", () => {
    useStudy.setState({ srs: { "1:ability": future(60_000, 0) } } as never);
    render(<DangerWords />);
    const card = screen.getByLabelText("واژه‌های خطرناک من");
    expect(card.querySelector('[data-testid^="danger-srs-chip-"]')).toBeNull();
    expect(screen.queryByTestId("danger-srs-bridge")).toBeNull();
    expect(card.textContent).toContain("هنوز واژهٔ خطری ثبت نشده");
  });
});

describe("قفلهایِ ساختاری — r370", () => {
  it("⑩ تکمنبع: چیپ از srsWordStatus، «از ۶» از SRS_INTERVALS.length — نه رقمِ دستنویس", () => {
    const src = readFileSync("src/components/study/practice/danger-words.tsx", "utf8");
    expect(src).toContain('import { srsWordStatus, type SrsWordStatus } from "@/lib/srs-due"');
    expect(src).toContain("srsWordStatus(srs[d.key]");
    expect(src).toContain("faNum(SRS_INTERVALS.length)");
    expect(src).not.toContain("از ۶");
    expect(src).not.toContain("transition-all");
    expect(EVENT_NAMES.length).toBe(52);
  });
});
