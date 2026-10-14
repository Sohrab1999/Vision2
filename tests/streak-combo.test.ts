// ------------------------------------------------------------------
// Task 150 — قراردادِ خالصِ نشانِ ترکیبی زنجیره (streakComboMeta).
// چیپِ یکپارچهٔ شعله×یخ جای دو چیپِ جدا نشسته؛ ترکیب‌بندی:
//   ① تازه‌واردِ کامل (زنجیرهٔ صفر، بی‌یخ، بدونِ نجات) → هیچ
//   ② شعلهٔ لخت → flame-only با عنوانِ عینِ چیپِ قدیم (واژه‌به‌واژه)
//   ③ شعله + مخزن → combo؛ عنوان = شعله؛ یخ (ترتیبِ ثابت)
//   ④ شعله + نجاتِ امروز → combo با یخِ saved («نجات شد»)
//   ⑤ زنجیرهٔ صفر + یخ → ice-only (موتور واقعی جلویش را می‌گیرد، ولی
//     قراردادِ دفاعی: persistِ خراب هرگز چیپِ خراب نمی‌سازد)
//   ⑥ کفِ ورودی: کسر و منفی و NaN هرگز چیپ نمی‌سازند
//   ⑦ today پارامتری: نجاتِ دیروز نجاتِ امروز نیست
// منبعِ یخ همان freezeBadgeMeta است — تست‌هایِ tests/freeze-badge.test.ts
// عمقِ آن قرارداد را قفل کرده‌اند؛ اینجا فقط ترکیب و ترتیب قفل می‌شود.
// ------------------------------------------------------------------

import { describe, it, expect } from "vitest";
import { streakComboMeta } from "@/lib/streak-combo";
import { freezeBadgeMeta } from "@/lib/freeze-badge";

const T = "2026-10-14";

describe("نشانِ ترکیبی زنجیره — قراردادِ خالص (Task 150)", () => {
  it("تازه‌واردِ کامل → هیچ (نه شعله، نه یخ، نه نجات)", () => {
    expect(streakComboMeta({ streak: 0, freezeCount: 0, freezeSavedDay: "", today: T })).toBeNull();
  });

  it("شعلهٔ لخت: flame-only، عنوانِ عینِ چیپِ قدیم، یخِ غایب", () => {
    const meta = streakComboMeta({ streak: 9, freezeCount: 0, freezeSavedDay: "", today: T });
    expect(meta).not.toBeNull();
    expect(meta!.mode).toBe("flame-only");
    expect(meta!.streak).toBe(9);
    expect(meta!.ice).toBeNull();
    expect(meta!.title).toBe("زنجیرهٔ ۹ روزه مطالعه");
  });

  it("شعله + مخزن: combo، برچسبِ یخ «۲ یخ»، عنوان = شعله؛ یخ با «؛»", () => {
    const meta = streakComboMeta({ streak: 9, freezeCount: 2, freezeSavedDay: "", today: T });
    expect(meta!.mode).toBe("combo");
    expect(meta!.ice!.mode).toBe("stock");
    expect(meta!.ice!.label).toBe("۲ یخ");
    expect(meta!.title).toContain("زنجیرهٔ ۹ روزه مطالعه؛ ۲ یخِ زنجیره داری");
  });

  it("شعله + نجاتِ امروز: combo با یخِ saved — «۹ · نجات شد» در یک عنوان", () => {
    const meta = streakComboMeta({ streak: 5, freezeCount: 1, freezeSavedDay: T, today: T });
    expect(meta!.mode).toBe("combo");
    expect(meta!.ice!.mode).toBe("saved");
    expect(meta!.ice!.label).toBe("نجات شد");
    expect(meta!.title).toContain("زنجیرهٔ ۵ روزه مطالعه؛ امروز یخ، زنجیره را نجات داد");
  });

  it("زنجیرهٔ صفر + مخزن: ice-only — عنوان فقط یخ است (بدونِ «؛»)", () => {
    const meta = streakComboMeta({ streak: 0, freezeCount: 2, freezeSavedDay: "", today: T });
    expect(meta!.mode).toBe("ice-only");
    expect(meta!.title).not.toContain("؛");
    expect(meta!.title).toBe(freezeBadgeMeta({ freezeCount: 2, freezeSavedDay: "", today: T })!.title);
  });

  it("زنجیرهٔ صفر + نجاتِ امروز: ice-only (قراردادِ دفاعی — موتور اجازه‌اش را نمی‌دهد)", () => {
    const meta = streakComboMeta({ streak: 0, freezeCount: 0, freezeSavedDay: T, today: T });
    expect(meta!.mode).toBe("ice-only");
    expect(meta!.title).toContain("نجات");
  });

  it("کفِ ورودی: ۹٫۷ → ۹، −۳ → صفر، مخزنِ ۲٫۷ → «۲ یخ»", () => {
    expect(streakComboMeta({ streak: 9.7, freezeCount: 0, freezeSavedDay: "", today: T })!.title).toBe(
      "زنجیرهٔ ۹ روزه مطالعه"
    );
    expect(streakComboMeta({ streak: -3, freezeCount: 0, freezeSavedDay: "", today: T })).toBeNull();
    expect(streakComboMeta({ streak: 4, freezeCount: 2.7, freezeSavedDay: "", today: T })!.ice!.label).toBe(
      "۲ یخ"
    );
  });

  it("today پارامتری: نجاتِ دیروز نجاتِ امروز نیست — مخزنِ معمولی می‌ماند", () => {
    const meta = streakComboMeta({ streak: 9, freezeCount: 1, freezeSavedDay: "2026-10-13", today: T });
    expect(meta!.ice!.mode).toBe("stock");
    expect(meta!.ice!.label).toBe("۱ یخ");
  });

  it("سه حالتِ mode نمایندهٔ کل فضای خروجی‌اند (هیچ حالتِ چهارمی ممکن نیست)", () => {
    const modes = new Set(
      [
        streakComboMeta({ streak: 0, freezeCount: 0, freezeSavedDay: "", today: T })?.mode, // null
        streakComboMeta({ streak: 9, freezeCount: 0, freezeSavedDay: "", today: T })!.mode,
        streakComboMeta({ streak: 0, freezeCount: 2, freezeSavedDay: "", today: T })!.mode,
        streakComboMeta({ streak: 9, freezeCount: 2, freezeSavedDay: "", today: T })!.mode,
      ].filter(Boolean)
    );
    expect(modes).toEqual(new Set(["flame-only", "ice-only", "combo"]));
  });
});
