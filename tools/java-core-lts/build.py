#!/usr/bin/env python3
"""Merge authored topic JSON -> validate -> inject into template -> public/java-core-lts.html"""
import json, re, sys, os, glob, html as htmllib

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(REPO, 'public', 'java-core-lts.html')
if '--out' in sys.argv:
    OUT = sys.argv[sys.argv.index('--out') + 1]

TOPICS = [
    (1, "Java Cơ Bản", "Biến, toán tử, luồng điều khiển, phạm vi biến"),
    (2, "Lập Trình Hướng Đối Tượng", "Class, kế thừa, interface, đa hình"),
    (3, "Collections", "List, Set, Map, iterator"),
    (4, "Xử Lý Chuỗi", "String, StringBuilder, String Pool"),
    (5, "Generics", "Type parameter, wildcard, type erasure"),
    (6, "Exception Handling", "Try-catch, try-with-resources"),
    (7, "Bộ Nhớ & GC", "Heap, stack, garbage collection"),
    (8, "Lambdas", "Functional interface, method reference"),
    (9, "Streams API", "Map, filter, reduce, collector"),
    (10, "Optional", "Xử lý null hiệu quả"),
    (11, "Modules", "Java Platform Module System (Java 9+)"),
    (12, "HTTP Client", "java.net.http (Java 11+)"),
    (13, "Type Inference", "Từ khóa var (Java 10+)"),
    (14, "Records", "Immutable data class (Java 16/17+)"),
    (15, "Sealed Classes", "Hạn chế kế thừa (Java 17+)"),
    (16, "Pattern Matching", "instanceof, switch, record pattern"),
    (17, "Virtual Threads", "Lightweight threading (Java 21+)"),
    (18, "Concurrency", "Thread, lock, executor, JMM"),
    (19, "Design Patterns", "Các pattern thông dụng"),
    (20, "Best Practices", "Performance, testing, architecture"),
]
VALID_TOPIC_IDS = {t[0] for t in TOPICS}
PLAIN_TUT = ('title', 'summary', 'trap', 'exampleTitle')
PLAIN_DRILL = ('question', 'explanation')
TAG_RE = re.compile(r'</?(?:b|i|code|em|strong)>', re.I)

errors, warnings, fixed = [], [], 0


def clean_plain(s):
    """Plain-text fields get escaped at render time, so strip stray markup/entities."""
    global fixed
    orig = s
    s = TAG_RE.sub('', s)
    if '&lt;' in s or '&gt;' in s or '&amp;' in s or '&quot;' in s:
        s = htmllib.unescape(s)
    if s != orig:
        fixed += 1
    return s


def check_sections(tid, sections):
    """sections allow only <b>/<i>/<code>; any other raw < is an authoring bug."""
    for s in sections:
        stripped = TAG_RE.sub('', s)
        if '<' in stripped or '>' in stripped:
            bad = stripped[max(0, stripped.find('<') - 30):stripped.find('<') + 40]
            errors.append(f"{tid}: raw < or > in sections (dùng &lt;/&gt;): ...{bad}...")


tutorials, drills = [], []
files = sorted(glob.glob(os.path.join(HERE, 'content', 'content-*.json')))
if not files:
    sys.exit("no content-*.json found")

for path in files:
    name = os.path.basename(path)
    try:
        data = json.load(open(path, encoding='utf-8'))
    except Exception as e:
        errors.append(f"{name}: JSON không parse được: {e}")
        continue

    for t in data.get('tutorials', []):
        tid = t.get('id', '?')
        if t.get('topicId') not in VALID_TOPIC_IDS:
            errors.append(f"{tid}: topicId không hợp lệ: {t.get('topicId')}")
        for f in PLAIN_TUT:
            if t.get(f):
                t[f] = clean_plain(t[f])
        t['keyPoints'] = [clean_plain(k) for k in t.get('keyPoints', [])]
        t['followUp'] = [clean_plain(k) for k in t.get('followUp', [])]
        secs = t.get('sections', [])
        if len(secs) < 3:
            warnings.append(f"{tid}: chỉ có {len(secs)} đoạn sections")
        check_sections(tid, secs)
        if not t.get('example'):
            warnings.append(f"{tid}: thiếu example")
        tutorials.append(t)

    for d in data.get('drills', []):
        did = d.get('id', '?')
        if d.get('topicId') not in VALID_TOPIC_IDS:
            errors.append(f"{did}: topicId không hợp lệ: {d.get('topicId')}")
        for f in PLAIN_DRILL:
            if d.get(f):
                d[f] = clean_plain(d[f])
        ch = d.get('choices', [])
        d['choices'] = [clean_plain(c) for c in ch]
        if len(ch) != 4:
            errors.append(f"{did}: {len(ch)} lựa chọn (cần 4)")
        ca = d.get('correctAnswer')
        if not isinstance(ca, int) or not (0 <= ca < len(ch)):
            errors.append(f"{did}: correctAnswer không hợp lệ: {ca}")
            continue
        ww = d.get('whyWrong', [])
        if len(ww) != len(ch):
            errors.append(f"{did}: whyWrong có {len(ww)} mục (cần {len(ch)})")
        else:
            d['whyWrong'] = [clean_plain(w) for w in ww]
            empties = [i for i, w in enumerate(d['whyWrong']) if not w.strip()]
            if empties != [ca]:
                errors.append(f"{did}: whyWrong rỗng ở {empties}, correctAnswer={ca}")
        if d.get('difficulty') not in ('beginner', 'intermediate', 'advanced'):
            errors.append(f"{did}: difficulty không hợp lệ: {d.get('difficulty')}")
        if len(d.get('explanation', '')) < 80:
            warnings.append(f"{did}: giải thích quá ngắn ({len(d.get('explanation',''))} ký tự)")
        drills.append(d)

# duplicate ids
for label, items in (('tutorial', tutorials), ('drill', drills)):
    seen = {}
    for x in items:
        seen.setdefault(x.get('id'), []).append(x.get('topicId'))
    for k, v in seen.items():
        if len(v) > 1:
            errors.append(f"trùng {label} id: {k} (x{len(v)})")

tutorials.sort(key=lambda x: (x['topicId'], x['id']))
drills.sort(key=lambda x: (x['topicId'], x['id']))

print(f"files: {len(files)}  tutorials: {len(tutorials)}  drills: {len(drills)}  (auto-fixed fields: {fixed})")
print("\ncoverage per topic:")
gap = False
for tid, name, _ in TOPICS:
    nt = sum(1 for x in tutorials if x['topicId'] == tid)
    nd = sum(1 for x in drills if x['topicId'] == tid)
    flag = '' if (nt >= 4 and nd >= 8) else '  <-- THIN'
    if flag:
        gap = True
    print(f"  {tid:>2} {name:<28} tut={nt:<3} drill={nd:<3}{flag}")

if warnings:
    print(f"\nwarnings ({len(warnings)}):")
    for w in warnings[:25]:
        print("  -", w)
if errors:
    print(f"\nERRORS ({len(errors)}):")
    for e in errors[:40]:
        print("  !", e)
    sys.exit(1)

if '--check' in sys.argv:
    print("\ncheck only, not writing")
    sys.exit(0)

topics_js = [{'id': i, 'name': n, 'desc': d} for i, n, d in TOPICS]
tpl = open(os.path.join(HERE, 'template.html'), encoding='utf-8').read()
j = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
out = (tpl.replace('/*__TOPICS__*/', j(topics_js))
          .replace('/*__TUTORIALS__*/', j(tutorials))
          .replace('/*__DRILLS__*/', j(drills)))
for marker in ('/*__TOPICS__*/', '/*__TUTORIALS__*/', '/*__DRILLS__*/'):
    assert marker not in out, f"marker {marker} chưa được thay"
open(OUT, 'w', encoding='utf-8').write(out)
print(f"\nwrote {OUT}  ({len(out.encode('utf-8')):,} bytes)")
if gap:
    print("NOTE: một số chủ đề còn mỏng (xem THIN ở trên)")
