import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r332 — گاردِ «تست گرامر و نگارش درس اول — استاندارد/متوسط» جزوهٔ دهم (ص۷۲-۷۴، کلیدِ توضیح‌دار ص۲۵۴-۲۵۷)
// دهمین گروه / بیست‌وپنجمین بانکِ درس‌محورِ پایهٔ دهم — ۴۰ MCQ هر آیتم با ترجمهٔ چاپیِ «ترجمه:» (الگوی r330).
// کلیدِ چاپی ۴۰/۴۰ صفر واگرایی. داوری‌های ۲۲۰۰-۹۰۰۰dpi: خداحافیط Q2، میز را Q5، دو day Q9، A:' Q11،
// جک،آرام Q13، --------------the Q14، شرکت بکنی/کافی Q19، کاوو/چور Q20، میبرد Q21، مشغول/حاضر Q22،
// می گوب Q26 (۶۰۰۰dpi)، دو پس/پسها/کرده Q27-d، مهمانی Q29، جین/مدت طولانی Q32، شیرفروشی/شیرینی Q34،
// تعطیلی Q36، بی تاب و بی حوصله Q38، خشکشویی/بگیریم Q39، هلن/راضی خواهی بود Q40،
// برچسب‌های قرمز (ریاضی ۹۴)/(تجاری ۹۴)، _ / گزینه‌های خالی Q32/Q36.

type TQ = {
  id: string; n: number; category: string; question: string; options: string[];
  answer: number; translation?: string; kind?: string; accepted?: string[]; placeholder?: string;
};
type TL = { lesson: number; title: string; level: string; count: number; questions: TQ[] };
type TBank = {
  grade: number;
  lessons: TL[];
  source: {
    file: string; exam: string; keyPages: string; keyVerification: string;
    extractedRound: string; pattern: string; translations: string;
    gram3?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// —— کلیدِ چاپیِ ص۲۵۴-۲۵۷ (۴۰ مدخل: گزینه + شیوهٔ حل + ترجمهٔ چاپی)
const PRINT_KEY_IDX = [
  0, 0, 2, 0, 1, 2, 1, 0, 3, 0, 1, 2, 3, 1, 3, 0, 2, 1, 1, 3,
  0, 0, 1, 2, 2, 1, 3, 0, 1, 3, 0, 1, 1, 2, 3, 0, 2, 3, 0, 3,
];
const PRINT_KEY_WORD = [
  "wakes", "will see", "are going to visit", "is going to faint", "help",
  "are going to", "will go", "cut / will", "is going to be", "is / will",
  "am going to go", "was going to", "are going to have", "does", "am going to / will",
  "isn’t going to be", "starts / are going to be", "am going to make", "Do / don’t", "will / will",
  "will win", "children / are playing", "countries", "wolves/were", "a missing kid",
  "people / prnciples",
  "Jamshid has two sons and a daughter. Sadly, one of the boys had a bad car accident two days ago.",
  "will inform", "The / Germany", "are / the", "peoples / beliefs", "the / will water",
  "knife / tomans", "the / am going to buy", "an / The injured people", "The / weeks",
  "sheep / a", "line", "am going to pick up", "will",
];

// —— ساقه‌های ص۷۲-۷۴ (عین چاپ — کوتیشن‌های خمیده و خط‌تیره‌های چسبیده حفظ شده)
const STEMS = [
  "On Friday mornings she --------------------- up at 7:30.",
  "A: “Sam is going abroad tomorrow afternoon.”  B: “Really? I -------------------- him off.”",
  "A: “Ahmad’s father has just been in hospital for two weeks.  B: “Yes, we ------------------ him at this time tomorrow.”",
  "She is so pale that I believe she---------------- now.",
  "A: Will you please -------------------- me carry the table?”  B: “Yes, sure”",
  "Samira and Saba ------------------- to the cinema tonight. It’s said that the movie is great. I wish I could go with them.",
  "A: “Hi Sobhan, it’s getting too dark. Don’t you want to come back home?”  B: “Yes dad, ok I ------------------- back very soon.”",
  "A: “I ------------ my finger a few seconds ago.”  B: “Ok, I ------------- bring the plaster soon”.",
  "We should wrap up warm, it has been snowing for two day, so it ------------------ very cold outside.",
  "The day after tomorrow -------------- my little son’s birthday and he ----------------- be seven years old.",
  "A:’ There’s nothing in the fridge.  B: “I know, I ------------------ shopping this evening.",
  "He ------------------------ her mother the whole truth, but he didn’t.",
  "Drive slowly! Jack! Otherwise, we -------------------- a car crash!",
  "A: “When --------------the sun come up every day”?  B: “I think it is around 6:30”.",
  "After graduation, I ------------------- an institute. I think it ----------------- attract lots of students.",
  "A: “Unfortunately, her daughter has just caught Covid-19.”  B: “Oh, that’s bad! She -------------------- in a good mood.”",
  "The film ------------ at 4:30 and now it’s 3:45. It takes an hour to reach the cinema, ------------ we will be late.",
  "A: “Why are you buying these things?”  B: “Because I ---------------- soup for Pedram.”",
  "A: ----------------- you want to attend these courses?  B: Actually no, I ----------------- have enough money.",
  "A: “Karo, -------------- you guide me how to solve this math problem?  B: “Yes. Don’t worry, I --------------- help you with it”",
  "There is a football match on TV tomorrow night. I feel Real Madrid --------------- against Barcelona.",
  "There are many ---------------- in the alley. They ----------------- right now.",
  "There are around 190 --------------- in the world. I wish we were able to visit all of them.",
  "I saw three --------------- in the mountain. They -------------- very dangerous.",
  "Coming back home, we found -----------------. She was crying loudly.",
  "A:” Today, few ------------- take notice of moral ---------------, do they”?  B: “Yes, you are right”.",
  "Which of the following is grammatically CORRECT?",
  "If you don’t follow the rules, I -------------- the police to catch you.",
  "-------------- guest who they invited was from -------------. He was a famous athlete.",
  "The police ------------ still looking into the murder. They believe they can catch ------------ killer soon.",
  "Since the creation, there have been a lot of ---------------- on the earth who have had different traditions and --------------- too.",
  "A: “Jane, we haven’t watered ----------------- flowers for a long period of time”  B: “Ok, I --------------- them very soon”.",
  "A: “Excuse me sir, how much is this -----------------?”  B: “It’s 100 thousand -------------------.”",
  "A: “Sahar, would you please drop me off next to --------- confectionary shop? I ------------ some sweet.”  B: “Yeah, sure.”",
  "The accident happened --------------- hour ago. --------------- were taken to hospital immediately.",
  "--------------- shops of our city will be closed tomorrow, and it lasts for two ------------------.",
  "Two of the ---------------- were devoured by ---------------- hungry wolf.",
  "Those people standing in --------------- are impatient with the long queue.",
  "A: “Where are you going?”  B: “I ------------- my coat from the cleaner’s. Is there anything I can do for you?” (ریاضی ۹۴)",
  "Helen is such a good English teacher that I’m sure you --------------- be happy with her. (تجاری ۹۴)",
];

// —— ترجمه‌های چاپی «ترجمه:» ص۲۵۴-۲۵۷ (عین چاپ با کوئیرک‌ها)
const TRANSLATIONS = [
  "او صبح های جمعه ساعت هفت و نیم از خواب بیدار می شود.",
  "الف: سام فردا بعد از ظهر به خارج از کشور می رود؟ ب: واقعا؟من می روم و با او خداحافیط خواهم کرد.",
  "الف: پدر اخیرا به مدت دو هفته در بیمارستان بوده است.\" ب:آره، ما قصد داریم فردا همین موقع از او دیدن کنیم.\"",
  "او آنقدر رنگش پریده است که باور دارم الان غش می کند.",
  "الف: میشه لطفا کمکم میز را حمل بکنم؟ ب:بله. حتما.",
  "سمیرا و صبا قصد دارند امشب به سینما بروند. میگویند که فیلم عالی است. ای کاش من هم میتوانستم با آنها بروم.",
  "الف: سلام سبحان، هوا دارد تاریک می شود. نمی خوایه به خانه برگردی؟ ب: بله پدر، باشه خیلی زود برخواهم گشت.",
  "الف: انگشتم را چند ثانیه قبل بریدم. ب: باشه زود چسب زخم را خواهم آورد.",
  "باید به خوبی لباس گرم بپوشیم، دو روز است که دارد برف می بارد، بنابراین بیرون خیلی سرد خواهد بود.",
  "پس فردا تولد پس کوچکم است و او هفت سالش خواهد شد.",
  "الف: هیچ چیز در یخچال نیست. ب: می دانم امروز عصر قصد دارم به خرید بروم.",
  "او قصد داشت تمام حقیقت را به مادرش بگوید اما این کار را نکرد.",
  "جک،آرام بکن! در غیر اینصورت تصادف خواهیم کرد.",
  "الف: خورشید هر روز ساعت چند طلوع می کند؟ ب: فکر بکنم حدود ساعت شش و نیم .",
  "بعد از اینکه فارغ التحصیل بشوم قصد دارم یک آموزشگاه تاسیس کنم. فکر می کنم دانش آموزان زیادی را (به خود) جذب خواهد کرد.",
  "الف: متاسفانه دختر او اخیرا بیماری کرونا گرفته است. ب: اوه، چه بد! او (الن) در حال و هوای خوب نیست.",
  "فیلم ساعت چهار و نیم شروع می شود و الان ساعت سه و چهل و پنج دقیقه است. یک ساعت هم طول می کشد تا به سینما برسیم، ما (قطعا) دیر خواهیم کرد.",
  "الف: چرا این چیزها را میخری؟ ب: زیرا قصد دارم برای پدرام سوپ درست بکنم.",
  "الف: آیا می خوایه در این دوره ها شرکت بکنی؟ ب:راستش نه. پول کافی ندارم.",
  "الف:کاوو میشه راهنماییم بکنی که چور این مسئله ریاضی را حل بکنم؟ ب:بله نگران نباش. کمکت خواهم کرد.",
  "الف: فردا شب در تلویزیون فوتبال پخش میشود. ب: من احساس می کنم که رئال مادرید در مقابل بارسلونا بازی را میبرد.",
  "بچه های زیادی در کوچه هستند . آنها در حال حاضر مشغول بازی کردن هستند.",
  "حدود 190 کشور در دنیا وجود دارد. ای کاش می توانستیم از همه آنها بازدید بکنیم.",
  "سه گرگ را در کوهستان دیدم. آنها خیلی خطرناک بودند.",
  "وقتی به خانه بر می گشتیم یک بچه گمشده را پیدا کردیم. او داشت با صدای بلند گریه می کرد.",
  "الف:امروزه مردم خیلی کم به اصول اخلاق توجه می کنند ,مگر نه؟ ب:بله درست می گوب.",
  "کدام یک از گزینه های زیر از نظر گرامری درست است ؟ — a: دایی من برای تولدم یک هدیه خرید. b: دو ماهی (آزاد) به دلیل کمبود مدت آب مردند. c: پژمان سه شنبه بعد می خواهد به خارج برود. d: جمشید دو پس و یک دختر دارد. متاسفانه یکی از پسها دو روز پیش تصادف بدی کرده.",
  "اگر از قوانین پیروی نکنی به پلیس اطلاع خواهم داد تا تو را دستگیر بکنند.",
  "مهمانی که آنها دعوت کردند اهل کشور آلمان بود . او یک ورزشکار مشهور بود.",
  "پلیس هنوز دارد درباره آن قتل تحقیق می کند. آنها معتقدند که می توانند قاتل را به زودی پیدا بکنند.",
  "از آغاز هستی اقوام زیادی روی زمین بوده اند که سنت ها و اعتقادات مختلفی داشته اند.",
  "الف: جین، مدت طولانی است که گل ها را آب نداده ایم . ب:باشه، به زودی آنها را آب می دهم.",
  "الف: ببخشید آقا قیمت این چاقو چقدر است؟ ب: قیمت آن صد هزار تومان است.",
  "سحر، میشه لطفا کنار آن مغازه شیرفروشی من را پیاده کنی؟ می خواهم کمی شیرینی بخرم.",
  "تصادف یک ساعت قبل اتفاق افتاد. مصدومان را فورا به بیمارستان بردند.",
  "مغازه های شهر ما فردا بسته خواهند شد و این تعطیلی تا دو هفته طول خواهد کشید.",
  "دو راس از گوسفندان توسط یک گرگ گرسنه بلعیده شدند.",
  "آن افرادی که در صف ایستاده اند از صف بی تاب و بی حوصله شده اند.",
  "الف: کجا داری می روی ؟ ب: قصد دارم کتم را از خشکشویی بگیریم. کاری هست که بتونم برای تو انجام بدهم؟",
  "هلن یک معلم خیلی خوب انگلیسی است که من مطمئنم تو از او راضی خواهی بود.",
];

const L25 = bank.lessons.find((l) => l.lesson === 25)!;

describe("jozve tests-g10 gram3 (r332 تست گرامر و نگارش درس اول — استاندارد/متوسط، p72-74, key pp254-257)", () => {
  it("gram3 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.gram3).toBeTruthy();
    const s = bank.source.gram3!;
    expect(s.exam).toContain("استاندارد/متوسط");
    expect(s.header).toContain("۲۵۴");
    expect(s.keyPages).toBe("254-257");
    expect(s.keyVerification).toContain("40/40");
    expect(s.extractedRound).toBe("r332");
    expect(s.pattern).toContain("r330");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(25);
    expect(s.printQuirks.some((q) => q.includes("خداحافیط"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("کاوو"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("می گوب"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("تجاری ۹۴"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("پاسخنامه تشریحی تستهای گرامر"))).toBe(true);
  });

  it("bank shape: 40 MCQ items, category grammar, 4 unique options each, no typed fields", () => {
    expect(L25.count).toBe(40);
    expect(L25.level).toContain("چهارگزینه‌ای");
    L25.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.accepted, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.category, q.id).toBe("grammar");
      expect(q.translation, q.id).toBeTruthy();
    });
  });

  it("40 answers locked to the printed key pp254-257 (index + option word)", () => {
    L25.questions.forEach((q, i) => {
      expect(q.answer, `Q${q.n} idx`).toBe(PRINT_KEY_IDX[i]);
      expect(q.options[q.answer], `Q${q.n} word`).toBe(PRINT_KEY_WORD[i]);
    });
  });

  it("40 stems locked verbatim to pp72-74", () => {
    L25.questions.forEach((q, i) => {
      expect(q.question, `Q${q.n}`).toBe(STEMS[i]);
    });
  });

  it("40 printed translations locked verbatim to pp254-257", () => {
    L25.questions.forEach((q, i) => {
      expect(q.translation, `Q${q.n}`).toBe(TRANSLATIONS[i]);
    });
  });

  it("print quirks visible in data: Q2 خداحافیط, Q5 میز را, Q9 two day, Q11 A:’, Q13 جک،آرام, Q14 the-چسبیده, Q20 کاوو/چور, Q21 میبرد, Q26 می گوب, Q27 دو پس, Q32 جین, Q34 شیرینی, Q38 بی تاب, Q39 بگیریم, Q40 هلن", () => {
    expect(L25.questions[1].translation).toContain("خداحافیط");
    expect(L25.questions[1].translation).toContain("واقعا؟من");
    expect(L25.questions[4].translation).toContain("میز را حمل بکنم؟ ب:بله. حتما.");
    expect(L25.questions[8].question).toContain("for two day,");
    expect(L25.questions[10].question).toContain("A:’ There’s nothing");
    expect(L25.questions[12].translation).toContain("جک،آرام بکن!");
    expect(L25.questions[13].question).toContain("--------------the sun");
    expect(L25.questions[13].question).toContain("day”?");
    expect(L25.questions[19].translation).toContain("الف:کاوو");
    expect(L25.questions[19].translation).toContain("چور این مسئله");
    expect(L25.questions[20].translation).toContain("میشود. ب: من احساس");
    expect(L25.questions[20].translation).toContain("میبرد.");
    expect(L25.questions[21].translation).toContain("هستند . آنها");
    expect(L25.questions[21].translation).toContain("مشغول بازی کردن");
    expect(L25.questions[24].translation).toContain("بر می گشتیم");
    expect(L25.questions[25].translation).toContain("می گوب.");
    expect(L25.questions[25].question).toContain("A:” Today, few");
    expect(L25.questions[25].question).toContain("they”?");
    expect(L25.questions[26].translation).toContain("دایی من برای تولدم");
    expect(L25.questions[26].translation).toContain("دو ماهی (آزاد)");
    expect(L25.questions[26].translation).toContain("جمشید دو پس و یک دختر");
    expect(L25.questions[26].translation).toContain("یکی از پسها");
    expect(L25.questions[26].options[1]).toContain("lack of water .");
    expect(L25.questions[26].options[2]).toContain("next Tuesday .");
    expect(L25.questions[28].translation).toContain("مهمانی که آنها");
    expect(L25.questions[31].translation).toContain("جین، مدت طولانی");
    expect(L25.questions[31].options[2]).toBe("_ / am going to water");
    expect(L25.questions[32].question).toContain("Excuse me sir,");
    expect(L25.questions[33].translation).toContain("شیرفروشی من را پیاده کنی؟");
    expect(L25.questions[33].translation).toContain("شیرینی بخرم");
    expect(L25.questions[35].options[1]).toBe("_ / weeks");
    expect(L25.questions[37].translation).toContain("بی تاب و بی حوصله");
    expect(L25.questions[38].question).toContain("(ریاضی ۹۴)");
    expect(L25.questions[38].translation).toContain("می روی ؟");
    expect(L25.questions[38].translation).toContain("خشکشویی بگیریم.");
    expect(L25.questions[39].question).toContain("(تجاری ۹۴)");
    expect(L25.questions[39].translation).toContain("هلن یک معلم");
    expect(L25.questions[39].translation).toContain("راضی خواهی بود");
    // برچسب‌های قرمز و گزینه‌های اسلش‌دار Q24
    expect(L25.questions[23].options[0]).toBe("wolves/are");
    expect(L25.questions[23].options[3]).toBe("wolfs / are");
  });

  it("ids unique across the whole 482-item family (r333 gram4 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1062);
  });
});
