// ------------------------------------------------------------------
// Task 290 «کتاب‌خانهٔ داستان‌ها» — سری کلاسیک Stories for Reproduction
// دکتر L. A. Hill (Oxford University Press) — سه سطحِ:
//   s1 Introductory (750 headwords) · s2 Elementary (1,000 headwords)
//   s3 Intermediate (1,500 headwords)
// هر داستان ~۱۵۰ واژه + بخشِ A (صحیح/غلط با پاسخ) + بخشِ B (پرسش‌های
// تشریحی — فقط نمایش) + واژه‌نامهٔ کوتاه فارسی.
// محتوا از نسخهٔ چاپی اسکن‌شده به‌دقت بازنویسی شده (OCR خام خواب‌های
// زیادی دارد) — پس هیچ متنِ این فایل از OCR کپی نشده است.
// دادهٔ ایستاست — به دیتابیس یا شبکه وابسته نیست.
// ------------------------------------------------------------------

export type HillBookId = "s1" | "s2" | "s3";

export interface HillTf {
  /** جملهٔ داستان-محور — خواننده درست/نادرست بودنش را از متن می‌سنجد */
  q: string;
  /** پاسخ درست — true = درست، false = نادرست */
  a: boolean;
}

export interface HillStory {
  id: string; // "s1-1"
  book: HillBookId;
  num: number; // شمارهٔ داستان در کتاب
  title: string; // عنوان کوتاه انگلیسی
  text: string; // پاراگراف‌ها با \n\n
  tf: HillTf[];
  /** بخش B کتاب — پرسش‌های تشریحی، فقط برای تمرین نمایش داده می‌شود */
  bq: string[];
  /** واژه‌نامهٔ کوتاه — واژه‌های خارج از ۷۵۰/۱۰۰۰/۱۵۰۰ headword + کلیدی‌ها */
  glossary: { en: string; fa: string }[];
}

export interface HillBook {
  id: HillBookId;
  faTitle: string;
  enTitle: string;
  level: string; // "750 headwords"
  levelFa: string; // «۷۵۰ واژهٔ پایه»
  desc: string;
  theme: "emerald" | "amber" | "violet";
}

export const HILL_BOOKS: HillBook[] = [
  {
    id: "s1",
    faTitle: "داستان‌های بازگوکردنی — مقدماتی",
    enTitle: "Stories for Reproduction · Introductory",
    level: "750 headwords",
    levelFa: "۷۵۰ واژهٔ پایه",
    desc: "نخستین پلهٔ سریِ کلاسیک دکتر هیل — داستان‌های کوتاهِ طنزآمیز با ساده‌ترین واژگان و دستور.",
    theme: "emerald",
  },
  {
    id: "s2",
    faTitle: "داستان‌های بازگوکردنی — ابتدایی",
    enTitle: "Stories for Reproduction · Elementary",
    level: "1,000 headwords",
    levelFa: "۱٬۰۰۰ واژهٔ پایه",
    desc: "پلهٔ دوم — همان سبکِ دوست‌داشتنی، با دامنهٔ واژگانِ اندکی پهن‌تر.",
    theme: "amber",
  },
  {
    id: "s3",
    faTitle: "داستان‌های بازگوکردنی — متوسط",
    enTitle: "Stories for Reproduction · Intermediate",
    level: "1,500 headwords",
    levelFa: "۱٬۵۰۰ واژهٔ پایه",
    desc: "پلهٔ سوم — داستان‌های کامل‌تر برای کسی که از سطحِ مقدماتی عبور کرده است.",
    theme: "violet",
  },
];

export const HILL_STORIES: HillStory[] = [
  // ================= s1 — Introductory (750) =================
  {
    id: "s1-1",
    book: "s1",
    num: 1,
    title: "Mr Jones's Hat",
    text: `Mr Jones had a few days' holiday, so he said, 'I'm going to go to the mountains by train.' He put on his best clothes, took a small bag, went to the station and got into the train. He had a beautiful hat, and he often put his head out of the window during the trip and looked at the mountains. But the wind pulled his hat off.

Mr Jones quickly took his old bag and threw that out of the window too.

The other people in the carriage laughed. 'Is your bag going to bring your beautiful hat back?' they asked.

'No,' Mr Jones answered, 'but there's no name and no address in my hat, and there's a name and address on the bag. Someone's going to find both of them near each other, and he's going to send me the bag and the hat.'`,
    tf: [
      { q: "Mr Jones had a day's holiday.", a: false },
      { q: "Mr Jones went to the mountains by train.", a: true },
      { q: "Mr Jones threw his hat out of the window.", a: false },
      { q: "There was a name and address on the bag.", a: true },
      { q: "The people in the carriage laughed at Mr Jones.", a: true },
      { q: "Someone sent Mr Jones the hat and the bag.", a: false },
    ],
    bq: [
      "Where did Mr Jones go for his holiday?",
      "How did he go there?",
      "What did he often do during the trip?",
      "What did the wind do then?",
      "What did the other people in the carriage do then?",
      "And what did Mr Jones answer?",
    ],
    glossary: [
      { en: "bag", fa: "کیف دستی" },
      { en: "carriage", fa: "کوپهٔ قطار" },
      { en: "to pull off", fa: "کندن، پرت کردن" },
      { en: "address", fa: "نشانی" },
    ],
  },
  {
    id: "s1-2",
    book: "s1",
    num: 2,
    title: "The Old Lady and the Bank",
    text: `An old lady went out shopping last Tuesday. She came to a bank and saw a car near the door. A man got out of it and went into the bank. She looked into the car. The keys were in the lock.

The old lady took the keys and followed the man into the bank.

The man took a gun out of his pocket and said to the clerk, 'Give me all the money!'

But the old lady did not see this. She went to the man, put the keys in his hand and said, 'Young man, you're stupid! Never leave your keys in your car: someone's going to steal it!'

The man looked at the old woman for a few seconds. Then he looked at the clerk — and then he took his keys, ran out of the bank, got into his car and drove away quickly, without any money.`,
    tf: [
      { q: "An old lady went to the bank last Tuesday.", a: true },
      { q: "A man left his keys in the lock of his car.", a: true },
      { q: "The old lady gave the keys to the man.", a: true },
      { q: "Someone stole the man's car.", a: false },
      { q: "The bank clerk gave the man some money.", a: false },
      { q: "When the man went away, he did not take any money.", a: true },
    ],
    bq: [
      "Where did the man go when he got out of his car?",
      "What did the old lady see in the car?",
      "What did the man do in the bank?",
      "What did the old lady do?",
      "What did she say to the young man?",
      "Did he steal any money from the bank?",
    ],
    glossary: [
      { en: "gun", fa: "تفنگ" },
      { en: "clerk", fa: "کارمند" },
      { en: "lock", fa: "قفل" },
      { en: "to steal", fa: "دزدیدن" },
    ],
  },
  {
    id: "s1-3",
    book: "s1",
    num: 3,
    title: "Mary's New School",
    text: `Mary was an English girl, but she lived in Rome. She was six years old. Last year her mother said to her, 'You're six years old now, Mary, and you're going to begin going to a school here. You're going to like it very much, because it's a nice school.'

'Is it an English school?' Mary asked.

'Yes, it is,' her mother said.

Mary went to the school, and enjoyed her lessons. Her mother always took her to school in the morning and brought her home in the afternoon. Last Monday her mother went to the school at 4 o'clock, and Mary ran out of her class.

'We've got a new girl in our class today, Mummy,' she said. 'She's six years old too, and she's very nice, but she isn't English. She's German.'

'Does she speak English?' Mary's mother asked.

'No, but she laughs in English,' Mary said happily.`,
    tf: [
      { q: "Mary went to an English school.", a: true },
      { q: "She did not like her school.", a: false },
      { q: "Her mother took her to school.", a: true },
      { q: "The new girl in Mary's class was English.", a: false },
      { q: "The new girl in Mary's class was German.", a: true },
      { q: "The new girl laughed like an English girl.", a: true },
    ],
    bq: [
      "Where did Mary live?",
      "What did her mother say to her when she was six?",
      "How did Mary like her school?",
      "What did she say to her mother last Monday?",
      "Does the new girl speak English?",
      "What did Mary say then?",
    ],
    glossary: [
      { en: "lesson", fa: "درس" },
      { en: "German", fa: "آلمانی" },
      { en: "to laugh", fa: "خندیدن" },
      { en: "happily", fa: "با شادی" },
    ],
  },
  {
    id: "s1-4",
    book: "s1",
    num: 4,
    title: "Mrs Jones's Lazy Sons",
    text: `Mrs Jones did not have a husband, but she had two sons. They were big, strong boys, but they were lazy. On Saturdays they did not go to school, and then their mother always said, 'Please cut the grass in the garden this afternoon, boys.' The boys did not like it, but they always did it.

Then somebody gave one of the boys a magazine, and he saw a picture of a beautiful lawn-mower in it. There was a seat on it, and there was a woman on the seat.

The boy took the picture to his mother and brother and said to them, 'Look, that woman's sitting on the lawn-mower and driving it and cutting the grass. We want one of those.'

'One of those lawn-mowers?' his mother asked.

'No,' the boy said. 'We want one of those women. Then she can cut the grass every week.'`,
    tf: [
      { q: "Mrs Jones had three sons.", a: false },
      { q: "They were big and strong but lazy.", a: true },
      { q: "The boys did not like cutting the grass.", a: true },
      { q: "The boys did not always cut the grass.", a: false },
      { q: "Someone gave one of the boys a lawn-mower.", a: false },
      { q: "A woman cuts the grass every week.", a: false },
    ],
    bq: [
      "What did Mrs Jones say to her sons on Saturdays?",
      "Why did they not like that work?",
      "What did one of the boys see in a magazine?",
      "What was there on the lawn-mower?",
      "What did the boy say to his mother and brother?",
      "And what did the boy answer?",
    ],
    glossary: [
      { en: "lazy", fa: "تنبل" },
      { en: "grass", fa: "چمن" },
      { en: "magazine", fa: "مجله" },
      { en: "lawn-mower", fa: "ماشین چمن‌زنی" },
    ],
  },
  {
    id: "s1-5",
    book: "s1",
    num: 5,
    title: "Harry and the Shoemaker",
    text: `One of Harry's feet was bigger than the other. 'I can never find boots and shoes for my feet,' he said to his friend Dick.

'Why don't you go to a shoemaker?' Dick said. 'A good one can make you the right shoes.'

'I've never been to a shoemaker,' Harry said. 'Aren't they very expensive?'

'No,' Dick said, 'some of them aren't. There's a good one in our village, and he's quite cheap. Here's his address.' He wrote something on a piece of paper and gave it to Harry.

Harry went to the shoemaker in Dick's village a few days later, and the shoemaker made him some shoes.

Harry went to the shop again a week later and looked at the shoes. Then he said to the shoemaker angrily, 'You're a silly man! I said, "Make one shoe bigger than the other," but you've made one smaller than the other!'`,
    tf: [
      { q: "Harry's feet were not the same size.", a: true },
      { q: "Harry had never been to a shoemaker.", a: true },
      { q: "The shoemaker was from Harry's village.", a: false },
      { q: "Harry went back to the shoemaker two weeks later.", a: false },
      { q: "The shoemaker was right.", a: true },
    ],
    bq: [
      "What was Harry's trouble?",
      "What did his friend Dick say?",
      "Where did Harry go a few days later?",
      "What did the shoemaker do?",
      "What did Harry say when he looked at the shoes?",
      "Which word did Harry use, bigger or smaller?",
    ],
    glossary: [
      { en: "feet", fa: "پاها" },
      { en: "boots", fa: "چکمه" },
      { en: "shoemaker", fa: "کفاش" },
      { en: "cheap", fa: "ارزان" },
    ],
  },
  {
    id: "s1-6",
    book: "s1",
    num: 6,
    title: "Joe Richards at the Bank",
    text: `Joe Richards finished school when he was 18, and then his father said to him, 'You've passed your examinations now, Joe, and you got good marks in them. Now go and get some good work. They're looking for clever people at the bank in the town. The clerks there get quite a lot of money now.'

A few days later, Joe went to the bank and asked for work there. A man took him into a small room and gave him some questions on a piece of paper. Joe wrote his answers on the paper, and then he gave them to the man.

The man looked at them for a few minutes, and then he took a pen and said to Joe, 'Your birthday was on the 12th of June, Mr Richards?'

'Yes, sir,' Joe said.

'What year?' the man asked.

'Oh, every year, sir,' Joe said.`,
    tf: [
      { q: "Joe Richards was seventeen years old.", a: false },
      { q: "Joe Richards passed his examinations.", a: true },
      { q: "Joe passed his examinations at the university.", a: false },
      { q: "Joe wanted to work in a bank.", a: true },
      { q: "Joe was born on the 12th of June.", a: true },
      { q: "Joe did not give the right answer.", a: true },
    ],
    bq: [
      "What did Joe's father say when Joe finished school?",
      "Where did Joe go a few days later?",
      "What did he want?",
      "What did a man do then?",
      "What did the man ask Joe?",
      "And what did Joe say?",
    ],
    glossary: [
      { en: "examination", fa: "امتحان" },
      { en: "marks", fa: "نمره‌ها" },
      { en: "clever", fa: "باهوش" },
      { en: "birthday", fa: "تولد" },
    ],
  },
  {
    id: "s1-7",
    book: "s1",
    num: 7,
    title: "Fred and His Red Cars",
    text: `Fred works in a factory. He does not have a wife, and he gets quite a lot of money every week. He loves cars, and has a new one every year. He likes driving very fast, and he always buys small, fast, red cars. He sometimes takes his mother out in them, and then she always says, 'But, Fred, why do you drive these cars? We're almost sitting on the road!'

Then Fred laughs and is happy. He likes being very near the road.

Fred is very tall and very fat.

Last week he came out of a shop and went to his car. There was a small boy near it. He was looking at the beautiful red car. Then he looked up and saw Fred.

'How do you get into that small car?' he asked him.

Fred laughed and said, 'I don't get into it. I put it on.'`,
    tf: [
      { q: "Fred has a wife.", a: false },
      { q: "Fred is a poor man.", a: false },
      { q: "Fred buys a new car every year.", a: true },
      { q: "Fred's mother does not like his cars.", a: true },
      { q: "A small girl was looking at Fred's car.", a: false },
      { q: "Fred gets into his car easily.", a: false },
    ],
    bq: [
      "Where does Fred work?",
      "What cars does he like?",
      "Who goes out in them with him sometimes?",
      "What does she always say?",
      "Is Fred a big man, or a small man?",
      "What did Fred say to the small boy?",
    ],
    glossary: [
      { en: "factory", fa: "کارخانه" },
      { en: "fat", fa: "چاق" },
      { en: "to drive", fa: "رانندگی کردن" },
      { en: "road", fa: "جاده" },
    ],
  },
  {
    id: "s1-8",
    book: "s1",
    num: 8,
    title: "Carol and George Watts",
    text: `Mr and Mrs Yates had one daughter. Her name was Carol, and she was nineteen years old. Carol lived with her parents and worked in an office. She had some friends, but she did not like any of the boys very much.

Then she met a very nice young man. His name was George Watts, and he worked in a bank near her office. They went out together quite a lot, and he came to Carol's parents' house twice, and then last week Carol went to her father and said, 'I'm going to marry George Watts, Daddy. He was here yesterday.'

'Oh, yes,' her father said. 'He's a nice boy — but has he got any money?'

'Oh, men! All of you are the same,' the daughter answered angrily. 'I met George on the first of June and on the second he said to me, "Has your father got any money?"'`,
    tf: [
      { q: "Carol was a girl.", a: true },
      { q: "She worked with her mother and father.", a: false },
      { q: "George worked near her office.", a: true },
      { q: "George never visited Carol's house.", a: false },
      { q: "Carol said to her mother, 'I'm going to marry George Watts.'", a: false },
      { q: "Both Mr Yates and George asked about money.", a: true },
    ],
    bq: [
      "Was Carol old, or young?",
      "Where did she work?",
      "Whom did she meet then?",
      "Did he visit Mr and Mrs Yates?",
      "What did Carol say to her father?",
      "What did he ask her?",
    ],
    glossary: [
      { en: "office", fa: "دفتر کار" },
      { en: "to marry", fa: "ازدواج کردن" },
      { en: "angrily", fa: "با عصبانیت" },
      { en: "bank", fa: "بانک" },
    ],
  },
  {
    id: "s1-9",
    book: "s1",
    num: 9,
    title: "The Blue Gloves",
    text: `Miss Williams was a teacher, and there were thirty small children in her class. They were nice children, and Miss Williams liked all of them, but they often lost clothes. It was winter, and the weather was very cold. The children's mothers always sent them to school with warm coats and hats and gloves. The children came into the classroom in the morning and took off their coats and hats and gloves. They put their coats and hats on hooks on the wall, and they put their gloves in the pockets of their coats.

Last Tuesday Miss Williams found two small blue gloves on the floor in the evening, and in the morning she said to the children, 'Whose gloves are these?', but no one answered.

Then she looked at Dick. 'Haven't you got blue gloves, Dick?' she asked him.

'Yes, miss,' he answered, 'but those can't be mine. I've lost mine.'`,
    tf: [
      { q: "There were forty children in Miss Williams' class.", a: false },
      { q: "Miss Williams liked all the children in her class.", a: true },
      { q: "It was very cold.", a: true },
      { q: "Miss Williams found one small glove.", a: false },
      { q: "She found the gloves in the morning.", a: false },
      { q: "The gloves were Dick's.", a: false },
    ],
    bq: [
      "What was Miss Williams?",
      "Did she have big, or small children in her class?",
      "What did the children often do?",
      "What did she find on the floor in the evening?",
      "Who answered her question in the morning?",
      "What did Dick answer?",
    ],
    glossary: [
      { en: "gloves", fa: "دستکش" },
      { en: "hook", fa: "قلاب" },
      { en: "pocket", fa: "جیب" },
      { en: "coat", fa: "پالتو" },
    ],
  },
  {
    id: "s1-10",
    book: "s1",
    num: 10,
    title: "The Lonely Bear's Head",
    text: `Whitebridge was a small village, and old people often came and lived there. Some of them had a lot of old furniture, and they often did not want some of it, because they were in a smaller house now, so every Saturday morning they put it out, and other people came and looked at it, and sometimes they took it away because they wanted it.

Every Saturday, Mr and Mrs Morton put a very ugly old bear's head out at the side of their gate, but nobody wanted it. Then last Saturday, they wrote, 'I'm very lonely here. Please take me,' on a piece of paper and put it near the bear's head.

They went to the town, and came home in the evening. There were now two bears' heads in front of their house, and there was another piece of paper. It said, 'I was lonely too.'`,
    tf: [
      { q: "Whitebridge was a big village.", a: false },
      { q: "A lot of old people lived in Whitebridge.", a: true },
      { q: "They put out their furniture every Sunday.", a: false },
      { q: "The bear's head was very ugly.", a: true },
      { q: "Nobody wanted the bear's head.", a: true },
      { q: "There were now three bears' heads.", a: false },
    ],
    bq: [
      "Why did old people in Whitebridge often sell their old furniture?",
      "Where did they put it?",
      "What did Mr and Mrs Morton put out every Saturday?",
      "What did they write on a piece of paper?",
      "What did they find at the side of their gate when they came home?",
      "What did the second piece of paper say?",
    ],
    glossary: [
      { en: "village", fa: "روستا" },
      { en: "furniture", fa: "اثاثیه" },
      { en: "gate", fa: "دروازهٔ حیاط" },
      { en: "lonely", fa: "تنها، دلگیر" },
    ],
  },
  {
    id: "s1-11",
    book: "s1",
    num: 11,
    title: "The Beautiful Girl of Paris",
    text: `Two old gentlemen lived in a quiet street in Paris. They were friends and neighbours, and they often went for walks together in the streets when the weather was fine. Last Saturday they went for a walk at the side of the river. The sun shone, the weather was warm, there were a lot of flowers everywhere, and there were boats on the water.

The two men walked happily for half an hour, and then one of them said to the other, 'That's a very beautiful girl.'

'Where can you see a beautiful girl?' said the other. 'I can't see one anywhere. I can see two young men. They're walking towards us.'

'The girl's walking behind us,' said the first man quietly.

'But how can you see her then?' asked his friend.

The first man smiled and said, 'I can't see her, but I can see the young men's eyes.'`,
    tf: [
      { q: "The two old men were friends and neighbours.", a: true },
      { q: "They often went to town when the weather was fine.", a: false },
      { q: "A beautiful girl was walking towards them.", a: false },
      { q: "Two young men were walking towards them.", a: true },
      { q: "The old man saw the beautiful girl.", a: false },
      { q: "The young men saw the beautiful girl.", a: true },
    ],
    bq: [
      "Where did the two old gentlemen live?",
      "What did they often do together?",
      "Where did they walk last Saturday?",
      "What did one of them say after half an hour?",
      "What did the second man say?",
      "And what was the first man's answer?",
    ],
    glossary: [
      { en: "gentleman", fa: "آقا، مرد مؤدب" },
      { en: "neighbour", fa: "همسایه" },
      { en: "towards", fa: "به‌سمت" },
      { en: "quietly", fa: "آرام" },
    ],
  },
  {
    id: "s1-12",
    book: "s1",
    num: 12,
    title: "Fred's Boots",
    text: `Fred was a young soldier in a big camp. During the week they always worked very hard, but it was Saturday, and all the young soldiers were free, so their officer said to them, 'You can go into the town this afternoon, but first I'm going to inspect you.'

Fred came to the officer, and the officer said to him, 'Your hair's very long. Go to the barber and then come back to me again.'

Fred ran to the barber's shop, but it was closed because it was Saturday. Fred was very sad for a few minutes, but then he smiled and went back to the officer.

'Are my boots clean now, sir?' he asked.

The officer did not look at Fred's hair. He looked at his boots and said, 'Yes, they're much better now. You can go out. And next week, first clean your boots, and then come to me!'`,
    tf: [
      { q: "The soldiers were free on Sundays.", a: false },
      { q: "The soldiers went to town every afternoon.", a: false },
      { q: "The officer inspected the soldiers.", a: true },
      { q: "The barber's shop was closed.", a: true },
      { q: "Fred cleaned his boots.", a: true },
      { q: "The officer looked at Fred's boots.", a: true },
    ],
    bq: [
      "What was Fred?",
      "What did his officer say to the soldiers on Saturday?",
      "What did he say to Fred?",
      "What did Fred do then?",
      "Did the officer look at Fred's hair now?",
      "What did he say to Fred?",
    ],
    glossary: [
      { en: "soldier", fa: "سرباز" },
      { en: "officer", fa: "افسر" },
      { en: "barber", fa: "آرایشگر مردانه" },
      { en: "boots", fa: "چکمه‌ها" },
    ],
  },

  // ---- r291: داستان‌های ۱۳–۱۹ از PDFِ اسکن‌شدهٔ s1 بازنویسی شد (همان قراردادِ Task 290) ----
  {
    id: "s1-13",
    book: "s1",
    num: 13,
    title: "Mrs Harris's Son",
    text: `Mrs Harris lives in a small village. Her husband is dead, but she has one son. He is twenty-one, and his name is Geoff. He worked in the shop in the village and lived with his mother, but then he got work in a town and went and lived there. Its name was Greensea. It was quite a long way from his mother's village, and she was not happy about this. But Geoff said, 'There isn't any good work for me in the country, Mother, and I can get a lot of money in Greensea, and I'll send you some every week.'

Mrs Harris was very angry last Sunday. She got in a train and went to her son's house in Greensea. Then she said to him, 'Geoff, why do you never phone me?'

Geoff laughed. 'But, Mother,' he said, 'you haven't got a phone.'

'No,' she answered, 'I haven't — but YOU'VE got one!'`,
    tf: [
      { q: "Mrs Harris's husband was dead.", a: true },
      { q: "Geoff went to live in Greensea.", a: true },
      { q: "Geoff got less money in Greensea.", a: false },
      { q: "Geoff had a phone.", a: true },
      { q: "Geoff's mother had a phone.", a: false },
      { q: "Geoff never phoned his mother.", a: true },
    ],
    bq: [
      "Where did Mrs Harris live?",
      "Where did her son work first?",
      "Where did her son go to work after that?",
      "Was Mrs Harris happy about this?",
      "What did Geoff say to her?",
      "Where did Mrs Harris go last Sunday?",
      "What did she say to Geoff?",
      "What was Geoff's answer?",
    ],
    glossary: [
      { en: "phone", fa: "تلفن؛ تلفن زدن" },
      { en: "village", fa: "روستا" },
      { en: "angry", fa: "خشمگین" },
      { en: "train", fa: "قطار" },
    ],
  },
  {
    id: "s1-14",
    book: "s1",
    num: 14,
    title: "Mr Robinson and the Dentist",
    text: `Mr Robinson never went to a dentist, because he was afraid, but then his tooth began aching, and he went to a dentist. The dentist did a lot of work in his mouth for a long time. On the last day Mr Robinson said to him, 'How much is all this work going to cost?' The dentist said, 'Twenty-five pounds,' but he did not ask him for the money.

After a month Mr Robinson phoned the dentist and said, 'You haven't asked me for any money for your work last month.'

'Oh,' the dentist answered, 'I never ask a man for money for his work.'

'Then how do you live?' Mr Robinson asked.

'Most people pay me quickly,' the dentist said, 'but some don't. I wait for my money for two months, and then I say, "That man isn't going to pay me", and then I ask him for the money.'`,
    tf: [
      { q: "Mr Robinson went to the dentist because his tooth hurt.", a: true },
      { q: "The dentist wanted twenty-five pounds from Mr Robinson.", a: true },
      { q: "Mr Robinson paid the money quickly.", a: false },
      { q: "Mr Robinson phoned the dentist after a month.", a: true },
      { q: "Most people paid the dentist quickly.", a: true },
      { q: "The dentist waited for the money for three months.", a: false },
    ],
    bq: [
      "Why did Mr Robinson never go to a dentist?",
      "Why did he go to one after a long time?",
      "What did the dentist do?",
      "What did Mr Robinson ask him then?",
      "What did the dentist answer?",
      "What did Mr Robinson say to the dentist after a month?",
      "What was the dentist's answer?",
      "And what did the dentist say to him then?",
    ],
    glossary: [
      { en: "dentist", fa: "دندان‌پزشک" },
      { en: "afraid", fa: "ترسان" },
      { en: "cost", fa: "بها داشتن" },
      { en: "pound", fa: "پوند — واحد پول" },
    ],
  },
  {
    id: "s1-15",
    book: "s1",
    num: 15,
    title: "Bill and the Football Match",
    text: `Bill likes football very much, and he often goes to matches in our town on Saturdays. He does not go to the best seats, because they are very expensive and he does not see his friends there.

There was a big football match in our town last Saturday. First it was very cold and cloudy, but then the sun shone, and it was very hot. There were a lot of people on the benches round Bill at the match. Bill was on one bench, and there was a fat man on a bench behind him. First the fat man was cold, but then he was very hot. He took his coat off and put it in front of him, but it fell on Bill's head.

Bill was not angry. He took the coat off his head, looked at it and then smiled and said, 'Thank you — but where are the trousers?'`,
    tf: [
      { q: "Bill plays in football matches in our town.", a: false },
      { q: "He sits in the cheaper seats.", a: true },
      { q: "His friends sit in the expensive seats.", a: false },
      { q: "Last Saturday the weather was very hot, and then it was very cold and cloudy.", a: false },
      { q: "The benches round Bill were almost empty.", a: false },
      { q: "A fat man's coat fell on Bill's head.", a: true },
    ],
    bq: [
      "Where does Bill go on Saturdays?",
      "Why does he not sit in the best seats?",
      "What weather did they have at the match last Saturday?",
      "Who was behind Bill?",
      "Why did the man take his coat off?",
      "What happened to the coat?",
      "Was Bill angry?",
      "What did he say?",
    ],
    glossary: [
      { en: "match", fa: "مسابقه" },
      { en: "bench", fa: "نیمکت" },
      { en: "expensive", fa: "گران" },
      { en: "coat", fa: "پالتو" },
    ],
  },
  {
    id: "s1-16",
    book: "s1",
    num: 16,
    title: "Peter and the Glue",
    text: `Peter was eight and a half years old, and he went to a school near his house. He always went there on foot, and he usually got back on time, but last Friday he came home from school late. His mother was in the kitchen, and she said, 'Why are you late today, Peter?'

'My teacher was angry and sent me to the headmaster after our lessons,' Peter answered.

'To the headmaster?' his mother said. 'Why did she send you to him?'

'Because she asked a question in the class,' Peter said, 'and none of the children gave her the answer except me.'

His mother was angry. 'But why did the teacher send you to the headmaster then? Why didn't she send all the other stupid children?' she asked Peter.

'Because her question was, "Who put glue on my chair?"' Peter said.`,
    tf: [
      { q: "Peter was seven years old.", a: false },
      { q: "Peter usually came home late.", a: false },
      { q: "Only Peter answered the teacher's question.", a: true },
      { q: "All the children put glue on the teacher's chair.", a: false },
      { q: "Peter put glue on the teacher's chair.", a: true },
      { q: "The teacher was angry about the glue.", a: true },
    ],
    bq: [
      "Where was Peter's school?",
      "How did he come home?",
      "What did his mother say to him when he came home last Friday?",
      "What was Peter's answer?",
      "What did his mother ask then?",
      "What did Peter answer?",
      "What did his mother ask him then?",
      "And what was his answer?",
    ],
    glossary: [
      { en: "glue", fa: "چسب" },
      { en: "headmaster", fa: "مدیرِ مدرسه" },
      { en: "except", fa: "به‌جز" },
      { en: "on foot", fa: "پیاده" },
    ],
  },
  {
    id: "s1-17",
    book: "s1",
    num: 17,
    title: "George and the Whisky",
    text: `George was sixty years old, and he was always ill. He was always tired, and his face was always very red. He did not like doctors, but last month his wife said to him, 'Don't be stupid, George. Go and see Doctor Brown.'

George said, 'No,' but last week he was worse, and he went to the doctor.

Dr Brown examined him and then said to him, 'You drink too much. Stop drinking whisky, and drink milk.'

George liked whisky, and he did not like milk. 'I'm not a baby!' he always said to his wife.

Now he looked at Dr Brown and said, 'But drinking milk is dangerous, doctor.'

The doctor laughed and said, 'Dangerous? How can drinking milk be dangerous?'

'Well, doctor,' George said, 'it killed one of my friends last year.'

The doctor laughed again and said, 'How did it do that?'

'The cow fell on him,' George said.`,
    tf: [
      { q: "George was always tired.", a: true },
      { q: "George did not like going to doctors.", a: true },
      { q: "George preferred drinking milk.", a: false },
      { q: "George said, 'Drinking milk is dangerous.'", a: true },
      { q: "George's friend died because he drank too much milk.", a: false },
      { q: "Dr Brown told George to drink milk.", a: true },
    ],
    bq: [
      "Was George old, or young?",
      "Why did he go to the doctor last week?",
      "What did the doctor say to him?",
      "What did George say to the doctor?",
      "What did the doctor answer?",
      "What did George say then?",
      "And what did the doctor ask him?",
      "What was George's answer?",
    ],
    glossary: [
      { en: "whisky", fa: "ویسکی" },
      { en: "examine", fa: "معاینه‌کردن" },
      { en: "dangerous", fa: "خطرناک" },
      { en: "cow", fa: "گاو" },
    ],
  },
  {
    id: "s1-18",
    book: "s1",
    num: 18,
    title: "Mr White's Pictures",
    text: `Mr White has a small shop in the middle of our town, and he sells pictures in it. They are not expensive ones, but some of them are quite pretty. Last Saturday a woman came into the shop and looked at a lot of pictures. Then she took Mr White to one of them and said, 'How much do you want for this one?' It was a picture of horses in a field.

Mr White looked at it for a few seconds and then went and brought his book. He opened it, looked at the first page and then said, 'I want twenty pounds for that one.'

The woman shut her eyes for a few seconds and then said, 'I can give you two pounds for it.'

'Two pounds?' Mr White said angrily. 'Two pounds? But the canvas cost more than two pounds.'

'Oh, but it was clean then,' the woman said.`,
    tf: [
      { q: "The pictures in Mr White's shop were expensive.", a: false },
      { q: "Last Saturday a woman came into the shop.", a: true },
      { q: "She wanted a picture of flowers.", a: false },
      { q: "Mr White wanted twenty pounds for the picture.", a: true },
      { q: "The woman said, 'I'll give you four pounds for it.'", a: false },
      { q: "Mr White was angry.", a: true },
    ],
    bq: [
      "What does Mr White sell in his shop?",
      "What pictures does he sell?",
      "What did a woman say to him last Saturday?",
      "What did he do then?",
      "And what did he say to the woman?",
      "What did she answer?",
      "What did Mr White say then?",
      "And what did the woman say?",
    ],
    glossary: [
      { en: "canvas", fa: "بومِ نقاشی" },
      { en: "pretty", fa: "زیبا" },
      { en: "angrily", fa: "با خشم" },
      { en: "field", fa: "دشت، مزرعه" },
    ],
  },
  {
    id: "s1-19",
    book: "s1",
    num: 19,
    title: "Miss Green's Cupboard",
    text: `Miss Green had a heavy cupboard in her bedroom. Last Sunday she said, 'I don't like this cupboard in my bedroom. The bedroom's very small, and the cupboard's very big. I'm going to put it in a bigger room.' But the cupboard was very heavy, and Miss Green was not very strong. She went to two of her neighbours and said, 'Please carry the cupboard for me.' Then she went and made some tea for them.

The two men carried the heavy cupboard out of Miss Green's bedroom and came to the stairs. One of them was in front of the cupboard, and the other was behind it. They pushed and pulled for a long time, and then they put the cupboard down.

'Well,' one of the men said to the other, 'we're never going to get this cupboard upstairs.'

'Upstairs?' the other man said. 'Aren't we taking it downstairs?'`,
    tf: [
      { q: "Miss Green's bedroom was very small.", a: true },
      { q: "She wanted the cupboard in a smaller room.", a: false },
      { q: "Miss Green was not very strong.", a: true },
      { q: "Two men carried the cupboard.", a: true },
      { q: "They carried the cupboard upstairs.", a: false },
      { q: "They carried the cupboard downstairs.", a: false },
    ],
    bq: [
      "Why didn't Miss Green like the cupboard in her bedroom?",
      "Where did she want it?",
      "Why didn't she carry it there?",
      "What did she say to two of her neighbours?",
      "What did the neighbours do?",
      "What did one of them say?",
      "And what did the other man say?",
    ],
    glossary: [
      { en: "cupboard", fa: "کمد، بوفه" },
      { en: "neighbour", fa: "همسایه" },
      { en: "heavy", fa: "سنگین" },
      { en: "stairs", fa: "پله‌ها" },
    ],
  },

  // ================= s2 — Elementary (1,000) =================
  {
    id: "s2-1",
    book: "s2",
    num: 1,
    title: "Dave's Sandwiches",
    text: `Dave worked in a factory, and he always made sandwiches in the morning, took them to work and ate them at midday.

Then he married, so he thought, 'Now my wife's going to make my sandwiches.'

On the first day, she made him some, and when he got home in the evening, she said to him, 'Were the sandwiches all right?'

'Oh, yes,' he answered, 'but you only gave me two slices of bread.'

The next day she gave him four slices, but he said again, 'Four slices aren't enough.'

The third day she gave him eight slices, but those were not enough for him either, so on the fourth day she took a loaf of bread, cut it in half and put a big piece of meat in it.

In the evening she said to him, 'Was your lunch nice?'

'Oh, yes,' he answered. 'But two slices of bread aren't enough.'`,
    tf: [
      { q: "Dave worked in an office.", a: false },
      { q: "Dave always ate sandwiches for lunch.", a: true },
      { q: "Dave liked sandwiches.", a: true },
      { q: "Four slices of bread were not enough for Dave.", a: true },
      { q: "Dave's wife gave him only two slices of bread on the fourth day.", a: false },
      { q: "Dave ate a lot of bread.", a: true },
    ],
    bq: [
      "Who made Dave's sandwiches before he married?",
      "Who made them after he married?",
      "What did his wife say on the first evening?",
      "What did Dave tell his wife on the second evening?",
      "What did she do on the fourth day?",
      "What did Dave answer?",
    ],
    glossary: [
      { en: "slice", fa: "برش، ورقه" },
      { en: "loaf of bread", fa: "قرص نان" },
      { en: "meat", fa: "گوشت" },
      { en: "midday", fa: "وسط روز" },
    ],
  },
  {
    id: "s2-2",
    book: "s2",
    num: 2,
    title: "Harry's Bottle of Whisky",
    text: `Harry did not stop his car at some traffic-lights when they were red, and he hit another car. Harry jumped out and went to it. There was an old man in the car. He was very frightened and said to Harry, 'What are you doing? You nearly killed me!'

'Yes,' Harry answered. 'I'm very sorry.' He took a bottle out of his car and said, 'Drink some of this. Then you'll feel better.' He gave the man some whisky, and the man drank it, but then he shouted again, 'You nearly killed me!'

Harry gave him the bottle again, and the old man drank a lot of the whisky. Then he smiled and said to Harry, 'Thank you. I feel much better now. But why aren't you drinking?'

'Oh, well,' Harry answered. 'I don't want any whisky now. I'm going to sit here and wait for the police.'`,
    tf: [
      { q: "Harry hit an old man.", a: false },
      { q: "Harry hit another car.", a: true },
      { q: "The old man was very frightened.", a: true },
      { q: "Harry gave the old man some water.", a: false },
      { q: "The old man drank a lot of whisky.", a: true },
      { q: "Harry did not drink any whisky.", a: true },
    ],
    bq: [
      "Why did Harry hit another car?",
      "What did the old man say?",
      "What did Harry answer, and what did he do?",
      "What did the old man do then?",
      "Why weren't you drinking? — What did Harry answer?",
      "What was Harry going to do?",
    ],
    glossary: [
      { en: "traffic-lights", fa: "چراغ راهنما" },
      { en: "frightened", fa: "ترسیده" },
      { en: "bottle", fa: "بطری" },
      { en: "whisky", fa: "ویسکی" },
    ],
  },
  {
    id: "s2-3",
    book: "s2",
    num: 3,
    title: "John's Old Clock",
    text: `John lived with his mother in a rather big house, and when she died, the house became too big for him so he bought a smaller one in the next street. There was a very nice old clock in his first house, and when the men came to take his furniture to the new house, John thought, 'I'm not going to let them carry my beautiful old clock in their truck. Perhaps they'll break it, and then mending it will be very expensive.' So he picked it up and began to carry it down the road in his arms.

It was heavy, so he stopped two or three times to have a rest.

Then suddenly a small boy came along the road. He stopped and looked at John for a few seconds. Then he said to John, 'You're a stupid man, aren't you? Why don't you buy a watch like everybody else?'`,
    tf: [
      { q: "John and his mother lived in a big house.", a: true },
      { q: "John bought a small house in the next street.", a: true },
      { q: "John had a beautiful new clock.", a: false },
      { q: "John and his friend carried the clock to his new house.", a: false },
      { q: "The clock was heavy.", a: true },
      { q: "John was really a stupid man.", a: false },
    ],
    bq: [
      "Why did John buy a smaller house?",
      "Was it a long way from his old house?",
      "Why did he not want to let the men carry his clock in their truck?",
      "How did he take it to the new house?",
      "What did he do two or three times on the way?",
      "What did the boy say?",
    ],
    glossary: [
      { en: "furniture", fa: "اثاثیه" },
      { en: "truck", fa: "کامیون" },
      { en: "heavy", fa: "سنگین" },
      { en: "watch", fa: "ساعت مچی" },
    ],
  },
  {
    id: "s2-4",
    book: "s2",
    num: 4,
    title: "Two Soldiers and a Letter",
    text: `Two soldiers were in camp. The first one's name was George, and the second one's name was Bill. George said, 'Have you got a piece of paper and an envelope, Bill?'

Bill said, 'Yes, I have,' and he gave them to him.

Then George said, 'Now I haven't got a pen.' Bill gave him his, and George wrote his letter. Then he put it in the envelope and said, 'Have you got a stamp, Bill?' Bill gave him one.

Then Bill got up and went to the door, so George said to him, 'Are you going out?'

Bill said, 'Yes, I am,' and he opened the door.

George said, 'Please put my letter in the box in the office, and . . .'

He stopped.

'What do you want now?' Bill said to him.

George looked at the envelope of his letter and answered, 'What's your girl-friend's address?'`,
    tf: [
      { q: "George wanted Bill to write a letter for him.", a: false },
      { q: "George gave Bill a piece of paper and an envelope.", a: false },
      { q: "George got a stamp from Bill.", a: true },
      { q: "George wanted Bill to take his letter to the office.", a: true },
      { q: "Bill had a girl-friend.", a: true },
    ],
    bq: [
      "What did George say at the beginning of this story?",
      "What did Bill say, and what did he do?",
      "What did George ask after that?",
      "What did Bill do?",
      "What did George want Bill to do when he went out?",
      "What did he ask Bill for at the end of this story?",
    ],
    glossary: [
      { en: "camp", fa: "اردوگاه" },
      { en: "envelope", fa: "پاکت نامه" },
      { en: "stamp", fa: "تمبر" },
      { en: "girl-friend", fa: "دوست‌دختر" },
    ],
  },
  {
    id: "s2-5",
    book: "s2",
    num: 5,
    title: "Good Morning, Pershing",
    text: `General Pershing was a famous American officer. He was in the American army, and fought in Europe in the First World War.

After he died, some people in his home town wanted to remember him, so they put up a big statue of him on a horse.

There was a school near the statue, and some of the boys passed it every day on their way to school and again on their way home. After a few months some of them began to say, 'Good morning, Pershing', whenever they passed the statue, and soon all the boys at the school were doing this.

One Saturday one of the smallest of these boys was walking to the shops with his mother when he passed the statue. He said, 'Good morning, Pershing' to it, but then he stopped and said to his mother, 'I like Pershing very much, Ma, but who's that funny man on his back?'`,
    tf: [
      { q: "General Pershing was British.", a: false },
      { q: "Some people put up a statue of him in his home town.", a: true },
      { q: "The statue was in a school.", a: false },
      { q: "The boys at the school always said, 'Good morning, Pershing.'", a: true },
      { q: "The little boy was walking with his mother.", a: true },
      { q: "The little boy thought, 'Pershing is the horse.'", a: true },
    ],
    bq: [
      "Who was General Pershing?",
      "What did he do in the First World War?",
      "Why did people in his town put up a statue of him?",
      "What did the boys begin to say after a few months?",
      "Who was walking past the statue one Saturday?",
      "What did he ask his mother then?",
    ],
    glossary: [
      { en: "statue", fa: "مجسمه" },
      { en: "army", fa: "ارتش" },
      { en: "to fight", fa: "جنگیدن" },
      { en: "funny", fa: "خنده‌دار" },
    ],
  },
  {
    id: "s2-6",
    book: "s2",
    num: 6,
    title: "Jack in Manchester",
    text: `Jack worked in an office in a small town. One day his boss said to him, 'Jack, I want you to go to Manchester, to an office there, to see Mr Brown. Here's the address.'

Jack went to Manchester by train. He left the station, and thought, 'The office isn't far from the station. I'll find it easily.'

But after an hour he was still looking for it, so he stopped and asked an old lady. She said, 'Go straight along this street, turn to the left at the end, and it's the second building on the right.' Jack went and found it.

A few days later he went to the same city, but again he did not find the office, so he asked someone the way. It was the same old lady! She was very surprised and said, 'Are you still looking for that place?'`,
    tf: [
      { q: "Jack worked in an office in a large town.", a: false },
      { q: "Jack's boss wanted him to go to Manchester.", a: true },
      { q: "Jack did not have the address of the office in Manchester.", a: false },
      { q: "Jack did not find the office easily.", a: true },
      { q: "Jack went to Manchester again a few months later.", a: false },
      { q: "He asked the same old lady the way again.", a: true },
    ],
    bq: [
      "What did Jack's boss want him to do?",
      "How did Jack go to Manchester?",
      "What did he think as he left the station?",
      "What did the lady say to Jack?",
      "Where did he go a few days later?",
      "What did the old lady say then?",
    ],
    glossary: [
      { en: "boss", fa: "رئیس" },
      { en: "station", fa: "ایستگاه" },
      { en: "straight", fa: "مستقیم" },
      { en: "surprised", fa: "متعجب" },
    ],
  },

  // ================= s3 — Intermediate (1,500) =================
  {
    id: "s3-1",
    book: "s3",
    num: 1,
    title: "Pat and the New Baby",
    text: `Mr and Mrs Taylor had one child. He was a boy, he was seven years old, and his name was Pat. Now Mrs Taylor was expecting another child.

Pat had seen babies in other people's houses and had not liked them very much, so he was not delighted about the news that there was soon going to be one in his house too.

One evening Mr and Mrs Taylor were making plans for the baby's arrival. 'This house won't be big enough for us all when the baby comes. I suppose we'll have to find a larger house and move to that,' said Mr Taylor finally.

Pat had been playing outside, but he came into the room just then and said, 'What are you talking about?'

'We were saying that we'll have to move to another house now, because the new baby's coming,' his mother answered.

'It's no use,' said Pat hopelessly. 'He'll follow us there.'`,
    tf: [
      { q: "Mr and Mrs Taylor had a son.", a: true },
      { q: "Pat was five years old.", a: false },
      { q: "Mrs Taylor was going to have another baby.", a: true },
      { q: "Pat did not like babies.", a: true },
      { q: "Pat was not happy about the new baby.", a: true },
      { q: "Mr and Mrs Taylor lived in a large house.", a: false },
    ],
    bq: [
      "Did Pat have any brothers or sisters at the beginning of this story?",
      "Why was he not happy to hear that his mother was expecting a baby?",
      "What did his father say one evening about the baby's arrival?",
      "Where was Pat when his father said this?",
      "What did he ask?",
      "What did Pat answer?",
    ],
    glossary: [
      { en: "expecting", fa: "باردار (در انتظار فرزند)" },
      { en: "delighted", fa: "خوشحال" },
      { en: "arrival", fa: "آمدن، رسیدن" },
      { en: "hopelessly", fa: "ناامیدانه" },
    ],
  },
  {
    id: "s3-2",
    book: "s3",
    num: 2,
    title: "The Doctor's Advice",
    text: `An important businessman went to see his doctor because he could not sleep at night. The doctor examined him carefully and then said to him, 'Your trouble is that you need to learn to relax. Have you got any hobbies?'

The businessman thought for a few moments and then said, 'No, doctor, I haven't. I don't have any time for hobbies.'

'Well,' the doctor answered, 'that is your main trouble, you see. You don't have time for anything except your work. You must find some hobbies, and you must learn to relax with them, or you'll be dead in less than five years. Why don't you learn to paint pictures?'

'All right, doctor,' the businessman said. 'I'll try that.'

The next day he telephoned the doctor and said, 'That was a very good idea of yours, doctor. Thank you very much. I've already painted fifteen pictures since I saw you.'`,
    tf: [
      { q: "The businessman wanted to sleep less at night.", a: false },
      { q: "The businessman had trouble in sleeping at night because he did not relax enough.", a: true },
      { q: "The businessman did not have any hobbies, because he wanted to relax when he was not busy.", a: false },
      { q: "The doctor said that he would be dead in less than five years unless he learned some hobbies and relaxed while he was doing them.", a: true },
      { q: "The doctor advised him not to do anything except his work.", a: false },
    ],
    bq: [
      "Why did the businessman go to his doctor?",
      "What did the doctor tell him?",
      "What did the businessman answer?",
      "What did the doctor say was the businessman's main trouble?",
      "What did he advise him to do?",
      "What did he tell the doctor the next day on the telephone?",
    ],
    glossary: [
      { en: "to relax", fa: "آرام گرفتن" },
      { en: "hobby", fa: "سرگرمی" },
      { en: "to examine", fa: "معاینه کردن" },
      { en: "to paint", fa: "نقاشی کشیدن" },
    ],
  },
  {
    id: "s3-3",
    book: "s3",
    num: 3,
    title: "The Tea-Making Machine",
    text: `Mary's mother was nearly seventy, and Mary and her husband wanted to give the old lady a nice birthday present. She liked drinking tea, so Mary ordered an electric machine which made the tea and then woke you up in the morning. She wrapped it up in pretty paper and brought it to her mother on her birthday. Then her mother opened the package. Mary showed her how to use it.

'Before you go to bed, put the tea in the pot and the water in the kettle,' she explained to the old lady, 'and don't forget to switch the electricity on. Then, when you wake up in the morning, your tea will be ready.'

After a few days, Mary's mother rang up and said, 'Perhaps I'm being rather silly, but there's one thing I'm confused about: why do I have to go to bed to make the tea?'`,
    tf: [
      { q: "Mary's mother was old.", a: true },
      { q: "She did not like tea very much.", a: false },
      { q: "Mary sent her mother a nice present by post.", a: false },
      { q: "The machine switched itself on in the morning.", a: false },
      { q: "The kettle did not need electricity.", a: false },
      { q: "Mary's mother thought she could only make the tea when she was in bed.", a: true },
    ],
    bq: [
      "How old was Mary's mother?",
      "What did Mary and her husband buy her mother?",
      "Why did they choose this for her?",
      "What could the machine do?",
      "What did Mary tell her mother?",
      "What did Mary's mother tell Mary on the telephone?",
    ],
    glossary: [
      { en: "kettle", fa: "کتری" },
      { en: "to switch on", fa: "روشن کردن" },
      { en: "package", fa: "بسته" },
      { en: "confused", fa: "گیج، سرگردان" },
    ],
  },
  {
    id: "s3-4",
    book: "s3",
    num: 4,
    title: "Mr Grey and the Stranger",
    text: `Mr Grey was the manager of a small office in London. He lived in the country, and came up to work by train. He liked walking from the station to his office unless it was raining, because it gave him some exercise.

One morning he was walking along the street when a stranger stopped him and said to him, 'You may not remember me, sir, but seven years ago I came to London without a penny in my pockets. I stopped you in this street and asked you to lend me some money, and you lent me five pounds, because you said that you were willing to take a chance so as to give a man a start on the road to success.'

Mr Grey thought for a few moments and then said, 'Yes, I remember you. Go on with your story.'

'Well,' answered the stranger, 'are you still willing to take a chance?'`,
    tf: [
      { q: "Mr Grey only walked to his office when the weather was good.", a: true },
      { q: "He walked because he was poor.", a: false },
      { q: "He had helped the stranger some years before.", a: true },
      { q: "He had been willing to take a chance because he wanted to help the man.", a: true },
      { q: "The stranger had been successful since then.", a: false },
      { q: "Now he wanted to give Mr Grey his money back.", a: false },
    ],
    bq: [
      "Where did Mr Grey work?",
      "Where did he live?",
      "How did he get from his home to his office?",
      "What happened to him one day in the street?",
      "What did Mr Grey answer?",
      "And what did the stranger ask then?",
    ],
    glossary: [
      { en: "manager", fa: "مدیر" },
      { en: "to lend", fa: "قرض دادن" },
      { en: "stranger", fa: "غریبه" },
      { en: "penny", fa: "پنی (سکهٔ خردِ انگلستان)" },
    ],
  },
  {
    id: "s3-5",
    book: "s3",
    num: 5,
    title: "The Seat in the Plane",
    text: `During the Second World War it was difficult to travel by plane, because the seats were needed for important government and army people.

Mr Brown worked for the government during the war. He was a civilian, and he was doing very secret work, so nobody was allowed to know how important he was except a very few people.

One day he had to fly to Edinburgh to give a lecture to a few top people there, but an important army officer came to the airport at the last minute, and Mr Brown's seat was given to him, so he was not able to fly to the city to give his lecture.

It was not until he reached the city that the important officer discovered that the man whose seat he had taken was the one whose lecture he had flown to the city to hear.`,
    tf: [
      { q: "It was difficult for government and army people to find seats on planes during the Second World War.", a: false },
      { q: "Mr Brown was an important person.", a: true },
      { q: "He wanted to go to Edinburgh by plane one day.", a: true },
      { q: "His seat was given to somebody else because he was late.", a: false },
      { q: "The important officer went to Edinburgh to give a lecture.", a: false },
      { q: "The important officer arrived in time for Mr Brown's lecture, because he went by plane.", a: false },
    ],
    bq: [
      "Why did ordinary people find it difficult to go by plane during the Second World War?",
      "Whom did Mr Brown work for?",
      "What work did he do?",
      "Why were only very few people allowed to know how important he was?",
      "Why didn't he manage to get there?",
      "What did the important officer discover when he got to the city?",
    ],
    glossary: [
      { en: "civilian", fa: "غیرنظامی" },
      { en: "secret", fa: "مخفی" },
      { en: "lecture", fa: "سخنرانی" },
      { en: "seat", fa: "صندلی" },
    ],
  },
  {
    id: "s3-6",
    book: "s3",
    num: 6,
    title: "Peter Judd's Last Bullet",
    text: `Peter Judd joined the army when he was eighteen, and for several months he was taught how to be a good soldier. He did quite well in everything except shooting. One day he and his friends were practising their shooting, and all of them were doing quite well except Peter. After he had shot at the target nine times and had not hit it once, the officer who was trying to teach the young soldiers to shoot said, 'You're quite hopeless, Peter! Don't waste your last bullet too! Go behind that wall and shoot yourself with it!'

Peter felt ashamed. He went behind the wall, and a few seconds later the officer and the other young soldiers heard the sound of a shot.

'Heavens!' the officer said. 'Has that silly man really shot himself?'

He ran behind the wall anxiously, but Peter was all right. 'I'm sorry, sir,' he said, 'but I missed again.'`,
    tf: [
      { q: "Peter was good at everything.", a: false },
      { q: "Peter was not good at shooting.", a: true },
      { q: "A lot of the other soldiers were bad at shooting too.", a: false },
      { q: "One of Peter's nine bullets hit the target.", a: false },
      { q: "The officer was not pleased with him.", a: true },
      { q: "The officer thought Peter had shot himself.", a: true },
    ],
    bq: [
      "When did Peter Judd join the army?",
      "In what was he quite good?",
      "What was he not good at?",
      "What did the officer say to him after nine shots?",
      "What did the officer hear a few seconds later?",
      "And what did Peter say?",
    ],
    glossary: [
      { en: "target", fa: "هدف (تیراندازی)" },
      { en: "bullet", fa: "گلوله" },
      { en: "ashamed", fa: "خجل" },
      { en: "to miss", fa: "خطا رفتن، نزدن" },
    ],
  },
];

// ---------------- پرسش‌گرهای خالص (تست‌پذیر بدون DOM) ----------------

export const storiesOfBook = (book: HillBookId): HillStory[] =>
  HILL_STORIES.filter((s) => s.book === book);

export const storyById = (id: string): HillStory | undefined =>
  HILL_STORIES.find((s) => s.id === id);

export const HILL_TOTAL_STORIES = HILL_STORIES.length;
