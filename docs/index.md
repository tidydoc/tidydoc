---
title: Welcome to tidydoc
description: A documentation site for your SaaS, from a folder of Markdown files and a single Docker container.
---

## What is tidydoc?

tidydoc turns a folder of Markdown files into a clean documentation website. There is no build step, no database and no config file: mount your folder in a container, set a few environment variables for your brand colors, and you are done.

It is designed to be reused across several products: the same image, a different folder and different colors.

## Key features

::: cards
- [Zero config](/getting-started/installation) Mount a folder of `.md` files, that's it. Navigation is built from your folders.
- [Your brand](/getting-started/configuration) Logo, colors, links and font are set with environment variables.
- [Full-text search](/writing/markdown) Instant client-side search, available with `⌘K`.
- [Dark mode](/getting-started/configuration#theme) Follows the system preference, with a manual toggle.
- [Rich content](/writing/components) Callouts, cards, tabs and syntax highlighting for 200+ languages.
- [LLM friendly](/writing/structure#raw-markdown) Every page is also available as raw Markdown by adding `.md` to its URL.
:::

## Quick start

```yaml title="docker-compose.yml"
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
```

Then open [http://localhost:8080](http://localhost:8080).

::: tip Live reload
Files are watched: edit a Markdown file, refresh the page, and the change is there.
:::
