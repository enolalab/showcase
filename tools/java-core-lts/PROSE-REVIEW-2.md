# Prose review #2 — topics 11–20 (Modules → Best Practices)

Scope: explanatory **prose only** — `sections[]`, `trap`, `keyPoints[]`, `followUp[]`, `summary` of
tutorials with `topicId` 11–20, plus `explanation` / `whyWrong[]` of the drills in those topics.
Answer keys and code output were verified by the prior audit (`FACTCHECK.md`) and were **not**
re-checked here. Nothing listed as fixed in `FACTCHECK.md` is re-reported; several of its items
(H1, H3, M2, M3, M10, L4, L5, L7, L16, L18, L19, C1) have already been applied to the content and
were re-verified as correct in passing.

Everything testable was compiled/run on the installed **JDK 25 with `--release` pinned** to the
version the item claims. Where JDK 25 *runtime* semantics differ from 21 (notably JEP 491, which
removed `synchronized` pinning in JDK 24), no runtime claim about 21 was drawn from this machine —
those rest on the JEP record and are marked as such.

For topic 12 the three targeted LTS JDKs (Temurin **11.0.32, 17.0.20, 21.0.12**) were downloaded and
the runtime claims were re-run on each, so the `HttpClient` thread-model findings below are not
JDK-25 artefacts.

**Tally: HIGH=6 MEDIUM=14 LOW=13**

---

## HIGH — wrong fact

### H1 — `t-14-4` `sections[1]` (content-F): a record **can** declare a no-arg constructor

Wrong text:

> Thứ nhất, JPA yêu cầu một constructor không tham số (mức public hoặc protected) để provider dựng instance rồi mới nạp dữ liệu — **record không thể có**.

A record may declare a no-arg (or any non-canonical) constructor as long as it delegates with
`this(...)`; it may even be `public`. What a record cannot do is hand back a *blank* instance for
the provider to fill afterwards — the real blocker is reason #2 (final fields), which the tutorial
already states correctly.

Evidence:

```
$ cat NoArg.java
public record NoArg(int x, int y) {
    public NoArg() { this(0, 0); }
    protected NoArg(int x) { this(x, 0); }
$ javac --release 17 -d out NoArg.java && java -cp out NoArg
NoArg[x=0, y=0]
reflective no-arg -> NoArg[x=0, y=0]     # Class.getDeclaredConstructor() finds it
$ javac --release 21 …                    # identical

# the actual blocker, confirmed separately:
$ java -cp out RefSet
FAILED: java.lang.IllegalAccessException: Can not set final int field RefSet$P.x to (int)42
```

Proposed replacement (`sections[1]`, first reason):

> Thứ nhất, JPA yêu cầu một constructor không tham số (mức public hoặc protected) để provider dựng instance <b>rỗng</b> rồi mới nạp dữ liệu; record <i>viết được</i> một constructor không tham số nhưng nó bắt buộc uỷ quyền <code>this(...)</code> về canonical nên luôn trả về object đã hoàn chỉnh — không có trạng thái rỗng để điền sau.

The same defect propagates to three sibling fields:

- `t-14-4` `keyPoints[1]`: "Không làm JPA entity được: **thiếu no-arg constructor**, field final, class final nên không proxy lazy được"
  → "Không làm JPA entity được: không dựng được instance rỗng để điền sau, field final, class final nên không proxy lazy được"
- `t-14-4` `trap`: "vì **thiếu no-arg constructor** và không proxy được"
  → "vì không dựng được instance rỗng để điền dữ liệu và không proxy được"
- `d-14-7` `explanation`: "Có ba rào cản độc lập: **record không thể có constructor không tham số**, field của nó là final…"
  → "Có ba rào cản độc lập: record không dựng được instance rỗng để provider điền sau (constructor không tham số viết được, nhưng vẫn phải uỷ quyền về canonical nên object luôn hoàn chỉnh), field của nó là final…"

### H2 — `t-19-5` `sections[3]` (content-E): the `final`-method CGLIB case is neither silent nor merely "advice doesn't run"

Wrong text (echoed in `keyPoints[3]` and `d-19-6` `explanation`):

> Hệ quả trực tiếp: CGLIB không override được method `final`, `private` hay `static`, nên `@Transactional` hay `@Cacheable` đặt lên chúng sẽ **im lặng không hoạt động** — không lỗi, không cảnh báo, chỉ là advice không chạy.

Two wrong facts, both about `final`:

**(a) There is a warning.** `CglibAopProxy.doValidateClass` logs at WARN for every public `final`
method on a CGLIB-proxied class (Spring Boot's root level is INFO, so it prints):

```java
if (Modifier.isFinal(mod)) {
    if (logger.isWarnEnabled() && Modifier.isPublic(mod)) {
        …logger.warn("Public final method [" + method + "] cannot get proxied via CGLIB, " +
                "consider removing the final marker or using interface-based JDK proxies.");
```
(`spring-aop/.../CglibAopProxy.java`, current 6.x)

**(b) The consequence is worse than "advice doesn't run".** Spring creates CGLIB proxies through
**Objenesis** (Spring reference, *Proxying Mechanisms*: "The constructor of your proxied object
will not be called twice, since the CGLIB proxy instance is created through Objenesis"). A `final`
method cannot be overridden, so the call executes on the **proxy instance itself, whose fields are
all null/0** — it is never routed to the target. Spring's own DEBUG message says exactly that:
*"Calls to this method will NOT be routed to the target instance and might lead to NPEs against
uninitialized fields in the proxy instance."* The usual symptom is an NPE, not a quietly
non-transactional but otherwise working method. `private` and `static` *are* genuinely silent.

Proposed replacement (last sentence of `sections[3]`):

> Hệ quả trực tiếp: CGLIB không override được method <code>final</code>, <code>private</code> hay <code>static</code>. Với <code>private</code>/<code>static</code>, advice <b>im lặng không chạy</b> — không lỗi, không cảnh báo. Với <code>final</code> thì tệ hơn: Spring ghi log WARN ("Public final method ... cannot get proxied via CGLIB"), và vì proxy được tạo bằng Objenesis nên constructor không hề chạy — lời gọi method <code>final</code> thực thi ngay trên proxy với field còn null thay vì được chuyển tới đối tượng thật, thường nổ NPE.

`keyPoints[3]` →

> Method final/private/static không được CGLIB proxy: private/static thì advice im lặng vô hiệu, còn final bị Spring log WARN và chạy trên proxy chưa khởi tạo field (dễ NPE)

### H3 — `t-12-4` `trap` (content-E): wrong catch order is a **compile error**, not a dead branch — and it contradicts `d-12-6`

Wrong text:

> Bắt HttpTimeoutException trước HttpConnectTimeoutException trong chuỗi catch sẽ khiến **nhánh connect timeout không bao giờ chạy**, vì lớp con phải đứng trước lớp cha.

Catching the supertype first is rejected at compile time (JLS 11.2.3) — nothing "runs" at all.
`d-12-6` in the same file is built entirely on this being a compile error (its `correctAnswer` is
"Lỗi biên dịch…" and `whyWrong[3]` says *"thực tế nó không compile được"*), so the trap contradicts
its own drill.

```
$ javac --release 21 Ord.java
Ord.java:8: error: exception HttpConnectTimeoutException has already been caught
    catch (HttpConnectTimeoutException e) { }   // child second
    ^
1 error
```

Proposed replacement:

> Bắt HttpTimeoutException trước HttpConnectTimeoutException trong chuỗi catch không phải là "nhánh chết" mà là lỗi biên dịch — javac báo "exception HttpConnectTimeoutException has already been caught" — vì lớp con bắt buộc phải đứng trước lớp cha.

### H4 — `t-12-3` `sections[2]` (content-E): dependent stages run on `commonPool`, not on the client's executor

Wrong text:

> **Callback chạy trên thread nào.** Các stage nối sau bằng `thenApply`/`thenAccept` chạy trên **executor của client** (hoặc thread hoàn tất future). Vì thế đặt công việc nặng hoặc lời gọi chặn ngay trong các stage này **có thể làm nghẽn chính cơ chế I/O của client**.

The client's executor runs the response/body processing (`BodyHandler.apply`, `BodySubscriber`), but
the `CompletableFuture` returned by `sendAsync` is completed asynchronously off the client's threads,
so dependents land on `ForkJoinPool.commonPool` — CompletableFuture's default async facility.
Blocking there starves the JVM-wide common pool (shared with parallel streams and every other CF);
it does **not** block the client's selector/worker threads. Measured identically on JDK 11, 17, 21
and 25, with the dependent attached *before* completion (500 ms server delay):

```
=== JDK 11 ===                                  === JDK 17 / 21 ===
BodyHandler.apply   MY-EXEC                     BodyHandler.apply   MY-EXEC
thenApply           ForkJoinPool.commonPool-…   thenApply           ForkJoinPool.commonPool-worker-1
whenComplete        ForkJoinPool.commonPool-…   whenComplete        ForkJoinPool.commonPool-worker-1
--- default client ---
BodyHandler.apply   HttpClient-2-Worker-2       BodyHandler.apply   HttpClient-2-Worker-0
thenApply           ForkJoinPool.commonPool-…   thenApply           ForkJoinPool.commonPool-worker-1
```

Proposed replacement:

> <b>Callback chạy trên thread nào.</b> Body của response được xử lý trên executor của client (thread <code>HttpClient-N-Worker-*</code> nếu bạn không truyền executor riêng), nhưng future do <code>sendAsync</code> trả về lại được hoàn tất bất đồng bộ, nên các stage nối sau bằng <code>thenApply</code>/<code>thenAccept</code> chạy trên <code>ForkJoinPool.commonPool</code> — executor async mặc định của <code>CompletableFuture</code> — chứ không phải trên thread I/O của client. Vì thế công việc nặng hay lời gọi chặn trong các stage này không làm nghẽn I/O của client, nhưng làm cạn common pool vốn dùng chung với parallel stream và mọi CompletableFuture khác trong JVM. Nếu cần xử lý tốn thời gian, hãy dùng biến thể <code>...Async(fn, myExecutor)</code> để đẩy sang pool riêng.

### H5 — `t-13-3` `sections[4]` (content-A): `var` **erases** wildcard captures — the spec removes them on purpose

Wrong text:

> Cùng cơ chế đó áp dụng cho kiểu giao (intersection type) **và capture của wildcard** sinh ra từ biểu thức — những kiểu bạn không có cú pháp nào để viết ra trong khai báo biến.

JLS §14.4.1 declares the variable's type to be the **upward projection** (§4.10.5) of the initializer
type *with respect to all synthetic (capture) type variables* — capture variables are exactly what
`var` throws away. Intersection types and anonymous-class types **are** kept; captures are not.

```
$ javac --release 21 Inter.java
Inter.java:7: error: incompatible types: INT#1 cannot be converted to String    <- intersection KEPT
  where INT#1 … extends Object,Serializable,Comparable<? extends INT#2>,Constable,ConstantDesc
Inter.java:11: error: incompatible types: Object cannot be converted to String  <- capture ERASED
        String bad2 = e;      // List<?> w;  var e = w.get(0);

$ javac --release 21 Cap2.java      // var v = idl(w);  // initializer type List<CAP#1>
Cap2.java:13: error: incompatible types: Object cannot be converted to CAP#1
        v.add(v.get(0));            // the capture cannot be round-tripped -> v is List<?>
```

Proposed replacement (last sentence only):

> Cùng cơ chế đó áp dụng cho kiểu giao (intersection type): <code>var x = true ? 1 : "s";</code> cho <code>x</code> kiểu <code>Object &amp; Serializable &amp; Comparable&lt;...&gt;</code>, thứ bạn không có cú pháp nào để viết ra. Ngược lại, capture của wildcard <i>không</i> được giữ lại: JLS 14.4.1 áp dụng upward projection để loại bỏ mọi capture variable, nên với <code>List&lt;?&gt; w</code> thì <code>var e = w.get(0);</code> cho <code>e</code> kiểu <code>Object</code> chứ không phải kiểu capture.

### H6 — `d-13-6` `explanation` (content-A): the same wrong capture claim

Wrong text (final clause):

> cơ chế tương tự cũng áp dụng cho intersection type **và capture của wildcard sinh ra từ biểu thức**.

Same evidence as H5. The answer key (42) is unaffected.

Proposed replacement (final clause):

> cơ chế tương tự cũng áp dụng cho intersection type (ví dụ var x = true ? 1 : "s"), nhưng KHÔNG áp dụng cho capture của wildcard: JLS 14.4.1 áp dụng upward projection để loại bỏ capture variable, nên với List&lt;?&gt; w thì var e = w.get(0) cho kiểu Object.

---

## MEDIUM — misleading

### M1 — `t-11-2` `sections[5]` (content-E): the `provides … with` rule is **or**, not **and**

Wrong text:

> <code>Impl</code> phải thực sự implement <code>S</code> **và** phải có constructor không tham số hoặc method <code>provider()</code> static, nếu không sẽ lỗi biên dịch.

JLS §7.7.4 makes these alternatives: the provider class must **either** be a subtype of the service
**or** declare a `public static` no-args `provider()` method whose return type is a subtype of the
service. And the no-arg constructor must be **public**, which the text omits.

Evidence — a provider class that does *not* implement the service compiles, links and runs:

```
$ cat prov/com/acme/prov/Factory.java
public class Factory {                       // KHONG implement Gateway
    public static Gateway provider() { return () -> "momo"; }
}
$ javac --release 21 --module-path out/spi -d out/prov $(find prov -name '*.java')   # exit 0
$ java --module-path out/spi:out/prov:out/app -m com.acme.app/com.acme.app.Main
loaded: momo

# javac's own wording confirms the disjunction:
$ javac --release 21 …  prov2/module-info.java
error: the service implementation type must be a subtype of the service interface type,
       or have a public static no-args method named "provider" returning the service implementation

# and the constructor must be public:
error: the no arguments constructor of the service implementation is not public: NonPub
```

Proposed replacement:

> …có ưu điểm là được compiler kiểm tra: <code>Impl</code> phải <i>hoặc</i> thực sự implement <code>S</code> và có constructor không tham số <b>public</b>, <i>hoặc</i> có method <code>public static provider()</code> trả về một kiểu con của <code>S</code> (khi đó bản thân <code>Impl</code> không cần implement <code>S</code>) — không thoả thì lỗi biên dịch.

### M2 — `d-11-7` `choices[3]` + `explanation` (content-E): `jakarta.xml.bind-api` does **not** fix `javax/xml/bind/JAXBException`

Wrong text (`choices[3]`, the marked-correct option, and repeated in the explanation's advice):

> Thêm dependency JAXB (**jakarta.xml.bind-api** và một implementation) vào build vì module java.xml.bind đã bị xoá khỏi JDK 11

The failure quoted in the question is `NoClassDefFoundError: javax/xml/bind/JAXBException`.
Jakarta EE 9 renamed the package: `jakarta.xml.bind-api` **3.0.0 and later** ships
`jakarta.xml.bind.JAXBException`, not `javax.xml.bind.JAXBException`. Adding the current artifact
(4.0.x) therefore leaves the exact error unchanged. The artifacts that restore the `javax.xml.bind`
namespace are `jakarta.xml.bind:jakarta.xml.bind-api:2.3.x` or the legacy
`javax.xml.bind:jaxb-api:2.3.x` (+ `org.glassfish.jaxb:jaxb-runtime:2.3.x`).

Proposed replacement (`choices[3]`):

> Thêm dependency JAXB vào build vì module java.xml.bind đã bị xoá khỏi JDK 11 (giữ nguyên package javax.xml.bind thì dùng jakarta.xml.bind-api 2.3.x, còn muốn lên jakarta.xml.bind-api 3.x/4.x thì phải đổi package trong code)

and append to `explanation`:

> Lưu ý về namespace: từ Jakarta EE 9, <code>jakarta.xml.bind-api</code> 3.0+ đã đổi package thành <code>jakarta.xml.bind</code>, nên nếu code vẫn import <code>javax.xml.bind</code> thì phải dùng bản 2.3.x (hoặc đổi package trong code), không thì lỗi cũ y nguyên.

### M3 — `t-16-1` `sections[3]` + `keyPoints[3]` + `d-16-6` `whyWrong[1]` (content-F): "`||` thì không" is stated as a rule about the operator

Wrong text (`sections[3]` heading and body):

> **`&&` hoạt động, `||` thì không.** … Đổi sang `||` thì vế phải chỉ chạy khi vế trái **sai**, tức là khi so khớp thất bại, nên `s` không tồn tại — compiler báo `cannot find symbol`.

Flow scoping keys off *which branch the pattern is introduced on*, not off the operator. A pattern
variable **is** in scope in the right operand of `||` whenever the left operand is the negated
match — which is the guard-clause idiom the very same tutorial teaches in `sections[2]`.

Evidence:

```java
static boolean blankOrNotString(Object o) {
    return !(o instanceof String s) || s.isEmpty();     // s IS in scope here
}
static void guard(Object o) {
    if (!(o instanceof String s) || s.isEmpty()) return;
    System.out.println(s.length());                     // and still in scope after
}
```
```
$ javac --release 21 OrTest.java     # exit 0
$ java OrTest
true true false
5
```

Proposed replacement (append to `sections[3]`):

> Nói cho chính xác: luật không nằm ở toán tử mà ở chỗ pattern được giới thiệu khi điều kiện <i>đúng</i> hay khi <i>sai</i>. Vì vậy <code>!(o instanceof String s) || s.isEmpty()</code> lại biên dịch được — <code>s</code> có mặt ở vế phải của <code>||</code> đúng khi vế trái là dạng phủ định.

`keyPoints[3]` →

> Biến pattern có mặt ở vế phải khi vế đó chỉ chạy lúc so khớp đã thành công: <code>x instanceof T t && …</code> được, <code>x instanceof T t || …</code> thì không, nhưng <code>!(x instanceof T t) || …</code> thì lại được

`d-16-6` `whyWrong[1]` →

> Phạm vi của biến pattern phụ thuộc vào luồng logic: ở dạng <code>x instanceof T t || …</code> vế phải chỉ chạy khi so khớp thất bại nên nằm ngoài phạm vi (dạng phủ định <code>!(x instanceof T t) || …</code> thì ngược lại)

### M4 — `t-17-3` `sections[1]` (content-G): wrong mechanism for `synchronized` pinning

Wrong text:

> Thứ nhất, virtual thread bị chặn trong khi đang giữ monitor của một khối `synchronized` (kể cả `Object.wait()`). Thứ hai, trên stack có native frame … **Trong cả hai trường hợp JVM không thể sao chép stack lên heap một cách an toàn, nên đành giữ nguyên.**

The stated cause is only true for the *native frame* case. For `synchronized`, the JVM can copy the
stack perfectly well; the blocker in JDK 21 is that the legacy object-monitor implementation records
ownership against the **carrier platform thread**, so unmounting would leave the monitor owned by a
thread that is no longer running the virtual thread. This is exactly what JEP 491 changed:
*"…by arranging for virtual threads that block in synchronized methods and statements to release
their underlying platform threads… This is achieved by re-implementing object monitors"* — a
monitor re-implementation, nothing to do with stack copying.

(Not testable on this machine: JEP 491 is already in effect on the JDK 25 runtime, and `--release`
only pins the compiler. A 60-virtual-thread run with a per-thread monitor around a blocking socket
read used exactly 20 carriers here, i.e. it unmounted — JDK 25 behaviour, not JDK 21's.)

Proposed replacement (last sentence):

> Hai trường hợp này bị chặn vì hai lý do khác nhau: với native frame, JVM không thể di chuyển stack một cách an toàn; còn với <code>synchronized</code>, cài đặt monitor cũ ghi quyền sở hữu theo chính platform thread đang mang virtual thread, nên unmount sẽ làm mất dấu chủ sở hữu monitor — đúng chỗ mà JEP 491 (JDK 24) viết lại object monitor để gỡ bỏ.

### M5 — `t-14-1` `sections[5]` (content-F): record patterns do not depend on `equals`/`hashCode`

Wrong text:

> Nhưng nếu override `equals` thì phải override `hashCode` cùng lúc và phải giữ đúng copy invariant, nếu không bạn tự phá hợp đồng mà **cả `HashMap` lẫn record pattern đều dựa vào**.

A record deconstruction pattern invokes the accessor methods only; it never calls `equals` or
`hashCode`. A record with a deliberately broken `equals` still deconstructs correctly.

Evidence:

```java
record P(int x, int y) {
    @Override public boolean equals(Object o) { return false; }
    @Override public int hashCode() { return 7; }
}
… if (o instanceof P(int x, int y)) …
```
```
$ javac --release 21 -d out Brk.java && java -cp out Brk
record pattern van chay: x=1 y=2
equals(self) = false
```

Proposed replacement (tail of the sentence):

> …nếu không bạn tự phá hợp đồng mà <code>HashMap</code>, <code>HashSet</code> và mọi so sánh giá trị đều dựa vào (record pattern thì chỉ gọi accessor nên không bị ảnh hưởng).

### M6 — `t-14-2` `sections[3]` (content-F): "validate once is enough" contradicts `t-14-3`

Wrong text:

> Vì record bất biến nên **kiểm tra một lần lúc dựng là đủ cho toàn bộ vòng đời**.

Records are only *shallowly* immutable — `t-14-3` `sections[0]` and `d-14-5` in the same file say so
explicitly. A validated `List`/array component can be mutated through a caller-retained reference
immediately after construction, so a single check suffices only when every component is genuinely
immutable or defensively copied in the same compact constructor. As written the two tutorials
contradict each other on the single most-probed follow-up to "record là immutable".

Proposed replacement:

> Vì record bất biến ở mức tham chiếu nên kiểm tra một lần lúc dựng là đủ — <b>với điều kiện</b> mọi component thực sự bất biến; nếu component là collection hay mảng thì phải copy phòng vệ ngay trong compact constructor, nếu không dữ liệu vẫn đổi được sau khi đã validate.

### M7 — `d-15-9` `explanation` (content-F): the JAR boundary is not what `sealed` checks — and it contradicts `d-15-3`

Wrong text:

> Ở đây còn có rào cản kỹ thuật cứng: kiểu con phải nằm cùng module (hoặc cùng package nếu chạy classpath), nên **một adapter đóng gói ở artifact riêng đơn giản là không kế thừa được**.

The JVM checks package/module, never the JAR. A permitted subtype packaged in a *different* JAR but
the same package loads and runs fine on the classpath. The real hard blocker for a third party is
that `permits` is fixed when the library is compiled, so an outside type can never be named in it.
`d-15-3` `whyWrong[3]` in the same topic already says "Ranh giới được kiểm tra là package hoặc
module, **không phải JAR**" — the two drills disagree.

Evidence — `p.Ev` (sealed) in `a.jar`, `p.Sub` (permitted) in `b.jar`, both on the classpath:

```
$ javac --release 21 -d jars/all jars/src/p/*.java jars/src/Main.java
$ jar cf a.jar -C a .   # only p/Ev.class
$ jar cf b.jar -C b .   # only p/Sub.class
$ java -cp a.jar:b.jar:all Main
loaded: p.Sub@7852e922 sealedOK
```

Proposed replacement:

> Ở đây còn có rào cản kỹ thuật cứng: mệnh đề <code>permits</code> phải liệt kê sẵn kiểu con ngay lúc bạn biên dịch thư viện, và kiểu con còn phải nằm cùng module (hoặc cùng package nếu chạy classpath) — một adapter do bên thứ ba viết không có cách nào lọt vào danh sách đó.

### M8 — `t-19-1` `sections[3]` (content-E): enum constants are created at class **initialization**, not loading — and this now contradicts `d-19-1`

Wrong text:

> Nhược điểm là enum không extends được class khác và khởi tạo là eager **theo thời điểm nạp class**.

Enum constants are created in `<clinit>` during class **initialization** (JLS 12.4), which is itself
lazy — triggered by first active use.

Evidence:

```
$ javac --release 17 E.java && java E
1) Class.forName(initialize=false) -> LOADING only:
   loaded: E$Cfg  (nothing created yet)
2) first active use -> INITIALIZATION:
  >> enum constant CREATED
   INSTANCE
```

`d-19-1` in the same file was already fixed to say the opposite correctly ("…tại bước khởi tạo class
(class initialization), chứ không phải tại bước nạp class (loading)"), so this is now an intra-file
contradiction.

Proposed replacement (last sentence):

> Nhược điểm là enum không extends được class khác, và khởi tạo là eager theo nghĩa mọi hằng được tạo cùng lúc ngay tại bước <b>khởi tạo class</b> (class initialization, không phải bước nạp class) ở lần truy cập đầu tiên vào enum.

### M9 — `d-19-4` `whyWrong[1]` (content-E): the public-only `@Transactional` rule is pre-Spring-6

Wrong text:

> Ngược lại, @Transactional chỉ hoạt động trên method **public** khi dùng proxy; private mới là thứ bị bỏ qua

Spring Framework reference, *Using `@Transactional`*: "The `@Transactional` annotation is typically
used on methods with `public` visibility. **As of 6.0, `protected` or package-visible methods can
also be made transactional for class-based proxies by default.** Note that transactional methods in
interface-based proxies must always be `public`…". Spring Boot 3 defaults to `proxyTargetClass=true`
(CGLIB), so `protected` and package-private `@Transactional` methods do work out of the box; only
`private` (plus `final`/`static`) are skipped.

Proposed replacement:

> Để public là đúng, nhưng lý do không phải vậy: từ Spring Framework 6.0, proxy dạng class-based (CGLIB — mặc định của Spring Boot 3) advise được cả method protected và package-private; chỉ private (cùng final, static) mới bị bỏ qua. Với proxy dạng interface (JDK) thì vẫn bắt buộc public.

### M10 — `t-20-2` `sections[0]` + `keyPoints[0]` (content-C): "no writes ⇒ no visibility problem" is not the JMM rule

Wrong text:

> Hệ quả kèm theo là **thread-safe miễn phí**: không có ghi thì không có race condition, không cần `synchronized`, **không cần nghĩ về visibility**.

The free visibility guarantee comes from **final-field semantics (JLS 17.5)**, not from the absence
of writes: only an object whose fields are all `final` is guaranteed to be seen fully constructed by
a thread that obtains the reference without synchronization. An object that is merely never mutated
after construction but has non-`final` fields can still be observed half-built through a data race —
which is precisely the double-checked-locking bug taught in `t-19-1` `sections[0]`. `sections[1]`
does prescribe `private final`, but never says why.

Proposed replacement (last clause of `sections[0]`):

> …không có ghi thì không có race condition và không cần <code>synchronized</code>. Cần nói rõ điều kiện: bảo đảm về visibility đến từ ngữ nghĩa final-field của JMM (JLS 17.5) — mọi field phải là <code>final</code> thì thread nhận được tham chiếu mới chắc chắn thấy object đã khởi tạo xong; nếu field không final mà chỉ "không ai sửa nữa" thì vẫn có thể bị nhìn thấy dở dang, đúng như bug của double-checked locking.

`keyPoints[0]` →

> Object bất biến với mọi field final thì thread-safe mà không cần đồng bộ hoá (final-field semantics của JMM), và an toàn khi làm key của HashMap

### M11 — `t-20-4` `sections[1]` + `trap`, and `d-20-2` `whyWrong[0]` (content-C): the Jackson objection to `Optional` is dated

Wrong text:

> `sections[1]`: *Optional* không implement `Serializable`, tốn thêm một lớp object cho mỗi instance, và nhiều framework ánh xạ (JPA, **Jackson**) xử lý không tự nhiên.
> `trap`: Nó không Serializable, **gây rắc rối với Jackson** và Hibernate, …
> `d-20-2 whyWrong[0]`: Optional không Serializable, **gây vấn đề với JPA và Jackson**, …

Jackson has handled `Optional` cleanly since 2.6 via `jackson-datatype-jdk8` (`Jdk8Module`), which
Spring Boot auto-registers through `ObjectMapper.findModules()`; and as of Jackson 3.0 the java8
modules are merged into `jackson-databind`, so `Optional` works in a default `ObjectMapper` with no
module at all. The objections that survive are: not `Serializable`, an extra object per instance,
and JPA/Hibernate not supporting an `Optional`-typed persistent attribute.

Proposed replacement (`sections[1]`, first clause):

> <i>Field</i>: <code>Optional</code> không implement <code>Serializable</code>, tốn thêm một lớp object cho mỗi instance, và JPA/Hibernate không ánh xạ được thuộc tính kiểu <code>Optional</code>. (Jackson thì không còn là lý do: module <code>jackson-datatype-jdk8</code> đã xử lý tốt từ 2.6 và Spring Boot tự đăng ký, còn từ Jackson 3.0 nó nằm sẵn trong <code>jackson-databind</code>.)

`trap` → "Nó không Serializable, không ánh xạ được bằng JPA/Hibernate, và thêm một lớp object cho mỗi instance — …"

`d-20-2` `whyWrong[0]` → "Optional không Serializable, không dùng được làm thuộc tính ánh xạ của JPA/Hibernate, và tốn thêm một object cho mỗi instance."

### M12 — `t-18-1` `sections[5]` (content-G): the final-field guarantee is stated without the `this`-escape condition

Wrong text:

> JMM đảm bảo rằng khi constructor kết thúc, mọi field `final` đã được khởi tạo xong sẽ hiển thị đúng với mọi thread nhìn thấy object đó, **kể cả khi việc công bố tham chiếu không được đồng bộ**.

True only for a *properly constructed* object — JLS 17.5 conditions the guarantee on the `this`
reference not escaping during construction. If the constructor publishes `this` (registers a
listener, starts a thread, stores itself in a static map), another thread can see the final fields at
their default values, and the whole "immutable ⇒ thread-safe" conclusion drawn in the next sentence
fails. This is the standard follow-up to `followUp[2]` ("Object bất biến an toàn đa luồng nhờ bảo
đảm nào của JMM?").

Proposed replacement:

> JMM đảm bảo rằng khi constructor kết thúc, mọi field <code>final</code> đã được khởi tạo xong sẽ hiển thị đúng với mọi thread nhìn thấy object đó, kể cả khi việc công bố tham chiếu không được đồng bộ — với một điều kiện bắt buộc: tham chiếu <code>this</code> không được lọt ra ngoài trong lúc constructor còn đang chạy (đăng ký listener, khởi động thread, tự đưa mình vào một map static). Nếu <code>this</code> lọt ra sớm, thread khác vẫn có thể thấy field <code>final</code> ở giá trị mặc định.

### M13 — `t-12-1` `sections[3]` (content-E): `HttpResponse` has no builder

Wrong text:

> **Cả ba** đều dùng builder và đều bất biến sau khi build.

`java.net.http.HttpResponse` is an interface with no nested `Builder` — it is produced by the client
and only read. Only `HttpClient` and `HttpRequest` have builders.

```
$ javap java.net.http.HttpResponse | grep -i builder
(no match; nested types are BodyHandler(s), BodySubscriber(s), PushPromiseHandler, ResponseInfo)
```

Proposed replacement (last sentence):

> <code>HttpClient</code> và <code>HttpRequest</code> đều được tạo qua builder và bất biến sau khi build; <code>HttpResponse</code> không có builder — nó do client tạo ra và chỉ để đọc.

### M14 — `t-12-3` `followUp[1]` (content-E): the question is premised on the wrong thread model

Wrong text:

> Nếu bạn chạy tác vụ nặng trong thenApply thì ảnh hưởng gì tới **các request khác của cùng client**?

The premise is false per H4 — the victim is the JVM-wide common pool, not the client.

Proposed replacement:

> Nếu bạn chạy tác vụ nặng trong thenApply thì nó chạy trên pool nào, và phần nào của hệ thống bị ảnh hưởng?

---

## LOW — imprecise

### L1 — `t-17-3` `sections[1]` (content-G): "native frame — tức đang ở trong lời gọi JNI"

JEP 444 pins on "a native method **or a foreign function**", so FFM (`java.lang.foreign`) downcalls
pin too, not only JNI. Minimal fix: "…tức đang ở trong một native method — lời gọi JNI hoặc downcall
FFM (<code>java.lang.foreign</code>)."

### L2 — `t-18-1` `sections[4]` (content-G): "là thứ duy nhất bảo vệ được một nhóm thao tác liên quan tới nhiều biến"

An `AtomicReference` holding an immutable value object that carries all the related fields updates
them as one atomic unit with no lock (Goetz's one-value-cache / `VolatileCachedFactorizer` pattern);
`StampedLock` and `ReadWriteLock` are also not `synchronized`/`ReentrantLock`. Minimal fix:
"…và là công cụ mặc định để bảo vệ một nhóm thao tác liên quan tới nhiều biến (cách còn lại là gói cả
nhóm biến vào một object bất biến rồi thay nguyên khối qua <code>AtomicReference</code>)."

### L3 — `t-15-1` `sections[2]` / `keyPoints[2]` (content-F): `enum` is the second implicit-modifier exception

`sections[1]` states the absolute "Mỗi kiểu con bắt buộc chọn một trong ba từ khoá… Quên khai báo là
lỗi biên dịch" and gives only `record` as the exception. `enum` is exempt too.

```
$ cat En.java
sealed interface St permits Simple, Fancy {}
enum Simple implements St { A, B }
enum Fancy implements St { X { void f(){} }, Y { void f(){} };  abstract void f(); }
$ javac --release 17 -d out En.java && java -cp out En
Simple sealed? false  final? true
Fancy  sealed? true   final? false
```

Fix: append to `sections[2]` — "Enum cũng vậy: enum ngầm <code>final</code>, hoặc ngầm
<code>sealed</code> nếu có hằng mang thân class, nên cài đặt sealed interface cũng không cần viết
thêm modifier." `keyPoints[2]` → "Record và enum ngầm final (enum có hằng mang thân class thì ngầm
sealed) nên cài đặt sealed interface mà không cần thêm modifier".

### L4 — `d-19-6` `whyWrong[0]` (content-E): Spring's CGLIB proxies need no constructor

> Proxy của JDK không hề gọi constructor của class đích nên constructor không liên quan; **đó lại là ràng buộc của CGLIB**

True of raw CGLIB `Enhancer.create()`, but not of Spring AOP — the context the drill itself sets up.
Spring has instantiated CGLIB proxies via **Objenesis since 4.0**, bypassing the constructor
entirely. Fix: "…đó là ràng buộc của CGLIB thuần — riêng Spring AOP dùng Objenesis (từ 4.0) nên cũng
không cần constructor mặc định."

### L5 — `t-15-5` `sections[5]` (content-F): sealed does not help the JIT

> Ngược lại, **việc biết tập kiểu con là đóng còn có thể giúp JVM suy luận tốt hơn về đa hình** — đừng lo về hiệu năng khi cân nhắc sealed…

HotSpot devirtualizes via class-hierarchy analysis over the classes actually *loaded*, which is
already at least as precise as the `permits` list (a sealed type with all three subtypes loaded is
*less* optimizable than an unsealed type with one). Through JDK 25 the `PermittedSubclasses`
attribute is consumed only by the load-time subtype check (JVMS 5.3.5), not by any JIT optimisation.
The rest of the paragraph ("chi phí runtime gần như bằng không") is correct and should stay. Fix:

> Cũng đừng kỳ vọng chiều ngược lại: HotSpot khử ảo hoá (devirtualize) dựa trên cây kế thừa các class đã thật sự nạp chứ không đọc danh sách <code>permits</code>, nên sealed không làm code chạy nhanh hơn — đừng lo về hiệu năng khi cân nhắc sealed, hãy lo về khả năng tiến hoá của API.

### L6 — `d-20-8` `explanation` (content-C): two receiver types is bimorphic, not megamorphic

> profile pollution (**nếu cả hai gọi chung một method thì call site trở thành megamorphic** và JIT tối ưu kém đi)

With two receiver types a HotSpot call site is **bimorphic** — C2 still inlines both targets behind a
type guard. A third type is what makes it megamorphic (vtable dispatch, no inlining). Fix:
"…thì call site không còn monomorphic mà thành bimorphic — thêm một kiểu nữa là megamorphic và JIT
hết inline được".

### L7 — `t-19-1` `sections[1]` (content-E): overstated absolute about pre-Java-5 DCL

> Trước Java 5, DCL **không có cách nào** làm đúng — đây là bối cảnh lịch sử đáng nêu ra khi trả lời.

"Double-Checked Locking is Broken" (Bacon et al.) documents two variants that *do* work under the old
memory model: DCL on a 32-bit primitive value, and the `ThreadLocal`-based variant. What has no
correct pre-5 form is DCL on an **object reference** via `volatile`. Fix:
"Trước Java 5, DCL trên một tham chiếu object <b>không có cách nào</b> làm đúng bằng
<code>volatile</code> (chỉ vài biến thể lệch chuẩn như dùng <code>ThreadLocal</code> mới đúng) — …"

### L8 — `t-20-1` `sections[0]` (content-C): the "nguyên văn" of Knuth is itself misquoted

> **Câu của Knuth bị trích sai suốt.** Nguyên văn là 'premature optimization is the root of all evil' *trong khoảng 97% trường hợp không quan trọng* — vế sau thường bị bỏ đi.

Knuth's sentence is: "We should forget about small efficiencies, say about 97% of the time: premature
optimization is the root of all evil. Yet we should not pass up our opportunities in that critical
3%." The 97% attaches to the **leading** clause; what circulation drops is the leading clause *and*
the trailing "critical 3%" sentence — not a trailing "97% of cases don't matter". Fix:

> <b>Câu của Knuth bị trích sai suốt.</b> Nguyên văn là: 'chúng ta nên bỏ qua những tối ưu nhỏ, cỡ 97% thời gian: premature optimization is the root of all evil. Nhưng đừng bỏ lỡ cơ hội ở 3% then chốt đó' — cả vế đầu lẫn vế cuối đều thường bị cắt mất.

### L9 — post-Java-8 APIs inside `example` of tutorials tagged `versions: [8, 11, 17, 21]`

The prior audit's L1 scan covered drills only; these are tutorial examples:

- `t-19-4` — `Map.of(…)` (Java 9) and `var raw = load();` (Java 10)
- `t-20-4` — `.filter(n -> !n.isBlank())` (Java 11)
- `t-19-2` — `List.of("a","b")` (Java 9), arguably deliberate since the prose cites `List.of` *as* an example of a JDK static factory

```
$ javac --release 8 V8.java
error: cannot find symbol  method of(String,…)   <- Map.of
error: cannot find symbol  class var             <- var
error: cannot find symbol  method isBlank()      <- String.isBlank
```

`t-20-2` shows the pattern to copy: it annotates the Java-10 API inline
(`// copy khi nhan (List.copyOf: Java 10+)`) and gives the Java 8 fallback.

### L10 — `t-12-2` `sections[4]` (content-E): `version` is also a *request*-level setting, and it overrides the client

> Ở cấp client: `connectTimeout`, **`version`**, … Ở cấp request: URI, method, header, body, và `timeout` cho toàn bộ vòng đời request.

`HttpRequest.Builder` has had `version(HttpClient.Version)` and `expectContinue(boolean)` since
Java 11, and a per-request `version()` overrides the client setting — misleading in a section whose
whole point is the client/request boundary. Fix:

> Ở cấp client: <code>connectTimeout</code>, <code>version</code>, <code>followRedirects</code>, <code>proxy</code>, <code>authenticator</code>, <code>cookieHandler</code>, <code>sslContext</code>, <code>executor</code>. Ở cấp request: URI, method, header, body, <code>timeout</code> cho toàn bộ vòng đời request, và cả <code>version</code>/<code>expectContinue</code> — <code>HttpRequest.Builder.version()</code> ghi đè phiên bản đặt ở cấp client cho riêng request đó.

### L11 — `t-13-1` `sections[2]` (content-A): the `var` naming restriction is broader than "class hay interface"

> Chỉ có một hạn chế là bạn không được đặt tên *class hay interface* là `var`.

`enum`, `record` and **type parameters** are equally rejected; variables, methods and packages named
`var` are fine.

```
$ javac --release 21 A.java   enum var { X }                -> error: 'var' not allowed here
                                                               as of release 10, 'var' is a restricted type name
$ javac --release 21 E.java   record var(int x) {}          -> error: 'var' not allowed here
$ javac --release 21 B.java   class B { <var> void m(…) }   -> error: 'var' not allowed here
$ javac --release 21 C.java   class C { int var = 1; int var() {…} }   -> OK
$ javac --release 21 var/D.java   package var; public class D {}       -> OK
```

Fix: "Hạn chế duy nhất là không được dùng <code>var</code> làm tên của một <i>kiểu</i> — class,
interface, enum, record hay tham số kiểu; tên biến, method và package thì vẫn hợp lệ."

### L12 — `t-12-5` `sections[4]` (content-E): Spring `RestClient` is not a declarative layer

> Đó là những khoảng trống mà OkHttp, Apache HttpClient 5, hay **tầng khai báo như Feign/RestClient** lấp vào.

`RestClient` (Spring 6.1) is a fluent/imperative client, the direct successor of `RestTemplate`.
Spring's declarative HTTP layer is the HTTP Interface (`@HttpExchange` + `HttpServiceProxyFactory`).
This is also mildly inconsistent with `sections[5]`, which correctly places `RestClient` alongside
`RestTemplate`. Fix:

> Đó là những khoảng trống mà OkHttp, Apache HttpClient 5, hay tầng cao hơn như Feign và HTTP Interface của Spring (<code>@HttpExchange</code>) lấp vào.

### L13 — `d-12-1` `whyWrong[2]` (content-E): the release count is wrong under any reading

> Java 17 không giới thiệu HttpClient; lúc đó API đã ổn định được **3 phiên bản**

Java 11 → 17 is six feature releases (12–17), or one LTS step. "3" matches neither. Fix:
"…tới lúc đó API đã ổn định qua 6 bản phát hành kể từ Java 11".

---

## Verified correct while reviewing — do not re-check

**Topic 11.** Automatic-module implied readability (post-M2 wording), `--add-opens` accepted-but-
warned by javac (post-L7 wording), the `java.net.http`-is-11 correction (post-H3), `--compress=zip-6`
(post-L5), `legacy-utils-2.3.1.jar` → module name `legacy.utils`, jlink rejecting automatic modules,
split-package hard failure, `exports` vs `opens` axes, `InaccessibleObjectException extends
RuntimeException`, the 9–15 permit / 16 deny (JEP 396) / 17 closed (JEP 403) timeline, and JEP 320's
module list.

**Topic 16.** Record-pattern exhaustiveness (post-H1) and the flat-`Line` trap wording (post-M3);
`case null, default` in the middle → `this case label is dominated by a preceding case label`;
unguarded `case Integer i` before `case Integer i when …` → same dominance error; `case int[] arr`
compiles and matches at `--release 21`; `case Pair(long a, int b)` on `record Pair(int,int)` →
`primitive patterns are a preview feature and are disabled by default`; `switch(o){case String s ->
…; default -> …}` throws NPE on `null` even with `default`; `instanceof` std 16, switch expressions
std 14, pattern switch and record patterns std 21; `break value` → `yield` history;
`SwitchBootstraps.typeSwitch`.

**Topic 17.** Virtual thread `getName()` is `""` and `toString()` is
`VirtualThread[#36]/runnable@ForkJoinPool-1-worker-1`; `setDaemon(false)` →
`IllegalArgumentException: 'false' not legal for virtual threads`; `InheritableThreadLocal` **is**
inherited by virtual threads created both by `Thread.ofVirtual()` and by
`newVirtualThreadPerTaskExecutor()` (so `t-17-5 sections[2]` is right); commonPool parallelism =
cores − 1 (19 on 20 cores) vs the separate FIFO virtual-thread scheduler; ScopedValue (JEP 446) and
StructuredTaskScope (JEP 453) correctly called out as preview-in-21 with the 19/20 incubator history;
JEP 491/JDK 24 correctly credited for removing `synchronized` pinning; `jdk.tracePinnedThreads`
scoped to JDK 21; `spring.threads.virtual.enabled` on Boot 3.2+; Little's law 200/0.3 ≈ 666.

**Topic 18.** `ConcurrentHashMap.computeIfAbsent(1, k -> map.put(17, …))` throws
`IllegalStateException: Recursive update` deterministically (3/3 runs) — the C1 fix is correct, and
keys 1 and 17 do collide in bin 1 of a 16-bin table; `CopyOnWriteArrayList` iterator `remove()` →
`UnsupportedOperationException`; `supplyAsync` without an executor runs on
`ForkJoinPool.commonPool-worker-*`; the post-H2 `compute`-runs-exactly-once wording; the post-M10
`ACC_SYNCHRONIZED`-is-an-access-flag wording; the post-M4 `CompletionException` qualification in
`keyPoints[1]`; the post-L19 tie-lock in `transferSafe`; the core→queue→max→reject order; Coffman
conditions; `submit` swallowing into `Future` vs `execute` reaching the uncaught handler; biased
locking disabled/deprecated in 15 (JEP 374); the four safe-publication idioms; `ExecutorService
implements AutoCloseable` from 19.

**Topics 14/15.** Sealed interface rejected as a lambda target; anonymous/local classes rejected;
permitted subtypes in a different package of the same named module compile; `permits` omitted when
subtypes are in the same file (incl. records nested in the interface); `Class.isSealed()` /
`getPermittedSubclasses()` at `--release 17`; `this.field = …` in a compact constructor →
`cannot assign a value to final variable`; a non-canonical record constructor without `this(...)` →
`constructor is not canonical, so it must invoke another constructor`; the generic
`sealed interface Result<T>` switch is exhaustive without `default`.

**Topics 19/20.** DCL reordering and JSR-133 `volatile` happens-before; holder idiom via class-init
locking; enum reflection immunity; Factory Method vs Abstract Factory vs static factory (incl.
`Integer.valueOf` cache, Spring `Map<String, Bean>` injection); Builder/record trade-offs and Lombok
`@Builder` not enforcing required args; Strategy vs Template Method; `Observer`/`Observable`
deprecated in 9 and `Flow` from 9; lambda-listener leak; GoF 1994 / Fowler 2004 / Service Locator;
`Proxy.newProxyInstance` on a class → `IllegalArgumentException: … is not an interface`; Boot's
`proxyTargetClass=true` default; self-invocation bypassing the proxy; JMH warm-up/fork/Blackhole/
`@State` (`private final double x = 42.0` is a JLS 4.12.4 constant variable, so javac emits
`ldc2_w 42.0` before C2 folds anything — confirmed with `javap -c`); SLF4J placeholders and the 2.x
fluent form; helpful NPE default from 15; ArrayList vs LinkedList locality / `System.arraycopy` /
`RandomAccess`.

**Topic 12** (re-run on Temurin 11.0.32 / 17.0.20 / 21.0.12). Incubator 9/10 → 11 timeline and
package rename; `Flow`-based publishers/subscribers; `java.net.http` in the default root set
(`java --describe-module java.se` → `requires transitive java.net.http`); HTTP/2 with ALPN / h2c
upgrade fallback and the multiplexing rationale; `HttpConnectTimeoutException ⊂ HttpTimeoutException
⊂ IOException`; `Redirect.NORMAL` = ALWAYS minus HTTPS→HTTP; the restricted-header list
(`Host`/`Content-Length`/`Connection`/`Upgrade` → `IllegalArgumentException: restricted header name`,
while `Date`/`From`/`Via`/`Warning` are allowed on modern JDKs — the tutorial names only the four
that really are restricted); `CookieManager`/`CookiePolicy`; Java 21
`close()`/`shutdown()`/`shutdownNow()`/`awaitTermination()` and `AutoCloseable`; **`close()` does not
shut down a user-supplied executor** (`my.isShutdown()` → `false` after `client.close()` on 21);
per-client selector thread + pool + executor; the BodyPublishers/BodyHandlers inventories; no
built-in multipart; internal retry limited to idempotent methods; `jdk.httpclient.connectionPoolSize`;
no HTTP/3 in 11/17/21; the post-M5 retry loop with `MAX_ATTEMPTS` and the post-L8
`JdkClientHttpRequestFactory` / `JdkClientHttpConnector` names.

**Topic 13.** `var x = 10` and `int x = 10` produce byte-identical class files even with `-g`
(`cmp` passes); `var l = List.of()` → `List<Object>` and `var bad = new ArrayList<>()` →
`ArrayList<Object>`; intersection types and anonymous-class types preserved; the poly-expression /
cast-escape reasoning; the legal/illegal position lists; all-or-nothing lambda parameter forms and
the annotation rationale for JEP 323; numeric promotion; `var` local 10 / lambda param 11 with no
semantic change through 21; zero runtime cost.
