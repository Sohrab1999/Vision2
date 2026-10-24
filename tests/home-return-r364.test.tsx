// @vitest-environment jsdom
// ------------------------------------------------------------------
// r364 — «ادامهٔ کنکور» + «بازگشت به میدان» — درهایِ چهارم و پنجمِ
// خوشهٔ بازگشت (ضمیمهٔ r235، کتابخانهٔ r297، درسِ r361).
//
// قراردادهایی که این فایل قفل میکند:
//   • غیبتِ صادقانه: بیپوششِ بانک / بی‌دفترچهٔ نبرد ⇒ هیچ رندر
//   • «آخرین» = duelHistory[0] — ترتیبِ newest-firstِ pushDuelRecord
//     دوباره مرتب نمیشود (یک حقیقت، یک ترتیب)
//   • پرشِ بدونِ رویداد: konkur_start/duel_start مالِ شروعِ واقعیِ
//     جلسه/نبردند — پرشِ کارت هیچ رویدادی نمیفرد (قانونِ r359)؛
//     رجیستریِ ۵۲ دستنخورده
//   • باندلِ خانه از لایهٔ داده دور میماند: هیچ کارتی examBank را
//     ایمپورت نمیکند — طولِ بانک هرگز به خانه هاردکد نمیشود
//   • همزادیِ بصری: کنکور نارنجی، میدان گلگلی؛ بی‌transition-all؛
//     press-scale قراردادیِ [0.96]
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import { EVENT_NAMES } from "@/lib/analytics-events";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const dayKeyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const rec = (over: Record<string, unknown>) => ({
  id: "d1",
  day: dayKeyOf(new Date(Date.now() - 2 * 86_400_000)),
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
    konkurSeen: {},
    konkurWrong: {},
    duelHistory: [],
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------
// ① کارتِ کنکور — گیتِ صادقانه و زبانِ پوشش
// ---------------------------------------------------------------
describe("home-konkur-resume — درِ چهارم", () => {
  it("① تازهواردِ بیپوشش ⇒ هیچ — غیبتِ صادقانه", async () => {
    const { default: Card } = await import("@/components/study/home/home-konkur-resume");
    const { container } = render(<Card />);
    expect(container).toBeEmptyDOMElement();
  });

  it("② با پوشش ⇒ عنوانِ فارسی با ارقامِ فارسی + دادهکاویِ seen", async () => {
    useStudy.setState({ konkurSeen: { "x-1": true, "x-2": true, "x-3": true } } as never);
    const { default: Card } = await import("@/components/study/home/home-konkur-resume");
    render(<Card />);
    const card = screen.getByLabelText("ادامهٔ کنکور — ۳ تست دیده‌ای");
    expect(card).toHaveAttribute("data-konkur-seen", "3");
    expect(card.textContent).toContain("ادامهٔ کنکور — ۳ تستِ بانک را دیدی");
  });

  it("③ غلطِ زنده ⇒ سطرِ «تستِ سخت» با شمارشِ صادق", async () => {
    useStudy.setState({
      konkurSeen: { "x-1": true, "x-2": true },
      konkurWrong: { "x-2": true },
    } as never);
    const { default: Card } = await import("@/components/study/home/home-konkur-resume");
    render(<Card />);
    const card = screen.getByLabelText("ادامهٔ کنکور — ۲ تست دیده‌ای");
    expect(card).toHaveAttribute("data-konkur-wrong", "1");
    expect(card.textContent).toContain("۱ تستِ سختِ تو منتظرِ مرور است");
  });

  it("④ بیغلط ⇒ سطرِ دعوتِ پوشش — نه سطرِ جعلیِ «سخت»", async () => {
    useStudy.setState({ konkurSeen: { "x-9": true } } as never);
    const { default: Card } = await import("@/components/study/home/home-konkur-resume");
    render(<Card />);
    expect(screen.getByLabelText("ادامهٔ کنکور — ۱ تست دیده‌ای").textContent).toContain(
      "نقشهٔ پوشش در انتظارِ ادامهٔ توست"
    );
  });

  it("⑤ پرش = setView کنکور + هیچ رویدادِ تحلیلی (konkur_start مالِ جلسهٔ واقعی)", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    useStudy.setState({ konkurSeen: { "x-1": true } } as never);
    const { default: Card } = await import("@/components/study/home/home-konkur-resume");
    render(<Card />);
    fireEvent.click(screen.getByLabelText("ادامهٔ کنکور — ۱ تست دیده‌ای"));
    await waitFor(() => expect(useStudy.getState().view.type).toBe("konkur"));
    expect(trackEvent).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------
// ② کارتِ میدان — دفترچه، ترتیب، گویشِ نتیجه
// ---------------------------------------------------------------
describe("home-duel-resume — درِ پنجم", () => {
  it("⑥ بی‌نبرد ⇒ هیچ — غیبتِ صادقانه", async () => {
    const { default: Card } = await import("@/components/study/home/home-duel-resume");
    const { container } = render(<Card />);
    expect(container).toBeEmptyDOMElement();
  });

  it("⑦ با نبرد ⇒ حریفِ آخرینِ رکورد + نتیجه + امتیازِ faNum و زمانِ نسبی", async () => {
    useStudy.setState({ duelHistory: [rec({ opponent: "مریم" })] } as never);
    const { default: Card } = await import("@/components/study/home/home-duel-resume");
    render(<Card />);
    const card = screen.getByLabelText("بازگشت به میدان — آخرین مصاف با مریم: برد");
    expect(card).toHaveAttribute("data-duel-outcome", "win");
    expect(card).toHaveAttribute("data-duel-opponent", "مریم");
    expect(card.textContent).toContain("بازگشت به میدان — آخرین مصاف با مریم");
    expect(card.textContent).toContain("برد ·"); // گویشِ خانوادهٔ دودل
    expect(card.textContent).toContain("۷–۵"); // الگویِ سطرهایِ دفترچه
    expect(card.textContent).toContain("روز پیش"); // timeAgoFa(day)
  });

  it("⑧ «آخرین» = duelHistory[0] — ترتیبِ newest-first دوباره مرتب نمیشود", async () => {
    useStudy.setState({
      duelHistory: [rec({ id: "d2", opponent: "نوین" }), rec({ id: "d1", opponent: "کهن" })],
    } as never);
    const { default: Card } = await import("@/components/study/home/home-duel-resume");
    render(<Card />);
    expect(screen.getByLabelText("بازگشت به میدان — آخرین مصاف با نوین: برد")).toBeTruthy();
    expect(screen.queryByLabelText(/کهن/)).toBeNull();
  });

  it("⑨ گویشِ باخت و مساوی از همان سهواژهٔ خانوادهٔ دودل", async () => {
    const { default: Card } = await import("@/components/study/home/home-duel-resume");
    const { rerender } = render(<Card />);
    useStudy.setState({ duelHistory: [rec({ outcome: "loss", myScore: 4, oppScore: 9 })] } as never);
    rerender(<Card />);
    const lossCard = screen.getByLabelText("بازگشت به میدان — آخرین مصاف با سینا: باخت");
    expect(lossCard.textContent).toContain("باخت ·"); // گویشِ نتیجه
    expect(lossCard.textContent).toContain("۴–۹"); // امتیاز در span خودش (dir=ltr)
    useStudy.setState({ duelHistory: [rec({ outcome: "tie", myScore: 6, oppScore: 6 })] } as never);
    rerender(<Card />);
    const tieCard = screen.getByLabelText("بازگشت به میدان — آخرین مصاف با سینا: مساوی");
    expect(tieCard.textContent).toContain("مساوی ·");
    expect(tieCard.textContent).toContain("۶–۶");
  });

  it("⑩ پرش = setView دودل + هیچ رویدادِ تحلیلی (duel_start مالِ نبردِ واقعی رویِ داور)", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    useStudy.setState({ duelHistory: [rec({})] } as never);
    const { default: Card } = await import("@/components/study/home/home-duel-resume");
    render(<Card />);
    fireEvent.click(screen.getByLabelText("بازگشت به میدان — آخرین مصاف با سینا: برد"));
    await waitFor(() => expect(useStudy.getState().view.type).toBe("duel"));
    expect(trackEvent).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------
// ③ قفلهایِ ساختاری — خوشه، باندل، رجیستری، پالت
// ---------------------------------------------------------------
describe("r364 — قفلهایِ ساختاریِ خوشهٔ بازگشت", () => {
  it("⑪ home-view هر دو کارت را بعدِ درهایِ سهگانه میچیند — ترتیبِ خوشه قفل است", () => {
    const src = read("src/components/study/home/home-view.tsx");
    const order = [
      "HomeLessonResume",
      "HomeContinueReading",
      "HomeKonkurResume",
      "HomeDuelResume",
    ];
    const at = order.map((n) => src.indexOf(`<${n} />`));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect([...at].sort((a, b) => a - b)).toEqual(at);
  });

  it("⑫ باندلِ خانه از لایهٔ داده دور میماند — هیچ کارتی examBank یا «۳۶۰» را به خانه نمیآورد", () => {
    for (const f of ["src/components/study/home/home-konkur-resume.tsx", "src/components/study/home/home-duel-resume.tsx"]) {
      const src = read(f);
      expect(src).not.toContain("@/data/exam");
      expect(src).not.toContain("examBank");
      expect(src).not.toContain("360"); // طولِ بانک تنها در ویوی کنکور زندگی میکند
      expect(src).not.toContain("trackEvent"); // خوانندهٔ صادق — هیچ فردِ تحلیلی
    }
  });

  it("⑬ رجیستریِ رویدادها ۵۲ میماند — هیچ رویدادِ نو برایِ پرشِ کارتها", () => {
    expect(EVENT_NAMES.length).toBe(52);
    expect(EVENT_NAMES).not.toContain("konkur_resume_jump");
    expect(EVENT_NAMES).not.toContain("duel_resume_jump");
  });

  it("⑭ پالتِ هر کارت رنگِ دنیایِ خودش است؛ بی‌transition-all؛ press-scale قراردادی", () => {
    const konkur = read("src/components/study/home/home-konkur-resume.tsx");
    const duel = read("src/components/study/home/home-duel-resume.tsx");
    expect(konkur).toContain("border-orange-200");
    expect(konkur).toContain("from-orange-500");
    expect(konkur).toContain("GraduationCap");
    expect(duel).toContain("border-fuchsia-200");
    // گویشِ آرکیدِ مستند (P3-Route-A): چیپ با توکنهایِ arcade، نه hexِ خام
    expect(duel).toContain("from-arcade-from-soft");
    expect(duel).toContain("to-arcade-to-soft");
    expect(duel).not.toMatch(/purple-\d+/);
    expect(duel).toContain("Swords");
    for (const src of [konkur, duel]) {
      expect(src).not.toContain("transition-all");
      expect(src).toContain("active:scale-[0.96]"); // قراردادِ press-scale — درسِ P10ِ r361
    }
  });

  it("⑮ هر دو کارت گاردِ ?? بیرونِ سلکتور دارند (همالگوی r297) — خرابیِ persist میشکند نه میسوزد", () => {
    const konkur = read("src/components/study/home/home-konkur-resume.tsx");
    const duel = read("src/components/study/home/home-duel-resume.tsx");
    expect(konkur).toContain("(s) => s.konkurSeen) ?? {}");
    expect(konkur).toContain("(s) => s.konkurWrong) ?? {}");
    expect(duel).toContain("(s) => s.duelHistory) ?? []");
  });
});
