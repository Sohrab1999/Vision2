// @vitest-environment jsdom
// راند ۲۲۲ — گاردهای «اجزای کلماتی» از خودِ جزوه‌ها (src/data/word-families.ts)
// + رندرِ زیرتبِ «اجزای کلام» ضمیمه با جدول‌های خانوادهٔ واژه.
// قرارداد: وفاداریِ عینِ جزوه — ترمیمِ سوپِ استخراج فقط؛ صفرِ ساختگی ممنوع.
import { describe, expect, it, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import AppendixView from "@/components/study/lesson/appendix-view";
import { WORD_FAMILY_TABLES, WORD_FAMILY_TOTAL } from "@/data/word-families";

afterEach(cleanup);

const LATIN = /^[A-Za-z'’\-\. ]*$/;
const PERSIAN = /[\u0600-\u06FF]/;

describe("دادهٔ خانوادهٔ واژه‌ها — ساختار و وفاداری (راند ۲۲۲)", () => {
  it("پینِ جامع: ۱۰ جدول در سه پایه با شمارشِ عینِ جزوه (۱۱۰+۶۸+۶۸ = ۲۴۶)", () => {
    expect(WORD_FAMILY_TABLES).toHaveLength(10);
    const byGrade: Record<string, number> = { دهم: 0, یازدهم: 0, دوازدهم: 0 };
    const tablesByGrade: Record<string, number> = { دهم: 0, یازدهم: 0, دوازدهم: 0 };
    for (const t of WORD_FAMILY_TABLES) {
      byGrade[t.grade] += t.families.length;
      tablesByGrade[t.grade] += 1;
    }
    expect(tablesByGrade).toEqual({ دهم: 4, یازدهم: 3, دوازدهم: 3 });
    expect(byGrade).toEqual({ دهم: 110, یازدهم: 68, دوازدهم: 68 });
    expect(WORD_FAMILY_TOTAL).toBe(246);
  });

  it("هم‌خوانیِ پایه ↔ Vision و ترتیبِ درس‌ها — از خودِ برچسبِ جزوه", () => {
    const visionOf: Record<string, string> = { دهم: "Vision One", یازدهم: "Vision Two", دوازدهم: "Vision Three" };
    for (const t of WORD_FAMILY_TABLES) expect(t.vision).toBe(visionOf[t.grade]);
    for (const grade of ["دهم", "یازدهم", "دوازدهم"]) {
      const lessons = WORD_FAMILY_TABLES.filter((t) => t.grade === grade).map((t) => t.lesson);
      expect(lessons).toEqual([...lessons].sort()); // درس اول، دوم، ... به ترتیب
      expect(lessons[0]).toBe("درس اول");
    }
    // فقط جدولِ چهارمِ دهم دارد (Vision One چهار درس دارد؛ دو پایهٔ دیگر سه درس)
    expect(WORD_FAMILY_TABLES.filter((t) => t.lesson === "درس چهارم").map((t) => t.grade)).toEqual(["دهم"]);
  });

  it("سلامتِ سلول‌ها: خانه‌های لاتین فقط لاتین، معنی فقط فارسی، ردیفِ کاملاً تهی ممنوع", () => {
    for (const t of WORD_FAMILY_TABLES) {
      for (const f of t.families) {
        for (const cell of [f.noun, f.verb, f.adjective, f.adverb]) {
          expect(LATIN.test(cell)).toBe(true);
          expect(PERSIAN.test(cell)).toBe(false);
        }
        if (f.fa) {
          expect(PERSIAN.test(f.fa)).toBe(true);
          expect(/[A-Za-z]/.test(f.fa)).toBe(false);
        }
        expect(f.noun || f.verb || f.adjective || f.adverb || f.fa).toBeTruthy();
      }
      // تکراریِ درون-جدولی ممنوع (تکرارِ بین-جدولی عینِ جزوه است — مثل know)
      const keys = t.families.map((f) => `${f.noun}|${f.adjective}|${f.adverb}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("پین‌های وفاداری: ردیف‌های شاخص عینِ جزوه — شاملِ غلطِ چاپیِ خودِ جزوه", () => {
    const all = WORD_FAMILY_TABLES.flatMap((t) => t.families);
    // یازدهم درس اول — با سوپِ ترمیم‌شده و خانهٔ خالیِ واقعی
    expect(all).toContainEqual({ adverb: "absolutely", adjective: "absolute", verb: "", fa: "وجود مطلق", noun: "absolute" });
    expect(all).toContainEqual({ adverb: "accessibly", adjective: "accessible", verb: "access", fa: "دسترسی", noun: "access" });
    // غلطِ چاپیِ خودِ جزوه در خانهٔ فعلِ خانوادهٔ measure — دست‌نخورده
    expect(all).toContainEqual({ adverb: "", adjective: "measureless", verb: "measurement", fa: "اندازه", noun: "measurement" });
    // «Patience» با حرفِ بزرگِ خودِ جزوه
    expect(all).toContainEqual({ adverb: "patiently", adjective: "patient", verb: "", fa: "صبور", noun: "Patience" });
    // دوازدهم — cost با معنیِ هزینه و ناشر به‌عنوانِ محتوای واژگانیِ خودِ جزوه
    expect(all).toContainEqual({ adverb: "", adjective: "costly", verb: "cost", fa: "هزینه", noun: "cost" });
    expect(all).toContainEqual({ adverb: "", adjective: "publishable", verb: "publish", fa: "ناشر", noun: "publisher" });
    // خانه‌های خالیِ صادقانه: proper (اسم ندارد) و recent (اسم ندارد)
    expect(all).toContainEqual({ adverb: "properly", adjective: "proper", verb: "", fa: "صحیح", noun: "" });
    expect(all).toContainEqual({ adverb: "recently", adjective: "recent", verb: "", fa: "جدید", noun: "" });
    // دهم درس چهارم — با ترمیمِ احترام و خانهٔ تهیِ اسم
    expect(all).toContainEqual({ adverb: "respectfully", adjective: "respectful", verb: "respect", fa: "احترام", noun: "respect" });
  });

  it("بلک‌لیستِ سوپِ استخراج: هیچ رشتهٔ ترمیم‌شده‌ای در داده نمی‌ماند", () => {
    const all = WORD_FAMILY_TABLES.flatMap((t) => t.families);
    const blob = JSON.stringify(WORD_FAMILY_TABLES);
    // سوپ‌های تک‌واژه‌ای در سطحِ توکن چک می‌شوند تا زیررشتهٔ واژهٔ درستِ خودشان
    // (مثل «تغیی» ⊂ «تغییر») خطای کاذب نسازند
    const tokens = new Set(all.flatMap((f) => f.fa.split(/[\s،]+/)));
    const singleWord = [
      "سالست", "فراوات", "مالحضه", "هسن", "شگفنر", "زیبات", "تغیی",
      "اطالعات", "عالقه", "معنز", "شناسات", "پایک", "سالمنر", "خوشحایل",
      "مخیر", "ناراحنر", "رسعت", "رسگری", "خارچ", "راحن", "گییحی",
      "ناراحن", "فیر", "تزئئر", "عنرص", "اخالق", "قدردات", "مهربات",
      "پائیر", "تمیر", "شچشمه", "آلودیک", "ابتدات", "شییم", "مسییح",
      "رهیی", "واکیس", "صی",
    ];
    for (const s of singleWord) expect(tokens.has(s)).toBe(false);
    // سوپ‌های چندواژه‌ای با زیررشته — هیچ‌کدام زیررشتهٔ رشتهٔ درست نیستند
    const multiWord = [
      "دسی یس", "رس و صدا", "ز ریاض", "مخیر ع", "تاری  خ", "احیر ام",
      "شر ط", "رص  ر", "فیر یک", "معاشر ت", "مرصف کننده", "آشیی ی", "پیش بین",
    ];
    for (const s of multiWord) expect(blob).not.toContain(s);
  });
});

describe("رندرِ زیرتبِ «اجزای کلام» — جدول‌های خانوادهٔ واژه", () => {
  it("۱۰ جدول با چیپِ جمع و تعریف‌های ۸گانه رندر می‌شوند", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    expect(screen.getByText("۲۴۶ خانواده · ۱۰ جدول")).toBeTruthy();
    expect(screen.getAllByText(/اجزای کلماتیِ درس/)).toHaveLength(10);
    // تعریف‌های عمومیِ قبلیِ زیرتاب سرِ جایشان‌اند
    expect(screen.getByText("اسم (Noun)")).toBeTruthy();
    expect(screen.getByText("قید (Adverb)")).toBeTruthy();
    // سرستون‌های جدول (برچسبِ لاتینِ خالص — بدونِ تداخل با تعریف‌های بالا)
    expect(screen.getAllByText("Noun").length).toBeGreaterThanOrEqual(10);
    expect(screen.getAllByText("Adverb").length).toBeGreaterThanOrEqual(10);
    // یک سلولِ مشخص از یازدهم درس اول
    expect(screen.getByText("knowledgeably")).toBeTruthy();
    expect(screen.getByText("وجود مطلق")).toBeTruthy();
  });

  it("دکمه‌های تلفظِ ردیفِ خانواده — از راند ۲۲۳ روی همهٔ ستون‌های انگلیسیِ غیرتهی (agreement: ۳ دکمه؛ قیدِ خالی دکمه ندارد)", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const agreement = screen.getByText("agreement");
    const row = agreement.closest("tr") as HTMLElement;
    // agreement: اسم + فعل + صفت دکمه دارند؛ قیدِ خالیِ جزوه فقط خطِ تیره است
    expect(within(row).getAllByRole("button", { name: "روخوانی متن انگلیسی" })).toHaveLength(3);
  });

  it("خانهٔ خالیِ صادقانه با خطِ تیره رندر می‌شود (ردیفِ proper)", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const properly = screen.getByText("properly");
    const row = properly.closest("tr") as HTMLElement;
    expect(row.textContent).toContain("صحیح");
    expect(within(row).getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });

  it("فیلترِ پایه: «دهم» فقط ۴ جدولِ Vision One را می‌گذارد و برگشتِ «همه» کار می‌کند", () => {
    render(<AppendixView />);
    fireEvent.click(screen.getByRole("button", { name: "اجزای کلام" }));
    const group = screen.getByRole("group", { name: "فیلتر پایهٔ جدول‌های اجزای کلماتی" });
    const dahom = within(group)
      .getAllByRole("button")
      .find((b) => (b.textContent ?? "").startsWith("دهم")) as HTMLElement;
    fireEvent.click(dahom);
    expect(screen.getAllByText(/اجزای کلماتیِ درس/)).toHaveLength(4);
    expect(screen.getByText("اجزای کلماتیِ درس چهارم")).toBeTruthy();
    expect(screen.queryByText(/Vision Two/)).toBeNull();
    // برگشت به «همه»
    const hameh = within(group)
      .getAllByRole("button")
      .find((b) => (b.textContent ?? "").startsWith("همه")) as HTMLElement;
    fireEvent.click(hameh);
    expect(screen.getAllByText(/اجزای کلماتیِ درس/)).toHaveLength(10);
  });
});
