// ------------------------------------------------------------------
// r410 — استورِ «سطحِ شنیدار» (lib/listen-surface) — دوقلویِ drill-active
// (r409) با قراردادِ خودش: T را از پوسته میگیرد، نه ناوبری را.
//
// قفلهای کلاس:
//  · نوشتنِ idempotent — همان ارزش هیچ خبری نمیدهد (مشترک دوبار
//    صدا زده نمیشود)
//  · اشتراک لغوپذیر است — پسِ unsubscribe خبری نمیرسد
//  · snapshotِ سرور همیشه false — پرچم رویِ سرور معنا ندارد
//  · snapshotِ کلاینت booleanِ پایدار است (هویتِ useSyncExternalStore)
// ------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest";
import {
  setListenSurface,
  subscribeListenSurface,
  listenSurfaceSnapshot,
  listenSurfaceServerSnapshot,
} from "@/lib/listen-surface";

describe("listen-surface r410 — پرچمِ سطحِ شنیدار", () => {
  it("نوشتنِ idempotent است — همان ارزش، خبرِ دومی نمیدهد", () => {
    setListenSurface(false);
    const cb = vi.fn();
    subscribeListenSurface(cb);
    setListenSurface(true);
    expect(cb).toHaveBeenCalledTimes(1);
    setListenSurface(true); // همان ارزش — ساکت
    expect(cb).toHaveBeenCalledTimes(1);
    setListenSurface(false);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("لغوِ اشتراک واقعی است — پسِ unsubscribe خبری نمیرسد", () => {
    setListenSurface(false);
    const cb = vi.fn();
    const unsub = subscribeListenSurface(cb);
    unsub();
    setListenSurface(true);
    expect(cb).not.toHaveBeenCalled();
    expect(listenSurfaceSnapshot()).toBe(true);
    setListenSurface(false);
  });

  it("snapshotِ سرور همیشه false است — سطحِ شنیدار رویِ سرور معنا ندارد", () => {
    setListenSurface(true);
    expect(listenSurfaceServerSnapshot()).toBe(false);
    expect(listenSurfaceSnapshot()).toBe(true);
    setListenSurface(false);
    expect(listenSurfaceServerSnapshot()).toBe(false);
  });

  it("snapshotِ کلاینت همیشه boolean است — هویتِ پایدار برایِ useSyncExternalStore", () => {
    setListenSurface(true);
    expect(listenSurfaceSnapshot()).toBe(true);
    expect(typeof listenSurfaceSnapshot()).toBe("boolean");
    setListenSurface(false);
    expect(listenSurfaceSnapshot()).toBe(false);
  });
});
