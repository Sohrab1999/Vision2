(async () => {
  const answers = ["anything","international","historical","quietly","illness","attractions","behavior","junk","destination","means","range","located","generously","pilgrims","souvenir"];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const log = [];
  for (let i = 0; i < answers.length; i++) {
    let input = null;
    for (let t = 0; t < 40; t++) {
      input = document.querySelector('input[placeholder*="پاسخ"], input[type="text"]:not([disabled])');
      if (input && !input.disabled && !input.readOnly) break;
      await sleep(150);
    }
    if (!input) { log.push("NO-INPUT step" + i); break; }
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, answers[i]);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await sleep(350);
    const btn = [...document.querySelectorAll("button")].find((b) => b.textContent.includes("بررسی پاسخ") && !b.disabled);
    if (btn) btn.click();
    else input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await sleep(400);
    const fb = document.querySelector("[data-quiz-feedback]");
    const ok = fb && fb.textContent.includes("✓");
    log.push((ok ? "OK" : "FAIL") + " Q" + (i + 2) + "=" + answers[i] + (fb ? " |" + fb.textContent.replace(/\s+/g, " ").slice(0, 30) : "|no-fb"));
    // گذر با دو Enter (الگوی r344)
    for (const target of [document, window]) {
      target.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
    }
    await sleep(450);
  }
  return log.join("\n");
})()
