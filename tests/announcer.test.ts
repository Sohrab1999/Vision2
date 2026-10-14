// Task 171 — «لایهٔ اعلام به صفحه‌خوان» — the announcer pub-sub contract.
// The live audit proved this Radix build ships NO live region, so the app
// grew its own: lib/announcer.ts (publish side, pure) + shell/live-announcer
// .tsx (the two sr-only regions) wired once in ui/toaster.tsx. These tests
// pin the publish side: routing, composition, error-channel rule and the
// wiring pins that keep the layer from silently unwiring.
import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  onAnnounce,
  announceFa,
  announceToast,
  isAssertiveToast,
} from "@/lib/announcer";

describe("announcer — pub-sub routing", () => {
  it("routes the message to every live listener with assertive=false by default", () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = onAnnounce(a);
    const offB = onAnnounce(b);
    announceFa("نشان طلایی باز شد");
    expect(a).toHaveBeenCalledWith("نشان طلایی باز شد", false);
    expect(b).toHaveBeenCalledTimes(1);
    offA();
    offB();
  });

  it("assertive=true reaches the listener as assertive", () => {
    const l = vi.fn();
    const off = onAnnounce(l);
    announceFa("خطا در ساخت فایل", true);
    expect(l).toHaveBeenCalledWith("خطا در ساخت فایل", true);
    off();
  });

  it("unsubscribe removes the listener — no ghosts after unmount", () => {
    const l = vi.fn();
    const off = onAnnounce(l);
    off();
    announceFa("پیامِ بی‌شنوه");
    expect(l).not.toHaveBeenCalled();
  });

  it("blank or whitespace-only messages are dropped (never a wasted live turn)", () => {
    const l = vi.fn();
    const off = onAnnounce(l);
    announceFa("");
    announceFa("   ");
    expect(l).not.toHaveBeenCalled();
    off();
  });

  it("messages are trimmed before delivery", () => {
    const l = vi.fn();
    const off = onAnnounce(l);
    announceFa("  پشتیبان ذخیره شد  ");
    expect(l).toHaveBeenCalledWith("پشتیبان ذخیره شد", false);
    off();
  });
});

describe("announcer — toast composition", () => {
  it("composes «title — description» with the em-dash separator", () => {
    const l = vi.fn();
    const off = onAnnounce(l);
    announceToast("✓ پشتیبان دانلود شد", "فایل JSON پیشرفت شما ذخیره شد");
    expect(l).toHaveBeenCalledWith("✓ پشتیبان دانلود شد — فایل JSON پیشرفت شما ذخیره شد", false);
    off();
  });

  it("without a description the message is the bare title", () => {
    const l = vi.fn();
    const off = onAnnounce(l);
    announceToast("نشانِ تازه");
    expect(l).toHaveBeenCalledWith("نشانِ تازه", false);
    off();
  });

  it("an empty description behaves like no description", () => {
    const l = vi.fn();
    const off = onAnnounce(l);
    announceToast("نشانِ تازه", "   ");
    expect(l).toHaveBeenCalledWith("نشانِ تازه", false);
    off();
  });
});

describe("announcer — error channel rule", () => {
  it("titles carrying «خطا» are assertive", () => {
    expect(isAssertiveToast("خطا در ساخت تصویر")).toBe(true);
    expect(isAssertiveToast("خطا در ساخت فایل")).toBe(true);
  });

  it("success/info titles stay polite", () => {
    expect(isAssertiveToast("✓ پشتیبان دانلود شد")).toBe(false);
    expect(isAssertiveToast("📊 جدول CSV ذخیره شد")).toBe(false);
    expect(isAssertiveToast("ماراتنِ دوهفته‌ای باز شد")).toBe(false);
  });

  it("announceToast routes a خطا title through the assertive channel", () => {
    const l = vi.fn();
    const off = onAnnounce(l);
    announceToast("خطا در ساخت تصویر", "لطفاً دوباره تلاش کن.", isAssertiveToast("خطا در ساخت تصویر"));
    expect(l).toHaveBeenCalledWith("خطا در ساخت تصویر — لطفاً دوباره تلاش کن.", true);
    off();
  });
});

describe("announcer — wiring pins (the layer must never silently unwire)", () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

  it("the toaster publishes every toast through announceToast", () => {
    const t = read("src/components/ui/toaster.tsx");
    expect(t).toContain('import { announceToast, isAssertiveToast } from "@/lib/announcer"');
    expect(t).toContain("announceToast(");
    expect(t).toContain("ToastAnnouncer");
  });

  it("layout mounts the LiveAnnouncer beside the Toaster", () => {
    const layout = read("src/app/layout.tsx");
    const code = layout.replace(/\/\*[\s\S]*?\*\//g, ""); // comments may mention either tag
    expect(code).toContain("<LiveAnnouncer />");
    expect(code).toContain("<Toaster />");
    expect(code.indexOf("<LiveAnnouncer />")).toBeLessThan(code.indexOf("<Toaster />"));
  });

  it("the LiveAnnouncer component carries both channels with their roles", () => {
    const c = read("src/components/study/shell/live-announcer.tsx");
    expect(c).toContain('aria-live="polite"');
    expect(c).toContain('role="status"');
    expect(c).toContain('aria-live="assertive"');
    expect(c).toContain('role="alert"');
    expect(c).toContain("sr-only");
  });
});
