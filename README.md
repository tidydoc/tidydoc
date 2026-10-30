# tidydoc

A documentation website for your SaaS, from a folder of Markdown files and a single Docker container.

Website: [tidydoc.dev](https://tidydoc.dev) · Contact: [hello@tidydoc.dev](mailto:hello@tidydoc.dev)

- **Zero config**: mount a folder of `.md` files. The navigation is built from your folders.
- **Your brand**: set the logo, colors, links and font with environment variables.
- **No backend, no build**: nginx serves a static app, and your Markdown is indexed when the container starts and again whenever a file changes.
- Full-text search (`⌘K`), dark mode, syntax highlighting, callouts, cards, tabs, a table of contents, and the raw Markdown of every page at `<url>.md`.

## Quick start

```yaml
# docker-compose.yml
services:
  docs:
    image: ghcr.io/tidydoc/tidydoc:latest
    ports:
      - "8080:80"
    volumes:
      - ./docs:/content:ro
    environment:
      SITE_TITLE: Acme
      COLOR_PRIMARY: "#6d28d9"
      SIDEBAR_LINKS: "Website|https://acme.com|mdi-web;GitHub|https://github.com/acme|mdi-github"
```

```bash
docker compose up -d
open http://localhost:8080
```

Without a volume, the container serves its own documentation (the [`docs/`](docs) folder of this repository).

## Writing content

```text
docs/
├── index.md                 → /             (home page)
├── 01-getting-started/      → "Getting started" section
│   ├── 01-installation.md   → /getting-started/installation
│   └── 02-configuration.md  → /getting-started/configuration
└── 02-guides/
    ├── _meta.json           → { "title": "Guides", "icon": "mdi-book", "collapsed": false }
    └── webhooks/            → collapsible group
        └── index.md         → /guides/webhooks
```

- Numeric prefixes (`01-`) set the order and are removed from URLs and titles.
- Frontmatter: `title`, `description`, `icon`, `order`, `hidden`.
- Components: `::: tip|note|info|warning|danger`, `::: cards`, `::: tabs` with `@tab Name` lines.

See [docs/02-writing](docs/02-writing) for the full syntax.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `SITE_TITLE` | `Documentation` | Site name |
| `SITE_DESCRIPTION` | | Meta description |
| `SHOW_TITLE` | `true` | Show the title next to the logo |
| `LOGO_URL` / `LOGO_DARK_URL` | | Logo, e.g. `/content/_assets/logo.svg` |
| `FAVICON_URL` | tidydoc icon | Favicon |
| `COLOR_PRIMARY` / `COLOR_PRIMARY_DARK` | `#18181b` / `#fafafa` | Links, active page, table of contents |
| `COLOR_SIDEBAR_BG` / `COLOR_SIDEBAR_BG_DARK` | `#f5f5f5` / `#111113` | Sidebar background |
| `COLOR_BACKGROUND` / `COLOR_BACKGROUND_DARK` | `#ffffff` / `#0a0a0a` | Page background |
| `DEFAULT_THEME` | `system` | `system`, `light` or `dark` |
| `SIDEBAR_LINKS` | | `Title\|URL\|mdi-icon;…` |
| `FONT_FAMILY` | `Inter` | A Google Font name, or `system` |
| `ENABLE_SEARCH` | `true` | Search box and `⌘K` |
| `ENABLE_COPY_MARKDOWN` | `true` | "Copy Markdown" / "Open" buttons |
| `WATCH` | `true` | Re-index when files change |
| `WATCH_POLL_INTERVAL` | | Poll every N seconds instead of using file events (useful when bind mounts don't forward them) |

## How it works

```
container start
  ├─ entrypoint.sh  → config.js (whitelisted env vars), index.html (title, meta, favicon)
  ├─ generate.sh    → content.json (all .md + _meta.json) and /_md/<route>.md symlinks
  ├─ inotifywait    → re-runs generate.sh when /content changes
  └─ nginx          → static Vue 3 + Vuetify 4 app, /content/* assets, raw /<route>.md
```

The browser loads `content.json` once, then builds the navigation, renders Markdown ([markdown-it](https://github.com/markdown-it/markdown-it) and [Shiki](https://shiki.style)) and indexes the search ([MiniSearch](https://github.com/lucaong/minisearch)).

## Development

```bash
cd app
npm install
npm run dev          # serves ../docs, set TIDYDOC_CONTENT_DIR to use another folder
npm test
npm run typecheck
```

```bash
docker compose up --build   # build the image locally
```

## Limitations

- tidydoc is a single-page app, so search engines get less than with server-rendered docs.
- It must be served at the root of a domain, not under a sub-path.
- There is no versioning and no i18n yet.
- Raw HTML in Markdown is rendered as-is: only serve content you trust.

## License

MIT
