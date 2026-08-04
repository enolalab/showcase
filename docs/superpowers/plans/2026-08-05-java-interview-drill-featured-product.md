# Java Interview Drill Featured Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing Java Interview Drill HTML as a static public page and list it as a featured product in the showcase catalogue.

**Architecture:** Keep the downloaded document as one unchanged self-contained HTML file under `public/java-interview-drill.html`, which Vite copies to the production output and Cloudflare Pages serves at `/java-interview-drill.html`. Add catalogue metadata for the new product and extend the registry whitelist so the existing validation continues to enforce the complete official product set.

**Tech Stack:** TypeScript, Vite, Vitest, Cloudflare Pages static assets.

## Global Constraints

- Preserve the HTML file's structure and bytes exactly.
- Do not extract, reformat, or rewrite its inline CSS, JavaScript, or content.
- Use the public URL `https://enolalab.com/java-interview-drill.html` as the product documentation URL.
- Keep all registry URLs HTTPS-only.
- Mark the new product as featured.
- Preserve all existing products and registry field shapes.

---

### Task 1: Add the static HTML asset

**Files:**
- Create: `public/java-interview-drill.html`

**Interfaces:**
- Produces the public static asset served at `/java-interview-drill.html`.

- [ ] **Step 1: Record the source hash and byte count**

Run:

```bash
sha256sum "/home/k0walski/Downloads/java-interview-drill (3).html"
stat -c '%s' "/home/k0walski/Downloads/java-interview-drill (3).html"
```

Expected: a SHA-256 digest and `287340` bytes.

- [ ] **Step 2: Add the source file without editing its contents**

Create `public/java-interview-drill.html` as an exact byte-for-byte copy of `/home/k0walski/Downloads/java-interview-drill (3).html`. Do not change the filename references, whitespace, encoding, inline styles, scripts, or document structure.

- [ ] **Step 3: Verify the copied asset**

Run:

```bash
sha256sum "/home/k0walski/code/showcase/public/java-interview-drill.html"
stat -c '%s' "/home/k0walski/code/showcase/public/java-interview-drill.html"
cmp -s "/home/k0walski/Downloads/java-interview-drill (3).html" "/home/k0walski/code/showcase/public/java-interview-drill.html"
```

Expected: the digest and byte count match the source, and `cmp` exits successfully.

### Task 2: Register Java Interview Drill as featured

**Files:**
- Modify: `src/data.ts:21-28`
- Modify: `public/registry.json:6-72`
- Modify: `tests/registry.test.ts:18-61`

**Interfaces:**
- Consumes the existing `Registry` and `Product` shapes.
- Produces a valid official product ID set containing `java-interview-drill`.

- [ ] **Step 1: Extend the official product ID whitelist**

Update `officialProductIds` in `src/data.ts` to append `'java-interview-drill'` after `'sunbeam'`.

- [ ] **Step 2: Add the registry entry**

Append this product object to `public/registry.json`:

```json
{
  "id": "java-interview-drill",
  "name": "Java Interview Drill",
  "summary": "A focused senior-level Java interview practice drill with timed questions, explanations, and progress tracking.",
  "status": "active",
  "category": "developer-tools",
  "techStack": ["HTML", "CSS", "JavaScript"],
  "docsUrl": "https://enolalab.com/java-interview-drill.html",
  "repoUrl": "https://github.com/enolalab/showcase",
  "releaseUrl": null,
  "thumbnail": null,
  "featured": true
}
```

- [ ] **Step 3: Update registry test fixtures**

Append the same product shape to the `products` fixture in `tests/registry.test.ts`, and append `'java-interview-drill'` to `officialProductIds`. Keep the existing five product fixtures unchanged.

- [ ] **Step 4: Add a featured product assertion**

Add a test assertion in the successful `parseRegistry` test that looks up `java-interview-drill` and verifies its `docsUrl` is `https://enolalab.com/java-interview-drill.html` and `featured` is `true`.

- [ ] **Step 5: Run the registry tests**

Run:

```bash
npm test -- --run tests/registry.test.ts
```

Expected: all registry tests pass.

### Task 3: Verify production serving

**Files:**
- Verify: `dist/java-interview-drill.html`

**Interfaces:**
- Consumes Vite's public asset copying behavior.
- Produces a build artifact available at `/java-interview-drill.html`.

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 2: Build the production site**

Run:

```bash
npm run build
```

Expected: the Vite build completes successfully and writes `dist/java-interview-drill.html`.

- [ ] **Step 3: Verify the production asset remains byte-identical**

Run:

```bash
cmp -s "/home/k0walski/Downloads/java-interview-drill (3).html" "/home/k0walski/code/showcase/dist/java-interview-drill.html"
```

Expected: `cmp` exits successfully, confirming the deployed build asset has the same bytes as the source.
