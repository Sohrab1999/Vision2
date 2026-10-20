import { describe, expect, it } from "vitest";
import {
  buildPhraseRegex,
  buildHighlightRegex,
  makeSnippet,
  normSearchText,
  searchTerms,
} from "@/lib/jozve-search";
import { searchJozve } from "@/lib/jozve-search.server";

// ------------------------------------------------------------------
// پیمان‌های r412 — «هایلایتِ دوطبقه»: عبارتِ پیوسته (زمردی) بر لایهٔ
// واژه‌ها (کهربایی) سوار می‌شود؛ snippet عبارت‌محور می‌شود و سرور پرچمِ
// phraseHit را روی نتایجی می‌گذارد که کلِ عبارت در متنِ خامِ‌شان نشسته.
// ------------------------------------------------------------------

describe("buildPhraseRegex — عبارتِ پیوسته", () => {
  it("پرس‌وجوی تک‌واژه‌ای یا خالی null می‌دهد (لایهٔ عبارت معنا ندارد)", () => {
    expect(buildPhraseRegex([])).toBeNull();
    expect(buildPhraseRegex(["حال"])).toBeNull();
    expect(buildPhraseRegex(["!!!"])).toBeNull(); // واژهٔ بی‌حرف
  });

  it("عبارت روی فاصلهٔ معمولی می‌نشیند", () => {
    const re = buildPhraseRegex(["حال", "کامل"])!;
    expect("گذشته کامل حال کامل آینده".match(re)).not.toBeNull();
  });

  it("عبارت روی نیم‌فاصله و فاصلهٔ چندتایی می‌نشیند", () => {
    const re = buildPhraseRegex(["حال", "کامل"])!;
    expect("حال\u200cکامل".match(re)).not.toBeNull();
    expect("حال   کامل".match(re)).not.toBeNull();
  });

  it("هم‌ارزهای نویسه‌ای (ی/ي، ک/ك، ا/أ) روی متنِ خام می‌نشینند", () => {
    const re = buildPhraseRegex(["یادگیری", "زبان"])!;
    expect("يادگيري زبان".match(re)).not.toBeNull();
    const re2 = buildPhraseRegex(["حال", "کامل"])!;
    expect("حأل كامل".match(re2)).not.toBeNull();
  });

  it("عبارتِ پیوسته نیست — واژهٔ دیگر میان‌شان — تطبیق نمی‌شود", () => {
    const re = buildPhraseRegex(["حال", "کامل"])!;
    expect("حالِ گذشتهٔ کامل".match(re)).toBeNull();
  });

  it("ترتیبِ واژه‌ها عوض شود تطبیق نمی‌شود («پیوسته» یعنی به‌ترتیب)", () => {
    const re = buildPhraseRegex(["حال", "کامل"])!;
    expect("کامل حال".match(re)).toBeNull();
  });

  it("پرچمِ i — بزرگ/کوچکِ لاتین بی‌اثر است", () => {
    const re = buildPhraseRegex(["present", "perfect"])!;
    expect("PRESENT PERFECT".match(re)).not.toBeNull();
    expect("Present Perfect".match(re)).not.toBeNull();
  });

  it("regex واژه‌ها را نمی‌شکند — دو لایه با هم سازگارند", () => {
    const terms = searchTerms("حال کامل");
    expect(terms).toEqual(["حال", "کامل"]);
    const termsRe = buildHighlightRegex(terms)!;
    const phraseRe = buildPhraseRegex(terms)!;
    const text = "حال کامل در گذشته کامل";
    // عبارت در متن هست؛ هر دو regex نشستِ مستقل دارند
    expect(text.match(phraseRe)).not.toBeNull();
    expect(text.match(termsRe)).not.toBeNull();
  });
});

describe("makeSnippet با لایهٔ عبارت — مرکزِ قطعه عبارت‌محور می‌شود", () => {
  // پیش‌وندِ >۷۰ نویسه‌ای تا برشِ لبه در پیمانِ سازگاری قطعی شود
  const text =
    "پیش‌درآمدِ نسبتاً بلندی از متن که عمداً بیش از هفتاد نویسه است تا هر نشستی در میانه‌های متن بیفتد و برش‌های «…» قطعی شوند؛ عبارتِ هدف اینجاست و پس از آن ادامهٔ نسبتاً بلندی از متن می‌آید تا برشِ انتهایی هم دیده شود.";

  it("بدونِ عبارت — رفتارِ قدیمی حفظ شده (پیمانِ سازگاری)", () => {
    const terms = ["هدف"];
    const s = makeSnippet(text, terms);
    expect(s).toContain("هدف");
    // نشست در میانه است — هر دو لبه بریده می‌شوند (رفتارِ r410)
    expect(s.startsWith("…")).toBe(true);
    expect(s.endsWith("…")).toBe(true);
  });

  it("با عبارت — قطعه حولِ نشستِ عبارت بریده می‌شود حتی اگر واژه‌ای دیگری زودتر در متن باشد", () => {
    // «بلندی» در همان پیش‌درآمدِ آغازین آمده — بی‌لایهٔ عبارت، قطعه آنجا مرکز می‌شد
    const terms = ["بلندی", "دیده"];
    const phrase = buildPhraseRegex(["هدف", "اینجاست"])!;
    const s = makeSnippet(text, terms, 30, phrase);
    expect(s).toContain("هدف اینجاست");
  });

  it("عبارت در متن نیست — به لایهٔ واژه‌ها سقوط می‌کند", () => {
    const terms = ["هدف"];
    const phrase = buildPhraseRegex(["دوازده", "نود"])!; // عبارتِ بی‌نشست
    const s = makeSnippet(text, terms, 40, phrase);
    expect(s).toContain("هدف");
  });
});

describe("searchJozve — پرچمِ phraseHit روی کورپوسِ واقعی", () => {
  it("نتایجِ «حال کامل» حداقل یک phraseHit دارند و عیناً عبارت در text است", () => {
    const r = searchJozve("حال کامل", { limit: 30 });
    expect(r.results.length).toBeGreaterThan(0);
    const hits = r.results.filter((x) => x.phraseHit);
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      // متنِ خام باید هر دو واژه را پیوسته داشته باشد
      expect(normSearchText(h.text)).toContain("حال کامل");
      // snippet هم عبارت‌محور شده
      expect(normSearchText(h.snippet)).toContain("حال کامل");
    }
  });

  it("پرس‌وجوی تک‌واژه‌ای هیچ phraseHit نمی‌دهد (لایهٔ عبارت وجود ندارد)", () => {
    const r = searchJozve("passive", { limit: 10, kind: "question" });
    expect(r.results.length).toBeGreaterThan(0);
    expect(r.results.every((x) => !x.phraseHit)).toBe(true);
  });

  it("phraseHit سازگاریِ شکلِ پاسخ را نمی‌شکند — فیلدهایِ قدیمی سرِ جایشان", () => {
    const r = searchJozve("حال کامل", { limit: 5 });
    for (const x of r.results) {
      expect(typeof x.kind).toBe("string");
      expect(typeof x.bookTitle).toBe("string");
      expect(typeof x.snippet).toBe("string");
      expect(typeof x.score).toBe("number");
      // phraseHit اختیاری است — یا غایب یا true
      if (x.phraseHit !== undefined) expect(x.phraseHit).toBe(true);
    }
  });
});
