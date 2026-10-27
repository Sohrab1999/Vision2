#!/usr/bin/env python3
# r388 pre-arbitration: byte-compare candidate normalized stems against all existing g12 stems
import json, re

d = json.load(open('public/jozve/tests-g12.json'))
existing = set()
for l in d['lessons']:
    for q in l['questions']:
        existing.add(q['question'])

def gapify(s):
    # extend ellipsis, then collapse dot-runs to standard gap (mirror of extraction norm)
    s = s.replace('…', '...')
    s = re.sub(r'\.{3,}', '-------', s)
    return s

candidates = {
  # Khordad 1399 math paper candidates (normalized = gapified)
  'm-20 honored':   "Elders feel ------- when we appreciate them.",
  'm-21 overcome':  "People use hybrid cars to ------- the problem of charging electric cars.",
  'm-22 suppose':   "Let us ------- for a moment that the news is really true.",
  'm-23 interm':    "Dictionaries are usually in three levels: elementary, i - - - - - - - - - - -  and advanced.",
  'm-24 replace':   "The factory could r - - - - - -most of its workers with robots two years ago.",
  'm-25 guide':     "The two words at the top of each page of a dictionary are called g - - - - words.",
  'm-26 whom':      "She was the person ------- everyone regarded as trustworthy.",
  'm-27 endanger':  "Scientists believe that hot weather is often ------- the corps.",
  'm-28 zhila':     "Zhila never says a word when she is sad,-------?",
  'm-29 dollars':   "My father might buy a new car if some more dollars------- by the family.",
  # deaf paper candidates
  'd-8 burst':      "Aida ------- into tears when she saw her score.",
  'd-9 variety':    "They do a ------- of fitness activities.",
  'd-10 odd1':      "ODD-ONE-OUT 10",
  'd-17 hafez':     "Hafez ------- as one of the most famous Persian poet of all time.",
  'd-52 twin-check':"Plants absorb carbon dioxide.",
  'd-51 diary':     "I have kept a diary for twelve years.",
  'd-53 jumped':    "I did not read the introduction and jumped into the next part.",
  'd-54 useup':     "Don’t use up all the milk - we need some for breakfast.",
}
for name, stem in candidates.items():
    hit = stem in existing
    print(f"{'TWIN ' if hit else 'NEW  '} {name}")

# also raw-layer check: does the deaf p295 dictionary passage differ from r386-l47's passage?
l47 = None
for l in d['lessons']:
    if l.get('lesson') == 47:
        l47 = l['questions'][0]['question']
print()
print('r386-l47 passage head:', l47[:120])
print()
# find any existing stem containing 'There are many things that a dictionary'
hits = [s[:100] for s in existing if 'There are many things that a dictionary' in s]
print('existing stems with deaf dictionary passage head:', len(hits))
for h in hits: print('  ', h)
hits2 = [s[:100] for s in existing if 'The research for new sources of energy' in s]
print('existing stems with languages passage head:', len([s for s in existing if 'There are many languages in the world' in s]))
print('existing stems with energy passage head:', len(hits2))
for h in hits2: print('  ', h)
hits3 = [s for s in existing if 'God helps those' in s or 'Action speak louder' in s or 'A burnt child' in s]
print('existing proverb stems (God/Action/burnt):', len(hits3))
for h in hits3: print('  ', h[:110])
hits4 = [s for s in existing if 'Our parents have a lot to share' in s or 'I really like the variety' in s or 'The factory polluted the river' in s or 'avoid foods that contain' in s]
print('existing definition-A stems (share/variety/polluted/contain):', len(hits4))
for h in hits4: print('  ', h[:110])
