// r338 — پروبِ mountِ دو پاپ‌آور: کدام بخشهایِ شرطی واقعاً زندهاند؟
//   درسِ r337: قفلِ منبع جانشینِ سنجشِ زنده نیست — این پروبِ خودش را سند
//   میکند (شمارشِ ردیفها/بخشها) تا «صفرِ» dbgِ بدونِ mount فریبنده نباشد.
(() => {
  const vis = (el) => {
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" ? 1 : 0;
  };
  const wraps = [...document.querySelectorAll("[data-radix-popper-content-wrapper]")].filter((w) => {
    const r = w.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  const slot = document.querySelector('[data-slot="popover-content"]');
  const inWrap = (sel) => wraps.some((w) => w.querySelector(sel) && vis(w.querySelector(sel)));
  const txt = (sel) => {
    for (const w of wraps) {
      const e = w.querySelector(sel);
      if (e) return (e.textContent || "").trim().slice(0, 40);
    }
    return "-";
  };
  // کدام پاپ‌آور؟ تنظیمات: radiogroupِ «اندازهٔ متن»؛ پروفایل: inputِ نام
  const isSettings = inWrap('[aria-label="اندازهٔ متن"]');
  const isProfile = inWrap('input[maxlength="24"]');
  return JSON.stringify({
    wrappers: wraps.length,
    isSettings,
    isProfile,
    // — تنظیمات —
    fontRadios: wraps.reduce((a, w) => a + w.querySelectorAll('[role="radio"][aria-label="اندازهٔ متن"], [role="radiogroup"][aria-label="اندازهٔ متن"] [role="radio"]').length, 0),
    goalRadios: wraps.reduce((a, w) => a + w.querySelectorAll('[role="radiogroup"][aria-label="هدف روزانهٔ فعالیت"] [role="radio"]').length, 0),
    activeRadios: wraps.reduce((a, w) => a + w.querySelectorAll('[role="radio"][aria-checked="true"]').length, 0),
    motionSwitch: inWrap('[aria-label="کاهش حرکت و انیمیشن"]'),
    motionChecked: (wraps.map((w) => w.querySelector('[aria-label="کاهش حرکت و انیمیشن"]')).find(Boolean)?.getAttribute("data-state")) || "-",
    pulseTrack: inWrap(".c-track-80"),
    pulseRows: wraps.reduce((a, w) => a + w.querySelectorAll(".c-track-80").length, 0),
    installRow: wraps.some((w) => (w.textContent || "").includes("نصب وب‌کتاب روی دستگاه")) ? 1 : 0,
    profileLink: wraps.some((w) => (w.textContent || "").includes("نام، رنگ و پشتیبان‌گیری")) ? 1 : 0,
    // — پروفایل —
    avatarDots: wraps.reduce((a, w) => a + w.querySelectorAll('button[aria-label^="رنگ "]').length, 0),
    avatarSelected: wraps.reduce((a, w) => a + w.querySelectorAll('button[aria-label^="رنگ "].scale-110').length, 0),
    nameValue: (wraps.map((w) => w.querySelector('input[maxlength="24"]')).find(Boolean)?.value || "-").slice(0, 20),
    saveBtn: txt("button"),
    resumeSection: inWrap('[data-testid="profile-resume-section"]'),
    resumeTitle: txt('[data-testid="profile-resume-section"] .truncate'),
    historyRows: wraps.reduce((a, w) => a + w.querySelectorAll('[data-testid^="profile-history-item-"]').length, 0),
    doorRows: wraps.reduce((a, w) => a + w.querySelectorAll('[data-testid^="profile-resume-door-"]').length, 0),
    autoSnapCard: wraps.some((w) => (w.textContent || "").includes("پشتیبان خودکار")) ? 1 : 0,
    autoSnapEmpty: wraps.some((w) => (w.textContent || "").includes("هر روز یک پشتیبان خودکار")) ? 1 : 0,
    syncCreate: wraps.some((w) => (w.textContent || "").includes("ساخت کد یادگیرنده")) ? 1 : 0,
    syncAttached: wraps.some((w) => (w.textContent || "").includes("به‌روزرسانی ابری")) ? 1 : 0,
  });
})();
