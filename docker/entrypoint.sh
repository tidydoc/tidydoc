#!/bin/sh
set -eu

CONTENT_DIR="${CONTENT_DIR:-/content}"
WEB_ROOT="${WEB_ROOT:-/usr/share/nginx/html}"
export CONTENT_DIR WEB_ROOT

# Keep in sync with ENV_KEYS in app/src/config.ts.
ENV_KEYS='SITE_TITLE SITE_DESCRIPTION SHOW_TITLE LOGO_URL LOGO_DARK_URL FAVICON_URL
COLOR_PRIMARY COLOR_PRIMARY_DARK COLOR_SIDEBAR_BG COLOR_SIDEBAR_BG_DARK COLOR_BACKGROUND COLOR_BACKGROUND_DARK
DEFAULT_THEME SIDEBAR_LINKS FONT_FAMILY ENABLE_SEARCH ENABLE_COPY_MARKDOWN'

write_config() {
  # shellcheck disable=SC2086
  keys=$(printf '%s\n' $ENV_KEYS | jq -R . | jq -cs .)
  {
    printf 'window.__TIDYDOC_ENV__ = '
    jq -n --argjson keys "$keys" 'env | with_entries(select(.key as $key | $keys | index($key)))'
  } > "$WEB_ROOT/config.js"
}

html_escape() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'
}

sed_escape() {
  printf '%s' "$1" | sed -e 's/[\\|&]/\\&/g'
}

# Title, description and favicon must be in the HTML itself for link previews.
write_index() {
  title=$(sed_escape "$(html_escape "${SITE_TITLE:-Documentation}")")
  description=$(sed_escape "$(html_escape "${SITE_DESCRIPTION:-}")")
  favicon=$(sed_escape "$(html_escape "${FAVICON_URL:-/favicon.svg}")")
  sed -E \
    -e "s|<title>[^<]*</title>|<title>$title</title>|" \
    -e "s|<meta name=\"description\" content=\"[^\"]*\"|<meta name=\"description\" content=\"$description\"|" \
    -e "s|<link rel=\"icon\" href=\"[^\"]*\"|<link rel=\"icon\" href=\"$favicon\"|" \
    "$WEB_ROOT/index.template.html" > "$WEB_ROOT/index.html"
}

watch_content() {
  if [ "${WATCH:-true}" = "false" ]; then
    return
  fi

  if [ -n "${WATCH_POLL_INTERVAL:-}" ]; then
    echo "[tidydoc] polling $CONTENT_DIR every ${WATCH_POLL_INTERVAL}s"
    fingerprint() {
      find "$CONTENT_DIR" -type f \( -iname '*.md' -o -name '_meta.json' \) -exec stat -c '%n %Y %s' {} + 2>/dev/null | sort | md5sum
    }
    last=$(fingerprint)
    while sleep "$WATCH_POLL_INTERVAL"; do
      current=$(fingerprint)
      if [ "$current" != "$last" ]; then
        last=$current
        generate.sh || true
      fi
    done
  else
    echo "[tidydoc] watching $CONTENT_DIR for changes"
    inotifywait -mqr -e close_write,create,delete,move --format '%w%f' "$CONTENT_DIR" | while IFS= read -r _; do
      # Wait for the burst of events (git pull, editor save) to settle.
      while IFS= read -r -t 1 _; do :; done
      generate.sh || true
    done
  fi
}

if [ ! -d "$CONTENT_DIR" ]; then
  echo "[tidydoc] $CONTENT_DIR does not exist: mount your markdown folder there" >&2
  mkdir -p "$CONTENT_DIR"
fi

write_config
write_index
generate.sh
watch_content &

exec "$@"
