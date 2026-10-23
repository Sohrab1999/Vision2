// r341 — پروبِ mountِ توستِ رادیکس + شناسنامهٔ کاملِ آن (درسِ r337/r340:
//   صفرِ بی mount فریبنده است). توستِ رادیکس `li[data-state=open]` داخلِ
//   ToastViewport است؛ عنوان = ToastTitle، توضیح = ToastDescription.
//   خروجی: JSON {found, count, title, desc, cls, bg, ink, corkbd}
(() => {
  const items = [...document.querySelectorAll('[data-radix-toast-announce], li[data-state="open"]')]
    .filter((el) => {
      const vp = el.closest('[data-radix-toast-viewport]');
      if (vp) return true;
      return el.tagName === 'LI' && el.className.includes('pointer-events-auto');
    })
    .filter((el) => el.getBoundingClientRect().height > 0);
  if (!items.length) {
    return JSON.stringify({ found: false, count: 0, bodyHasToastText: false });
  }
  const first = items[0];
  const full = (first.innerText || '').replace(/\n/g, ' | ').slice(0, 90);
  const cs = getComputedStyle(first);
  return JSON.stringify({
    found: true,
    count: items.length,
    text: full,
    cls: (first.className.match(/(?:bg|text)-[a-z-]+[\d]*/g) || []).join(','),
    bg: cs.backgroundColor,
    ink: cs.color,
    state: first.getAttribute('data-state'),
  });
})()
