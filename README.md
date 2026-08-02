# Enolalab Product Catalogue

The Enolalab product catalogue is a Vite site that presents the organisation's five public open-source products. Each card links directly to that product's documentation, source repository, and releases when available.

## Local Development

```bash
npm install
npm run dev
```

Run the full validation suite before opening a pull request:

```bash
npm test && npm run build
```

## Product Registry

`public/registry.json` is the checked-in source of catalogue metadata. It contains exactly these products:

- `dotagen`
- `sunset`
- `grid-screen`
- `linear-cli`
- `sunbeam`

Each entry must include a unique `id`, source-verified `name` and `summary`, `status`, `category`, `techStack`, HTTPS `docsUrl` and `repoUrl`, `releaseUrl` (or `null`), `thumbnail`, and `featured`.

The supported statuses are `active`, `in-development`, and `maintained`. The supported categories are `developer-tools`, `desktop`, `automation`, and `computer-vision`.

## Validation

When editing the registry, verify that every documentation, source, and release link is current and uses HTTPS. The registry parser rejects missing required fields, duplicate IDs, invalid statuses or categories, and non-HTTPS documentation or source URLs.

## License

MIT
