# Documentation Standard Final Fix Report

Date: 2026-08-02

## Status

The coordinated final-review fix wave is complete in the canonical template and all five product repositories. Intended changes are committed in each owning repository. Unrelated generated directories, audit artifacts, and debug JPEGs were not staged or modified.

The external Linear custom-DNS mismatch remains unresolved in source. `https://linear-cli.enolalab.com/` currently returns HTTP 200 but serves the older documentation build, so the new content-aware smoke check will fail there until DNS or the Pages custom-domain configuration is corrected.

## Fixes

1. Canonical template `v1.0.1` was created at commit `ff6ddea9`. The historical `v1.0.0` tag still resolves to `d894d8d5` and was not moved or deleted.
2. All product `website/site-metadata.json` files now use `templateVersion: "1.0.1"`.
3. The validator now requires each audit `sources` entry to be an existing repository-relative path. Absolute paths, URLs, traversal paths, and missing paths are rejected. Existing tracked paths under `internal/**` remain valid.
4. Canonical and product regression tests cover valid internal paths, missing paths, absolute paths, and URL sources. The Linear API placeholder regression remains covered and is now part of the canonical validator behavior.
5. Grid Screen now triggers the documentation workflow for `scripts/**` on both push and pull request events. Main-only deployment and existing validation gates are unchanged.
6. Deployment Wrangler is pinned to `4.118.0` in the canonical template, Dotagen, Sunset, and Sunbeam. Existing Grid Screen and Linear CLI pins were preserved.
7. Linear deployment smoke checks now assert the expected current documentation identity and reject `lin_api_your_key_here` for both the Pages project URL and the canonical hostname.
8. Sync guidance now explains that shared template changes require adopting the next template tag and bumping product metadata in the same reviewed change.

## Commits

| Repository | Commit | Intended changes |
| --- | --- | --- |
| `docs-template` | `ff6ddea9` | Validator, tests, sync guidance, Wrangler pin, metadata |
| `dotagen` | `fea0569` | Validator, regression test, workflow pin, metadata, guidance |
| `sunset` | `95d0534` | Validator, regression test, workflow pin, metadata |
| `grid-screen` | `89f24e7` | Validator, regression test, path filters, metadata, guidance |
| `linear-cli` | `02f16be` | Validator, regression test, smoke checks, metadata |
| `sunbeam` | `f87a88d` | Validator, regression test, workflow pin, metadata, guidance |

## Verification

Canonical template:

- `npm test`: 26 tests passed.
- `npm run validate`: passed.
- `npm run build --prefix website`: passed.
- `v1.0.0^{commit}`: `d894d8d5`.
- `v1.0.1^{commit}` and `HEAD`: `ff6ddea9`.

Products:

- Dotagen source regression test, validator, website build, and `go test ./...`: passed.
- Sunset source regression test, validator, website build, and `go test ./...`: passed.
- Grid Screen source regression test, validator, website build, and `npm run check`: passed. Svelte check reported 0 errors and 28 pre-existing warnings. The pre-existing Rust compile issue was not attempted.
- Linear CLI source regression test, existing validator test, validator, website build, `npm test`, and `go test -v -race ./...`: passed. Website dependencies were installed with the existing lockfile before the build.
- Sunbeam source regression test, validator, website build, and `./mvnw test`: passed. Maven reported 8 tests passed.

Showcase:

- `npm test`: 3 test files and 18 tests passed.
- `npm run build`: passed.

Live Linear content checks:

- `https://linear-cli-docs.pages.dev/`: expected identity present; `lin_api_your_key_here` absent.
- `https://linear-cli.enolalab.com/`: HTTP 200, expected identity absent, `lin_api_your_key_here` absent. This is the stale custom-DNS site and is intentionally reported rather than hidden by an HTTP-only smoke test.

## Concerns

- Linear custom DNS or Pages custom-domain routing must be corrected externally before the canonical-host smoke step can pass.
- Linear `npm ci` reported 22 existing dependency audit findings: 1 low, 20 moderate, and 1 high. No dependency files were changed in this fix wave.
- Docusaurus builds retain the existing deprecation warning for `siteConfig.onBrokenMarkdownLinks` and report an available Docusaurus update. These are outside this review scope.
- Grid Screen `npm run check` retains existing accessibility and CSS warnings; it has no errors.
