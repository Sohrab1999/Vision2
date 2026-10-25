// r319 — ممیزیِ دامِ basis-صفر در کلِ app (تعمیمِ r318-probe)
//   درسِ r318: «min-w-0 flex-1» در سطرِ رقیب‌دار (آیکنِ shrink-0 + دکمهٔ shrink-0)
//   کفِ min-content را میبلعد و متنِ نشکن را له میکند — سه راهاندازِ «واژههای من»
//   قربانیِ همان بودند. این پروب هر عنصرِ min-w-0+flex-1 رویِ سطحِ حاضر را میسنجد:
//     · truncate دارد           → برشِ طراحی‌شده (پیشفرضِ سالمِ ellipsis) — مشروع
//     · INPUT/TEXTAREA          → اسکرولِ درونیِ خودِ فیلد — مشروع
//     · والدِ column            → flex-1 یعنی ارتفاع؛ min-w-0 برِ محورِ عرضی بیربط است — مشروع
//     · dir=row && over>1       → کاندیدای واقعیِ لهشدگی (suspect)
(() => {
  const els = [...document.querySelectorAll('[class*="min-w-0"][class*="flex-1"]')].filter((el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
  });
  const report = els.map((el) => {
    const pcs = el.parentElement ? getComputedStyle(el.parentElement) : null;
    return {
      tag: el.tagName,
      dir: pcs ? pcs.flexDirection : "?",
      wrap: pcs ? pcs.flexWrap : "?",
      truncated: el.classList.contains("truncate"),
      over: el.scrollWidth - el.clientWidth,
      cls: String(el.className).slice(0, 56),
    };
  });
  const suspects = report.filter(
    (r) => !r.truncated && r.tag !== "INPUT" && r.tag !== "TEXTAREA" && r.dir === "row" && r.over > 1,
  );
  return JSON.stringify({
    total: report.length,
    rowItems: report.filter((r) => r.dir === "row").length,
    truncated: report.filter((r) => r.truncated).length,
    suspects,
  });
})()
