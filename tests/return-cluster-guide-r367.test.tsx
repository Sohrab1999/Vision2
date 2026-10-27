// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۳۶۷ — بندِ ③ پیشنهادِ r366: «خوشهٔ بازگشت» در کارتِ راهنما
//
// r364 خوشهٔ بازگشتِ خانه را پنجدره کرد («درهایِ چهارم و پنجم») اما
// مستنداتِ درها — کارتِ راهنما — فقط حلقهٔ «ادامهٔ مطالعه» و پوششِ
// حکمها را داشت. این راند پنج درِ خانه از
// RETURN_CLUSTER_DOORS (تک‌منبعِ حقیقتِ src/lib/return-cluster-doors.ts)
// به راهنما میرسد — سومین «فهرستِ زنده»؛ درِ نو به خانه اضافه شود،
// کارتِ راهنما خودش تازه میشود.
//
// گاردهایِ این فایل:
//   ① قفلِ منبع: راهنما از RETURN_CLUSTER_DOORS.map رندر میکند —
//     هیچ فهرستِ دستیِ دومی که از حقیقت عقب بماند.
//   ② قفلِ داده ↔ درخت: هر در فایلِ واقعیِ خودش را دارد و probeِ آن
//     دقیقاً در یک فایلِ درخت است — کپیِ ناآگاهانه و جابه‌جایی میشکنند.
//   ③ یکتایی + پنجدرهبودنِ موبهمو: id/file/probe یکتا؛ طولِ رجیستری ۵ —
//     درِ ششم ناگزیر به ثبتِ آگاهانه.
//   ④ صداقتِ گیتها: هر gateHint «چه‌وقت هست» را میگوید — قراردادِ
//     «با نخستینِ …» (بی‌رکورد، هیچ — r236).
//   ⑤ سطحِ کامپوننت: بخشِ نو با دقیقاً پنج ردیف + شمارشِ faNum در
//     تیتر + gateHintِ دیدنی زیرِ هر ردیف + پانویسِ صداقت.
//   ⑥ کلیکِ واقعی: ردیف راهنما را میبندد و به خانه میبرد — همان
//     شاخهٔ goto-homeِ runDoorAction (یک منطق، یک نقطه).
//   ⑦ رجیستریِ رویدادها ۵۲ میماند — خوانندهٔ صادق، هیچ فردِ تحلیلیِ نو.
//   ⑧ صفرِ CSS: بدونِ transition-all؛ ترنزیشنِ اسکوپشده؛ کلاسهایِ
//     موجودِ خودِ فایل.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, act } from "@testing-library/react";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import ShortcutGuide from "@/components/study/shell/shortcut-guide";
import { RETURN_CLUSTER_DOORS, RETURN_HOME_OPEN_LABEL } from "@/lib/return-cluster-doors";
import { EVENT_NAMES } from "@/lib/analytics-events";
import { useStudy } from "@/lib/study-store";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const STUDY_TREE = join(process.cwd(), "src/components/study");
const REGISTRY_SRC = readFileSync(join(process.cwd(), "src/lib/return-cluster-doors.ts"), "utf8");
const GUIDE_SRC = readFileSync(join(process.cwd(), "src/components/study/shell/shortcut-guide.tsx"), "utf8");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

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
  useStudy.setState({
    view: { type: "home" },
    lessonTab: "vocab",
    known: {},
    results: {},
    mistakes: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

describe("خوشهٔ بازگشت در راهنما — r367 ③", () => {
  it("① قفلِ منبع: راهنما از تک‌منبعِ رندر می‌کند، نه فهرستِ دستی", () => {
    expect(GUIDE_SRC).toContain("RETURN_CLUSTER_DOORS.map");
    expect(GUIDE_SRC).toContain('data-testid={`return-door-${door.id}`}');
    // شمارش در تیتر از خودِ داده می‌آید — هیچ «۵» دستیِ فارسی یا لاتین
    expect(GUIDE_SRC).toContain("faNum(RETURN_CLUSTER_DOORS.length)");
    expect(GUIDE_SRC).not.toMatch(/بازگشت — خانه به یاد دارد —\s*(۵|5)\s*در/);
  });

  it("② قفلِ داده ↔ درخت: probe هر در فقط در فایلِ ثبتشده‌اش است", () => {
    for (const door of RETURN_CLUSTER_DOORS) {
      const p = join(STUDY_TREE, door.file);
      expect(existsSync(p), door.file).toBe(true);
      expect(readFileSync(p, "utf8"), door.file).toContain(door.probe);
    }
    // اسکنِ معکوسِ کلِ درخت: هر probe دقیقاً یک‌بار — فایلِ registered
    const tree = walk(STUDY_TREE);
    for (const door of RETURN_CLUSTER_DOORS) {
      const hits = tree
        .filter((p) => readFileSync(p, "utf8").includes(door.probe))
        .map((p) => p.replace(/\\/g, "/"));
      expect(hits, door.probe).toEqual([join(STUDY_TREE, door.file).replace(/\\/g, "/")]);
    }
  });

  it("③ یکتایی و پنج‌دره‌بودنِ موبهمو: طولِ رجیستری ۵ — درِ ناشناس می‌شکند", () => {
    expect(RETURN_CLUSTER_DOORS).toHaveLength(5);
    const ids = RETURN_CLUSTER_DOORS.map((d) => d.id);
    const files = RETURN_CLUSTER_DOORS.map((d) => d.file);
    const probes = RETURN_CLUSTER_DOORS.map((d) => d.probe);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(files).size).toBe(files.length);
    expect(new Set(probes).size).toBe(probes.length);
    // پنج دنیایِ مستندِ خوشه — بدونِ غایب
    expect(ids).toEqual(["appendix", "lesson", "reading", "konkur", "duel"]);
  });

  it("④ صداقتِ گیت‌ها: هر gateHint «چه‌وقت هست» را با قراردادِ «با نخستین» می‌گوید", () => {
    for (const door of RETURN_CLUSTER_DOORS) {
      expect(door.label.trim().length, door.id).toBeGreaterThan(0);
      expect(door.text.trim().length, door.id).toBeGreaterThan(0);
      expect(door.gateHint, door.id).toContain("با نخستین");
      expect(door.gateHint.endsWith("می‌شود"), door.id).toBe(true);
    }
  });

  it("⑤ انعکاسِ مستنداتِ درها: نسبتِ درِ مشترکِ ضمیمه با حلقه ثبت شده", () => {
    // «پنجدره شدنِ خوشه در مستنداتِ درها بازتاب یابد» — هدرِ رجیستری
    // نسبت با حلقهٔ «ادامهٔ مطالعه» را صادقانه توضیح میدهد (درِ مشترک).
    expect(REGISTRY_SRC).toContain("حلقهٔ «ادامهٔ مطالعه»");
    expect(REGISTRY_SRC).toContain("درِ ضمیمه مشترک است");
  });

  it("⑥ سطحِ کامپوننت: پنج ردیفِ زنده + شمارشِ faNum + gateHintِ دیدنی + پانویسِ صداقت", () => {
    render(<ShortcutGuide />);
    act(() => {
      window.dispatchEvent(new CustomEvent("open-shortcuts"));
    });
    const section = screen.getByTestId("shortcut-guide-return-cluster");
    const rows = RETURN_CLUSTER_DOORS.map((d) => screen.getByTestId(`return-door-${d.id}`));
    expect(rows).toHaveLength(5);
    expect(section).toHaveTextContent("۵ در");
    // دو نمونهٔ معرف از زبانِ خودِ داده — label + text در دکمه، gateHint
    // در «لی»ی همان ردیف (زیرِ دکمه — ساختارِ صادق: هر در با گیتِ خودش)
    expect(screen.getByTestId("return-door-konkur")).toHaveTextContent("کنکورِ دیده‌شده:");
    expect(screen.getByTestId("return-door-konkur").closest("li")).toHaveTextContent("با نخستین تستِ بانک که ببینی ساخته می‌شود");
    expect(screen.getByTestId("return-door-duel")).toHaveTextContent("بازگشت به میدان");
    expect(screen.getByTestId("return-door-appendix").closest("li")).toHaveTextContent("با نخستین ورق‌زدنِ ضمیمه");
    expect(section).toHaveTextContent("بی‌رکورد، هیچ");
    // tooltipِ مشترک از ثابتِ رجیستری می‌آید — دو منبع نمیشود
    expect(rows[0]).toHaveAttribute("title", RETURN_HOME_OPEN_LABEL);
  });

  it("⑦ کلیکِ واقعی: ردیف راهنما را می‌بندد و به خانه می‌برد — همان شاخهٔ goto-home", () => {
    render(<ShortcutGuide />);
    act(() => {
      window.dispatchEvent(new CustomEvent("open-shortcuts"));
    });
    expect(screen.getByTestId("shortcut-guide-return-cluster")).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByTestId("return-door-konkur"));
    });
    // ناوبریِ فوری — بی‌دست‌دهی؛ خانه مقصد است نه کنکور (درها رویِ خانه‌اند)
    expect(useStudy.getState().view).toEqual({ type: "home" });
    // راهنما بسته شد — دکمه از صحنه رفت
    expect(screen.queryByTestId("shortcut-guide-return-cluster")).not.toBeInTheDocument();
  });

  it("⑧ رجیستریِ رویدادها ۵۲ میماند — فهرستِ زنده هیچ فردِ تحلیلی نمی‌سازد", () => {
    expect(EVENT_NAMES.length).toBe(55); // r423 +۱ — کارتِ تصویریِ تقویمِ هفته؛ r424 +۱ — هم‌رسانیِ بومیِ همان کارت (دوقلویِ r306)؛ r425 +۱ — پرشِ خانهٔ امروزِ نوارِ هفته
    expect(REGISTRY_SRC).not.toContain("trackEvent");
  });

  it("⑨ صفرِ CSS: بدونِ transition-all؛ ترنزیشنِ اسکوپشده؛ یک منطقِ خانه", () => {
    expect(GUIDE_SRC).not.toContain("transition-all");
    expect(REGISTRY_SRC).not.toContain("transition-all");
    // ردیفهایِ خوشه: ترنزیشنِ اسکوپشدهٔ همان خانواده
    expect(GUIDE_SRC).toContain("transition-[background-color,color]");
    // goto-homeِ runDoorAction و ردیفهایِ خوشه از یک نقطه می‌گذرند
    expect(GUIDE_SRC).toContain("const goHomeThroughDoor = () => {");
    expect(GUIDE_SRC).toContain("goHomeThroughDoor();");
    expect(GUIDE_SRC).toContain("onClick={goHomeThroughDoor}");
  });
});
