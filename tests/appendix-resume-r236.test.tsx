// @vitest-environment jsdom
// ------------------------------------------------------------------
// راند ۲۳۶ — دو لایهٔ نو:
//   A. هدرِ سراسری «ادامهٔ مطالعه» (بندِ ① پیشنهادِ ۲۳۵) — درِ چهارم:
//     ① بی‌رکورد = هیچ دکمه‌ای در هدر نیست
//     ② با رکورد = دکمه با تولوتیپِ کامل (لایه + عنوان + hint)
//     ③ روی خودِ نمایِ ضمیمه پنهان است (نشانگرِ r234 همان‌جاست)
//     ④ واکنش‌پذیر: نوشتنِ رکورد در حالِ mount دکمه را بی‌درنگ می‌آورد
//     ⑤ کلیک = مسیرِ عمیقِ همان لایه + صفرِ نوشتنِ جانبیِ استور
//   B. قلابِ مشترکِ مسیر (r236): هر پنج scope به viewِ درست می‌روند
//   C. رکوردِ مسافر در پشتیبان (بندِ ② پیشنهادِ ۲۳۵):
//     ⑦ parseBackup — رکوردِ سالم سفر می‌کند؛ خراب/ناقص/آرایه = کلید حذف
//     ⑧ applyBackup — پذیرش-اگر-غایب در هر دو جهت + بی‌رکوردِ payload بی‌اثر
//     ⑨ snapshotِ خودکار رکورد را دارد؛ restore آن را برمی‌گرداند
//   D. سینک ابری:
//     ⑩ syncSchema — resumeِ اختیاریِ شیء؛ غیرِ شیء رد می‌شود
//     ⑪ fetchSync — پاکتِ legacy (خودِ data) بدونِ رکورد؛ پاکتِ نو با رکورد؛
//        resumeِ خراب = بی‌رکورد (هیچ شکستنی)
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Header from "@/components/study/shell/header";
import HeaderResumeButton from "@/components/study/shell/header-resume-button";
import { useAppendixResumeNav } from "@/components/study/shared/use-appendix-resume-nav";
import {
  writeAppendixResume,
  readAppendixResume,
  adoptResumeIfAbsent,
} from "@/lib/bg-reading";
import { useStudy } from "@/lib/study-store";
import {
  parseBackup,
  applyBackup,
  maybeAutoBackup,
  restoreAutoBackup,
  readAutoBackup,
  BACKUP_VERSION,
} from "@/lib/backup";
import { syncSchema } from "@/lib/api/validate";
import { fetchSync } from "@/lib/sync";
import type { AppendixResumeItem } from "@/lib/bg-reading";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  // jsdom matchMedia ندارد — SettingsPopover وضعیتِ نصبِ PWA را می‌پرسد
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
    known: {},
    results: {},
    flashIntent: "none",
    streak: 0,
    srs: {},
    starredWords: [],
    syncCode: "",
  } as Partial<ReturnType<typeof useStudy.getState>>);
  cleanup();
});

const phonRecord: AppendixResumeItem = {
  scope: "phonetics",
  id: "ɑː",
  title: "/ɑː/ کشیده آ",
  hint: "arm, father",
};

describe("the header resume button — the fourth door (r236)", () => {
  it("no record: the header renders no resume button at all", () => {
    render(<Header />);
    expect(screen.queryByTestId("header-resume-button")).toBeNull();
  });

  it("with a record: the button appears with the full tooltip (layer + title + hint)", () => {
    writeAppendixResume(phonRecord);
    render(<Header />);
    const btn = screen.getByTestId("header-resume-button");
    const label = btn.getAttribute("aria-label") ?? "";
    expect(label).toContain("ادامهٔ مطالعه از «/ɑː/ کشیده آ»");
    expect(label).toContain("در جدول تلفظ");
    expect(label).toContain("arm, father");
  });

  it("hidden on the appendix view itself — the r234 pill owns that header", () => {
    writeAppendixResume(phonRecord);
    useStudy.setState({ view: { type: "appendix" } } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<Header />);
    expect(screen.queryByTestId("header-resume-button")).toBeNull();
  });

  it("reactive: writing a record while mounted summons the button — no remount", () => {
    render(<Header />);
    expect(screen.queryByTestId("header-resume-button")).toBeNull();
    // نوشتنِ storeِ خارجی داخلِ act تا رندرِ واکنشی همگام شود
    act(() => {
      writeAppendixResume(phonRecord);
    });
    expect(screen.getByTestId("header-resume-button")).toBeInTheDocument();
  });

  it("click deep-links the same layer — with zero learning-store side-writes", () => {
    writeAppendixResume(phonRecord);
    render(<Header />);
    fireEvent.click(screen.getByTestId("header-resume-button"));
    expect(useStudy.getState().view).toEqual({
      type: "appendix",
      phonemeId: "ɑː",
    });
    expect(useStudy.getState().known).toEqual({});
    expect(useStudy.getState().results).toEqual({});
  });
});

describe("the shared nav hook maps all five scopes (r236)", () => {
  it("grammar/pos/phonetics/abbrev/verbs each land on their own anchor view", () => {
    const probeCases: AppendixResumeItem[] = [
      { scope: "grammar", id: "bg-subject-pronouns", title: "ضمایر فاعلی" },
      { scope: "pos", id: "t10-v1", title: "دهم · درس اول" },
      { scope: "phonetics", id: "ʌ", title: "/ʌ/ کوتاه آ" },
      { scope: "abbrev", id: "n", title: "n — اسم" },
      { scope: "verbs", id: "be", title: "be · was / were · been" },
    ];
    const expectedFor = (r: AppendixResumeItem) =>
      r.scope === "grammar"
        ? { type: "appendix", topicId: r.id }
        : r.scope === "pos"
          ? { type: "appendix", posTableId: r.id }
          : r.scope === "phonetics"
            ? { type: "appendix", phonemeId: r.id }
            : r.scope === "abbrev"
              ? { type: "appendix", abbrevSym: r.id }
              : { type: "appendix", verbBase: r.id };
    for (const r of probeCases) {
      const { unmount } = render(<NavProbe record={r} />);
      fireEvent.click(screen.getByRole("button"));
      expect(useStudy.getState().view).toEqual(expectedFor(r));
      unmount();
    }
  });
});

/** پرابِ کوچکِ مسیر — هر رندر یک رکورد، هر کلیک یک پرشِ واقعی */
function NavProbe({ record }: { record: AppendixResumeItem }) {
  const navigate = useAppendixResumeNav();
  return <button type="button" onClick={() => navigate(record)}>go</button>;
}

describe("the resume record travels in backups (r236)", () => {
  const minimalData = {}; // sanitizeAll همهٔ فیلدها را پیش‌فرض می‌دهد

  it("parseBackup round-trips a healthy resume; malformed shapes drop the key entirely", () => {
    const good = parseBackup(
      JSON.stringify({
        app: "vision2-webbook",
        version: BACKUP_VERSION,
        exportedAt: "2026-10-16T03:00:00Z",
        data: minimalData,
        resume: phonRecord,
      }),
    );
    expect(good.resume).toEqual(phonRecord);

    // رکورد با hint خراب → hint دور ریخته می‌شود نه کل رکورد
    const partial = parseBackup(
      JSON.stringify({
        app: "vision2-webbook",
        version: BACKUP_VERSION,
        data: minimalData,
        resume: { scope: "abbrev", id: "n", title: "n — اسم", hint: 42 },
      }),
    );
    expect(partial.resume).toEqual({ scope: "abbrev", id: "n", title: "n — اسم" });

    // خراب‌ها: JSON تودرتو نامعتبر / scope ناشناخته / آرایه / ناقص
    for (const bad of [
      { scope: "future-layer", id: "x", title: "t" },
      ["phonetics"],
      { scope: "verbs", id: "be" },
      "garbage",
    ]) {
      const p = parseBackup(
        JSON.stringify({ app: "vision2-webbook", version: BACKUP_VERSION, data: minimalData, resume: bad }),
      );
      expect(p.resume).toBeUndefined();
    }

    // legacy payload بدونِ resume اصلاً کلید ندارد
    const legacy = parseBackup(
      JSON.stringify({ app: "vision2-webbook", version: BACKUP_VERSION, data: minimalData }),
    );
    expect("resume" in legacy).toBe(false);
  });

  it("applyBackup adopts the travelling record only when this device has none", () => {
    const payload = {
      app: "vision2-webbook" as const,
      version: BACKUP_VERSION,
      exportedAt: "2026-10-16T03:00:00Z",
      data: {} as never,
      resume: phonRecord,
    };
    // دستگاه بی‌رکورد → پذیرش
    expect(applyBackup(payload)).toBe(true);
    expect(readAppendixResume()).toEqual(phonRecord);

    // دستگاه رکورددار → «آخرینِ دیده‌شدهٔ» محلی می‌ماند (سیاستِ پذیرش-اگر-غایب)
    const local: AppendixResumeItem = { scope: "abbrev", id: "n", title: "n — اسم", hint: "(noun)" };
    writeAppendixResume(local);
    expect(applyBackup(payload)).toBe(true);
    expect(readAppendixResume()).toEqual(local);

    // payload بی‌رکورد هیچ خرابکاری در رکوردِ محلی نمی‌کند
    localStorage.removeItem("vision2-bg-last-item");
    expect(
      applyBackup({ app: "vision2-webbook", version: BACKUP_VERSION, exportedAt: "", data: {} as never }),
    ).toBe(true);
    expect(readAppendixResume()).toBeNull();
  });

  it("the auto-snapshot carries the record and its restore adopts it on a blank device", () => {
    writeAppendixResume(phonRecord);
    // force — «پیشرفتِ» واقعی لازم نیست تا snapshot ساخته شود
    expect(maybeAutoBackup(true)).toBe("written");
    const snap = readAutoBackup();
    expect(snap?.resume).toEqual(phonRecord);

    // دستگاه تازه: همه‌چیز پاک به‌جز خودِ snapshot — restore رکورد را برمی‌گرداند
    const raw = localStorage.getItem("vision2-auto-backup");
    localStorage.clear();
    if (raw) localStorage.setItem("vision2-auto-backup", raw);
    expect(readAppendixResume()).toBeNull();
    expect(restoreAutoBackup()).toBe(true);
    expect(readAppendixResume()).toEqual(phonRecord);
  });
});

describe("the resume record travels in cloud sync (r236)", () => {
  it("syncSchema accepts an optional object resume and rejects non-objects", () => {
    const base = { userId: "learner-1", data: { known: {}, results: {} } };
    expect(syncSchema.safeParse({ ...base, resume: { scope: "verbs", id: "be" } }).success).toBe(true);
    expect(syncSchema.safeParse(base).success).toBe(true); // اختیاری
    expect(syncSchema.safeParse({ ...base, resume: ["verbs"] }).success).toBe(false);
    expect(syncSchema.safeParse({ ...base, resume: "garbage" }).success).toBe(false);
  });

  it("fetchSync unwraps both envelopes: legacy plain data (no resume) and the new {data, resume}", async () => {
    const syncData = { known: {}, results: {} };
    // legacy — snapshotهایِ کهنه: خودِ SyncData؛ بدونِ رکورد
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ updatedAt: "2026-10-15T00:00:00Z", data: syncData }), { status: 200 }),
      ),
    );
    const legacy = await fetchSync("K7QM-34XP");
    expect(legacy.ok).toBe(true);
    expect(legacy.data?.known).toEqual({});
    expect(legacy.resume).toBeUndefined();

    // پاکتِ نو — data + resume
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            updatedAt: "2026-10-16T03:00:00Z",
            data: { data: syncData, resume: phonRecord },
          }),
          { status: 200 },
        ),
      ),
    );
    const modern = await fetchSync("K7QM-34XP");
    expect(modern.ok).toBe(true);
    expect(modern.data?.known).toEqual({});
    expect(modern.resume).toEqual(phonRecord);

    // رکوردِ خراب در پاکت = بی‌رکورد (هیچ شکستنی)
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ updatedAt: "", data: { data: syncData, resume: { scope: 7 } } }),
          { status: 200 },
        ),
      ),
    );
    const corrupt = await fetchSync("K7QM-34XP");
    expect(corrupt.ok).toBe(true);
    expect(corrupt.resume).toBeUndefined();
    vi.unstubAllGlobals();
  });

  it("the adopt policy is exported and honest: sanitize-first, absent-only", () => {
    localStorage.removeItem("vision2-bg-last-item");
    // رکوردِ خراب پذیرفته نمی‌شود
    expect(adoptResumeIfAbsent({ scope: "nope", id: "x", title: "t" })).toBe("kept-local");
    expect(readAppendixResume()).toBeNull();
    // رکوردِ سالم روی دستگاهِ بی‌رکورد پذیرفته می‌شود
    expect(adoptResumeIfAbsent(phonRecord)).toBe("adopted");
    expect(readAppendixResume()).toEqual(phonRecord);
    // دستگاه رکورددار شد — مسافرِ بعدی پذیرفته نمی‌شود
    expect(adoptResumeIfAbsent({ scope: "abbrev", id: "n", title: "n — اسم" })).toBe("kept-local");
    expect(readAppendixResume()?.id).toBe("ɑː");
  });
});

describe("pill vs header consistency (r236)", () => {
  it("the r234 appendix pill still hides the header button — but HeaderResumeButton standalone hides on appendix view", async () => {
    writeAppendixResume(phonRecord);
    useStudy.setState({ view: { type: "appendix" } } as Partial<ReturnType<typeof useStudy.getState>>);
    render(<HeaderResumeButton />);
    expect(screen.queryByTestId("header-resume-button")).toBeNull();
    // برگشت به خانه → دکمه می‌آید (واکنش به view، نه فقط رکورد)
    useStudy.setState({ view: { type: "home" } } as Partial<ReturnType<typeof useStudy.getState>>);
    await waitFor(() => {
      expect(screen.getByTestId("header-resume-button")).toBeInTheDocument();
    });
  });
});
