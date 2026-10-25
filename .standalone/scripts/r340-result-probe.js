// r340 — پروبِ mountِ نمایِ نتیجه (آزمون جامع / شبیهساز کنکور)
//   درسِ r337: «صفر» بدونِ mount فریبنده است — هر بخشِ شرطی باید سندِ
//   زنده داشته باشد: کارتِ گواهی (certificate-card فقط برایِ آزمون)،
//   نام، درصد، پیامِ grade، چیپهایِ آمار، فهرستِ مرور، دکمههایِ CTA.
(() => {
  const t = document.body.innerText;
  const btns = [...document.querySelectorAll("button")].map((b) => (b.textContent || "").trim());
  return JSON.stringify({
    cert: !!document.querySelector(".certificate-card"),
    certName: document.querySelector('[data-testid="cert-name"]')?.textContent ?? null,
    finalResult: t.includes("نتیجهٔ نهایی"),
    percent: (t.match(/[۰-۹0-9]+\s*[٪%]/) || [null])[0],
    gradeMsg: t.includes("عالی") || t.includes("خوب") || t.includes("تلاش") || t.includes("بیشتر"),
    chips: (t.match(/درست|غلط|بی‌پاسخ/g) || []).length,
    reviewRows: document.querySelectorAll(".en-text").length,
    ctas: btns.filter((b) => /اشتراک|گواهی|تلاش|بازگشت|خانه|مرور/.test(b)).length,
    isExam: t.includes("آزمون جامع") || t.includes("پایان ترم"),
    isKonkur: t.includes("کنکور"),
  });
})()
