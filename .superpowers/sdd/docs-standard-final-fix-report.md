# Documentation Standard Final Fix Report

Date: 2026-08-02

## Status

The final template-version correction is complete in the canonical template and all five product repositories. Intended changes are committed in each owning repository. Unrelated generated directories, audit artifacts, and debug JPEGs were not staged or modified.

The Linear custom hostname is now serving the corrected documentation. A live check on 2026-08-02 returned HTTP 200 from both the Pages project and canonical hostname; neither response contains the API-key placeholder.

## Fixes

1. Canonical template `v1.0.2` was created at commit `42cb9b67`, the existing canonical HEAD containing the final Wrangler workflow invocation. The historical `v1.0.0` and `v1.0.1` tags still resolve to `d894d8d5` and `ff6ddea9` respectively and were not moved or deleted.
2. All five product `website/site-metadata.json` files now use `templateVersion: "1.0.2"`.
3. The validator now requires each audit `sources` entry to be an existing repository-relative path. Absolute paths, URLs, traversal paths, and missing paths are rejected. Existing tracked paths under `internal/**` remain valid.
4. Canonical and product regression tests cover valid internal paths, missing paths, absolute paths, and URL sources. The Linear API placeholder regression remains covered and is now part of the canonical validator behavior.
5. Grid Screen now triggers the documentation workflow for `scripts/**` on both push and pull request events. Main-only deployment and existing validation gates are unchanged.
6. Deployment Wrangler is pinned to `4.118.0` in the canonical template, Dotagen, Sunset, and Sunbeam. Existing Grid Screen and Linear CLI pins were preserved.
7. Linear deployment smoke checks now assert the expected current documentation identity and reject `lin_api_your_key_here` for both the Pages project URL and the canonical hostname.
8. Canonical and product sync guidance now identifies `v1.0.2` as the current template tag and requires adopting the next template tag and bumping product metadata in the same reviewed change.

## Commits

| Repository | Commit/tag | Intended changes |
| --- | --- | --- |
| `docs-template` | tag `v1.0.2` -> `42cb9b67`; guidance `a5565f55` | Immutable release tag at the final workflow fix; post-tag sync guidance reference |
| `dotagen` | `9e2b65b8` | Metadata and synchronization guidance only |
| `sunset` | `9d2308bb` | Metadata and synchronization guidance only |
| `grid-screen` | `02499c2f` | Metadata and synchronization guidance only |
| `linear-cli` | `f426ab1f` | Metadata and synchronization guidance only |
| `sunbeam` | `e5eeb18f` | Metadata and synchronization guidance only |

## Verification

Canonical template:

- `npm test`: 26 tests passed.
- `npm run validate`: passed.
- `npm run build --prefix website`: passed.
- `v1.0.0^{commit}`: `d894d8d5`.
- `v1.0.1^{commit}`: `ff6ddea9`.
- `v1.0.2^{commit}`: `42cb9b67`.
- Current canonical `HEAD`: `a5565f55` (sync guidance update after the immutable tag).

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

## Final Template-Version Correction Evidence

Date: 2026-08-02

### Exact References

- Canonical `v1.0.0^{commit}`: `d894d8d5f7760964a9c5d9a8f09e6927c16cbc08`.
- Canonical `v1.0.1^{commit}`: `ff6ddea9eaa12d3389ac659a657b759e973454d1`.
- Canonical `v1.0.2^{commit}`: `42cb9b6783a4753d0f539126f2a9e6c4410d50b5`.
- Canonical current HEAD after guidance update: `a5565f556e6317b78773b29618a76f609b07684b`.
- `docs-template` guidance commit: `a5565f556e6317b78773b29618a76f609b07684b`.
- `dotagen` adoption commit: `9e2b65b8c8b35ccf000af04b35b568c2793ffd02`.
- `sunset` adoption commit: `9d2308bb2683e6d024c25c86d380ee7b47e88628`.
- `grid-screen` adoption commit: `02499c2f10e127e027ebc4b90fda69b315480f82`.
- `linear-cli` adoption commit: `f426ab1fa10b2917011481d52de5a7daed6899db`.
- `sunbeam` adoption commit: `e5eeb18f6983cb6052f5b215e2e49480f09dde48`.

The product adoption commits each contain exactly `website/site-metadata.json` and the existing product synchronization guidance file. No product implementation, documentation page, workflow, validator, or audit content was changed in this correction.

### Verification Commands

Canonical template:

- `npm test`: 26 tests passed, 0 failed.
- `npm run validate`: passed.
- `npm run build --prefix website`: passed. Existing Docusaurus `siteConfig.onBrokenMarkdownLinks` deprecation warning remains.

Products:

- Dotagen: `go test ./...`, `node scripts/validate-docs.mjs --root .`, and `npm run build --prefix website` all passed. The build emitted only the existing Docusaurus deprecation warning.
- Sunset: `go test ./...`, `node scripts/validate-docs.mjs --root .`, and `npm run build --prefix website` all passed. The build emitted only the existing Docusaurus deprecation warning.
- Grid Screen: `node --test tests/validate-docs-sources.test.mjs` passed with 1 test; `node scripts/validate-docs.mjs --root .`, `npm run build --prefix website`, and `npm run check` passed. `svelte-check` reported 0 errors and 28 existing warnings.
- Linear CLI: `npm test` passed with 2 tests; `node scripts/validate-docs.mjs --root .`, `npm run build --prefix website`, and `go test -v -race ./...` passed. The build emitted only the existing Docusaurus deprecation warning.
- Sunbeam: `./mvnw test` passed with 8 tests; `node scripts/validate-docs.mjs --root .` and `npm run build --prefix website` passed. The build emitted only the existing Docusaurus deprecation warning; Maven/native tooling emitted existing Java agent warnings.

Metadata and tag resolution:

- A Node verification script parsed all five product metadata files and confirmed `templateVersion=1.0.2` for Dotagen, Sunset, Grid Screen, Linear CLI, and Sunbeam.
- The same verification resolved `v1.0.0^{commit}` to `d894d8d5f7760964a9c5d9a8f09e6927c16cbc08`, `v1.0.1^{commit}` to `ff6ddea9eaa12d3389ac659a657b759e973454d1`, and `v1.0.2^{commit}` to `42cb9b6783a4753d0f539126f2a9e6c4410d50b5`.
- `git diff --check` passed for every correction commit.

### Concerns

- Product worktrees retain pre-existing untracked generated directories, audit artifacts, and Sunbeam debug JPEGs. They were not staged or modified by the correction commits.
- The canonical `v1.0.2` tag intentionally points to release commit `42cb9b67`; sync guidance was added afterward at `a5565f55`, so the release tag remains immutable.
- Existing Docusaurus, Grid Screen accessibility/CSS, Java agent, and dependency warnings remain outside this version-only correction scope.
