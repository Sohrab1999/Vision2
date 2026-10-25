// r407 — سرشماریِ واژگانِ درسها (پیش از ساختنِ بانکِ ششم)
import { lessons } from "../src/data/index";

let tot = 0;
for (const l of lessons) {
  const enSet = new Set(l.vocabulary.map((w) => w.en));
  const faSet = new Set(l.vocabulary.map((w) => w.fa));
  const posSet = new Set(l.vocabulary.map((w) => w.pos));
  tot += l.vocabulary.length;
  console.log(
    JSON.stringify({
      id: l.id,
      grade: l.grade,
      title: l.titleFa,
      n: l.vocabulary.length,
      enDup: l.vocabulary.length - enSet.size,
      faDup: l.vocabulary.length - faSet.size,
      pos: [...posSet],
    }),
  );
}
console.log("TOTAL", tot);
