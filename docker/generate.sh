#!/bin/sh
# Builds content.json (every markdown file + _meta.json, raw) and the /_md/<route>.md
# symlinks used to serve raw markdown. Swapped in atomically so nginx never serves a partial index.
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

chmod 644 "$tmp/content.json"
mv "$tmp/content.json" "$WEB_ROOT/content.json"
rm -rf "$WEB_ROOT/_md"
mv "$tmp/_md" "$WEB_ROOT/_md"

echo "[tidydoc] indexed $(jq '.files | length' "$WEB_ROOT/content.json") files from $CONTENT_DIR"
