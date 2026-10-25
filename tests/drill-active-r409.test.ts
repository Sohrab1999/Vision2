// ------------------------------------------------------------------
// r409 — «دریل در جریان است» — استورِ خارجیِ drill-active.
//
// قفلهای کلاس:
//  · snapshotِ کلاینت boolean است؛ snapshotِ سرور همیشه false (هویتِ پایدار
//    برای useSyncExternalStore — دریل رویِ سرور معنا ندارد)
//  · نوشتنِ همگام + خبردادنِ مشترکین فقط در تغییرِ واقعی (idempotent —
//    نوشتنِ همان ارزش هیچکس را بیدار نمیکند)
//  · لغوِ اشتراک واقعی است — پس از unsubscribe هیچ خبری نمیرسد
//  · پرچم گذراست: هیچ persistای و هیچ نوشتنی به استورِ یادگیری —
//    مصرفکنندهٔ نوشتن فقط AppendixDrillView (فازِ run)، خواندن: راهنما
// ------------------------------------------------------------------

import { describe, it, expect, beforeEach } from "vitest";
import {
  setDrillActive,
  subscribeDrillActive,
  drillActiveSnapshot,
  drillActiveServerSnapshot,
} from "@/lib/drill-active";

describe("r409 — drill-active: استورِ خارجیِ پرچمِ جلسهٔ دریل", () => {
  beforeEach(() => setDrillActive(false));

  it("آغاز: خاموش — و snapshotِ سرور همیشه false (هویتِ پایدار)", () => {
    expect(drillActiveSnapshot()).toBe(false);
    expect(drillActiveServerSnapshot()).toBe(false);
    expect(drillActiveServerSnapshot()).toBe(drillActiveServerSnapshot());
  });

  it("روشن/خاموشِ همگام با خبردادنِ مشترکین", () => {
    let seen: boolean | null = null;
    const unsub = subscribeDrillActive(() => {
      seen = drillActiveSnapshot();
    });
    setDrillActive(true);
    expect(drillActiveSnapshot()).toBe(true);
    expect(seen).toBe(true); // خبرِ روشنشدن با snapshotِ تازه رسید
    setDrillActive(false);
    expect(drillActiveSnapshot()).toBe(false);
    expect(seen).toBe(false);
    unsub();
  });

  it("idempotent: نوشتنِ همان ارزش هیچ خبری نمیدهد (بدونِ رندرِ بیهوده)", () => {
    let calls = 0;
    const unsub = subscribeDrillActive(() => {
      calls++;
    });
    setDrillActive(true);
    setDrillActive(true); // همان ارزش — ساکت
    setDrillActive(true);
    expect(calls).toBe(1);
    setDrillActive(false);
    setDrillActive(false); // باز همان ارزش
    expect(calls).toBe(2);
    unsub();
  });

  it("لغوِ اشتراک واقعی است — پس از unsubscribe هیچ خبری نمیرسد", () => {
    let calls = 0;
    const unsub = subscribeDrillActive(() => {
      calls++;
    });
    setDrillActive(true);
    unsub();
    setDrillActive(false);
    setDrillActive(true);
    expect(calls).toBe(1); // فقط خبرِ پیش از لغو
    expect(drillActiveSnapshot()).toBe(true);
    setDrillActive(false); // بهداشتِ ماژول برایِ تستهایِ بعدی
  });
});
