---
description: Add your documentation next to your other services.
icon: mdi-docker
---

# Docker Compose

```yaml title="docker-compose.yml"
services:
  docs:
    image: ghcr.io/tidydoc/tidydoc:latest
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./docs:/content:ro
    environment:
      SITE_TITLE: Acme
      SITE_DESCRIPTION: Developer documentation for Acme
      LOGO_URL: /content/_assets/logo.svg
      COLOR_PRIMARY: "#6d28d9"
      SIDEBAR_LINKS: "Website|https://acme.com|mdi-web;GitHub|https://github.com/acme|mdi-github"
```

## Volume

The folder must be mounted on `/content`. Read-only (`:ro`) is enough: tidydoc never writes into it.

## Live reload

tidydoc watches the folder and rebuilds its index when a file changes. Refresh the page to see the change.

::: warning Docker Desktop on macOS / Windows
File events are not always forwarded through bind mounts. If new pages don't show up, enable polling:

```yaml
environment:
  WATCH_POLL_INTERVAL: 5 # seconds
```
:::
