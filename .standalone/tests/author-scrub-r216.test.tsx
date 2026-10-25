// @vitest-environment jsdom
// ---------------------------------------------------------------------
// راند ۲۱۶ — گاردِ scrubِ نامِ مؤلف/ناشر در سطوحِ user-facing.
// درخواستِ صریح کاربر: «به جز اسم ناشر و نویسنده جزوه‌ها همه چیز رو
// دقیق استخراج کن» — یعنی هیچ رندر و متادیتایی نباید نامِ مؤلف/ناشرِ
// جزوه‌ها را ببرد. یافتهٔ QA همین راند: فوتر و متادیتای layout نامِ
// مؤلف را داشتند — هر دو ترمیم شدند و این گارد جلوی بازگشتشان را
// می‌گیرد. (شخصیت‌های مکالمهٔ خودِ جزوه مثل «Mr. Ahmadi» درس ۷/هفتم
// استثنا هستند — محتوای وفادار جزوه‌اند، نه اعتبارِ مؤلف.)
// Run: bun run test
// ---------------------------------------------------------------------
import { describe, it, expect, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, cleanup } from "@testing-library/react";

import Footer from "@/components/study/shell/footer";

const SRC = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("author-scrub-r216 — هیچ اعتبارِ مؤلف/ناشری در سطوحِ قابل‌دیدن نیست", () => {
  beforeEach(cleanup);

  it("فوتر و متادیتای layout نامِ مؤلف/نشانه‌های تألیف/گردآوریِ اعتباری ندارند", () => {
    const footer = SRC("src/components/study/shell/footer.tsx");
    expect(footer).not.toMatch(/احمدی/);
    expect(footer).not.toMatch(/تألیف/);
    const layout = SRC("src/app/layout.tsx");
    expect(layout).not.toMatch(/احمدی/);
    // متادیتای authors حذف شده باشد (هیچ کلیدِ authors با نامِ مؤلف)
    expect(layout).not.toMatch(/authors:\s*\[/);
  });

  it("manifest و فایل‌های عمومی هم پاک‌اند", () => {
    expect(SRC("src/app/manifest.ts")).not.toMatch(/احمدی/);
  });

  it("رندرِ فوتر: خطِ اعتبار خنثی است و نامِ مؤلف در DOM نیست", () => {
    render(<Footer />);
    const txt = document.body.textContent ?? "";
    expect(txt).toContain("بر اساس جزوه‌های جامعِ درس زبان انگلیسی دبیرستان");
    expect(txt).not.toContain("احمدی");
    expect(screen.getByText(/وب‌کتاب تعاملی «Vision Two»/)).toBeTruthy();
  });
});
