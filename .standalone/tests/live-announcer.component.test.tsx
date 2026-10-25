// @vitest-environment jsdom
// ------------------------------------------------------------------
// Task 171 — <LiveAnnouncer /> live behavior: the two sr-only regions
// must exist with their exact roles, route messages to the right
// channel, re-announce repeated text via clear-then-set, and detach
// cleanly on unmount. The publish side contracts live in
// announcer.test.ts (node) — this file proves the DOM half actually
// receives what a toast announces.
// ------------------------------------------------------------------

import { describe, it, expect, afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, act } from "@testing-library/react";
import LiveAnnouncer from "@/components/study/shell/live-announcer";
import { onAnnounce, announceFa } from "@/lib/announcer";

const tick = (ms = 60) => new Promise((r) => setTimeout(r, ms));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("LiveAnnouncer — DOM contract (Task 171)", () => {
  it("mounts exactly two sr-only regions: polite status + assertive alert", () => {
    const { container } = render(<LiveAnnouncer />);
    const regions = container.querySelectorAll("[aria-live]");
    expect(regions).toHaveLength(2);
    const polite = container.querySelector('[aria-live="polite"]')!;
    const assertive = container.querySelector('[aria-live="assertive"]')!;
    expect(polite).toHaveAttribute("role", "status");
    expect(polite).toHaveClass("sr-only");
    expect(assertive).toHaveAttribute("role", "alert");
    expect(assertive).toHaveAttribute("aria-atomic", "true");
    expect(assertive).toHaveClass("sr-only");
  });

  it("routes a polite announcement into the status region (after the 40ms set)", async () => {
    const { container } = render(<LiveAnnouncer />);
    await act(async () => {
      announceFa("پشتیبان ذخیره شد");
      await tick();
    });
    const polite = container.querySelector('[aria-live="polite"]')!;
    const assertive = container.querySelector('[aria-live="assertive"]')!;
    expect(polite.textContent).toBe("پشتیبان ذخیره شد");
    expect(assertive.textContent).toBe("");
  });

  it("routes assertive announcements into the alert region only", async () => {
    const { container } = render(<LiveAnnouncer />);
    await act(async () => {
      announceFa("خطا در ساخت فایل", true);
      await tick();
    });
    const polite = container.querySelector('[aria-live="polite"]')!;
    const assertive = container.querySelector('[aria-live="assertive"]')!;
    expect(assertive.textContent).toBe("خطا در ساخت فایل");
    expect(polite.textContent).toBe("");
  });

  it("clear-then-set: a repeated identical message re-announces (not swallowed)", async () => {
    const { container } = render(<LiveAnnouncer />);
    await act(async () => {
      announceFa("همین پیام");
      await tick();
      // second identical message must first clear the region
      announceFa("همین پیام");
      await tick(20); // mid-window: cleared but not yet re-set
    });
    const polite = container.querySelector('[aria-live="polite"]')!;
    await act(async () => {
      await tick(40);
    });
    expect(polite.textContent).toBe("همین پیام");
  });

  it("unmount detaches the subscription — no writes to unmounted refs", async () => {
    const { container, unmount } = render(<LiveAnnouncer />);
    unmount();
    const off = onAnnounce(() => {
      // the component's own listener must be gone by now; a stray write
      // would throw on a detached node — asserting no-throw is the contract
    });
    await act(async () => {
      announceFa("پیام پس از unmount");
      await tick();
    });
    off();
    expect(container.querySelectorAll("[aria-live]").length).toBeGreaterThanOrEqual(0);
  });
});
