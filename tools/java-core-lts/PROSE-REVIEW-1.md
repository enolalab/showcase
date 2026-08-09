# Prose review #1 — tutorials & drills with `topicId` 1–10

Scope: `sections[]`, `trap`, `keyPoints[]`, `followUp[]`, `summary` of every tutorial with
`topicId` 1–10, plus `explanation` / `whyWrong[]` of every drill in those topics.
Files touched: `content-A.json` (topics 1–2), `content-B.json` (3–5), `content-C.json` (6–7),
`content-D.json` (8–10) — 50 tutorials, 90 drills.

Out of scope by instruction, and **not** re-checked: `example` code, `correctAnswer`, printed
output. Items already recorded in `FACTCHECK.md` (including the ones whose fixes are already
visible in the JSON — L6 ArrayList/JDK-7143928, L10 heap-not-the-only-GC-region, L11
`Runtime.halt()`, L12 remembered set, L17 `List.of` has no modCount, M1 CMS obsolete-vs-expired)
are excluded.

All evidence below was produced on the installed **JDK 25.0.3**, with `--release 21` pinned for
every compile.

**Tally: HIGH=3 MEDIUM=3 LOW=6**

The prose in these ten topics is in good shape. The three HIGH findings all share one shape: a
*reason* invented to explain a correct observation. In every case the observation stands and only
the mechanism sentence has to change.

---

## HIGH — wrong fact

### H1 — `t-1-4` (content-A) `sections[5]`: the reason HashMap uses `>>>` is wrong, and it contradicts `t-3-1`

**Wrong text, verbatim** (end of `sections[5]`):

> Ngoài ra <code>&gt;&gt;</code> giữ dấu còn <code>&gt;&gt;&gt;</code> chèn 0 vào bit cao — **dùng
> <code>&gt;&gt;</code> cho số âm khi tính chỉ số băm sẽ cho kết quả âm, đó là lý do
> <code>HashMap</code> trong JDK dùng phép dịch không dấu khi trộn hash.**

**Why it is wrong.** The bucket index in `HashMap` is `(n - 1) & hash`, a mask — it is
*mathematically incapable* of being negative, whatever the sign of `hash` and whichever shift is
used. Worse, `h >> 16` and `h >>> 16` have **identical low 16 bits** (an arithmetic shift only
fills the vacated *high* bits), so for any table of length ≤ 65536 the two spread functions give
**the same bucket, bit for bit**. The real reason `h ^ (h >>> 16)` uses the unsigned shift is that
`>>` would sign-extend and invert the top 16 bits of the spread value for negative hashes,
corrupting exactly the high bits that a very large table (> 2^16 buckets) needs for its index.

This is also an **internal contradiction**: `t-3-1` `sections[0]` in content-B states the index
formula correctly — `Vị trí bucket được tính bằng (n - 1) & hash` — which already rules out a
negative index. A reader going A → B hits both.

**Evidence** (`T1.java`, `javac --release 21`):

```
table n=16 … n=65536
  h=-1           idx(>>>)=0      idx(>>)=0      same=true   bothNonNeg=true
  h=-987654321   idx(>>>)=21102  idx(>>)=21102  same=true   bothNonNeg=true
  h=-2147483648  idx(>>>)=32768  idx(>>)=32768  same=true   bothNonNeg=true
table n=1048576
  h=-987654321   idx(>>>)=86638  idx(>>)=938606 same=false  bothNonNeg=true
```

Never negative; identical up to a 65536-slot table; diverges only once the index needs more than
16 bits.

**Minimal replacement** (replace only the clause after the em dash):

> Ngoài ra <code>&gt;&gt;</code> giữ dấu còn <code>&gt;&gt;&gt;</code> chèn 0 vào bit cao. Chỉ số
> bucket của <code>HashMap</code> là <code>(n-1) &amp; hash</code> nên không bao giờ âm dù dùng
> phép dịch nào; lý do JDK chọn <code>h ^ (h &gt;&gt;&gt; 16)</code> là vì
> <code>&gt;&gt;</code> sẽ nhân bản bit dấu và làm hỏng chính 16 bit cao của giá trị trộn — phần
> mà một bảng lớn hơn 2^16 ô mới dùng tới.

`keyPoints[4]` and `followUp[1]` are fine as they stand; `followUp[1]` ("Vì sao HashMap dùng >>>
khi trộn hash chứ không dùng >>?") becomes a good question once the section answers it correctly.

---

### H2 — `t-9-2` (content-D) `keyPoints[2]` + `t-9-1` `sections[4]`/`keyPoints[3]`: `distinct()` is not a barrier and does not hang on an infinite source

**Wrong text, verbatim** — `t-9-2` `keyPoints[2]`:

> Stream vô hạn chỉ an toàn khi pipeline có điểm cắt; **sorted/distinct trên nguồn vô hạn sẽ treo
> hoặc OOM**

and `t-9-1` `sections[4]`:

> <b>Ngoại lệ: operation có trạng thái là hàng rào.</b> <code>sorted()</code> và
> <code>distinct()</code> **phải nhìn thấy dữ liệu trước khi phát tiếp**

and `t-9-1` `keyPoints[3]`:

> **sorted() và distinct() là stateful barrier** — nên đặt filter trước sorted

**Why it is wrong.** `sorted()` is a *full barrier*: it must buffer the entire input, so it really
does hang or OOM on an infinite source. `distinct()` is stateful but **not** a barrier — on a
sequential stream it emits each element the moment it is confirmed unseen, so it composes fine
with an infinite source and a downstream short-circuit. `t-9-2` `sections[3]` gets this right
(it names only `sorted()`); the `keyPoint` generalises it to `distinct` and breaks it.

**Evidence** (`T2.java`, `javac --release 21`, `timeout 20`, exit 0 — no hang):

```
distinct on infinite + limit  -> [1, 2, 3, 4, 5]     // Stream.iterate(1, x->x+1).distinct().limit(5)
distinct dedup infinite       -> [0, 1, 2]           // Stream.iterate(0, x->(x+1)%3).distinct().limit(3)
distinct().findFirst          -> Optional[7]         // Stream.generate(() -> 7).distinct().findFirst()
```

**Minimal replacements.**

`t-9-2` `keyPoints[2]`:

> Stream vô hạn chỉ an toàn khi pipeline có điểm cắt; sorted() trên nguồn vô hạn chắc chắn treo
> hoặc OOM, còn distinct() thì vẫn chảy được vì nó phát phần tử ngay khi biết là chưa gặp

`t-9-1` `sections[4]`, first sentence:

> <b>Ngoại lệ: operation có trạng thái.</b> <code>sorted()</code> là hàng rào thật — nó buộc phải
> gom toàn bộ phần tử vào bộ đệm mới sắp xếp được. <code>distinct()</code> cũng giữ trạng thái
> (tập phần tử đã gặp) nhưng không phải hàng rào: trên stream tuần tự nó phát phần tử ngay khi
> xác nhận là mới, nên vẫn dùng được với nguồn vô hạn.

`t-9-1` `keyPoints[3]`:

> sorted() là stateful barrier (gom hết dữ liệu); distinct() stateful nhưng vẫn phát dần — nên đặt
> filter trước sorted

---

### H3 — `d-8-8` (content-D) `explanation` + `t-8-3` `sections[4]`: a lambda capturing a local is *not* non-capturing and is *not* reused

**Wrong text, verbatim** — `d-8-8` `explanation`, final sentence:

> Cách chữa: copy giá trị ra biến local trước rồi capture biến local
> (`int snapshot = version; return () -> snapshot;`), **khi đó lambda không tham chiếu instance nào
> và thường còn được JDK tái sử dụng chung một object.**

and `t-8-3` `sections[4]`:

> Nếu lambda không tham chiếu gì tới instance bao ngoài, javac còn sinh method synthetic dạng
> <code>static</code>, và **lambda trở thành non-capturing, thường được tái sử dụng cùng một
> instance.**

**Why it is wrong.** "Does not reference `this`" and "non-capturing" are two different properties.
`() -> snapshot` captures the local `snapshot`, so `LambdaMetafactory` produces a *capturing* call
site: the `invokedynamic` takes `snapshot` as an argument and allocates a **new object on every
evaluation**. Only a lambda that captures *nothing at all* gets the constant call site that
OpenJDK reuses. The `static` synthetic method is real (that part is right) but it does not imply
reuse.

This is also an **internal contradiction inside content-D**: `t-8-1` `sections[4]` states the rule
correctly — *"Lambda không capture gì thường được OpenJDK trả về cùng một instance mỗi lần đánh
giá; còn lambda có capture thì thường phải tạo object mới."*

**Evidence** (`T8.java`, `javac --release 21`) — `capturesLocalOnly` is exactly the shape the
drill prescribes:

```
non-capturing same instance?             true
captures local only, same instance?      false
javap:  private static java.lang.String lambda$capturesLocalOnly$0(java.lang.String);
        private static java.lang.String lambda$nonCapturing$0();
```

Both synthetic methods are `static`, yet only the truly non-capturing one is reused.

**Minimal replacements.**

`d-8-8` `explanation`, final clause:

> …capture biến local (`int snapshot = version; return () -> snapshot;`), khi đó lambda không giữ
> tham chiếu tới `this` nữa nên object bao ngoài được GC bình thường. (Nó vẫn là lambda có capture
> — mỗi lần chạy vẫn tạo một object mới; chỉ lambda không capture gì mới được JDK dùng lại chung
> một instance.)

`t-8-3` `sections[4]`, final sentence:

> Nếu lambda không tham chiếu gì tới instance bao ngoài, javac sinh method synthetic dạng
> <code>static</code> và cắt được tham chiếu tới <code>this</code> — nhưng nó vẫn là lambda có
> capture nếu còn bắt biến local, nên vẫn tạo object mới mỗi lần; chỉ lambda không capture gì mới
> được tái sử dụng cùng một instance.

---

## MEDIUM — misleading

### M1 — `t-1-5` (content-A) `sections[5]`: "modifying a collection in for-each throws CME" stated as an absolute, contradicting `t-3-3`/`d-3-5`

**Wrong text, verbatim** (end of `sections[5]`):

> Ngoài ra, **sửa một collection trong khi duyệt bằng vòng for-each sẽ ném
> <code>ConcurrentModificationException</code>**; muốn xoá phần tử phải dùng
> <code>Iterator.remove()</code> hoặc <code>removeIf</code>.

**Why it is misleading.** Two documented exceptions, both of which an interviewer probes:
(1) fail-fast is *best-effort* — removing the second-to-last element of an `ArrayList` ends the
loop silently with no CME; (2) the concurrent collections never throw it at all. content-B says
exactly this: `t-3-3` `sections[2]` (*"Fail-fast là best-effort, không phải đảm bảo"*) and
`d-3-5` (*"câu 'xoá phần tử áp chót thì không ném CME' luôn đúng với ArrayList"*). Stating the
absolute in topic 1 sets up the learner to fail the very drill in topic 3.

**Evidence** (`T6.java`):

```
ArrayList remove second-to-last in for-each: no CME, list=[a, c]
COWAL add during for-each: no CME, size=6
```

**Minimal replacement** (last sentence only):

> Ngoài ra, sửa cấu trúc một collection <code>java.util</code> trong khi duyệt bằng for-each
> thường ném <code>ConcurrentModificationException</code> — nhưng đó chỉ là cơ chế best-effort
> (xoá phần tử áp chót của <code>ArrayList</code> thì lọt qua im lặng) và các collection concurrent
> thì không bao giờ ném; muốn xoá phần tử phải dùng <code>Iterator.remove()</code> hoặc
> <code>removeIf</code>.

---

### M2 — `t-3-3` (content-B) `sections[4]` + `keyPoints[4]`: `CopyOnWriteArrayList` is a snapshot iterator, not a weakly-consistent one

**Wrong text, verbatim** — `sections[4]`:

> <b>Đối lập: iterator weakly consistent.</b> <code>ConcurrentHashMap</code>,
> <code>CopyOnWriteArrayList</code>, <code>ConcurrentLinkedQueue</code> không ném CME. Chúng cho
> phép duyệt song song với sửa đổi, đổi lại bạn nhận một ảnh chụp 'gần đúng': **có thể thấy hoặc
> không thấy phần tử được thêm sau khi iterator ra đời**, nhưng không bao giờ thấy phần tử hai lần
> hay thấy trạng thái hỏng.

and `keyPoints[4]`:

> **ConcurrentHashMap và CopyOnWriteArrayList dùng iterator weakly consistent** nên không bao giờ
> ném CME

**Why it is misleading.** `CopyOnWriteArrayList` does not give a "gần đúng" view at all — its
iterator holds a hard reference to the array as it was at `iterator()` time, so it is a *strict
snapshot*: it will **never** see a later addition or removal, and `remove()` on it throws
`UnsupportedOperationException`. Lumping it with `ConcurrentHashMap`, whose iterator genuinely may
or may not reflect later writes, mis-states two different guarantees as one. "What exactly does
`CopyOnWriteArrayList`'s iterator guarantee?" is a standard follow-up.

**Evidence** (`T6.java`):

```
COWAL iterator saw [x, y] ; list is now [y, z]            <-- snapshot: ignored both add and remove
COWAL iterator.remove() -> UnsupportedOperationException
CHM iterator saw [0, 1, 2, 3, 100] (contains 100? true)   <-- weakly consistent: DID see the later put
```

**Minimal replacements.**

`sections[4]`:

> <b>Đối lập: iterator không fail-fast.</b> <code>ConcurrentHashMap</code>,
> <code>CopyOnWriteArrayList</code>, <code>ConcurrentLinkedQueue</code> không ném CME, nhưng bảo
> đảm của chúng khác nhau. <code>ConcurrentHashMap</code> và <code>ConcurrentLinkedQueue</code> là
> <i>weakly consistent</i>: có thể thấy hoặc không thấy phần tử được thêm sau khi iterator ra đời,
> nhưng không bao giờ thấy phần tử hai lần hay thấy trạng thái hỏng.
> <code>CopyOnWriteArrayList</code> mạnh hơn — nó giữ đúng bản chụp mảng tại thời điểm tạo
> iterator, nên <b>chắc chắn không</b> thấy mọi thay đổi sau đó, và <code>remove()</code> trên
> iterator ném <code>UnsupportedOperationException</code>.

`keyPoints[4]`:

> ConcurrentHashMap dùng iterator weakly consistent, CopyOnWriteArrayList dùng iterator snapshot —
> cả hai đều không bao giờ ném CME

---

### M3 — `t-3-3` (content-B) `sections[5]`: "only `setValue` and `put` on an existing key are safe" fails for access-order `LinkedHashMap`

**Wrong text, verbatim:**

> <b>Bẫy với Map.</b> Trong vòng lặp trên <code>map.keySet()</code> hay <code>map.entrySet()</code>,
> gọi <code>map.put(keyMoi, v)</code> hoặc <code>map.remove(k)</code> đều làm modCount tăng. **Chỉ
> có <code>entry.setValue(v)</code> và <code>map.put</code> lên key ĐÃ tồn tại là an toàn, vì chúng
> không đổi cấu trúc.**

**Why it is misleading.** For a `LinkedHashMap` built with `accessOrder = true` — the standard LRU
idiom, which content-C's `d-7-6` explicitly recommends (*"chí ít là LinkedHashMap với
removeEldestEntry"*) — `afterNodeAccess` bumps `modCount`. So `put` on an **existing** key throws
CME, and so does a bare `get()`. The stated rule is right for `HashMap` and for insertion-order
`LinkedHashMap`, and wrong for exactly the map an interviewer reaches for when the topic is caches.

**Evidence** (`T6.java`):

```
LHM access-order,   put on EXISTING key            -> ConcurrentModificationException
LHM access-order,   plain get() during for-each    -> ConcurrentModificationException
LHM insertion-order,put on EXISTING key            : no CME
```

**Minimal replacement** (last sentence, plus one added clause):

> Chỉ có <code>entry.setValue(v)</code> và <code>map.put</code> lên key ĐÃ tồn tại là an toàn, vì
> chúng không đổi cấu trúc. Ngoại lệ đáng nhớ: <code>LinkedHashMap</code> tạo với
> <code>accessOrder = true</code> (idiom LRU) coi cả một lần <code>get()</code> là thay đổi thứ tự
> và tăng <code>modCount</code> — nên trên map đó, ngay cả <code>get()</code> trong lúc duyệt cũng
> ném CME.

---

## LOW — imprecise

### L1 — `d-1-9` (content-A) `explanation`: BigDecimal's unscaled value is **signed**

> In ra false rồi true. **BigDecimal lưu một số nguyên không dấu cùng với scale**, và equals() so
> sánh cả hai thành phần…

`BigDecimal` stores a signed unscaled value (a `long intCompact`, or a `BigInteger` which is
signed) plus an `int scale`. `new BigDecimal("-2.0")` is representable, which an unsigned magnitude
alone could not express. The rest of the explanation is correct.

**Fix:** `BigDecimal lưu một số nguyên có dấu (unscaled value) cùng với scale`

---

### L2 — `t-4-2` (content-B) `sections[2]`: `new String(literal)` does not copy the content

> <b>new String("a") luôn tạo object mới.</b> Toán tử <code>new</code> theo định nghĩa cấp phát
> object mới trên heap, **chép nội dung từ literal trong pool**.

Since JDK 7u6, `String(String original)` assigns `this.value = original.value` — the new `String`
object **shares the backing array** with the pooled literal; nothing is copied. The conclusion
(`new String("a") != "a"`) is unaffected, only the stated mechanism.

**Evidence** (`TA.java`, `--add-opens java.base/java.lang=ALL-UNNAMED`):

```
literal == copy (object identity): false
backing byte[] SHARED between literal and new String(literal): true
new String(char[]) shares array with literal? false
```

**Fix:** `Toán tử <code>new</code> theo định nghĩa cấp phát một object String mới trên heap (nó
dùng chung mảng byte nền với literal, nhưng vẫn là object khác).`

---

### L3 — `t-3-2` (content-B) `sections[2]` + `keyPoints[2]`, and `d-3-4` `explanation`: a mutated key *is* removable

> Tệ hơn, entry đó cũng **không remove được nữa: nó chiếm chỗ vĩnh viễn** cho tới khi cả map bị thu
> hồi. *(và `keyPoints[2]`: "…khiến entry không tìm được và không xoá được"; `d-3-4`: "không tìm
> được và cũng không remove được")*

`remove(key)` fails, but `iterator().remove()`, `entrySet().removeIf(...)`, `values().remove(v)`
and `clear()` all still work. "Chiếm chỗ vĩnh viễn" overstates it.

**Evidence** (`T7.java`): `remove(b) -> null, size=1` then `after iterator.remove(): size=0`.

**Fix:** `Tệ hơn, entry đó cũng không xoá được bằng <code>remove(key)</code> nữa — chỉ còn lấy ra
được bằng cách duyệt và gọi <code>Iterator.remove()</code>.` (same wording adjustment in
`keyPoints[2]` and in `d-3-4`: `không tìm được và không xoá được bằng remove(key)`)

---

### L4 — `t-3-5` (content-B) `sections[4]`: `ConcurrentHashMap` is dated to Java 8

> <code>ConcurrentHashMap</code> **(Java 8+)** khoá ở mức từng bucket — CAS khi bucket rỗng…

`ConcurrentHashMap` ships in **Java 5**; what arrived in Java 8 is the *rewrite* (segments →
per-bin CAS + `synchronized`). `d-3-8` in the same file states this correctly
(*"ConcurrentHashMap từ Java 8 bỏ cơ chế segment của Java 7"*), so the parenthesis in the tutorial
reads as a wrong birth date next to a correct one.

**Fix:** `<code>ConcurrentHashMap</code> (có từ Java 5; từ Java 8 bỏ segment) khoá ở mức từng
bucket — …`

---

### L5 — `t-5-5` (content-B) `sections[0]` + `keyPoints[0]`: heap pollution attributed exclusively to raw types / unchecked casts

> **Nó chỉ xảy ra khi có raw type hoặc unchecked cast trong đường đi.** *(và `keyPoints[0]`: "…luôn
> bắt nguồn từ raw type hoặc unchecked cast")*

The very next section of the same tutorial describes the other route: a generic-varargs method that
leaks its `T[]` through an `Object[]` pollutes the heap with **no raw type and no cast written
anywhere**. JLS 4.12.2 ties heap pollution to "an operation that produces an unchecked warning",
which covers generic varargs as well.

**Fix (`sections[0]`):** `Nó chỉ xảy ra ở những chỗ compiler đã phải phát cảnh báo unchecked — raw
type, unchecked cast, hoặc mảng varargs generic.`
**Fix (`keyPoints[0]`):** `…luôn bắt nguồn từ một thao tác có cảnh báo unchecked: raw type,
unchecked cast, hoặc varargs generic`

---

### L6 — `t-10-1` (content-D) `sections[0]`: the compiler does not force the caller to handle empty

> <code>Optional&lt;User&gt;</code> đưa khả năng 'không có giá trị' vào <b>hệ thống kiểu</b>, **nên
> compiler buộc người gọi phải nghĩ tới trường hợp rỗng.**

No compiler check exists — `opt.get()` compiles cleanly, which is precisely why `t-10-2`
`sections[2]` has to call `get()` an anti-pattern. What the type does is make the possibility
*visible in the signature*; the enforcement is social/review, not compile-time.

**Fix:** `…đưa khả năng 'không có giá trị' vào <b>hệ thống kiểu</b>, nên người gọi buộc phải mở bao
ra và không thể không nhìn thấy trường hợp rỗng (dù compiler không cấm được việc gọi thẳng
<code>get()</code>).`

---

## Checked and found correct — do not re-check

These were the highest-risk claims in topics 1–10 and all survived scrutiny, several with a test:

- **`t-8-5` TRAP, `Integer::toString` ambiguity** — real. `javac --release 21`:
  `reference to toString is ambiguous / both method toString(int) in Integer and method toString() in Integer match`.
- **`t-2-1` `sections[4]` "class wins"** — holds, including the hard case: an *abstract* superclass
  method beats an interface `default` and forces the subclass to implement
  (`C is not abstract and does not override abstract method m() in A`).
- **`t-2-5` `sections[4]` `HashSet.addAll` → `add`** — still true on JDK 25 (measured: 3 elements
  counted 6 times by a naive counting subclass), so the fragile-base-class example is live.
- **`t-3-5` `sections[2]`** — `Set.of` duplicate → `IllegalArgumentException: duplicate element`;
  `Map.of` duplicate key → `IllegalArgumentException`; `List.of(...).contains(null)` and
  `Set.of(...).contains(null)` → `NullPointerException`. All four verified.
- **`t-3-2` `sections[5]`** — `new TreeMap<>().put(null, 1)` throws NPE even on an empty map;
  `HashMap` accepts one null key. Verified.
- **Flag facts** (`-XX:+PrintFlagsFinal`): `MaxGCPauseMillis = 200`, `MaxTenuringThreshold = 15`,
  `AutoBoxCacheMax = 128`, `StringTableSize = 65536`, `DoEscapeAnalysis = true` — every tutorial
  claim about these matches.
- **Version attributions in topics 1–10** — every one of ~120 "Java N" claims was read against the
  JEP record; no defect found. Spot-worth noting as correct: `Math.floorDiv`/`addExact` 8,
  covariant returns 5, switch-on-String 7, arrow `switch` std 14, `record` 16, `sealed` 17,
  pattern-matching-for-switch std 21, text blocks + `formatted()` 15, `strip/isBlank/lines/repeat`
  11, Compact Strings 9 (JEP 254), `StringConcatFactory` 9 (JEP 280), pool→heap **7** vs PermGen
  death **8** (kept apart in three separate places), `substring` copy at 7u6, `List.of` 9 /
  `List.copyOf` 10 / `Collectors.toUnmodifiableList` 10 / `Stream.toList` 16, `SequencedCollection`
  21 (JEP 431), `@SafeVarargs` on private instance methods from 9, `StringBuilder.compareTo` 11,
  try-with-resources on effectively-final vars 9 (JEP 213), `Throwable(…, boolean, boolean)` 7,
  helpful NPE 14 opt-in / 15 default, `finalize` deprecated 9 → for-removal 18 (JEP 421),
  `Cleaner` 9, Parallel default 8 / G1 default 9, ZGC 11→15 with Generational ZGC opt-in at 21,
  `Optional.or`/`stream`/`ifPresentOrElse` 9, `orElseThrow()` 10, `isEmpty()` 11, and `get()`
  correctly stated as **not** deprecated as of 21.
- **Cross-file consistency** — pairwise checks on the topics that appear in more than one file:
  Integer cache (A `t-1-2` vs B `t-4-2`), `equals`/`hashCode` contract (A `t-2-5` vs B `t-3-2`),
  effectively-final rationale (A `t-1-5` vs D `t-8-2`), lambda scoping (A `t-1-5` vs D `t-8-3`),
  escape analysis (B `t-4-3` vs C `t-7-2`/`d-7-8`), `Collectors.toList` mutability (B `t-3-5` vs
  D `t-9-3`/`d-9-5`), `Optional` not `Serializable` (D `t-10-1`/`d-10-9`), commonPool sizing
  (D `t-9-5`), string pool location (B `t-4-2` vs C `t-7-1`). The only contradictions found are
  H1 (A vs B), H3 (D vs D) and M1 (A vs B), all reported above.
