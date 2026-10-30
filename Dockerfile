FROM node:24-alpine AS build
WORKDIR /app
COPY app/package.json app/package-lock.json ./
RUN npm ci
COPY app/ ./
RUN npm run build && mv dist/index.html dist/index.template.html

FROM nginx:stable-alpine
RUN apk add --no-cache jq inotify-tools \
 && rm -rf /usr/share/nginx/html/*
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh docker/generate.sh docker/seo.jq /usr/local/bin/
COPY --from=build /app/dist /usr/share/nginx/html
# Demo content, replaced by your own folder when mounted on /content.
COPY docs /content

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1/content.json || exit 1
ENTRYPOINT ["entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
