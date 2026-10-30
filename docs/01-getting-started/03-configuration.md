---
description: Everything is configured with environment variables.
icon: mdi-tune-variant
---

# Configuration

All settings are optional. They are read when the container starts.

## Site

| Variable | Default | Description |
| --- | --- | --- |
| `SITE_TITLE` | `Documentation` | Name shown in the sidebar and in the browser tab |
| `SITE_DESCRIPTION` | | Meta description, used in link previews |
| `SHOW_TITLE` | `true` | Show the title next to the logo |
| `LOGO_URL` | | Logo URL, e.g. `/content/_assets/logo.svg` |
| `LOGO_DARK_URL` | `LOGO_URL` | Logo used in dark mode |
| `FAVICON_URL` | tidydoc icon | Favicon URL |
| `SIDEBAR_LINKS` | | External links at the top of the sidebar |
| `FONT_FAMILY` | `Inter` | Any [Google Font](https://fonts.google.com), or `system` |

## Colors

| Variable | Default (light) | Variable | Default (dark) |
| --- | --- | --- | --- |
| `COLOR_PRIMARY` | `#18181b` | `COLOR_PRIMARY_DARK` | `COLOR_PRIMARY` or `#fafafa` |
| `COLOR_SIDEBAR_BG` | `#f5f5f5` | `COLOR_SIDEBAR_BG_DARK` | `#111113` |
| `COLOR_BACKGROUND` | `#ffffff` | `COLOR_BACKGROUND_DARK` | `#0a0a0a` |

The primary color is used for links, the active page and the table of contents.

## Theme

`DEFAULT_THEME` accepts `system` (default), `light` or `dark`. Visitors can switch theme from the bottom of the sidebar; their choice is remembered.

## Sidebar links

`SIDEBAR_LINKS` is a list of `Title|URL|icon` separated by `;`. The icon is optional and can be any [Material Design Icon](https://pictogrammers.com/library/mdi/) prefixed with `mdi-`.

```bash
SIDEBAR_LINKS="Website|https://acme.com|mdi-web;Dashboard|https://app.acme.com|mdi-view-dashboard-outline"
```

## Features

| Variable | Default | Description |
| --- | --- | --- |
| `ENABLE_SEARCH` | `true` | Search box and `⌘K` shortcut |
| `ENABLE_COPY_MARKDOWN` | `true` | "Copy Markdown" and "Open" buttons on each page |
| `WATCH_POLL_INTERVAL` | | Poll the folder every N seconds instead of using file events |
