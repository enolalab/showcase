# java-core-lts build pipeline

`public/java-core-lts.html` is **generated**. Do not edit it by hand — your changes will be
overwritten by the next build. Edit the content JSON here and rebuild.

```
tools/java-core-lts/
  content/content-{A..G}.json   authored content, grouped by topic
  template.html                 page shell: CSS, markup, renderer, syntax highlighter
  build.py                      merge + validate + inject -> public/java-core-lts.html
  FACTCHECK.md                  accuracy audit of the content (see below)
```

## Build

```bash
python3 tools/java-core-lts/build.py            # writes public/java-core-lts.html
python3 tools/java-core-lts/build.py --check    # validate only, write nothing
python3 tools/java-core-lts/build.py --out /tmp/preview.html   # build elsewhere
```

The build fails on a schema violation and prints per-topic coverage, flagging any topic with
fewer than 4 tutorials or 8 drills as `THIN`.

## Content schema

Each file holds `{"tutorials": [...], "drills": [...]}`.

**Tutorial** — `id` (`t-<topicId>-<n>`), `topicId`, `versions`, `title`, `summary`,
`sections[]`, `example`, `exampleTitle?`, `keyPoints[]`, `trap`, `followUp[]`.

**Drill** — `id` (`d-<topicId>-<n>`), `topicId`, `versions`, `difficulty`
(`beginner|intermediate|advanced`), `question`, `code?`, `choices[4]`, `correctAnswer` (0-based),
`explanation`, `whyWrong[4]`.

### Escaping rules — the build enforces these

| field | markup | angle brackets |
|---|---|---|
| `sections[]` | `<b>` `<i>` `<code>` only, rendered as HTML | must be written `&lt;` / `&gt;` |
| `example`, `code` | none — plain Java, syntax-highlighted at render time | raw `<` and `>` |
| everything else | none — escaped at render time | raw `<` and `>` |

`whyWrong` must be the same length as `choices`, with an empty string at the `correctAnswer`
index and a real reason at every other index. That reason is what the learner sees when they
pick that specific wrong option, so it has to address that option, not restate the answer.

`topicId` must be one of the 20 topics defined in `TOPICS` at the top of `build.py`; topic
names and descriptions live there too, not in the content files.

## Accuracy

This material is used for interview preparation, so a wrong answer key is the worst possible
defect. `FACTCHECK.md` records an adversarial audit in which every drill carrying a `code`
snippet was compiled and run against a real JDK with `--release` pinned to the version the drill
claims — 186 of 187 answer keys held, and the 35 findings were fixed.

If you add or change content, verify it the same way. Pin `--release`, because a newer JDK will
happily accept post-21 syntax and mask the difference:

```bash
javac --release 21 T.java && java T
```

Version attribution is the other common trap. Be precise about *standard* vs *preview*, and
never present a preview feature as standard. As of Java 21: virtual threads are standard;
ScopedValue and StructuredTaskScope are still preview; String Templates never standardised;
Generational ZGC is opt-in via `-XX:+ZGenerational`, not the default.
