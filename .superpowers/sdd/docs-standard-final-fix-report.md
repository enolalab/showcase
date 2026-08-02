# Documentation Standard Final Fix Report

Date: 2026-08-02

## Status

The coordinated final-review fix wave is complete in the canonical template and all five product repositories. Intended changes are committed in each owning repository. Unrelated generated directories, audit artifacts, and debug JPEGs were not staged or modified.

The Linear custom hostname is now serving the corrected documentation. A live check on 2026-08-02 returned HTTP 200 from both the Pages project and canonical hostname; neither response contains the API-key placeholder.

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

- `https://linear-cli-docs.pages.dev/`: HTTP 200, title `Introduction | linear-cli`, expected `linear-cli` identity present; `lin_api_your_key_here` absent.
- `https://linear-cli.enolalab.com/`: HTTP 200, title `Linear CLI`, expected identity present; `lin_api_your_key_here` absent.

## Concerns

- Linear custom DNS and Pages custom-domain routing were verified serving the current documentation during the live check above.
- Linear `npm ci` reported 22 existing dependency audit findings: 1 low, 20 moderate, and 1 high. No dependency files were changed in this fix wave.
- Docusaurus builds retain the existing deprecation warning for `siteConfig.onBrokenMarkdownLinks` and report an available Docusaurus update. These are outside this review scope.
- Grid Screen `npm run check` retains existing accessibility and CSS warnings; it has no errors.

## Wrangler Invocation Fix Evidence

Date: 2026-08-02

- Updated all six documentation workflows to use `npx --yes wrangler@4.118.0 pages deploy ...`.
- Preserved Node 22 setup, Cloudflare secrets, main-only deployment conditions, PR triggers, product test gates, and smoke checks.
- YAML parsing passed for all six `.github/workflows/docs.yml` files using the system Node `yaml` parser.
- Control assertions passed: each workflow has exactly one `npx --yes wrangler@4.118.0` Pages deployment, no `--no-install` invocation remains, and all main-only deployment conditions remain present.
- Each repository has a one-line workflow diff with `git diff --check` passing.
- Canonical and all five product documentation validators passed.
- Canonical and all five product Docusaurus builds passed.

Commits for this Wrangler fix wave:

- `docs-template`: `42cb9b67`
- `dotagen`: `ad129fb`
- `sunset`: `bf31139`
- `grid-screen`: `ab5777b`
- `linear-cli`: `527ed6c`
- `sunbeam`: `635f1d4`
