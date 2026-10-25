// r337 — قفلهایِ سویپِ زندهٔ هدرِ شخصیت‌دار در دسکتاپِ ۱۲۸۰ (پیشنهادِ ②ِ r336):
//   چهار عضوِ دیگرِ خانوادهٔ c-chip (due/goal/freeze + شاخهٔ توپرِ goal-done)
//   برایِ نخستینبار با دادهٔ پُر در دو تم زندهسنجیده شدند — ده حکمِ dbgِ
//   هدر-scoped، همه صفر. کشفِ مسیرِ داده: حبهٔ مرور (c-chip-due) فقط با
//   کلیدِ واژه (wordKey = "1:ability") mount میشود — srsDueTotal عمداً
//   کلیدهایِ "q:" را نادیده میگیرد (F11) و هیچ personaیی واژهٔ سررسید
//   نمیکاشت → حبه در هیچ persona-sویپی قبلی هرگز رندر نشده بود.
//   درسِ r327 رعایت شده: کامنتها توکنِ ممنوعهٔ کامل را نقل نمیکنند.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");
const css = read("src/app/globals.css");
const header = read("src/components/study/shell/header.tsx");
const goalChip = read("src/components/study/practice/goal-chip.tsx");
const freezeBadge = read("src/components/study/practice/freeze-badge.tsx");
const duePill = read("src/components/study/practice/due-pill.tsx");
const srsEngine = read("src/state/srs-engine.ts");

const lin = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const lum = ([r, g, b]: number[]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const hex = (h: string): number[] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const ratio = (a: string, b: string) => {
  const l1 = lum(hex(a)), l2 = lum(hex(b));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const over = (top: number[], a: number, bottom: number[]) =>
  "#" + top.map((v, i) => Math.round(v * a + bottom[i] * (1 - a)).toString(16).padStart(2, "0")).join("");

// سطحِ تاریکِ هدر: نگاشتِ کرنلِ bg-[#f7f6f2]/85 رویِ بدنهٔ تاریک
const DARK_PAGE = hex("#1c1917");
const DARK_HEADER = hex(over(hex("#0c0a09"), 0.82, DARK_PAGE));

describe("r337 — جفتهایِ زندهسنجیدهٔ خانوادهٔ c-chip (دسکتاپِ ۱۲۸۰، دو تم)", () => {
  it("هدفِ میان‌حالت: زمردی۷۰۰ رویِ زمردی۵۰ = ۵٫۲+ در روشن؛ زمردی۳۰۰ رویِ شستشو = ۱۱+ در تاریک", () => {
    expect(ratio("#047857", "#ecfdf5")).toBeGreaterThanOrEqual(5);
    const darkSurface = over(hex("#063728"), 0.35, DARK_HEADER);
    expect(ratio("#6ee7b7", darkSurface)).toBeGreaterThanOrEqual(11);
  });
  it("هدفِ برآورده (شاخهٔ توپرِ جدا): سفید رویِ زمردی۷۰۰ = ۵٫۴+ و میکرونوارِ سفید۹۰٪ = ۴٫۷+ (غیرمتنِ ۳:۱)", () => {
    expect(ratio("#ffffff", "#047857")).toBeGreaterThanOrEqual(5.4);
    const fill = over(hex("#ffffff"), 0.9, hex("#047857"));
    expect(ratio(fill, "#047857")).toBeGreaterThanOrEqual(4.5);
  });
  it("یخِ انبار: آسمانی۷۰۰ رویِ آسمانی۵۰ = ۵٫۵+ روشن؛ آسمانی۴۰۰ رویِ شستشو = ۸+ تاریک", () => {
    expect(ratio("#0369a1", "#f0f9ff")).toBeGreaterThanOrEqual(5.5);
    const darkSurface = over(hex("#082f3c"), 0.45, DARK_HEADER);
    expect(ratio("#38bdf8", darkSurface)).toBeGreaterThanOrEqual(8);
  });
  it("حبهٔ مرور: رزی۷۰۰ رویِ رزی۵۰ = ۵٫۷+ روشن؛ رزی۳۰۰ رویِ شستشو = ۹٫۵+ تاریک", () => {
    expect(ratio("#be123c", "#fff1f2")).toBeGreaterThanOrEqual(5.5);
    const darkSurface = over(hex("#50121c"), 0.35, DARK_HEADER);
    expect(ratio("#fda4af", darkSurface)).toBeGreaterThanOrEqual(9);
  });
  it("شعله در روشن (جفتِ مکملِ درمانِ r336 که تاریکش را بست): کهربایی۷۰۰ رویِ کهربایی۵۰ = ۴٫۸+", () => {
    expect(ratio("#b45309", "#fffbeb")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("r337 — قفلهایِ منبعِ سطحِ چیپها", () => {
  it("قواعدِ تاریکِ سه عضو عینِ شستشوهایِ سنجیدهشده میمانند — هیچ انحرافی بدونِ شکستنِ این قفل", () => {
    const goal = css.match(/\.dark \.c-chip-goal \{[\s\S]*?\}/);
    expect(goal?.[0]).toContain("background-color: rgba(6, 55, 40, 0.35)");
    expect(goal?.[0]).toContain("color: rgb(110, 231, 183)");
    const freeze = css.match(/\.dark \.c-chip-freeze \{[\s\S]*?\}/);
    expect(freeze?.[0]).toContain("background-color: rgba(8, 47, 60, 0.45)");
    expect(freeze?.[0]).toContain("color: rgb(56, 189, 248)");
    const due = css.match(/\.dark \.c-chip-due \{[\s\S]*?\}/);
    expect(due?.[0]).toContain("background-color: rgba(80, 18, 28, 0.35)");
    expect(due?.[0]).toContain("color: rgb(253, 164, 175)");
  });
  it("شاخهٔ توپرِ هدفِ برآورده از کلاسِ معنایی جداست — متادیتایِ زندهٔ «۱۰ از ۱۰» با همان جفتِ ۵٫۴۸ سرو میگیرد", () => {
    expect(goalChip).toContain('border-emerald-600 bg-emerald-700 text-white');
    expect(goalChip).toContain('meta.done ? "bg-white/90" : "bg-emerald-700"');
  });
  it("قراردادِ نمایان بودن: شعله و یخ فقط دسکتاپ؛ حبه و هدف در همهٔ پهناها — همان پروبِ ۳۹۰", () => {
    const flame = header.match(/className="[^"]*c-chip-flame[^"]*"/);
    expect(flame?.[0]).toContain("hidden");
    expect(flame?.[0]).toContain("sm:inline-flex");
    const freezeBtn = freezeBadge.match(/className="[^"]*c-chip-freeze[^"]*"/);
    expect(freezeBtn?.[0]).toContain("hidden");
    expect(freezeBtn?.[0]).toContain("sm:inline-flex");
    const dueBtn = duePill.match(/className="[^"]*due-pill[^"]*"/);
    expect(dueBtn?.[0]).not.toContain("hidden");
    const goalBtn = goalChip.match(/className=\{`[^`]*goal-chip[^`]*`\}/);
    expect(goalBtn?.[0]).not.toMatch(/(^|[\s`])hidden[\s`]/);
  });
});

describe("r337 — قراردادِ داده: چرا حبه در هیچ persona-sویپی قبلی mount نشده بود", () => {
  it("srsDueTotal کلیدهایِ q: را نادیده میگیرد (F11) — شمارشِ حبه فقط واژههاست", () => {
    const fn = srsEngine.match(/export function srsDueTotal[\s\S]*?\n\}/);
    expect(fn).not.toBeNull();
    expect(fn?.[0]).toContain('!k.startsWith("q:")');
    expect(fn?.[0]).toContain("v.dueAt <= now");
  });
  it("حبه فقط با due>0 و یخ فقط با انبار یا نجاتِ امروز — حالتِ خالیِ رookie همین را ثابت کرد", () => {
    expect(duePill).toContain("{due > 0 && (");
    const meta = freezeBadge.match(/if \(!mounted \|\| !meta\) return null;/);
    expect(meta).not.toBeNull();
    const guard = read("src/lib/freeze-badge.ts").match(/if \(n <= 0\) return null;/);
    expect(guard).not.toBeNull();
  });
});

describe("r337 — قفلِ اجراییِ شخصیتِ «هدرفول» (چهار واریانت)", () => {
  const run = (variant: string) => {
    const r = spawnSync(process.execPath, [join(root, "scripts/r337-persona.js"), variant], {
      encoding: "utf8",
    });
    expect(r.status, variant).toBe(0);
    return JSON.parse(r.stdout).state;
  };
  it("full: زنجیرهٔ ۶ + شش واژهٔ سررسید (۴ تزریقی + ۲ سرآمدِ پایه) + هدفِ ۶/۱۰ + دو یخ", () => {
    const s = run("full");
    expect(s.streak).toBe(6);
    expect(s.lastActiveDay).toBeTruthy();
    const wordDue = Object.keys(s.srs).filter((k: string) => !k.startsWith("q:") && s.srs[k].dueAt <= Date.now());
    expect(wordDue.length).toBe(6);
    expect(s.srs["1:ability"]).toBeTruthy();
    expect(s.dayStat.reviews + s.dayStat.quizzes).toBe(6);
    expect(s.freezeCount).toBe(2);
    expect(s.freezeSavedDay).toBe("");
  });
  it("goal-done: همان + فعالیتِ ۱۰/۱۰ برایِ شاخهٔ توپر", () => {
    const s = run("goal-done");
    expect(s.dayStat.reviews + s.dayStat.quizzes).toBe(10);
  });
  it("freeze-saved: نجاتِ امروز با یک یخِ باقیمانده", () => {
    const s = run("freeze-saved");
    expect(s.freezeSavedDay).toBe(s.dayStat.day);
    expect(s.freezeCount).toBe(1);
  });
  it("empty: rookieِ واقعاً خالی — بدونِ زنجیره/سررسید/یخ/dayStat تا چیپهایِ شرطی خاموش بمانند", () => {
    const s = run("empty");
    expect(s.streak ?? 0).toBe(0);
    expect(s.dayStat).toBeFalsy();
    const wordDue = Object.keys(s.srs ?? {}).filter((k: string) => !k.startsWith("q:") && s.srs[k].dueAt <= Date.now());
    expect(wordDue.length).toBe(0);
    expect(s.freezeCount ?? 0).toBe(0);
  });
});
