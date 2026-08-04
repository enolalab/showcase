# Contributing to the Enolalab Product Catalogue

Catalogue changes maintain the official six-product registry in [`public/registry.json`](public/registry.json). The registry is curated: update existing metadata only when it can be verified against first-party product sources.

## Local checks

Install dependencies and run the local checks from the repository root:

```bash
npm install
npm run dev
npm test
npm run build
```

Use `npm run dev` for visual verification. `npm test` validates registry parsing and routing behavior, while `npm run build` verifies TypeScript and the production Vite build.

## Updating registry metadata

1. Edit the relevant entry in `public/registry.json`.
2. Keep the catalogue at exactly these IDs: `dotagen`, `sunset`, `grid-screen`, `linear-cli`, `sunbeam`, and `java-interview-drill`.
3. Preserve each stable `id` and the existing JSON field shape.
4. Keep `docsUrl`, `repoUrl`, and every non-null `releaseUrl` as verified HTTPS links to official product sources.
5. Keep `summary`, `status`, `category`, and `techStack` consistent with current official documentation, source repositories, or release notes.
6. Use `null` for unavailable optional links or thumbnails. Do not add placeholder or unrelated URLs.
7. Set `featured` only when the catalogue presentation should highlight the product.

## Registry fields

Each product entry uses these fields:

```json
{
  "id": "stable-product-id",
  "name": "Display name",
  "summary": "Source-backed product summary.",
  "status": "active",
  "category": "developer-tools",
  "techStack": ["Go"],
  "docsUrl": "https://official-docs.example.com",
  "repoUrl": "https://github.com/example/product",
  "releaseUrl": "https://github.com/example/product/releases",
  "thumbnail": null,
  "featured": false
}
```

Summaries must describe what the product actually does and should be traceable to a first-party source. When a detail cannot be verified, leave it out rather than guessing.

## Before sharing a change

- Confirm the JSON remains valid and contains exactly the six official IDs.
- Check every documentation, source, and release link for HTTPS and official ownership.
- Run `npm test` and `npm run build`.
- Review the diff to ensure it contains only intentional catalogue or documentation changes.
