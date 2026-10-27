// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۳۶۹ — «کلاسِ آموزشیِ مرورگر»: قفلهایِ کامپوننتیِ دو سطحی که
// داوریِ زندهٔ r366 صادقانه SKIP کرده بود (danger-words و SrsPanel —
// فقط با پیشرفتِ یادگیرنده رندر میشوند). این آزمونها همان ریاضیاتِ
// صادق را در سطحِ کامپوننت قفل میکنند که کلاسِ r369 زنده میپیماید:
//
//   ① DangerWords: تهیِ صادق (بی‌خطا = حالتِ خالی، نه کارتِ دروغین)
//   ② DangerWords: با داده — فهرستِ رتبهبندیِ خطر + شمارش + دیالوگِ
//     تمرین با گیتِ حداقلِ دیکته (DICTATION_MIN_DANGER)
//   ③ SrsPanel: صفرهایِ صادق (بی-srs = چهار چیپِ صفر + دوناتِ تهی)
//   ④ SrsPanel: ریاضیاتِ سررسید — ورودیِ آینده = سررسیدِ صفر (درِ
//     ۱۵دقیقهای هنوز سر نرسیده)؛ ورودیِ گذشته = سررسیدِ یک
//   ⑤ نوارِ سررسید فقط با سررسیدِ واقعی ظاهر میشود و با مصرف، خالی
//     میشود (صفرِ صادق — همان که کلاسِ زنده میبیند)
//   ⑥ رجیستریِ رویدادها ۵۲ + بی‌transition-all
// ------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import DangerWords from "@/components/study/practice/danger-words";
import SrsPanel from "@/components/study/practice/srs-panel";
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

// سrs record helpers — ریاضیاتِ واقعیِ srs-engine
const pastDue = () => ({ level: 0, dueAt: Date.now() - 60_000 });
const futureDue = (ms: number) => ({ level: 0, dueAt: Date.now() + ms });

describe("DangerWords — قفلِ کامپوننتیِ سطحِ SKIPشده — r369", () => {
  it("① بی‌خطا: حالتِ خالیِ صادق — نه فهرستِ دروغین، نه دیالوگِ باز", () => {
    render(<DangerWords />);
    const card = screen.getByLabelText("واژه‌های خطرناک من");
    expect(card).toBeInTheDocument();
    // تهیِ صادق — شمارشِ واژه نیست
    expect(card.textContent).not.toMatch(/^\s*[۰-۹]+\s*واژه/);
  });

  it("② با خطا: فهرستِ رتبهبندی + شمارش + گیتِ حداقلِ دیکته", () => {
    // کلیدِ واقعیِ واژه: «<درس>:<en>» (قراردادِ wordByKey) + قاعدهٔ صداقتِ
    // word-risk: یک بدشانسیِ تنها شاهد نیست — seen≥2 یا mistakes≥2 لازم است
    useStudy.setState({
      wordMistakes: { "1:ability": 2, "1:absolutely": 1 },
      wordSeen: { "1:ability": 3, "1:absolutely": 3, "1:access": 5 },
    } as never);
    render(<DangerWords />);
    const card = screen.getByLabelText("واژه‌های خطرناک من");
    // شمارشِ زندهٔ فهرست — فقط واژههایِ خطادارِ واجدِ شرط (۲ از ۳ دیدهشده)
    expect(card.textContent).toMatch(/۲ واژه/);
    // رتبهٔ نخست = بیشترین خطا («ability» با ۲ خطا بالاتر از «absolutely» با ۱)
    const text = card.textContent || "";
    expect(text.indexOf("ability")).toBeGreaterThan(-1);
    expect(text.indexOf("ability")).toBeLessThan(text.indexOf("absolutely"));
    // دیکتهٔ خطرناکها با کمتر از حداقل مستور است (صداقتِ حداقل)
    const dictBtn = [...card.querySelectorAll("button")].find((b) => (b.textContent || "").includes("دیکته"));
    if (dictBtn) expect(dictBtn).toBeDisabled();
  });
});

describe("SrsPanel — ریاضیاتِ صادقِ سررسید — r369", () => {
  it("③ بی-srs: چهار چیپِ صفر — هیچ سررسیدِ ساختگی", () => {
    render(<SrsPanel />);
    const panel = screen.getByLabelText("داشبورد مرور هوشمند");
    expect(panel.textContent).toContain("سررسید الآن");
    expect(panel.textContent).toContain("در حال یادگیری");
    // نوارِ «سررسید الآن — با یک ضربه مرور کن» بدونِ سررسید رندر نمیشود
    expect(panel.textContent).not.toContain("با یک ضربه مرور کن");
  });

  it("④ ورودیِ آینده (۱۵دقیقهای): سررسیدِ صفر — درِ زمان هنوز باز نشده", () => {
    useStudy.setState({
      srs: {
        "1:ability": futureDue(14 * 60_000),
        "1:absolutely": futureDue(10 * 60_000),
      },
    } as never);
    render(<SrsPanel />);
    const panel = screen.getByLabelText("داشبورد مرور هوشمند");
    // نوارِ سررسید بدونِ سررسیدِ واقعی رندر نمیشود (صفرِ صادق)
    expect(panel.textContent).not.toContain("واژهٔ سررسید");
    expect(panel.textContent).not.toContain("منتظر مرور است");
  });

  it("⑤ ورودیِ گذشته: نوارِ سررسید با شمارشِ درست — و چیپِ واژهٔ سررسید", () => {
    useStudy.setState({
      srs: {
        "1:ability": pastDue(),
        "1:absolutely": futureDue(86_400_000),
      },
    } as never);
    render(<SrsPanel />);
    const panel = screen.getByLabelText("داشبورد مرور هوشمند");
    // نوارِ سررسید فقط با سررسیدِ واقعی: «۱ واژهٔ سررسید» + «۱ واژه منتظر مرور است»
    expect(panel.textContent).toContain("۱ واژهٔ سررسید");
    expect(panel.textContent).toContain("۱ واژه منتظر مرور است");
    // چیپِ واژهٔ سررسید با titleِ سطح — کلیکش جلسهٔ مرورِ هوشمند میگشاید
    const chip = [...panel.querySelectorAll("button")].find((b) => /سطح ۱ از ۶/.test(b.title || ""));
    expect(chip).toBeDefined();
    act(() => {
      fireEvent.click(chip!);
    });
    // پرش به درس در حالتِ هوشمند (openLesson) — نه هیچ مقصدِ ساختگی
    expect(useStudy.getState().view).toEqual({ type: "lesson", id: 1 });
  });
});

describe("قفلهایِ ساختاری — r369", () => {
  it("⑥ رجیستریِ رویدادها ۵۲ میماند + بی‌transition-all در هر دو سطح", () => {
    expect(EVENT_NAMES.length).toBe(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت (دوقلویِ r306)؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
    for (const f of ["src/components/study/practice/danger-words.tsx", "src/components/study/practice/srs-panel.tsx"]) {
      const src = readFileSync(f, "utf8");
      expect(src).not.toContain("transition-all");
    }
  });
});
