---
description: Ship an image that already contains your docs.
---

# Bake the content into an image

Instead of mounting a volume, you can build your own image:

```dockerfile title="Dockerfile"
FROM ghcr.io/tidydoc/tidydoc:latest
COPY docs /content
```

This is useful for platforms without volumes, like Cloud Run or Fly.io.
