# Enolalab Product Catalogue

The Enolalab catalogue is a curated, static directory of the organisation's official products. It presents product summaries, status, technology, documentation, source repositories, and release links from `public/registry.json`.

The catalogue currently contains exactly these five products:

- `dotagen`
- `sunset`
- `grid-screen`
- `linear-cli`
- `sunbeam`

Live site: [enolalab.com](https://enolalab.com)

## Stack

- TypeScript
- Vite
- Vanilla CSS
- Cloudflare Pages hosting

This is a static Vite site. The build produces the catalogue application in `dist/`; it does not copy or execute product source trees.

## Local development

```bash
npm install
npm run dev
npm test
npm run build
```

`npm run dev` starts the local Vite server. The test and build commands should pass before catalogue changes are shared.

## Registry

The single source of catalogue metadata is [`public/registry.json`](public/registry.json). Each product entry contains:

| Field | Purpose |
| --- | --- |
| `id` | Stable URL-safe product identifier |
| `name` | Display name |
| `summary` | Short product description |
| `status` | `active`, `in-development`, or `maintained` |
| `category` | Curated product category |
| `techStack` | Technologies used by the product |
| `docsUrl` | Official HTTPS documentation URL |
| `repoUrl` | Official HTTPS source repository URL |
| `releaseUrl` | Official HTTPS release URL, or `null` when unavailable |
| `thumbnail` | Catalogue thumbnail URL or `null` |
| `featured` | Whether the product is highlighted in the catalogue |

## Metadata rules

- Keep the registry limited to the five official product IDs listed above.
- Keep `docsUrl`, `repoUrl`, and any non-null `releaseUrl` HTTPS-only and verify that each link resolves to the product's official source.
- Write summaries from the product's official documentation, README, repository, or release notes. Do not add unsupported claims.
- Preserve stable IDs and the existing field shape so links, validation, and UI rendering remain compatible.
- Use `null` when an optional URL or thumbnail is not available; do not substitute an unrelated destination.
- Keep status, category, technology, and featured state aligned with current first-party sources.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the registry maintenance workflow.

## License

MIT © [hieuntg81](https://github.com/hieuntg81)
