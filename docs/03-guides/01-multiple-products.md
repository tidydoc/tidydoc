---
description: One image, several documentation sites.
icon: mdi-layers-outline
---

# Multiple products

tidydoc is stateless: run one container per product, each with its own folder and colors.

```yaml title="docker-compose.yml"
services:
  docs-acme:
    image: ghcr.io/tidydoc/tidydoc:latest
    volumes: ["./acme-docs:/content:ro"]
    environment:
      SITE_TITLE: Acme
      COLOR_PRIMARY: "#6d28d9"

  docs-globex:
    image: ghcr.io/tidydoc/tidydoc:latest
    volumes: ["./globex-docs:/content:ro"]
    environment:
      SITE_TITLE: Globex
      COLOR_PRIMARY: "#059669"
```
