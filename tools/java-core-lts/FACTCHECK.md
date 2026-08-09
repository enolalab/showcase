# Adversarial fact-check — Java study content (7 merged authors)

Scope: `content-A.json` … `content-G.json` — 105 tutorials, 187 drills.

Method: every drill with a `code` field that asks about output / behaviour / compilability was
written to a throwaway `.java` file and compiled and run on the local JDK 25 with `--release`
pinned to the version the drill claims (21 / 17 / 11 / 9 / 8), so that JDK 25 could not
silently validate post-21 syntax or post-21 runtime behaviour. Real multi-module JPMS projects
and live HTTP servers were built to test the module and `HttpClient` claims. Version
attributions were checked against the JEP record, against `javac --release N` acceptance, and
against `-XX:+PrintFlagsFinal`.

**Tally: CRITICAL=1 HIGH=3 MEDIUM=10 LOW=21**

The content is unusually accurate. 186 of 187 answer keys are correct, and the danger zones
that this kind of material almost always gets wrong — Generational ZGC being opt-in in 21,
escape analysis being scalar replacement rather than stack allocation, HashMap treeify needing
table length ≥ 64, ScopedValue / StructuredTaskScope still being preview in 21, String
Templates never standardising — are all correct, several of them used deliberately as teaching
points. The defects below are concentrated in tutorial prose and example code, not in the
answer keys.

---

## CRITICAL — wrong answer key

### C1 — `d-18-8` (content-G): the code shown never throws; distractor `[0]` is what actually happens

`correctAnswer` is `1`:

> `[1]* Có thể ném IllegalStateException với thông điệp "Recursive update", hoặc trong trường hợp khác gây treo, vì computeIfAbsent giữ khoá trên bin trong lúc chạy hàm`

and `whyWrong[0]` dismisses the true outcome:

> `WW[0]: Đây chính xác là tình huống mà javadoc của ConcurrentHashMap cấm; hành vi không được bảo đảm.`

The code in the drill is:

```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.computeIfAbsent("a", k -> { map.put("b", 2); return 1; });
```

`"a".hashCode()==97` → bin 1; `"b".hashCode()==98` → bin 2. The recursive `put` lands in a
**different bin** from the reservation node, so no self-deadlock and no recursive-update
detection is possible. This is deterministic, not a race — 5/5 identical runs:

```
run0: NO EXCEPTION, map={a=1, b=2}
run1: NO EXCEPTION, map={a=1, b=2}
run2: NO EXCEPTION, map={a=1, b=2}
run3: NO EXCEPTION, map={a=1, b=2}
run4: NO EXCEPTION, map={a=1, b=2}
hash a=97 bin=1 | b=98 bin=2
```

Distractor `[0]` is `Chạy bình thường, map có hai key a và b` — which describes the observed
result word for word, map contents included. The same test with keys that *do* collide
(`Integer` `1` and `17`, both → bin 1) produces the intended exception:

```
same-bin: java.lang.IllegalStateException: Recursive update
```

The general teaching point (the javadoc forbids it, behaviour is unspecified) is correct — the
chosen sample just happens to land in the benign case, which makes the marked-wrong option the
right one for a student who runs it. Fix: use a colliding key pair
(`ConcurrentHashMap<Integer,Integer>` with `1` and `17`), or drop the concrete `CODE:` block so
the question is purely about the contract.

---

## HIGH — wrong fact

### H1 — `t-16-4` (content-F): record patterns **do** make a `switch` exhaustive in Java 21

Wrong claim, verbatim (section heading):

> **Record pattern là pattern có điều kiện nên không tự làm switch đầy đủ.** `case Shape s` phủ trọn kiểu `Shape`, nhưng `case Circle(double r)` chỉ khớp khi giá trị đúng là `Circle` khác null.

and the follow-up question built on it:

> `FU: case Circle(double r) có làm switch trên sealed type trở nên đầy đủ không?`

Correct fact: per JLS 21 §14.11.1.1 a record pattern `R(P1..Pn)` **does cover** type `R` when
each component pattern covers its component type, including nested record patterns. A switch
over a sealed type whose branches are only record patterns compiles with **no `default`**;
because record patterns still don't match `null`, javac inserts an implicit `MatchException`
branch. The answer to the FU is **yes**.

Evidence — record patterns only, no `default`:

```java
sealed interface Sh permits Ci, Re {}
record Ci(double r) implements Sh {}
record Re(double w, double h) implements Sh {}
static String f(Sh s) {
    return switch (s) {                       // no default
      case Ci(double r) -> "c";
      case Re(double w, double h) -> "r";
    };
}
```
```
$ javac --release 21 RP.java
COMPILES -> record patterns ARE exhaustive
$ java RP
cr
```

The tutorial's own EXAMPLE, with its `case Rect r` fallback removed so that only nested record
patterns remain, also compiles and then throws `MatchException` at runtime — the exact
signature of an exhaustive-by-record-pattern switch.

The *second* half of the same sentence is correct and was verified separately: a record pattern
is never *unconditional* (JLS 21 §14.30.3), so `case Ci c` after `case Ci(double r)` is not a
dominance error. The two properties — *covers* (for exhaustiveness) and *unconditional* (for
dominance) — are distinct; the tutorial collapses them and gets the first one backwards. The
KP line `Record pattern là pattern có điều kiện nên vẫn viết được case Type t phía sau nó` is
fine; only the heading and the FU need fixing.

### H2 — `t-18-3` (content-G): `ConcurrentHashMap.compute` does **not** re-run the function

Wrong claim, verbatim:

> `updateAndGet`, `accumulateAndGet`, `compute` của `ConcurrentHashMap` đều có thể chạy lại hàm của bạn nhiều lần khi CAS thất bại.

and the KP:

> `KP: Hàm truyền cho updateAndGet/compute có thể chạy lại nhiều lần nên phải không có side effect`

Correct fact: `ConcurrentHashMap.compute` / `computeIfAbsent` / `computeIfPresent` do not use a
CAS-retry loop around the user function — they hold the bin lock (or a `ReservationNode`
monitor) while invoking it. Javadoc: *"The entire method invocation is performed atomically."*
The function is invoked **exactly once**. (The *default* `ConcurrentMap.compute` interface
method does retry, but CHM overrides it — so the statement is wrong precisely for the class it
names.)

Measured, 64 threads × 2000 ops on a single key:

```
CHM.compute  : expected=128000 actualInvocations=128000 value=128000   -> re-run? NO
updateAndGet : expected=128000 actualInvocations=337257 value=128000   -> re-run? YES (2.6x)
```

The tutorial is right about `Atomic*` and wrong about `ConcurrentHashMap`. The advice "keep the
function pure" stays good for CHM — but for a different reason (it runs under a bin lock), so
only the stated mechanism needs fixing.

### H3 — `t-11-1` (content-E): `java.net.http` credited to Java 9, contradicting `t-12-1` in the same file

Wrong claim, verbatim:

> Java 9 tách JDK thành khoảng 70 module (`java.base`, `java.sql`, `java.xml`, `java.net.http`...)

Correct fact: there is no `java.net.http` module in Java 9. Java 9/10 shipped the **incubator**
module `jdk.incubator.httpclient` (package `jdk.incubator.http`); `java.net.http` first exists
in Java 11 (JEP 321).

```
$ javac --release 9  H9.java   -> error: package java.net.http does not exist
$ javac --release 10 H9.java   -> error: package java.net.http does not exist
$ javac --release 11 H9.java   -> (compiles)
$ javac --release 9  ...jdk.incubator.http...
     error: package jdk.incubator.http is not visible
     (package jdk.incubator.http is declared in module jdk.incubator.httpclient, ...)
```

This is also an **internal contradiction**: `t-12-1` and `d-12-1` in the *same file* state the
9-incubator → 11-standard timeline correctly and in detail. An external reviewer reading
content-E front to back will hit both.

---

## MEDIUM — misleading but defensible

### M1 — `t-7-4` (content-C): the CMS flag on Java 14 does not stop the JVM booting

Stated three times:

> `dùng cờ -XX:+UseConcMarkSweepGC trên Java 14+ sẽ khiến JVM không khởi động được`
> `// -XX:+UseConcMarkSweepGC           BỊ GỠ ở Java 14, JVM không khởi động được`
> `KP: CMS bị deprecate ở Java 9 và gỡ bỏ hoàn toàn ở Java 14 — dùng cờ cũ sẽ làm JVM không khởi động.`

Correct fact: JEP 363 (JDK 14) made `UseConcMarkSweepGC` **obsolete**, not unrecognised. JDK 14
prints `Ignoring option UseConcMarkSweepGC; support was removed in 14.0` and **starts normally
on G1**. The flag *expired* in JDK 15; only from 15 onward does it abort startup.

Evidence — the same obsolete→expired lifecycle demonstrated live on the JDK present here
(`ZGenerational` is currently obsolete, `UseConcMarkSweepGC` expired):

```
$ java -XX:+UseZGC -XX:+ZGenerational Hi
OpenJDK 64-Bit Server VM warning: Ignoring option ZGenerational; support was removed in 24.0
JVM started OK                                   <-- obsolete: warns, starts

$ java -XX:+UseConcMarkSweepGC Hi
Unrecognized VM option 'UseConcMarkSweepGC'
Error: Could not create the Java Virtual Machine. <-- expired: aborts
```

Fix: "Java 15+ → aborts; Java 14 → warning, ignored, runs on G1". (No JDK 14 is installed, so
this rests on the JEP 363 release note plus the demonstrated flag lifecycle.)

### M2 — `t-11-4` (content-E): automatic-module implied readability overstated

> Automatic module *export toàn bộ* package, *requires transitive* **mọi module khác trên module path**, và đọc được cả unnamed module.

(repeated more weakly in `d-11-3` EXPL: *"…và được coi là requires transitive."*)

Correct fact: an automatic module *reads* every other resolved module, but it grants **implied
readability only to other automatic modules**. A module that `requires` an automatic module does
**not** thereby read explicit named modules such as `java.sql`.

Evidence — `com.acme.app { requires auto.one; }` with two automatic JARs on the module path:

```
reads auto2 = true          <-- automatic -> automatic: implied readability YES
```
but referencing `java.sql.Types` from the same module:
```
error: package java.sql is not visible
  (package java.sql is declared in module java.sql, but module com.acme.app does not read it)
```
— and the same error even with `--add-modules java.sql`, so `java.sql` was definitely resolved.

### M3 — `t-16-4` TRAP (content-F): the headline names the wrong example

> `TRAP: Nghĩ rằng case Line(Point p1, Point p2) sẽ khớp mọi Line.`

Correct fact: `case Line(Point p1, Point p2)` — flat type patterns for the components — *does*
match every non-null `Line`, including one whose components are null. The failure mode only
arises with a **nested** record pattern (`Line(Point(var x, var y), ...)`), which is what the
rest of the TRAP sentence actually describes. Running the tutorial's own EXAMPLE:

```
hinh tron ban kinh 5.0     <- describe(new Circle(null, 5)) DID match case Circle(Point p, double r)
```

### M4 — `t-18-8` (content-G): the EXAMPLE throws NPE on the very path it demonstrates

```java
.orTimeout(2, TimeUnit.SECONDS)
.exceptionally(ex -> {
    log.warn("loi: {}", ex.getCause().getMessage());   // getCause: bo lop CompletionException
```

`orTimeout` completes via `completeExceptionally(new TimeoutException())`, which stores the
**raw** throwable; `uniExceptionally` passes it through without `CompletionException` wrapping.
So `ex` is a bare `TimeoutException` and `ex.getCause()` is `null`:

```
exceptionally sees -> TimeoutException
getCause() NPE: java.lang.NullPointerException: Cannot invoke "java.lang.Throwable.getMessage()"
                because the return value of "java.lang.Throwable.getCause()" is null
```

The related KP is also too broad: *"Exception bị bọc trong CompletionException khi truyền tiếp
và khi join"*. Precise rule: wrapping happens when a **stage's function throws**; a future
completed directly (`completeExceptionally`, `orTimeout`, `failedFuture`) delivers the raw
throwable to `exceptionally`/`handle`, although `join()` still wraps at the boundary. The
section prose is stated correctly — only the example and the KP shorthand are wrong.

### M5 — `t-12-5` (content-E): the "manual retry" example loops forever and contradicts its own prose

```java
int attempt = 0;
while (true) {
    try {
        HttpResponse<String> res = CLIENT.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() < 500 && res.statusCode() != 429) return res;
    } catch (IOException e) {
        if (++attempt >= 3) throw e;
    }
    Thread.sleep(Duration.ofMillis((long) (100 * Math.pow(2, attempt))));
}
```

`attempt` is incremented only in the `catch`. A server that persistently returns 500/429 gives
an **infinite loop** with a constant 100 ms delay — no attempt cap and no exponential backoff,
i.e. the opposite of the prose directly above it ("vòng lặp retry với exponential backoff kèm
jitter"). It also retries every 5xx including 501/505 although the prose restricts retries to
408/429/502/503/504, and ignores `Retry-After` which the prose demands.

### M6 — `d-20-6` (content-C): the HashMap consequence is false for the class as written

> `Hệ quả nghiêm trọng: object kiểu này dùng làm key HashMap sẽ làm hashCode đổi sau khi put và get() trả về null.`

The `Order` class in the drill overrides neither `equals` nor `hashCode`, so it uses the
identity hash. Mutating its `items` list changes nothing and `get()` still works:

```
identity hashCode before/after mutate: 2060468723 / 2060468723 ; get()=v
```

The claim only holds for a value-based `equals`/`hashCode` (record, Lombok `@Data`, or
hand-written). As written, immediately after a class that has neither, it teaches a wrong causal
rule.

### M7 — `d-6-6` (content-C): tagged `VERSIONS: [8, …]` but the code needs Java 11

The snippet uses `Path.of(...)` and `Files.readString(...)`, both Java 11+, so on Java 8 a
learner does not reach the intended lesson at all:

```
$ javac --release 8 D66v8.java
D66v8.java:4: error: cannot find symbol
        try { Files.readString(Path.of("a.txt")); }
                                   ^  symbol: method of(String)

$ javac --release 21 D66.java
D66.java:6: error: exception IOException has already been caught   <-- the intended lesson
```

Fix: drop `8` from `versions`, or use `Files.readAllBytes(Paths.get(...))`.

### M8 — `d-20-6` / `t-20-2` (content-C): `List.copyOf` prescribed as the fix, but it is Java 10+

`d-20-6` is tagged `VERSIONS: [8, 11, 17, 21]` and its explanation says
`cách gọn nhất là this.items = List.copyOf(items)`; `t-20-2` repeats it in code with no version
note (unlike its record section, which *is* correctly version-tagged).

```
$ javac --release 9  Copy8.java -> error: cannot find symbol  method copyOf(List<String>)
$ javac --release 10 Copy8.java -> OK
```

Java 8 equivalent: `Collections.unmodifiableList(new ArrayList<>(items))`.

### M9 — `t-14-1` (content-F): `-parameters` is not a plausible cause of record deserialization failure

> nếu bạn thấy lỗi kiểu "no suitable constructor" khi deserialize một record thì gần như chắc chắn là phiên bản Jackson quá cũ **hoặc thiếu `-parameters`**.

Correct fact: Jackson 2.12+ reads record component names from the class file's `Record`
attribute via `Class#getRecordComponents()`, so `-parameters` is irrelevant *for records*. Only
the "Jackson too old" half holds. Evidence — compiled **without** `-parameters`, Jackson 2.16.1
binds the record fine and even runs the compact-constructor validation:

```
Email[value=x@y, n=3]
threw: ValueInstantiationException / cause java.lang.IllegalArgumentException: bad email
```

(`t-14-4` states the same point more carefully and is fine.)

### M10 — `t-18-4` (content-G): `ACC_SYNCHRONIZED` is not in the constant pool

> còn method `synchronized` chỉ là một cờ `ACC_SYNCHRONIZED` trong **constant pool** và JVM tự khoá monitor khi vào

`ACC_SYNCHRONIZED` is an access flag in the `method_info` structure — a separate structure from
the constant pool. `javap -v`:

```
Constant pool:
  #46 = Utf8               instanceSync        <-- only the NAME is in the pool
...
  synchronized void instanceSync();
    flags: (0x0020) ACC_SYNCHRONIZED           <-- the flag lives on the method
```

Everything else in that sentence (JVM locks the monitor on entry, the exception handler
releases it) is correct.

---

## LOW — nitpicks

**Version tagging**

- **L1 — content-D, five drills tagged Java-8-valid use `List.of(...)` (Java 9).** `d-8-9`,
  `d-9-1`, `d-9-2`, `d-9-6`, `d-9-7` all carry `versions: [8, 11, 17, 21]` but open with
  `List.of(...)`. The concept each teaches is valid on 8; the printed code is not compilable
  there (`javac --release 8` → `cannot find symbol: method of(String,String,String)`). A scripted
  scan for post-8 APIs across every drill in all seven files (`List/Set/Map.of`, `var`, text
  blocks, `record`, `sealed`, `Stream.toList`, `strip/repeat/lines`, `takeWhile/dropWhile`,
  `HttpClient`, `Thread.ofVirtual`, arrow-`case`, `instanceof` patterns) found this pattern
  **only** in content-D — a per-author systematic slip.
- **L2 — `d-10-3` (content-D).** Distractor `[3]` uses `Optional.isEmpty()` (Java 11) in a drill
  tagged `versions: [8, …]`. `whyWrong[3]` does flag it, so it may be deliberate.
- **L3 — `t-15-3` (content-F).** `Ở Java 17 bạn có sealed nhưng chưa có pattern matching cho switch` — JEP 406 shipped it as **preview** in 17 (previews through 20, standard 21). "chưa có ở dạng chuẩn" would be precise.
- **L4 — `t-11-1` (content-E).** `Java 9 tách JDK thành khoảng 70 module` — JDK 9 shipped **98**
  modules. ~70 happens to match JDK 25 (`java --list-modules | wc -l` → 69), not JDK 9.
- **L5 — `t-11-5` (content-E).** jlink example uses `--compress=2`, deprecated since JDK 21
  (`--compress=zip-6` is current): `Warning: The 2 argument for --compress is deprecated…`. The
  claimed image size does check out (47 MB).
- **L6 — `t-3-4` (content-B).** ArrayList's lazy empty-array optimisation credited to "Java 7";
  JDK-7143928 landed in JDK 8 and was backported to 7u40, so it is defensible shorthand but not
  exact for stock 7 GA.

**Wrong or imprecise mechanism detail**

- **L7 — `t-11-4` / `d-11-8` (content-E).** `--add-opens không phải tuỳ chọn của javac` /
  `javac không nhận`. javac **does** accept it and warns instead of rejecting:
  `warning: [options] --add-opens has no effect at compile time`. The semantic point is right,
  the wording isn't.
- **L8 — `t-12-5` (content-E).** `JdkClientHttpRequestConnector` does not exist.
  `JdkClientHttpRequestFactory` is right (Spring 6.1, `RestClient`/`RestTemplate`); the reactive
  one is `org.springframework.http.client.reactive.JdkClientHttpConnector` (`WebClient`).
- **L9 — `d-19-1` (content-E).** `Enum khởi tạo khi class được nạp` — enum constants are created
  during class **initialization**, not loading.
- **L10 — `t-7-1` (content-C).** `Heap … là vùng duy nhất được garbage collector quản lý` —
  Metaspace is also reclaimed by GC (class unloading during GC cycles), as is the string table.
  "the only region holding application objects" would be accurate.
- **L11 — `t-6-2` (content-C).** `Chỉ ba trường hợp nó không chạy: System.exit(), JVM bị kill, hoặc thread … không bao giờ kết thúc` — also `Runtime.halt()` (which unlike `exit()` skips shutdown hooks) and a JVM crash/`abort`.
- **L12 — `t-7-3` (content-C).** `một minor GC … tìm các object còn sống bằng cách duyệt từ GC roots` — incomplete: a young collection must also scan the remembered set / card table for old→young references. The card table appears in `t-7-1` but is never connected here.
- **L13 — `d-6-6 whyWrong[2]` (content-C).** The contrast drawn is wrong: catching a checked exception that can never be thrown is *also* a compile error, not a warning (`error: exception IOException is never thrown in body of corresponding try statement`).
- **L14 — `t-18-1` (content-G).** Visibility failures attributed to per-core caches. On mainstream hardware caches are coherent; the real causes are compiler/JIT hoisting and store buffers. Standard teaching simplification, but stated as *the* mechanism.
- **L15 — `t-18-3` (content-G).** `AtomicInteger.incrementAndGet() chính là một vòng lặp … compareAndSet` — true of the Java source, but HotSpot intrinsifies `getAndAddInt` to a single `lock xadd` on x86, so plain increment has no retry loop at machine level (unlike `updateAndGet`).
- **L16 — `d-15-1` EXPL (content-F).** `Record ngầm final nên là ngoại lệ duy nhất` — an `enum` implementing a sealed interface also needs no modifier (implicitly final, or implicitly sealed with constant bodies). Both compile. The drill's answer key is unaffected (the question is scoped to a *class*).
- **L17 — `t-3-3` (content-B).** `Mọi collection trong java.util giữ một bộ đếm modCount` — the `List.of`/`Set.of` immutable collections have none (they also can't be structurally modified).

**Example code / wording**

- **L18 — `t-17-5` (content-G).** `DateTimeFormatter.ISO_DATE` offered as the replacement for `SimpleDateFormat("yyyy-MM-dd")`, but it is not equivalent: it appends the offset when the temporal carries one (`2026-08-09+07:00`) and cannot format a `java.util.Date` at all (`UnsupportedTemporalTypeException`). The exact equivalent is `ISO_LOCAL_DATE` or `ofPattern("yyyy-MM-dd")`. The sibling drill `d-17-11` says only "dùng DateTimeFormatter" and is fine.
- **L19 — `t-18-6` `transferSafe` (content-G).** The prose correctly requires a tie lock for `identityHashCode` collisions, but the example omits it; on a tie the ternary selects `b` first, making lock order argument-order dependent again — silently reintroducing the exact deadlock in the collision case.
- **L20 — `t-9-1` (content-D).** The example comment `// filter an / filter binh / map binh / filter cuong / map cuong` omits the `forEach` output; the real interleaved output also contains `BINH` and `CUONG`. Confirmed by running it.
- **L21 — `d-20-6` (content-C).** Options `[0]` and `[3]` both open with `Không` and both correctly say the class is not immutable; `[3]` is wrong only because of the trailing `là đủ`. Consider putting the falsehood at the head of `[3]`.

---

## VERIFIED CORRECT — checked empirically, do not re-check

### Answer keys

**186 of 187 verified correct.** Every code drill in content-A (27), B (27), C (27), D (27),
E (27), F (27) and G (24 of 25) was compiled and where possible run, at the pinned release.
Selected outputs:

```
A  d-1-4: -1702967296   d-1-5: 7 12   d-1-8: 54   d-1-9: false / true
   d-2-5: Animal / "toi la Dog"   d-2-7: 142356   d-2-9: false   d-13-6: 42   d-13-8: 121
B  d-3-5: [a, c], no CME (second-to-last removal)   d-3-9: table length 32 after 13 puts
   d-4-4: true, false, true   d-4-9: "Hello\n  World\n" (14 chars)   d-5-5: ArrayStoreException
D  d-8-7: [Binh 25, An 30, An 25]   d-9-4: fa ma ea fb mb eb fc mc ec
   d-9-9: peek prints NOTHING, n = 3 (Java 9+ count() short-circuit — reproduced)
   d-10-4: "truy van DB" once (orElse), result "cache cache"
   d-9-8: 3 runs -> size=14121 (with null) / size=8314 / ArrayIndexOutOfBoundsException
C  d-6-1 -> 2   d-6-3 -> body closeB closeA finally   d-6-4 -> "from body | 1"
   d-6-8 -> "from finally | 0"   (TWR vs manual-finally suppression correctly inverted)
G  d-17-7: virtual thread getName() really is empty   d-17-2: 5025 ms vs 141 ms (scaled 10x)
   d-18-1: volatile count++ -> 994/996/998/996/1000, amplified 382699 of 800000
   d-18-4: poolSize=4 largestPoolSize=4 queue=980 — unbounded queue never reaches maxPoolSize
F  d-14-8: NaN equals NaN -> true; 0.0 equals -0.0 -> false (Double.compare semantics)
   d-14-9: deserialization goes through the canonical constructor; a declared readObject is
           IGNORED; tampered stream rejected; implicit serialVersionUID = 0
   d-15-8: version skew reproduced for real (built lib-v1, compiled client, swapped lib-v2
           with an added subtype) -> java.lang.MatchException
```

Compile-fail keys confirmed with the exact diagnostics, e.g. `d-2-8` →
`inherits unrelated defaults for move()`; `d-13-7` →
`cannot mix 'var' and implicitly-typed parameters`; `d-5-3` erasure clash; `d-6-5` →
`multi-catch parameter e may not be assigned`; `d-6-7` →
`overridden method does not throw Exception`; `d-11-2`, `d-11-4`, `d-11-6` (JPMS, real modules);
`d-12-6` → `HttpConnectTimeoutException has already been caught`; `d-15-3` →
`cannot extend a sealed class in a different package`. `d-2-3` was verified by compiling all
four override candidates individually.

### Version attributions — all correct

`var` local 10 / lambda param 11 (JEP 323); records std 16 (preview 14/15); sealed std 17
(preview 15/16); `instanceof` patterns std 16; switch expressions std 14; switch-on-String 7;
pattern matching for switch std 21; record patterns std 21; primitive patterns still preview
(`--release 21` → `primitive patterns are a preview feature`); text blocks 15;
`Stream.toList()` 16; `Collectors.toUnmodifiableList()` 10; `List.of` 9 / `List.copyOf` 10;
`Optional.stream`/`or`/`ifPresentOrElse` 9, `orElseThrow()` 10, `isEmpty()` 11, and `get()`
correctly noted as **not** deprecated as of 21; `String.strip/isBlank/lines/repeat` 11; Compact
Strings 9 (JEP 254); `StringConcatFactory` 9 (JEP 280); string pool left PermGen in **7** while
PermGen itself died in **8** (explicitly kept apart — a distinction most material conflates);
`substring` stopped sharing the backing array at **7u6**; SequencedCollection 21 (JEP 431);
`@SafeVarargs` on private instance methods from 9; G1 default from 9; Parallel default in 8;
CMS deprecated 9 / removed 14; ZGC experimental 11 → production 15, **Generational ZGC is Java
21 and explicitly opt-in via `-XX:+ZGenerational`** (stated correctly twice); Shenandoah
experimental 12 → production 15 with the "not in every build" caveat; `finalize()` deprecated 9
→ deprecate-for-removal 18 (JEP 421), `Cleaner` 9; helpful NPE opt-in 14 / default 15; biased
locking disabled 15 (JEP 374); `ExecutorService implements AutoCloseable` 19; JPMS + jlink 9;
JAXB removed 11; `HttpClient` incubator 9/10 → standard 11 (JEP 321) with the package rename,
and **`HttpClient implements AutoCloseable` only from 21** (verified: `--release 11` and
`--release 17` both give `HttpClient cannot be converted to AutoCloseable`; 21 compiles);
virtual threads preview 19 (JEP 425) / 20 (JEP 436) → **standard 21 (JEP 444)** while
**ScopedValue (JEP 446) and StructuredTaskScope (JEP 453) are correctly called out as still
preview in 21**, requiring `--enable-preview`; `jdk.tracePinnedThreads` on 21, with `t-17-3`
explicitly scoping `synchronized` pinning to Java 21 and flagging JEP 491 / JDK 24 as the fix —
i.e. it does **not** fall into the JDK-25-runtime trap; String Templates correctly described as
never standardised.

Every drill tagged `[17, 21]` in content-F produces byte-identical behaviour under
`--release 17`; every drill tagged `[21]` genuinely requires 21. No `_` unnamed patterns and no
other Java 22+ syntax is presented as valid 21 anywhere.

### Mechanism claims most often botched — correct here

- **Escape analysis** described as **scalar replacement**, with the explicit correction
  `HotSpot không cấp phát nguyên object lên stack` (content-C `d-7-8` / `t-7-2`).
- **HashMap treeify** = bucket reaches 8 **and** table length ≥ 64, otherwise resize; untreeify
  at ~6 (content-B `d-3-6` / `t-3-1`).
- **Integer cache** −128..127, `Character` 0..127, `-XX:AutoBoxCacheMax` tunable (content-A).
- **Lambdas are not anonymous inner classes**: synthetic method + `invokedynamic` +
  `LambdaMetafactory` (hidden class from 15), **zero** extra `.class` files — confirmed by
  listing the output directory (only `Outer.class` + `Outer$1.class` for the anonymous class).
- **`volatile` does not make `count++` atomic** (content-G `d-18-1`, measured).
- **Unbounded queue means `maximumPoolSize` is never reached** (content-G `d-18-4`, measured).
- Exception cost = `fillInStackTrace`, not the `try` block — verified with `javap -c`: the happy
  path is byte-for-byte identical to the no-try version.
- `ConcurrentHashMap`: CAS on empty bin + `synchronized` on the bin head, weakly-consistent
  iterators, no null key or value, per-method atomicity only.
- ThreadLocalMap weak key / **strong** value; SoftReference cleared before `OutOfMemoryError`.
- `ForkJoinPool.commonPool()` parallelism = `availableProcessors() - 1` (verified: 20 cores → 19)
  vs the virtual-thread scheduler's **separate** FIFO pool with parallelism =
  `availableProcessors()` and `maxPoolSize` 256 — the two are correctly kept distinct across
  content-D and content-G.
- `HttpClient` defaults (highest-risk item in content-E, all four verified on a live server):
  `version=HTTP_2`, `followRedirects=NEVER`, `connectTimeout=Optional.empty`,
  `cookieHandler=Optional.empty`; a 500 response returns normally rather than throwing.
- Enum singleton really is reflection-proof:
  `IllegalArgumentException: Cannot reflectively create enum objects`.
- Record `equals`/`hashCode` really are `invokedynamic` →
  `java/lang/runtime/ObjectMethods.bootstrap`; pattern switch →
  `java/lang/runtime/SwitchBootstraps.typeSwitch` preceded by `Objects.requireNonNull`.

### Cross-file consistency (different authors, same topics)

No cross-file contradictions found. Checked pairwise: HashMap treeify (B), `Collectors.toList()`
mutability (B `t-3-5` vs D `t-9-3`/`d-9-5`), string-concat O(n²) (B `d-4-5`/`t-4-3` vs C
`d-20-1`), ArrayList-vs-LinkedList (B `d-3-7`/`t-3-4` vs C `d-20-9`), `Optional` not
`Serializable` (C `t-20-4` vs D `t-10-1`/`d-10-9`), escape analysis (B `d-4-3` vs C `d-7-8`),
commonPool sizing (D `t-9-5` vs G `t-18-8`), `record`=16 and `sealed`=17 (asserted in A, B, C,
E, F — identical every time). The one internal contradiction found is **intra-file**: content-E
`t-11-1` vs `t-12-1` on `java.net.http` (see H3).

### Structural scan

All 187 drills: exactly 4 choices, `correctAnswer` in range, `whyWrong` length 4 with the
correct index blank and all three distractor slots filled. No structural defects.
