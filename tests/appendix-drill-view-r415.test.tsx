// @vitest-environment jsdom
// ------------------------------------------------------------------
// r415 — «تمرینِ سررسیدها» — قفلهایِ نما: دکمهٔ دومِ معرفی و جلسهٔ فقطسررسید.
//
// قراردادهایِ نما:
//  · دکمه فقط با dueCount > 0 و سازندهٔ حاضر بالا میآید (r236 + سازگاریِ
//    پسرو — میزبانِ بیِسازنده دکمه ندارد)؛ متن و aria با عددِ فارسی
//  · جلسهاش کاملِ خودش است (isReplay=false): ثبتِ نتیجه/خطا/حق مثلِ هر
//    جلسهٔ کامل — پاسخِ درستِ سررسید ok میگیرد و مسلط از سررسید بیرون میرود
//  · مرورِ اشتباهها (r401) پسِ آن هم از هیچ دری عبور نمیکند
//  · طولِ جلسه = شمارِ سررسیدها («سؤال ۱ از n») — نه وعدهٔ دهتایِ برساخته
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import AppendixDrillView from "@/components/study/lesson/appendix-drill-view";
import { useStudy } from "@/lib/study-store";
import { countDrillDue } from "@/lib/drill-mistakes";
import { faNum } from "@/lib/study-theme";
import { todayStr } from "@/state/day-engine";
import { irregularVerbs } from "@/data/appendix";

const TODAY = todayStr();
const YESTERDAY = "2026-10-20"; // روزِ ثابتِ گذشته — سررسیدِ صادق زیرِ هر تاریخِ اجرا

const dueEntry = (over: Record<string, unknown> = {}) => ({
  wrong: 1,
  ok: 0,
  lastDay: YESTERDAY,
  lastOkDay: "",
  ...over,
});

const openVerbsTab = () => {
  fireEvent.click(screen.getByRole("button", { name: "افعال بی‌قاعده" }));
};

const openDrillIntro = () => {
  render(<AppendixView />);
  openVerbsTab();
  fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
};

const mistakeBtn = (n: number) =>
  screen.getByRole("button", {
    name: `شروع جلسهٔ تمرین فقط از سررسیدهای این تمرین: ${faNum(n)} مورد`,
  });

/** هدفِ پرسشِ فعلی را از پرامپتش مییابد و شکلِ درستِ پاسخ را برمیگرداند */
const correctOfCurrent = (): { target: (typeof irregularVerbs)[number]; correct: string } => {
  const promptEl = screen.getByText(/کدام است؟|متعلق به کدام فعل است؟/);
  const prompt = promptEl.textContent || "";
  const target = irregularVerbs.find(
    (v) => prompt.includes(`«${v.base}»`) || prompt.includes(`«${v.past}»`),
  );
  expect(target).toBeDefined();
  const correct =
    prompt.startsWith("معنیِ") ? target!.fa
    : prompt.includes("گذشتهٔ سادهٔ") ? target!.past
    : prompt.includes("p.p.") ? target!.pp
    : target!.base;
  return { target: target!, correct };
};

const clickOption = (match: (label: string) => boolean) => {
  const opt = screen
    .getAllByRole("button", { name: /^گزینه [۱-۴]: / })
    .find((b) => match(b.getAttribute("aria-label") || ""));
  expect(opt).toBeDefined();
  fireEvent.click(opt!);
};

/** n پرسش را با یک الگو پاسخ میدهد و تا صفحهٔ نتیجه پیش میرود */
const runQuestions = (n: number, mode: "correct" | "wrong") => {
  for (let i = 0; i < n; i++) {
    const { correct } = correctOfCurrent();
    if (mode === "correct") clickOption((l) => l.includes(correct));
    else clickOption((l) => !l.includes(correct));
    fireEvent.click(
      i === n - 1
        ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
        : screen.getByRole("button", { name: "سؤال بعدی" }),
    );
  }
};

describe("appendix-drill-view r415 — تمرینِ سررسیدها", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    useStudy.setState(useStudy.getInitialState(), true);
  });

  it("دکمه فقط با سررسیدِ بزرگتر از صفر بالا میآید — بی‌بانک هیچ، با سررسید با عددِ صادق", () => {
    openDrillIntro();
    expect(screen.queryByRole("button", { name: /شروع جلسهٔ تمرین فقط از سررسیدها/ })).toBeNull();
    cleanup();
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry(),
          see: dueEntry({ wrong: 3 }),
          run: dueEntry({ wrong: 1, ok: 1, lastOkDay: "2026-10-21" }), // مسلط — بی شمارش
        },
      },
    });
    expect(countDrillDue(useStudy.getState().drillMistakes["verbs"], TODAY)).toBe(2);
    openDrillIntro();
    expect(mistakeBtn(2)).toBeTruthy();
    expect(screen.getByText(/تمرینِ سررسیدها/).textContent).toContain(`(${faNum(2)})`);
  });

  it("میزبانِ بیِسازنده (سازگاریِ پسرو): چیپِ سررسید هست ولی دکمه نیست", () => {
    useStudy.setState({ drillMistakes: { verbs: { go: dueEntry() } } });
    render(
      <AppendixDrillView
        spec={{
          id: "verbs",
          title: "تمرین افعال بی‌قاعده",
          intro: "معرفی",
          startAria: "شروع جلسهٔ تمرین فعل",
          exitLabel: "جدول افعال",
          exitAria: "بازگشت به جدول افعال",
          exitResultAria: "بازگشت به جدول افعال",
          cancelAria: "انصراف از تمرین",
        }}
        buildSession={() => null}
        onExit={() => {}}
      />,
    );
    expect(screen.getByLabelText(/سررسیدهای مرور این تمرین/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /شروع جلسهٔ تمرین فقط از سررسیدها/ })).toBeNull();
  });

  it("جلسهٔ فقطسررسید کاملِ خودش است: طولش = شمارِ سررسیدها و ثبتش مثلِ هر جلسهٔ کامل", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry(),
          see: dueEntry({ wrong: 3 }), // اولویتِ بالاتر — پرسشِ نخست
        },
      },
    });
    openDrillIntro();
    fireEvent.click(mistakeBtn(2));
    // طولِ صادق: «سؤال ۱ از ۲» — نه دهتایِ برساخته
    expect(screen.getByText(`سؤال ${faNum(1)} از ${faNum(2)}`)).toBeTruthy();
    // اولویت: بیشترینِ خطا نخست — پرسشِ نخست «see» است
    expect(screen.getByText(/«see»/)).toBeTruthy();
    runQuestions(2, "correct");
    expect(screen.getByText("نتیجهٔ تمرین")).toBeTruthy(); // مرور نیست — تمرینِ کامل
    const asked = (screen.getByLabelText(/بازخوانی سؤال‌های تمرین/).textContent || "") as string;
    const after = useStudy.getState().drillMistakes["verbs"]!;
    for (const [base, e] of Object.entries(after)) {
      if (asked.includes(base)) {
        // هر پایهٔ پرسیدهشده یا ok گرفته (درست) یا wrongِ تازه (نادرست) — رخدادِ واقعی
        expect(e.ok >= 1 || e.lastDay === TODAY).toBe(true);
      }
    }
    expect(useStudy.getState().drillStats["verbs"]?.sessions).toBe(1); // جلسهٔ کامل ثبت شد
  });

  it("حلقه بسته میشود: پاسخِ درستِ سررسید ok میگیرد، مسلط میشود و دکمه/چیپ صادقانه غایب میشوند", () => {
    useStudy.setState({ drillMistakes: { verbs: { go: dueEntry() } } });
    openDrillIntro();
    fireEvent.click(mistakeBtn(1));
    expect(screen.getByText(`سؤال ${faNum(1)} از ${faNum(1)}`)).toBeTruthy();
    runQuestions(1, "correct"); // پرسشِ نخست = go (تنها سررسید — صفِ اولویت)
    const go = useStudy.getState().drillMistakes["verbs"]!["go"]!;
    expect(go.ok).toBe(1);
    expect(go.lastOkDay).toBe(TODAY);
    expect(go.wrong).toBe(1); // ردیف حذف نشده — حکمِ max-merge
    expect(countDrillDue(useStudy.getState().drillMistakes["verbs"], TODAY)).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به جدول افعال از نتیجه" }));
    // خروج به جدول میرسد — معرفی را دوباره باز میکنیم
    fireEvent.click(screen.getByRole("button", { name: "شروع تمرین افعال بی‌قاعده" }));
    // معرفیِ پسِ تسلط: چیپِ سررسید و دکمهٔ تمرینِ سررسیدها هر دو صادقانه غایب
    expect(screen.queryByLabelText(/سررسیدهای مرور این تمرین/)).toBeNull();
    expect(screen.queryByRole("button", { name: /شروع جلسهٔ تمرین فقط از سررسیدها/ })).toBeNull();
    // چیپِ خطا میماند — دو حقیقتِ جدا (ثبتشده ≠ سررسید)
    expect(screen.getByLabelText("بانک خطاهای این تمرین: ۱ مورد ثبتشده")).toBeTruthy();
  });

  it("مرورِ اشتباهها پسِ جلسهٔ فقطسررسید هم از هیچ دری عبور نمیکند", () => {
    useStudy.setState({
      drillMistakes: {
        verbs: {
          go: dueEntry({ wrong: 2 }),
          come: dueEntry(),
        },
      },
    });
    openDrillIntro();
    fireEvent.click(mistakeBtn(2));
    runQuestions(2, "wrong"); // هر دو نادرست — مرورِ r401 بالا میآید
    const snapshot = useStudy.getState().drillMistakes["verbs"];
    fireEvent.click(screen.getByRole("button", { name: "مرور اشتباههای تمرین" }));
    // مرور: دو پرسشِ نادرست، اینبار درست — ولی هیچ ثبتی (سرصفحهٔ صادق پسِ پایانِ مرور)
    for (let i = 0; i < 2; i++) {
      const { correct } = correctOfCurrent();
      clickOption((l) => l.includes(correct));
      fireEvent.click(
        i === 1
          ? screen.getByRole("button", { name: "دیدن نتیجهٔ تمرین" })
          : screen.getByRole("button", { name: "سؤال بعدی" }),
      );
    }
    expect(screen.getByText("نتیجهٔ مرور")).toBeTruthy();
    expect(useStudy.getState().drillMistakes["verbs"]).toEqual(snapshot); // هیچ ردیفی جابهجا نشد
    expect(useStudy.getState().drillStats["verbs"]?.sessions).toBe(1); // مرور دوبارهشماری نشد
  });
});
