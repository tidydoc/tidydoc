---
description: Run tidydoc with Docker in less than a minute.
icon: mdi-download-outline
---

# Installation

## Requirements

You only need [Docker](https://docs.docker.com/get-docker/). tidydoc ships as a small image (nginx + a shell script) that works on `amd64` and `arm64`.

## With docker run

```bash
docker run --rm -p 8080:80 \
  -v "$(pwd)/docs:/content:ro" \
  -e SITE_TITLE="Acme" \
  ghcr.io/tidydoc/tidydoc:latest
```

## With Docker Compose

This is the recommended setup: see [Docker Compose](./02-docker-compose.md).

## Your first page

Create a `docs/index.md` file:

```markdown
---
title: Welcome to Acme
description: Everything you need to integrate Acme.
---

## Getting started

Hello world!
```

The `index.md` file at the root of the folder is your home page.
