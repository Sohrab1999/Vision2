// @vitest-environment jsdom
// ------------------------------------------------------------------
// r378 — «چیپِ نبضِ زندهٔ ۲۴ساعت» — بندِ ②ِ پیشنهادِ r377: شمارندهٔ
// یادگیرندههایِ فعال کنارِ سرشماریِ فهرست که با کلیک، ردیفهایِ فعال
// را فیلتر میکند. قراردادها:
//   • موتورِ تکحقیقت: activeIn24h از teacher-csv (همان که ستونِ
//     روزنامهِ r377 میخواند) — هیچ محاسبهٔ موازی، هیچ دوقلوی محلی
//   • ساعتِ پنجره = generatedAtِ گزارش (لحظهٔ snapshotِ سرور — همان
//     ساعتی که summary.last24h با آن خوانده شده) — نه ساعتِ هر رندر
//   • گویشِ هر سطح: کارتِ آمار تلاش میشمارد (last24h)، چیپ یادگیرنده
//     (پیشینهٔ r363 — هر سطح به گویشِ خودش) — همزبانِ ستونِ روزنامه
//   • مرزِ دوگویشی با r375: هیزمِ جست‌وجو فقط نام + مهارتِ ضعیف —
//     «فعال» توکنِ جست‌وجو نیست، وضعیت است؛ درِ وضعیت فقط چیپ
//   • ترکیبِ تقاطعی: چیپ (وضعیت) × جست‌وجو (متن) — ANDِ صادق
//   • سه خالیِ صادقانه: کلاسِ خالی ≠ جست‌وجوی بیجواب ≠ نبضِ بیزنده
//   • سرشماریِ سربرگ کلِ کلاس؛ دفتر/روزنامه همیشه از report.roster —
//     فیلترِ نما هرگز دامنهٔ پرونده را تنگ نمیکند (r374/r375)
//   • مرزِ inclusivoِ پنجره: t >= now-24h — همان قراردادِ r377،
//     داده‌محور با generatedAtِ ثابت — نه حدسِ ساعت
//   • صفرِ رویدادِ تحلیلیِ نو — فیلترِ خواندنی، کنشِ یادگیری نیست
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, waitFor, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { useStudy } from "@/lib/study-store";
import type { RosterRow } from "@/lib/teacher-report";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
const toastSpy = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastSpy }) }));

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

const HOUR = 3600_000;
const now = Date.parse("2026-10-24T12:00:00.000Z"); // ساعتِ ثابتِ راند — مرزِ inclusivo داده‌محور میشود
const iso = (ms: number) => new Date(ms).toISOString();

const mkRow = (name: string, attempts: number, lastActive: string | null, handle?: string): RosterRow => ({
  name,
  color: "emerald",
  attempts,
  avgPercent: attempts > 0 ? 73 : null,
  bestPercent: attempts > 0 ? 90 : null,
  lessons: attempts > 0 ? 2 : 0,
  lastActive,
  weakest: attempts > 0 ? { category: "quiz", avgPercent: 73 } : null,
  handle,
});

const day = (i: number) => new Date(now - i * 86_400_000).toISOString().slice(0, 10);

const reportPayload = (roster: RosterRow[]) => ({
  ok: true,
  generatedAt: iso(now), // ساعتِ snapshot — پنجرهٔ چیپ از همین میخواند
  summary: {
    learners: roster.length,
    attempts: roster.reduce((s, r) => s + r.attempts, 0),
    avgPercent: 73,
    last24h: 7, // عمداً ≠ شمارندهٔ چیپ — کارت تلاش میشمارد، چیپ یادگیرنده
    byDay: Array.from({ length: 7 }, (_, i) => ({ day: day(6 - i), attempts: i === 6 ? 7 : 0 })),
    byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: 1, avgPercent: 73 })),
  },
  roster,
});

// سارا: ۱ساعت پیش (زنده) — بلیت: ۳۰ساعت پیش (خاموش) — آرش: دقیقاً
// مرزِ ۲۴ساعت (inclusivo ⇒ زنده — همان قراردادِ ستونِ r377) — علی: بیتلاش
const fixture = () => [
  mkRow("سارا", 5, iso(now - HOUR), "h-sara"),
  mkRow("بلیت‌آزمای QA", 2, iso(now - 30 * HOUR), "h-bilit"),
  mkRow("آرش", 3, iso(now - 24 * HOUR), "h-arash"),
  mkRow("علی", 0, null),
];

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  useStudy.setState({ view: { type: "home" } } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

afterEach(() => {
  vi.unstubAllGlobals();
  toastSpy.mockClear();
  cleanup();
});

const openPanel = async (roster: RosterRow[] = fixture()) => {
  sessionStorage.setItem("vision2-teacher-code", "edu-1404");
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (String(url).includes("/api/teacher/report")) {
        return new Response(JSON.stringify(reportPayload(roster)), { status: 200 });
      }
      // استابِ دیالوگ — قراردادِ کاملِ LearnerDetail (درسِ r377)
      return new Response(
        JSON.stringify({
          ok: true,
          learner: {
            name: "سارا",
            color: "emerald",
            joinedAt: iso(now - 30 * 86_400_000),
            attempts: 5,
            avgPercent: 73,
            bestPercent: 90,
            lessons: 2,
            lastActive: iso(now - HOUR),
            byDay: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), attempts: i === 13 ? 2 : 0 })),
            byLesson: Array.from({ length: 12 }, (_, i) => ({ lesson: i + 1, attempts: i < 2 ? 2 : 0, avgPercent: i < 2 ? 73 : null })),
            bySkill: [{ category: "dictation", attempts: 2, avgPercent: 55, bestPercent: 70 }],
            recent: [{ category: "quiz", lesson: 2, percent: 80, createdAt: iso(now - HOUR) }],
          },
        }),
        { status: 200 }
      );
    })
  );
  const { default: TeacherView } = await import("@/components/study/teacher/teacher-view");
  const utils = render(<TeacherView />);
  await waitFor(() => expect(utils.getByTestId("teacher-ready")).toBeDefined());
  return utils;
};

const rowNames = (utils: ReturnType<typeof render>) =>
  (utils.getAllByTestId("teacher-row") as HTMLElement[]).map((el) =>
    (el.querySelector("span.truncate") as HTMLElement).textContent
  );

const clickChip = (utils: ReturnType<typeof render>) =>
  fireEvent.click(utils.getByTestId("teacher-active-chip"));

describe("r378 — چیپِ نبضِ زندهٔ ۲۴ساعت", () => {
  it("① قفلِ منبع: activeIn24h تکمنبعِ teacher-csv (بدونِ دوقلوی محلی)؛ هیزمِ جست‌وجو دستنخورده (مرزِ دوگویشی r375)؛ بی رویدادِ نو؛ دفتر از report.roster", () => {
    const src = read("src/components/study/teacher/teacher-view.tsx");
    // موتورِ واحد — import از کتابخانه، بدونِ تعریفِ محلی
    expect(src).toContain('import { downloadClassCsv, activeIn24h } from "@/lib/teacher-csv"');
    expect(src).not.toMatch(/function activeIn24h/);
    expect(src).not.toMatch(/const activeIn24h\s*=/);
    // دقیقاً دو جایگاهِ فراخوانی: فیلترِ چیپ + شمارندهٔ چیپ — هیچ سومی
    expect(src.split("activeIn24h(").length - 1).toBe(2);
    // ساعتِ پنجره از snapshotِ گزارش میآید — نه ساعتِ رندر
    expect(src).toContain("report ? Date.parse(report.generatedAt) : 0");
    // مرزِ دوگویشی: هیزمِ جست‌وجو همان r375 — وضعیت هرگز توکنِ متن نمیشود
    expect(src).toContain('normalizeFa(r.name + (r.weakest ? " " + skillLabel(r.weakest.category) : ""))');
    // چیپ با aria-pressed — دکمهٔ وضعیت، نه عضوِ گروهِ مرتبسازی
    expect(src).toContain("aria-pressed={activeOnly}");
    // قراردادهایِ r374 پابرجا: بی transition-all؛ دفتر از report.roster؛ بی رویدادِ نو
    expect(src).not.toContain("transition-all");
    expect(src).toContain("report.roster.filter((r) => r.attempts > 0");
    expect(src).toContain("visibleRoster.map(");
    expect(src).not.toContain('trackEvent("teacher_active');
    expect(src).not.toContain("teacher_search");
    // سه testidِ قراردادیِ راند
    expect(src).toContain('data-testid="teacher-active-chip"');
    expect(src).toContain('data-testid="teacher-active-badge"');
    expect(src).toContain('data-testid="teacher-active-empty"');
  });

  it("② نشانِ چیپ = شمارندهٔ یادگیرنده (۲) ≠ کارتِ آمار (تلاشِ ۷) — هر سطح به گویشِ خودش (پیشینهٔ r363)", async () => {
    const utils = await openPanel();
    expect(utils.getByTestId("teacher-active-badge").textContent).toBe("۲");
    const card = [...utils.container.querySelectorAll("p")].find((p) => p.textContent?.trim() === "فعال در ۲۴ ساعت");
    expect(card?.parentElement?.querySelector("p[dir]")?.textContent).toBe("۷");
    // پیشفرض: خاموش — کلِ فهرست
    expect(utils.getByTestId("teacher-active-chip").getAttribute("aria-pressed")).toBe("false");
    expect(rowNames(utils)).toHaveLength(4);
  });

  it("③ کلیکِ چیپ: فقط زندهها (سارا + آرشِ مرزی)؛ aria-pressed=true؛ سرشماریِ سربرگ کلِ کلاس میماند", async () => {
    const utils = await openPanel();
    clickChip(utils);
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا", "آرش"]));
    expect(utils.getByTestId("teacher-active-chip").getAttribute("aria-pressed")).toBe("true");
    expect(utils.getByText("یادگیرندگان (۴)")).toBeDefined();
  });

  it("④ مرزِ inclusivoِ پنجره — آرشِ «دقیقاً ۲۴ساعت پیش» زنده میماند (همان قراردادِ ستونِ r377؛ داده‌محور با generatedAtِ ثابت)", async () => {
    const utils = await openPanel([mkRow("مرزی", 1, iso(now - 24 * HOUR), "h-edge"), mkRow("کهنه", 1, iso(now - 24 * HOUR - 1000), "h-old")]);
    clickChip(utils);
    await waitFor(() => expect(rowNames(utils)).toEqual(["مرزی"]));
  });

  it("⑤ تقاطعِ صادق: چیپ × جست‌وجو — «سارا» زیرِ چیپ یک ردیف؛ پاکسازیِ جست‌وجو چیپ را نمیرد", async () => {
    const utils = await openPanel();
    clickChip(utils);
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا", "آرش"]));
    fireEvent.change(utils.getByTestId("teacher-search-input"), { target: { value: "سارا" } });
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا"]));
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۱ یادگیرنده یافت شد");
    // پاکسازی با دکمه — چیپ پابرجا: دوباره هر دوِ زنده
    fireEvent.click(utils.getByTestId("teacher-search-clear"));
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا", "آرش"]));
    expect(utils.getByTestId("teacher-active-chip").getAttribute("aria-pressed")).toBe("true");
    // خاموشیِ چیپ ⇒ کلِ فهرست
    clickChip(utils);
    await waitFor(() => expect(rowNames(utils)).toHaveLength(4));
    expect(utils.queryByTestId("teacher-search-count")).toBeNull();
  });

  it("⑥ جست‌وجوِ بیجواب زیرِ چیپ — خالیِ جست‌وجو درِ چیپ را هم نام میبرد (hintِ سه‌درِه)", async () => {
    const utils = await openPanel();
    clickChip(utils);
    fireEvent.change(utils.getByTestId("teacher-search-input"), { target: { value: "علی" } });
    await waitFor(() => expect(utils.getByTestId("teacher-search-empty")).toBeDefined());
    expect(utils.getByTestId("teacher-search-count").textContent).toBe("۰ یادگیرنده یافت شد");
    expect(utils.getByTestId("teacher-search-empty").textContent).toContain("چیپِ «فعال» را بردار");
    // بی‌چیپ: hintِ آشنایِ r375 دستنخورده
    clickChip(utils);
    fireEvent.change(utils.getByTestId("teacher-search-input"), { target: { value: "علی" } });
    await waitFor(() => expect(rowNames(utils)).toEqual(["علی"]));
  });

  it("⑦ نبضِ بیزنده — کلاسِ کاملاً خاموش زیرِ چیپ: خالیِ صادقانهٔ سوم («هیچ یادگیری زنده نیست») ≠ دو خالیِ کهنه", async () => {
    const utils = await openPanel([
      mkRow("کهنهٔ یک", 4, iso(now - 30 * HOUR), "h-o1"),
      mkRow("کهنهٔ دو", 2, iso(now - 50 * HOUR), "h-o2"),
      mkRow("بیتلاش", 0, null),
    ]);
    expect(utils.getByTestId("teacher-active-badge").textContent).toBe("۰");
    clickChip(utils);
    await waitFor(() => expect(utils.getByTestId("teacher-active-empty")).toBeDefined());
    expect(utils.getByTestId("teacher-active-empty").textContent).toContain("در ۲۴ ساعتِ گذشته هیچ یادگیری زنده نیست");
    expect(utils.getByTestId("teacher-active-empty").textContent).toContain("چیپِ «فعال» را بردار");
    expect(utils.queryAllByTestId("teacher-row")).toHaveLength(0);
    // خاموشی ⇒ فهرستِ کامل برمیگردد — هیچ دامِ ردیفِ دروغگو
    clickChip(utils);
    await waitFor(() => expect(rowNames(utils)).toHaveLength(3));
  });

  it("⑧ کلاسِ خالی × چیپ — فیلتر جواب میدهد نه سرشماری (فلسفهٔ r374⑨): خالیِ نبض، نه «کلاسِ خالی»", async () => {
    const utils = await openPanel([]);
    await waitFor(() => expect(utils.getByTestId("teacher-roster-empty")).toBeDefined());
    clickChip(utils);
    await waitFor(() => expect(utils.getByTestId("teacher-active-empty")).toBeDefined());
  });

  it("⑨ صداقتِ پرونده زیرِ چیپ — روزنامه همیشه از report.roster: چهار سطرِ کامل در بایتها، نه دو سطرِ فیلترشده", async () => {
    // [ترتیبِ ابزاری] پنل اول رندر میشود؛ جاسوسیِ appendChild فقط حینِ
    // کلیکِ دانلود فعال است — جاسوسیِ زودهنگام اتصالِ کانتینرِ RTL را میشکند
    const utils = await openPanel();
    clickChip(utils);
    await waitFor(() => expect(rowNames(utils)).toEqual(["سارا", "آرش"]));
    let captured: Blob | null = null;
    const originalCOU = globalThis.URL.createObjectURL;
    const originalRevoke = globalThis.URL.revokeObjectURL;
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      value: (b: Blob) => { captured = b; return "blob:r378"; },
      writable: true, configurable: true,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: () => {}, writable: true, configurable: true });
    const appended: HTMLElement[] = [];
    const origAppend = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((el: HTMLElement) => { appended.push(el); return origAppend(el); }) as typeof document.body.appendChild;
    try {
      fireEvent.click(utils.getByLabelText("دانلود روزنامهٔ کلاس (CSV)"));
      await waitFor(() => expect(captured).not.toBeNull());
      const buf = new Uint8Array(await (captured as unknown as Blob).arrayBuffer());
      const text = new TextDecoder("utf-8").decode(buf.slice(3)); // BOM را میبلعد
      const lines = text.split("\r\n").filter(Boolean);
      expect(lines).toHaveLength(5); // سربرگ + ۴ سطرِ کاملِ کلاس — فیلترِ نما دامنه را تنگ نمیکند
      expect(lines[0]).toContain("فعال در ۲۴ ساعت");
      expect(text).toContain("علی"); // بیتلاشِ بیرونِ فیلتر هم در پرونده است
      expect(text).toContain("بلیت‌آزمای QA");
      const anchor = appended.find((el) => (el as HTMLAnchorElement).download?.startsWith("vision2-class-"));
      expect(anchor).toBeDefined();
    } finally {
      document.body.appendChild = origAppend;
      Object.defineProperty(globalThis.URL, "createObjectURL", { value: originalCOU, writable: true, configurable: true });
      Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: originalRevoke, writable: true, configurable: true });
    }
  });

  it("⑩ مرتبسازیِ معلم زیرِ چیپ حاکم میماند — کلیدِ «نام» با فیلترِ نبض، داده‌محور با localeCompare", async () => {
    const utils = await openPanel();
    clickChip(utils);
    fireEvent.click(utils.getByTestId("teacher-sort-name"));
    await waitFor(() => {
      const names = rowNames(utils);
      expect(names).toHaveLength(2);
      expect(names).toEqual([...names].sort((a, b) => (a as string).localeCompare(b as string, "fa")));
    });
  });

  it("⑪ گویشِ نشان: faNumِ فارسی — هیچ رقمیِ لاتین در نشان و عنوان (قراردادِ خانواده)", async () => {
    const utils = await openPanel();
    expect(utils.getByTestId("teacher-active-badge").textContent).toMatch(/^[۰-۹]+$/);
    expect(utils.getByTestId("teacher-active-chip").getAttribute("title")).toContain("یادگیرنده");
  });
});
