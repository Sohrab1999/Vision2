import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

// ------------------------------------------------------------------
// r396 — کتابخانهٔ مشترکِ QA (qa-lib.sh) — الگویِ دوقلو رویِ خودِ QA.
//
// سرشماریِ راند: ۱۰۹ اسکریپتِ qa-r*.sh — wait_home ×۱۸ / seed_guard ×۱۲ /
// to_dark ×۱۲ / ensure_alive ×۷ / ... — هشِ بایتی «فقط یک جفت» همسان
// میداد، اما بازبینیِ چشمی: تفاوتها نویزِ قالببندی است (فاصله/کامنت/
// شکستِ خط/«home-ready-after-») و بدنِ معنایی بایتبهبایت یکی است —
// درسِ r385 دو-نام، نسخهٔ bash: نویزِ قالبی خانواده را پنهان میکرد.
//
// تصمیمهایِ حکم:
//  ① مالک: scripts/qa-lib.sh با پیشوندِ qa_ (نیمفضایِ نام — تابعِ
//     کتابخانه ≠ گویشِ محلیِ اسکریپت).
//  ② انجمادِ تاریخی: ۱۰۹ اسکریپتِ qa-r341..r395 مهاجرت نمیشوند —
//     شاهدِ داوریِ خودشان‌اند؛ بازنویسی فقط هزینهٔ بازاجرا دارد.
//     مهاجرت پیشرو است: نخستین مصرفکننده qa-r396-playall-healthy.sh.
//  ③ گویشهایِ آزاد: سناریو/انکرها/NEEDLEها سمتِ میزبان؛ بذرِ شخصیت
//     (آرش-قهرمان) در همهٔ نسخهها یکی — پارامتریسازیاش REQUIRES-VERDICT.
//  ④ درسهایِ یکجاشده: SCENE-CLEAR و revive (r395) و استابِ صدا با
//     mode «ended» (r396 — پراکندنِ ended تا توالیِ playAll در هدلس
//     واقعاً پیش برود).
// ------------------------------------------------------------------

const p = (f: string) => readFileSync(join(process.cwd(), f), "utf8");

const LIB = "scripts/qa-lib.sh";
const FIRST_CONSUMER = "scripts/qa-r396-playall-healthy.sh";

const LIB_FUNCS = [
  "qa_shot()",
  "qa_rec()",
  "qa_count_reset()",
  "qa_wait_home()",
  "qa_seed_guard()",
  "qa_ensure_alive()",
  "qa_to_dark()",
  "qa_to_light()",
  "qa_toast_identity()",
  "qa_click_toast_q()",
  "qa_wait_toasts_clear()",
  "qa_click_expect_no_toast()",
  "qa_tts_count_on()",
  "qa_tts_fail_on()",
  "qa_tts_restore()",
  "qa_audio_stub_on()",
  "qa_audio_stub_off()",
  "qa_stub_count()",
] as const;

describe("r396 — مالکِ کتابخانهٔ QA", () => {
  it("همهٔ ۱۸ تابعِ مالک در qa-lib.sh زندهاند", () => {
    const lib = p(LIB);
    for (const fn of LIB_FUNCS) expect(lib, fn).toContain(fn);
  });

  it("قراردادِ میزبان: QA_SEED_FILE اجباری است (:? syntax) — اسکریپتِ بیقرارداد زود بمیرد", () => {
    const lib = p(LIB);
    expect(lib).toContain('${QA_SEED_FILE:?');
  });

  it("درسهایِ یکجاشده در سرصفحهٔ مالک ثبتند — SCENE-CLEAR و revive و استابِ ended", () => {
    const lib = p(LIB);
    expect(lib).toContain("wait_toasts_clear"); // r395
    expect(lib).toContain("revive"); // r395
    expect(lib).toContain("dispatchEvent(new Event('ended'))"); // r396
    expect(lib).toContain("__endedCount");
  });

  it("حکمِ انجماد در سرصفحه ثبت است — مهاجرت فقط پیشرو", () => {
    const lib = p(LIB);
    expect(lib).toContain("qa-r341..r395");
    expect(lib).toContain("qa-r396-playall-healthy.sh");
  });

  it("bash -n بر کتابخانه میگذرد", () => {
    expect(() => execSync(`bash -n ${LIB}`)).not.toThrow();
  });
});

describe("r396 — نخستین مصرفکننده", () => {
  it("qa-r396 کتابخانه را source میکند و هیچ دستنویسیِ مالک ندارد", () => {
    const s = p(FIRST_CONSUMER);
    expect(s).toContain('source /home/z/my-project/scripts/qa-lib.sh');
    // توابعِ مالک نباید در مصرفکننده بازتعریف شوند (دو-نامِ r385 ممنوع)
    expect(s).not.toMatch(/^qa_wait_home\(\)/m);
    expect(s).not.toMatch(/^wait_home\(\)/m);
    expect(s).not.toMatch(/^qa_wait_toasts_clear\(\)/m);
    expect(s).not.toMatch(/^qa_audio_stub_on\(\)/m);
  });

  it("bash -n بر مصرفکننده میگذرد", () => {
    expect(() => execSync(`bash -n ${FIRST_CONSUMER}`)).not.toThrow();
  });

  it("سناریوی راند: استابِ ended → playAllِ سالم → کنترلِ مثبتِ r394 با reload", () => {
    const s = p(FIRST_CONSUMER);
    expect(s).toContain("qa_audio_stub_on ended");
    expect(s).toContain("playall-clicked");
    expect(s).toContain("location.reload"); // کشِ ماژول را پاک میکند (خطِ بیکش)
    expect(s).toContain("پخش صدا ممکن نشد");
  });
});

describe("r396 — انجمادِ تاریخی (نمونهبرداری)", () => {
  it("اسکریپتهایِ تاریخی دستنخوردهاند — هنوز helperهایِ خودشان را دارند", () => {
    // هیچکدام از راندهایِ نمونه (سه دهه) کتابخانه را source نمیکنند
    for (const f of [
      "scripts/qa-r345-audio-failpath.sh",
      "scripts/qa-r390-pair-speak-chips.sh",
      "scripts/qa-r395-negctl-audio.sh",
    ]) {
      expect(p(f), f).not.toContain("qa-lib.sh");
    }
    // و آنهایی که wait_home دارند، هنوز دستنویسِ خودشان است
    for (const f of [
      "scripts/qa-r345-audio-failpath.sh",
      "scripts/qa-r395-negctl-audio.sh",
    ]) {
      expect(p(f), f).toMatch(/^wait_home[ (]/m);
    }
  });

  it("فقط r396 به کتابخانه وابسته است — سرشماریِ مصرفکننده", () => {
    const hits = execSync(`rg -l 'scripts/qa-lib.sh' scripts/ || true`)
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean);
    expect(hits).toEqual([FIRST_CONSUMER]);
  });
});
