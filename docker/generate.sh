#!/bin/sh
# Builds content.json (every markdown file + _meta.json, raw), the /_md/<route>.md
# symlinks used to serve raw markdown, and the SEO files of seo.jq (/_pages/<route>.html,
# index.html, sitemap.xml, robots.txt, llms.txt).
# Swapped in atomically so nginx never serves a partial index.
set -eu

CONTENT_DIR="${CONTENT_DIR:-/content}"
WEB_ROOT="${WEB_ROOT:-/usr/share/nginx/html}"

# Keep in sync with routeFromPath() in app/src/content/slug.ts.
slugify() {
  printf '%s' "$1" \
    | sed -E 's/\.[mM][dD]$//; s#(^|/)[0-9]+[-_]#\1#g; s#[[:space:]]+#-#g' \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's#(^|/)index$##'
}

list_files() {
  find "$CONTENT_DIR" -mindepth 1 -name '.*' -prune -o -type f \( -iname '*.md' -o -name '_meta.json' \) -print | sort
}

tmp=$(mktemp -d "$WEB_ROOT/.tidydoc.XXXXXX")
trap 'rm -rf "$tmp"' EXIT
mkdir "$tmp/_md"

list_files | while IFS= read -r file; do
  path=${file#"$CONTENT_DIR"/}
  jq -n --arg path "$path" --rawfile raw "$file" '{ path: $path, raw: $raw }'

  case "$path" in
    *.md|*.MD|*.Md|*.mD)
      name=$(slugify "$path")
      name=${name:-index}
      mkdir -p "$tmp/_md/$(dirname "$name")"
      ln -sf "$file" "$tmp/_md/$name.md"
      ;;
  esac
done | jq -cs '{ files: . }' > "$tmp/content.json"

mkdir "$tmp/_pages"
jq -r --rawfile template "$WEB_ROOT/index.template.html" -f "$(dirname "$0")/seo.jq" "$tmp/content.json" \
  | while IFS="$(printf '\t')" read -r path data; do
      mkdir -p "$tmp/$(dirname "$path")"
      printf '%s' "$data" | base64 -d > "$tmp/$path"
    done

chmod 644 "$tmp/content.json"
mv "$tmp/content.json" "$WEB_ROOT/content.json"
rm -rf "$WEB_ROOT/_md"
mv "$tmp/_md" "$WEB_ROOT/_md"
rm -rf "$WEB_ROOT/_pages"
mv "$tmp/_pages" "$WEB_ROOT/_pages"
# sitemap.xml only exists when SITE_URL is set.
for file in index.html sitemap.xml robots.txt llms.txt; do
  if [ -f "$tmp/$file" ]; then
    chmod 644 "$tmp/$file"
    mv "$tmp/$file" "$WEB_ROOT/$file"
  else
    rm -f "$WEB_ROOT/$file"
  fi
done

echo "[tidydoc] indexed $(jq '.files | length' "$WEB_ROOT/content.json") files from $CONTENT_DIR"
