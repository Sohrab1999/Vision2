// r339 — پروبِ mountِ دو دیالوگِ ثالث (درسِ r337: «صفر» بدونِ mount فریبنده است)
//   راهنمای میانبر: درها (۶ عضوِ RESUME_LOOP_DOORS)، درِ هدرِ فعال (شخصیتِ
//   پُرِ r338 رکورد دارد)، جدولِ پوشش (۱۱ عضو)، بندِ کهربایی.
//   فرمان‌یاب: گروهها، گزینهها، ردیفِ فعال (data-active)، چیپِ Enter،
//   حالتِ خالی (SearchX)، مقدارِ فعلیِ جست‌وجو.
(() => {
  const g = document.querySelector('.shortcuts-dialog[data-state="open"]');
  const p = document.querySelector('.command-palette[data-state="open"]');
  const doors = [...document.querySelectorAll('[data-testid^="resume-door-"]')];
  const hd = document.querySelector('[data-testid="resume-door-header"]');
  const active = p ? p.querySelector('[data-active="true"]') : null;
  return JSON.stringify({
    guide: !!g,
    palette: !!p,
    doors: doors.length,
    headerDoor: hd ? (hd.disabled ? "disabled" : "enabled") : "missing",
    coverage: document.querySelectorAll('[data-testid^="coverage-"]').length,
    amberNote: g ? (g.textContent.includes("میان‌برهای حرفی") ? 1 : 0) : 0,
    groups: p ? p.querySelectorAll('#command-palette-list [role="group"]').length : -1,
    opts: p ? p.querySelectorAll('#command-palette-list [role="option"]').length : -1,
    activeRow: p ? (active ? 1 : 0) : -1,
    enterChip: p && active ? (active.textContent.includes("Enter") ? 1 : 0) : -1,
    emptyState: p ? (p.textContent.includes("فرمانی یافت نشد") ? 1 : 0) : -1,
    query: p ? (p.querySelector("input")?.value ?? "") : null,
  });
})()
