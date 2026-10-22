// r318 probe — my-words launcher rows: which row overflows and by how much
(() => {
  const rows = [...document.querySelectorAll(".min-w-0.flex-1")].filter(
    (d) => d.scrollWidth > d.clientWidth + 1
  );
  return JSON.stringify({
    count: rows.length,
    rows: rows.map((r) => {
      const h = r.querySelector("h2");
      return {
        h2: h ? h.textContent.trim() : "",
        over: r.scrollWidth - r.clientWidth,
        h2over: h ? h.scrollWidth - h.clientWidth : null,
        btns: r.parentElement.querySelectorAll("button").length,
      };
    }),
  });
})()
