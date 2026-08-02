# Enolalab Product Catalogue and Documentation Sites

**Status:** Approved design
**Date:** 2026-08-01

## Goal

Turn `enolalab.com` from a student-submission showcase into the central catalogue for Enolalab's public products. Each product has an independent, English-first Docusaurus documentation site hosted on its own Enolalab subdomain.

## Repository Audit

The public repositories in `enolalab` at the time of design are:

| Repository | Primary technology | Product summary |
| --- | --- | --- |
| `dotagen` | Go | Define AI coding agents and skills once, then render them for multiple agent platforms. |
| `sunset` | Go | Tree-sitter codebase indexer that generates structured Markdown documentation. |
| `grid-screen` | Rust, Tauri, Svelte | Linux X11 desktop window arranger with visual zones and saved layouts. |
| `linear-cli` | Go | Non-interactive Linear CLI designed for AI-agent workflows. |
| `sunbeam` | Java, Spring Boot, OpenCV | OMR Vision API for automatic exam grading. |
| `showcase` | TypeScript, Vite | The Enolalab product catalogue itself. |

`showcase` is catalogue infrastructure, not a product card and not an independent docs site. The other five repositories are displayed as products.

## Decisions

- Each product repository owns its source documentation, Docusaurus configuration, and documentation deployment workflow.
- Documentation uses Docusaurus Classic with TypeScript configuration and is initially English-only.
- Each docs site is hosted at the product root on a dedicated subdomain: `dotagen.enolalab.com`, `sunset.enolalab.com`, `grid-screen.enolalab.com`, `linear-cli.enolalab.com`, and `sunbeam.enolalab.com`.
- Cloudflare Pages hosts the static builds. GitHub Actions deploys only the `main` branch using GitHub/organization secrets.
- `showcase` has no runtime GitHub API dependency. Its checked-in registry is the curated source of product presentation metadata.
- A catalogue card opens the corresponding documentation homepage in the same tab. Source, release, and external links open in a new tab.
- Public documentation is written only from verified repository artifacts: source, tests, configuration, README, existing public docs, workflows, and release notes. Internal planning and review material is excluded.
- Product docs track `main` until a stable semantic-versioned release requires a frozen documentation version.

## Architecture

```text
enolalab.com (showcase repository)
  -> curated product registry
  -> product cards
  -> https://<product>.enolalab.com/

<product> repository
  -> Docusaurus source and public Markdown docs
  -> GitHub Actions validation on pull requests
  -> GitHub Actions production deployment from main
  -> Cloudflare Pages custom subdomain
```

The showcase repository retains its Vite application and Cloudflare static deployment. Its current student-submission language, guide, project iframe viewer, and `projects/`-based runtime assumption are replaced by a product-catalogue experience. The catalogue exposes product identity, lifecycle status, technology, source repository, release link where available, and documentation URL.

The existing `/projects/:id` viewer must not embed application builds or Docusaurus sites in an iframe. It redirects to the matching validated `docsUrl`, preserving direct navigation while making the external documentation site the product entry point.

## Showcase Data Contract

The product registry is a static JSON document in `showcase`. Product entries require the following presentation fields:

```json
{
  "id": "dotagen",
  "name": "dotagen",
  "summary": "Define coding agents and skills once, then sync them across platforms.",
  "status": "active",
  "category": "developer-tools",
  "techStack": ["Go"],
  "docsUrl": "https://dotagen.enolalab.com",
  "repoUrl": "https://github.com/enolalab/dotagen",
  "releaseUrl": "https://github.com/enolalab/dotagen/releases",
  "thumbnail": null,
  "featured": true
}
```

`status` is curated metadata, not inferred from a browser-side API request. Valid initial values are `active`, `in-development`, and `maintained`. `releaseUrl` is optional for repositories without releases. The registry schema and TypeScript types must reject missing `docsUrl`, `repoUrl`, and `status` values.

## Common Docusaurus Convention

Every product repository contains a standard Docusaurus Classic site under `website/`. This prevents a collision with Grid Screen's application-owned `src/` directory and keeps public documentation separate from existing internal documentation:

```text
website/docs/                 Public Markdown and MDX documentation
website/src/css/custom.css    Enolalab visual tokens and Docusaurus customizations
website/src/pages/            Optional product-specific landing content
website/static/               Product assets
website/docusaurus.config.ts  Site URL, navbar, footer, docs settings
website/sidebars.ts           Explicit information architecture
website/package.json          Development, build, and serving scripts
.github/workflows/    Documentation validation and deployment
```

The docs plugin uses `routeBasePath: '/'` so the introduction resolves at the subdomain root. Every site uses a common navbar/footer pattern with links to Enolalab, its source repository, releases when applicable, and the other products catalogue. Docusaurus built-in dark mode, Markdown/MDX code blocks, breadcrumbs, table of contents, and edit links are enabled.

Shared visual conventions are intentionally copied rather than distributed as a package in this first release. This avoids package publication and versioning infrastructure while docs content is being established. A shared preset can be extracted later if five sites prove stable enough to justify it.

## Documentation Content Standard

Before authoring a repository's pages, conduct a documentation audit that inventories its public commands or endpoints, configuration, expected inputs and outputs, supported platforms, tests, CI behavior, release behavior, and architecture boundaries. Each claim in a page must map to that audit.

All sites include these sections when applicable:

- Introduction and product scope
- Getting started and installation
- Conceptual guides and common workflows
- Complete public reference
- Configuration and troubleshooting
- Development, testing, release, and contribution guidance

Internal materials such as `docs/superpowers/plans/**`, `docs/superpowers/reviews/**`, and internal design assets are excluded from the sidebar and docs build unless explicitly rewritten and approved as public content.

### dotagen

- Installation, update, and first sync
- Source definitions, targets, rendering, and symlink workflow
- Agent and skill authoring
- Platform support matrix and platform-specific behavior
- Web control plane
- Complete CLI reference
- Troubleshooting and contribution workflow

### sunset

- Installation and first scan
- Output formats, frontmatter, and generated index
- Supported language behavior and source mapping
- Configuration, filtering, cache, and incremental operation
- Dependency graph behavior
- Complete CLI and Go API reference
- Architecture, releases, and contribution workflow

### grid-screen

- Linux/X11 requirements and installation
- Window arrangement workflow
- Built-in presets, custom layouts, settings, and multi-monitor use
- System tray and compatibility boundaries for X11, XWayland, and Wayland
- Troubleshooting and privacy statement
- Rust/Tauri/Svelte architecture, local development, testing, and releases

### linear-cli

- Installation and authentication
- JSON output, exit-code, and non-interactive conventions
- Workflows grouped by Linear resource: teams, issues, projects, cycles, labels, users, comments, attachments, statuses, and configuration
- Complete command reference and configuration reference
- Credential safety and AI-agent automation patterns
- Development, testing, releases, and contribution workflow

### sunbeam

- Runtime prerequisites, Tesseract setup, and local or production deployment
- `POST /api/v1/grade` request, CSV answer-key, image-input, result, and error reference
- OMR, image-processing, OCR, and grading pipeline behavior
- Application configuration and operational troubleshooting
- Worked client examples
- Test fixtures, quality guarantees, local development, and architecture

## Deployment and Versioning

Each docs repository has these workflows:

| Trigger | Required behavior |
| --- | --- |
| Pull request changing docs or docs configuration | Install locked dependencies and run the production Docusaurus build. Broken links and invalid sidebar entries fail the check. |
| Merge to `main` | Build and deploy to that repo's Cloudflare Pages project and configured custom subdomain. |
| Semantic release | Create a Docusaurus docs version immediately before publishing, then deploy it with the release. |

Cloudflare credentials use repository or organization secrets. The implementation must document the required secret names and the one-time Cloudflare custom-domain setup, but never store tokens in source control.

The first release does not manufacture version history. Versioning starts only when an existing or future stable project release needs a supported snapshot.

## Quality and Failure Handling

- The Docusaurus production build is the minimum documentation validation. It catches malformed MDX, missing docs, broken internal links, and invalid sidebars.
- The catalogue pipeline validates the registry schema and confirms every `docsUrl` is an HTTPS URL. A release validation job performs HTTP smoke checks against live docs after deployment.
- Source changes that alter a documented public command, endpoint, or configuration should include matching docs changes in the same pull request. Reviewers use the documentation audit as the completeness checklist.
- A failed docs deployment leaves the previous Cloudflare Pages production build available. The GitHub Actions run reports the failure; no partial production publish is considered successful.
- Docs contain no production credentials, private endpoints, sample secrets, or unverified performance/accuracy claims.

## Acceptance Criteria

- `enolalab.com` presents exactly the five public product repositories and no longer presents itself as a student project submission platform.
- Every product card includes current product metadata and reaches an HTTPS Docusaurus docs homepage.
- All five product docs sites build from their own repository and deploy independently to their configured `*.enolalab.com` subdomain.
- Every site has a coherent sidebar, English introduction, getting-started flow, public reference, troubleshooting, and development guidance matching the relevant product's verified codebase audit.
- Every docs pull request validates successfully before merge, and every main-branch deployment has a post-deploy health check.
- Docs do not publish internal Enolalab planning or review files.

## Delivery Decomposition

This is a multi-repository program, not one atomic code change. Implementation is intentionally divided into these independently reviewable workstreams:

1. Refactor `showcase` into the central product catalogue and define the registry schema.
2. Establish the Docusaurus and Cloudflare deployment convention in one pilot repository, `dotagen`.
3. Apply the approved convention and audited content model to `sunset`.
4. Apply it to `grid-screen`.
5. Apply it to `linear-cli`.
6. Apply it to `sunbeam`.
7. Add cross-site validation, release versioning where applicable, and final catalogue verification.

The pilot validates the shared convention before it is duplicated across the other repositories. Full product documentation remains a required deliverable for each repository, not generated placeholder content.
