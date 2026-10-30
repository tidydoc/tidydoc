---
description: Serve your docs on docs.your-saas.com with HTTPS.
---

# Reverse proxy

tidydoc listens on port `80` inside the container. Put it behind your usual reverse proxy.

::: tabs
@tab Caddy

```text title="Caddyfile"
docs.acme.com {
  reverse_proxy docs:80
}
```

@tab Traefik

```yaml
services:
  docs:
    image: ghcr.io/tidydoc/tidydoc:latest
    labels:
      - traefik.http.routers.docs.rule=Host(`docs.acme.com`)
      - traefik.http.routers.docs.tls.certresolver=letsencrypt
```

@tab nginx

```nginx
server {
  server_name docs.acme.com;
  location / {
    proxy_pass http://docs:80;
  }
}
```
:::

::: warning Sub-paths
tidydoc must be served at the root of a domain (`docs.acme.com`), not under a path (`acme.com/docs`).
:::
