import { describe, expect, it } from "vitest";
import fs from "node:fs";

// r330 — گاردِ «تست گرامر و نگارش درس اول» جزوهٔ دهم (ص۶۶-۶۷، کلیدِ توضیح‌دار ص۲۴۹-۲۵۱)
// هشتمین گروه / هفدهمین بانکِ درس‌محورِ پایهٔ دهم — ۲۰ MCQ هر آیتم با ترجمهٔ چاپیِ «ترجمه تست» (الگوی r328).
// کلیدِ چاپی ۲۰/۲۰ صفر واگرایی. داوری‌های ۳۰۰۰-۸۰۰۰dpi: «دستگری» سربرگ، «پس/پسر» Q3، «بخرد» Q4،
// «قراره/بشوریم» Q11، «کمی(مداد و خودکار)» Q16، «اوه..کاملاً» Q17، «ساعت۹:۳۰» Q19، «میدونم/میشود» Q20،
// «آمریکا هستند» Q13 (گپ ۲.۳۳pt در بازهٔ فاصلهٔ واقعی ۱.۶-۳.۱pt — خوانش چشمیِ نخست رد شد).

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
    gram2?: {
      exam: string; header: string; keyPages: string; keyVerification: string;
      extractedRound: string; pattern: string; printQuirks: string[];
    };
  };
};

const bank: TBank = JSON.parse(
  fs.readFileSync("public/jozve/tests-g10.json", "utf8"),
) as unknown as TBank;

// —— کلیدِ چاپیِ ص۲۴۹-۲۵۱ (۲۰ مدخل: گزینه + شیوهٔ حل + ترجمه تست)
const PRINT_KEY_IDX = [0, 1, 1, 3, 2, 1, 3, 0, 2, 3, 0, 3, 1, 0, 1, 2, 0, 2, 0, 2];
const PRINT_KEY_WORD = [
  "live", "to read", "children / a / The", "is going to buy", "an / Their / -",
  "will teach", "These / the", "is going to travel", "are going to invite", "are going to paint",
  "’m going to wash / them", "is going to cook", "to teach / - / the", "am going to show", "are going to protect",
  "will lend", "will send", "is going to help", "leaves", "begins",
];

// —— ساقه‌های ص۶۶-۶۷ (عین چاپ)
const STEMS = [
  "When people keep the earth clean and safe, most kinds of animals will --------------- longer in the future.",
  "Other students are going ------------------- their friends’ reports and learn many things about nature and sea animals.",
  "Our neighbor has a big family. He has four ----------, --------- boy and three girls. --------- boy is 7 years old and their girls are 3, 16 and 20.",
  "Mr. Rahimi’s little daughter broke his expensive laptop. He --------------------- a new one next month.",
  "Armin and Alireza have ---------- Italian class together. ------------- teacher is ----------- Mr. Del Piero.",
  "A: My classmates and I don’t know how to answer these difficult math questions.  B: They’re really easy. Don’t worry my dear students. I --------------------- you these questions again.",
  "------------- shops aren’t very expensive, because they’re not in the center of ------------- town.",
  "Next Saturday, my cousin ----------------- to Tehran for 2 days to visit Milad Tower and Azadi Square.",
  "My parents have decided to have a great birthday party for me. They --------------------- my best friends next Wednesday.",
  "A: Why did they buy a lot of paint last week?  B: Because they --------------------- all the classes of our school soon.",
  "A: The windows of your house are really dirty.  B: Yes, I know. I -------------------- and clean -------------------- with my sister next Friday.",
  "Our mother has bought some rice, meat from the supermarket. So, she ----------------------- a delicious food tomorrow night.",
  "Most of the professors who are going ---------- us English at university are from ---------- Mexico and ---------- USA.",
  "When you come to our house Sunday night, I --------------------- you my big new toy train.",
  "The hard-working zookeepers in our city’s zoo ---------------- the endangered animals more seriously.",
  "A: I don’t have any pens and pencils in my school bag today.  B: Really? Well, I --------------- you some.",
  "A: Did you send your homework for the teacher?  B: Oh, I completely forgot, I ------------------- it after dinner.",
  "Raman helped his friend, Arshan to solve his math problems. He ------------------ him do his homework next Thursday.",
  "My flight ---------------- at 9:30 tomorrow, so I need to get to the airport by 9:00. (کنکور منحصراً زبان)",
  "I don’t know what time the movie ------------------ tonight. (کنکور منحصراً زبان)",
];

// —— ترجمه‌های چاپی «ترجمه تست» ص۲۴۹-۲۵۱ (عین چاپ با کوئیرک‌ها)
const TRANSLATIONS = [
  "زمانیکه مردم، کره زمین را تمیز و امن نگه دارند، بیشتر حیوانات در آینده طولانی تر خواهند زیست.",
  "سایر دانش آموزان قرار است که گزارشات دوستان خود را خوانده و چیزهای زیادی در مورد طبیعت و حیوانات دریایی یاد بگیرند.",
  "همسایه ما خانواده پر جمعیتی دارد. او صاحب چهار فرزند است. یک پس و سه دختر. پسر ۷ ساله دارد و دخترها ۳، ۱۶ و ۲۰ ساله هستند.",
  "دختر کوچک آقای رحیمی لپ تاپ گران قیمت او را شکست. او قرار است یک لپ تاپ جدید را ماه آینده بخرد.",
  "آرمین و علیرضا به یک کلاس زبان ایتالیایی میروند و معلم آنها آقای دل پیرو است.",
  "الف: من و همکلاسیهایم نمیدانیم چطور به این سوالات سخت ریاضی پاسخ دهیم.\" ب: این سوالات واقعاً آسان هستند نگران نباشید. من این سوالات را دوباره به شما تدریس خواهم کرد.",
  "این مغازه ها خیلی گران قیمت نیستند، چونکه در مرکز شهر نیستند.",
  "شنبه آینده عموزاده من قرار است به مدت ۲ روز به تهران، برای دیدن کردن از برج میلاد و میدان آزادی، سفر کند.",
  "والدین من تصمیم گرفته اند یک مهمانی تولد برای من بگیرند. آنها قرار است تعداد زیادی از بهترین دوستانم را برای چهارشنبه آینده دعوت کنند.",
  "الف- چرا آنها هفته گذشته آن همه رنگ را خریدند؟ ب- زیرا آنها قصد دارند همه کلاسهای مدرسه ما را به زودی رنگ آمیزی کنند.",
  "الف- پنجره های خانه شما واقعاً کثیف هستند. ب- بله میدانم. من قراره با خواهرم جمعه آینده آنها را بشوریم و تمیز کنیم.",
  "مادرم کمی برنج و گوشت را از سوپرمارکت خریده است. او قصد دارد برای فردا شب یک شام خوشمزه ای را بپزد.",
  "بیشتر اساتیدی که امسال قرار است به ما در دانشگاه زبان انگلیسی را تدریس کنند اهل کشور مکزیک و ایالات متحده آمریکا هستند.",
  "اگه (زمانیکه) شما یکشنبه شب به خانه ما آمدید، قطار اسباب بازی جدید بزرگم را به تو نشان خواهم داد.",
  "نگهبانان سختکوش در باغ وحش شهر ما قرار است از حیوانات در معرض خطر به طور جدی تری محافظت کنند",
  "الف- من امروز هیچ خودکار و مدادی در کیفم ندارم. ب- واقعاً؟ نگران نباش. من بهت کمی(مداد و خودکار) به تو قرض خواهم داد.",
  "الف- آیا تکلیفت را برای معلم ارسال کردی؟ ب- اوه..کاملاً فراموش کردم. بعد از شام آن را ارسال خواهم کرد.",
  "رامان به دوستش آرشان کمک کرد که مسائل ریاضی را حل کند. قرار است که پنج شنبه آینده به او در انجام تکلیفش کمک کند.",
  "پرواز من در ساعت۹:۳۰ خواهد بود (حرکت میکنه). بنابراین لازمه که تا ساعت ۹ در فرودگاه باشم.",
  "آیا میدونم امشب فیلم سینمایی ساعت چند شروع میشود. (شروع خواهد شد.)؟",
];

const L17 = bank.lessons.find((l) => l.lesson === 17)!;

describe("jozve tests-g10 gram2 (r330 تست گرامر و نگارش درس اول — p66-67, key pp249-251)", () => {
  it("gram2 receipt complete: header, key pages, round, pattern, quirks", () => {
    expect(bank.source.gram2).toBeTruthy();
    const s = bank.source.gram2!;
    expect(s.exam).toContain("تست گرامر و نگارش درس اول");
    expect(s.header).toContain("۲۴۹");
    expect(s.keyPages).toBe("249-251");
    expect(s.keyVerification).toContain("20/20");
    expect(s.extractedRound).toBe("r330");
    expect(s.pattern).toContain("r328");
    expect(s.printQuirks.length).toBeGreaterThanOrEqual(12);
    expect(s.printQuirks.some((q) => q.includes("دستگری"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("ساعت۹:۳۰"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("کنکور منحصراً زبان"))).toBe(true);
    expect(s.printQuirks.some((q) => q.includes("۲.۳۳pt"))).toBe(true);
  });

  it("bank shape: 20 MCQ items, category grammar, 4 unique options each, no typed fields", () => {
    expect(L17.count).toBe(20);
    expect(L17.level).toContain("چهارگزینه‌ای");
    L17.questions.forEach((q) => {
      expect(q.kind, q.id).toBeUndefined();
      expect(q.accepted, q.id).toBeUndefined();
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, q.id).toBe(4);
      expect(q.category, q.id).toBe("grammar");
      expect(q.translation, q.id).toBeTruthy();
    });
  });

  it("20 answers locked to the printed key pp249-251 (index + option word)", () => {
    L17.questions.forEach((q, i) => {
      expect(q.answer, `Q${q.n} idx`).toBe(PRINT_KEY_IDX[i]);
      expect(q.options[q.answer], `Q${q.n} word`).toBe(PRINT_KEY_WORD[i]);
    });
  });

  it("20 stems locked verbatim to pp66-67", () => {
    L17.questions.forEach((q, i) => {
      expect(q.question, `Q${q.n}`).toBe(STEMS[i]);
    });
  });

  it("20 printed translations locked verbatim to pp249-251", () => {
    L17.questions.forEach((q, i) => {
      expect(q.translation, `Q${q.n}`).toBe(TRANSLATIONS[i]);
    });
  });

  it("print quirks visible in data: Q3 پس/پسر, Q11 قراره/بشوریم, Q13 آمریکا هستند, Q16 کمی(, Q17 اوه..کاملاً, Q19 ساعت۹:۳۰, Q20 میدونم/میشود", () => {
    expect(L17.questions[2].translation).toContain("یک پس و سه دختر. پسر ۷ ساله");
    expect(L17.questions[10].translation).toContain("من قراره با خواهرم");
    expect(L17.questions[10].translation).toContain("بشوریم و تمیز کنیم");
    expect(L17.questions[12].translation).toContain("آمریکا هستند");
    expect(L17.questions[15].translation).toContain("کمی(مداد و خودکار)");
    expect(L17.questions[16].translation).toContain("اوه..کاملاً");
    expect(L17.questions[18].translation).toContain("ساعت۹:۳۰");
    expect(L17.questions[18].translation).toContain("تا ساعت ۹");
    expect(L17.questions[19].translation).toContain("میدونم");
    expect(L17.questions[19].translation).toContain("میشود. (شروع خواهد شد.)؟");
    // برچسب کنکور در ساقه‌ها + گزینه‌های آپاستروف‌دار Q11
    expect(L17.questions[18].question).toContain("(کنکور منحصراً زبان)");
    expect(L17.questions[19].question).toContain("(کنکور منحصراً زبان)");
    expect(L17.questions[10].options[0]).toBe("’m going to wash / them");
    expect(L17.questions[10].options[1]).toBe("’ll wash / it");
  });

  it("ids unique across the whole 482-item family (r333 gram4 appended)", () => {
    const ids = bank.lessons.flatMap((l) => l.questions.map((q) => q.id));
    expect(new Set(ids).size).toBe(1130);
  });
});
