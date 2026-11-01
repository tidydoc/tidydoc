---
description: Everything is configured with environment variables.
icon: mdi-tune-variant
---

# Configuration

All settings are optional. They are read when the container starts.

## Site

| Variable           | Default         | Description                                              |
|--------------------|-----------------|----------------------------------------------------------|
| `SITE_TITLE`       | `Documentation` | Name shown in the sidebar and in the browser tab         |
| `SITE_DESCRIPTION` |                 | Meta description, used in link previews                  |
| `SITE_URL`         |                 | Public URL of the site, see [SEO](#seo)                  |
| `OG_IMAGE_URL`     |                 | Link preview image, see [SEO](#seo)                      |
| `SHOW_TITLE`       | `true`          | Show the title next to the logo                          |
| `LOGO_URL`         |                 | Logo URL, e.g. `/content/_assets/logo.svg`               |
| `LOGO_DARK_URL`    | `LOGO_URL`      | Logo used in dark mode                                   |
| `FAVICON_URL`      | tidydoc icon    | Favicon URL                                              |
| `SIDEBAR_LINKS`    |                 | External links at the top of the sidebar                 |
| `FONT_FAMILY`      | `Inter`         | Any [Google Font](https://fonts.google.com), or `system` |

## Colors

| Variable           | Default (light) | Variable                | Default (dark)               |
|--------------------|-----------------|-------------------------|------------------------------|
| `COLOR_PRIMARY`    | `#18181b`       | `COLOR_PRIMARY_DARK`    | `COLOR_PRIMARY` or `#fafafa` |
| `COLOR_SIDEBAR_BG` | `#f5f5f5`       | `COLOR_SIDEBAR_BG_DARK` | `#111113`                    |
| `COLOR_BACKGROUND` | `#ffffff`       | `COLOR_BACKGROUND_DARK` | `#0a0a0a`                    |

The primary color is used for links, the active page and the table of contents.

## Theme

`DEFAULT_THEME` accepts `system` (default), `light` or `dark`. Visitors can switch theme from the bottom of the sidebar;
their choice is remembered.

## Sidebar links

`SIDEBAR_LINKS` is a list of `Title|URL|icon` separated by `;`. The icon is optional and can be
any [Material Design Icon](https://pictogrammers.com/library/mdi/) prefixed with `mdi-`.

```bash
SIDEBAR_LINKS="Website|https://acme.com|mdi-web;Dashboard|https://app.acme.com|mdi-view-dashboard-outline"
```

## SEO

Every page is served with its own `<title>`, description (the `description` of its frontmatter, or `SITE_DESCRIPTION`),
Open Graph and Twitter tags, so search engines and link previews (Slack, X, LinkedIn…) see the right page without
running JavaScript. Unknown URLs return a real `404`.

| Variable       | Description                                                                                                                     |
|----------------|---------------------------------------------------------------------------------------------------------------------------------|
| `SITE_URL`     | Public URL, e.g. `https://docs.acme.com`. Enables canonical URLs, `og:url` and `/sitemap.xml`                                   |
| `OG_IMAGE_URL` | Image shown in link previews, ideally 1200×630 PNG or JPEG, e.g. `/content/_assets/og-image.png`. Relative URLs need `SITE_URL` |

tidydoc also serves:

- `/sitemap.xml`: every page except the hidden ones (requires `SITE_URL`),
- `/robots.txt`: allows everything and points to the sitemap,
- `/llms.txt`: the list of pages with a link to their raw Markdown, for LLMs and AI agents.

## Features

| Variable               | Default | Description                                                  |
|------------------------|---------|--------------------------------------------------------------|
| `ENABLE_SEARCH`        | `true`  | Search box and `⌘K` shortcut                                 |
| `ENABLE_COPY_MARKDOWN` | `true`  | "Copy Markdown" and "Open" buttons on each page              |
| `WATCH_POLL_INTERVAL`  |         | Poll the folder every N seconds instead of using file events |

## Analytics

tidydoc can send page views to [PostHog](https://posthog.com). It is off by default: without `POSTHOG_KEY`, the PostHog
library is not even downloaded and nothing leaves the browser.

| Variable       | Default                    | Description                                                                                               |
|----------------|----------------------------|-----------------------------------------------------------------------------------------------------------|
| `POSTHOG_KEY`  |                            | Project API key (`phc_…`), found in your PostHog project settings. It is public by design                 |
| `POSTHOG_HOST` | `https://us.i.posthog.com` | Use `https://us.i.posthog.com` for the US cloud, or the URL of your reverse proxy or self-hosted instance |

```bash
POSTHOG_KEY=phc_xxxxxxxxxxxxxxxx
POSTHOG_HOST=https://eu.i.posthog.com
```

tidydoc sends:

- `$pageview` on every page change, and `$pageleave`,
- `docs_search` when the search dialog closes: `query`, `results_count` and the `selected` page (or `null`),
- `docs_copy_markdown` and `docs_open` (`target`: `markdown`, `chatgpt` or `claude`), with the page `route`.

Autocapture and session replay follow the settings of your PostHog project.

::: warning
PostHog stores an identifier in a cookie and in `localStorage`. Depending on where your visitors are (GDPR in the EU),
you may need their consent: that is up to you as the operator of the site.
:::
