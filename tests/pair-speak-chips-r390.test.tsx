// @vitest-environment jsdom
// ------------------------------------------------------------------
// r390 — «چیپِ «روخوانی جفت» یک نام گرفت» — مالک:
//        src/components/study/lesson/pair-speak-chips.tsx
//
// سه حکمی که این فایل قفل میکند:
//  ① سرشماریِ r390 (الگویِ r382..r389): دکمهٔ جفتِ مترادف/متضاد با شش
//     عضوِ بایتهمسان در شش نما تکرار می‌شد (دیکشنری/واژگان/فلش‌کارت/
//     واژهٔ روز/واژه‌هایِ من/داورِ خطر): key + title + aria + آیکونِ
//     ≈/↔ + کلیکِ speak(0.95, undefined, onError) + سرریزِ «+N».
//     حالا یک مالک دارد و شش نما وامگیرند — قراردادِ واحد: «کلیکِ
//     همتا را روخوانی میکند» و هیچ فراخوانِ بی-onErrorای نمیماند
//     (زبانِ خانوادهٔ شکستِ r345 سمتِ میزبان پابرجا).
//  ② گویشهایِ میزبانِ عمدی پابرجا: ظرفِ چیدمان سمتِ میزبان،
//     stopPropagation (کارتِ بلدم/فلش‌کارت)، tone sky/flip، گویشِ
//     فشردهٔ ردیفِ خطر (compact + max=2 + titleِ سرریز).
//  ③ حکمِ «نخیر»ها: SpeakButton و روخوانیهایِ تک‌واژه قراردادهایِ
//     خودشان را دارند — دستنخورده.
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import PairSpeakChips from "@/components/study/lesson/pair-speak-chips";
import { buildSynAntIndex, synAntPairsFor, type SynAntPairEntry } from "@/lib/syn-ant-lookup";
import { speak } from "@/lib/speak";
import { faNum } from "@/lib/study-theme";
import { lessons } from "@/data";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

vi.mock("@/lib/speak", () => ({ speak: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const SIX_VIEWS = [
  "src/components/study/lesson/dictionary-view.tsx",
  "src/components/study/lesson/vocab-tab.tsx",
  "src/components/study/lesson/flashcards.tsx",
  "src/components/study/lesson/word-of-day.tsx",
  "src/components/study/practice/my-words.tsx",
  "src/components/study/practice/danger-words.tsx",
];

const pair = (kind: "syn" | "ant", other: string, lessonId = 1): SynAntPairEntry => ({
  kind,
  other,
  fa: "—",
  lessonId,
});

beforeEach(() => {
  cleanup();
  vi.mocked(speak).mockClear();
  window.localStorage.clear();
});

describe("r390 — PairSpeakChips: مالکِ چیپِ «روخوانی جفت»", () => {
  it("قالبِ دقیق: title و aria و آیکونِ kind — ارقامِ فارسی در سرریز", () => {
    const pairs = [pair("syn", "use"), pair("ant", "refuse"), pair("ant", "reject"), pair("syn", "accept")];
    render(<PairSpeakChips pairs={pairs} en="ability" onSpeakError={() => {}} />);
    const chips = screen.getAllByTitle("روخوانی جفت");
    expect(chips).toHaveLength(3); // سقفِ پیشفرضِ ۳
    expect(chips[0]).toHaveAttribute("aria-label", "مترادفِ ability: use — روخوانی");
    expect(chips[1]).toHaveAttribute("aria-label", "متضادِ ability: refuse — روخوانی");
    expect(chips[0].textContent).toContain("≈");
    expect(chips[1].textContent).toContain("↔");
    expect(chips[0].querySelector("[dir='ltr']")).toHaveTextContent("use");
    expect(screen.getByText(`+${faNum(1)}`)).toBeInTheDocument(); // سرریزِ صادق
  });

  it("کلیک: speak(other, 0.95, undefined, onSpeakError) — هیچ فراخوانِ بی-onErrorای", () => {
    const onError = vi.fn();
    render(<PairSpeakChips pairs={[pair("ant", "lend")]} en="borrow" onSpeakError={onError} />);
    fireEvent.click(screen.getByTitle("روخوانی جفت"));
    expect(speak).toHaveBeenCalledWith("lend", 0.95, undefined, onError);
    expect(vi.mocked(speak).mock.calls[0].length).toBe(4);
  });

  it("stopPropagation رفتاری: با پرچم کارت نمیبلعد، بی‌پرچم میبلعد", () => {
    let cardClicks = 0;
    const Card = (p: { stopPropagation?: boolean }) => (
      <div onClick={() => { cardClicks++; }} data-testid="card">
        <PairSpeakChips
          pairs={[pair("syn", "use")]}
          en="ability"
          onSpeakError={() => {}}
          stopPropagation={p.stopPropagation}
        />
      </div>
    );
    const { rerender } = render(<Card stopPropagation />);
    fireEvent.click(screen.getByTitle("روخوانی جفت"));
    expect(cardClicks).toBe(0); // کارتِ بلدمِ تبِ واژگان + پشتِ فلش‌کارت
    rerender(<Card />);
    fireEvent.click(screen.getByTitle("روخوانی جفت"));
    expect(cardClicks).toBe(1); // ردیفهایِ دیکشنری/خطر/واژه‌هایِ من + کارتِ واژهٔ روز
  });

  it("دو گویشِ بصریِ نامدار: sky (emerald/rose) و flip (حجابِ r333) — رشتههایِ دقیقاً پیشین", () => {
    const { rerender } = render(
      <PairSpeakChips pairs={[pair("syn", "use"), pair("ant", "refuse")]} en="ability" onSpeakError={() => {}} />
    );
    let [syn, ant] = screen.getAllByTitle("روخوانی جفت");
    expect(syn.className).toContain("dict-pair-chip");
    expect(syn.className).toContain("border-emerald-200 bg-emerald-50/60 text-emerald-700");
    expect(ant.className).toContain("border-rose-200 bg-rose-50/60 text-rose-700");
    expect(syn.className).toContain("text-[10.5px]");

    cleanup();
    render(
      <PairSpeakChips pairs={[pair("syn", "use")]} en="borrow" onSpeakError={() => {}} tone="flip" />
    );
    const flip = screen.getByTitle("روخوانی جفت");
    expect(flip.className).toContain("flip-pair-chip");
    expect(flip.className).toContain("border-white/30 bg-black/20");
    expect(flip.className).toContain("text-white");
    expect(flip.className).not.toContain("border-emerald-200"); // flip از kind جدا نمیشود
  });

  it("گویشِ فشردهٔ ردیفِ خطر: max={2} + compact + titleِ سرریز", () => {
    const pairs = [pair("ant", "refuse"), pair("ant", "reject"), pair("syn", "accept")];
    render(
      <PairSpeakChips
        pairs={pairs}
        en="ability"
        onSpeakError={() => {}}
        max={2}
        compact
        overflowTitle="ردیف‌های جفت دیگر در تبِ مترادف و متضاد درس"
      />
    );
    const chips = screen.getAllByTitle("روخوانی جفت");
    expect(chips).toHaveLength(2);
    expect(chips[0].className).toContain("text-[10px]");
    const over = screen.getByText(`+${faNum(1)}`);
    expect(over.className).toContain("text-[10px]");
    expect(over).toHaveAttribute("title", "ردیف‌های جفت دیگر در تبِ مترادف و متضاد درس");
  });

  it("بی‌جفت هیچ؛ سرریزِ flip با رشتهٔ تیرهٔ خودش", () => {
    const { container } = render(<PairSpeakChips pairs={[]} en="x" onSpeakError={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    cleanup();
    render(
      <PairSpeakChips
        pairs={[pair("syn", "a"), pair("syn", "b"), pair("syn", "c"), pair("syn", "d")]}
        en="x"
        onSpeakError={() => {}}
        tone="flip"
      />
    );
    expect(screen.getByText(`+${faNum(1)}`).className).toContain("bg-black/20");
    expect(screen.getByText(`+${faNum(1)}`).className).toContain("text-white/90");
  });
});

describe("r390 — موافقت با دادهٔ زندهٔ جزوه (تک‌منبعِ syn-ant-lookup)", () => {
  it("accept: ↔ reject (درس ۳) + ↔ refuse (درس ۴، آینه) — همان لنگرهایِ قفلهایِ پیشین", () => {
    const idx = buildSynAntIndex(lessons);
    const pairs = synAntPairsFor(idx, "accept");
    expect(pairs.length).toBeGreaterThanOrEqual(2);
    render(<PairSpeakChips pairs={pairs} en="accept" onSpeakError={() => {}} />);
    const chips = screen.getAllByTitle("روخوانی جفت");
    const others = chips.map((c) => c.querySelector("[dir='ltr']")?.textContent);
    expect(others).toContain("reject");
    expect(others).toContain("refuse");
    // aria همیشه با kindِ واقعیِ همتا حرف میزند
    const ant = chips.find((c) => c.textContent?.includes("↔"))!;
    expect(ant).toHaveAttribute("aria-label", expect.stringContaining("متضادِ accept:"));
  });
});

describe("r390 — قفلهایِ منبع: شش نما وامگیرند؛ قالبِ دستی منقرض", () => {
  it("هر شش نما از مالک وام میگیرند و pairSpeakError میزبان را میدهند", () => {
    for (const v of SIX_VIEWS) {
      const src = read(v);
      expect(src, `importِ PairSpeakChips در ${v}`).toMatch(/import PairSpeakChips from "\.\/pair-speak-chips"|import PairSpeakChips from "\.\.\/lesson\/pair-speak-chips"/);
      expect(src, `onSpeakError={pairSpeakError} در ${v}`).toContain("onSpeakError={pairSpeakError}");
    }
  });

  it("قالبِ دستی منقرض است: title/aria/آیکون/کلیکِ speak فقط در مالک", () => {
    for (const v of SIX_VIEWS) {
      const src = read(v);
      expect(src, `titleِ دستی در ${v}`).not.toContain('title="روخوانی جفت"');
      expect(src, `ariaِ دستی در ${v}`).not.toContain("— روخوانی`");
      expect(src, `کلیکِ دستیِ speak در ${v}`).not.toContain("void speak(p.other");
      expect(src, `importِ speak در ${v}`).not.toContain('import { speak } from "@/lib/speak"');
    }
    const owner = read("src/components/study/lesson/pair-speak-chips.tsx");
    expect(owner).toContain('title="روخوانی جفت"');
    expect(owner).toContain("void speak(p.other, 0.95, undefined, onSpeakError)");
  });

  it("زبانِ خانوادهٔ شکستِ r345 سمتِ میزبان پابرجاست (توستِ 🔇)", () => {
    for (const v of SIX_VIEWS) {
      expect(read(v), `توستِ خانواده در ${v}`).toContain("پخش صدا ممکن نشد");
    }
  });

  it("حکمِ «نخیر»: SpeakButton دستنخورده — و تعریفِ مالک یکجاست", () => {
    const sb = read("src/components/study/shared/speak-button.tsx");
    expect(sb).toContain("پخش صدا ممکن نشد"); // عضوِ پایهٔ r345 دستنخورده
    const owner = read("src/components/study/lesson/pair-speak-chips.tsx");
    expect(owner.match(/export default function PairSpeakChips/g)?.length).toBe(1);
  });
});
