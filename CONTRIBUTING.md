# Contributing to the Enolalab Product Catalogue

The catalogue is curated metadata for Enolalab's five public products. Contributions should keep `public/registry.json` aligned with verified public repository artifacts and live documentation.

## Editing the Registry

Update a product entry when its public summary, lifecycle status, technology stack, documentation URL, source repository, or release link changes.

- Keep the five fixed product IDs: `dotagen`, `sunset`, `grid-screen`, `linear-cli`, and `sunbeam`.
- Use only source-verified summaries. Do not add claims for unreleased functionality.
- Set `docsUrl` and `repoUrl` to HTTPS URLs.
- Set `releaseUrl` to an HTTPS releases page when one exists, otherwise `null`.
- Use only supported statuses and categories documented in the README.

## Validation

Before submitting a change, run:

```bash
npm test && npm run build
```

Confirm that the documentation, source, and release links in the edited entry resolve to their intended public destinations.
