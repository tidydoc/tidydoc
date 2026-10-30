// Must stay in sync with slugify() in docker/generate.sh (used for raw .md symlinks).
const ORDER_PREFIX = /^(\d+)[-_]/

export function stripOrderPrefix (segment: string) {
  return segment.replace(ORDER_PREFIX, '')
}

export function orderPrefix (segment: string): number | undefined {
  const match = segment.match(ORDER_PREFIX)
  return match ? Number(match[1]) : undefined
}

function slugSegment (segment: string) {
  return stripOrderPrefix(segment).toLowerCase().replace(/\s+/g, '-')
}

/** `guides/01-Getting Started.md` → `/guides/getting-started`, `guides/index.md` → `/guides` */
export function routeFromPath (path: string) {
  const segments = path.replace(/\.md$/i, '').split('/').filter(Boolean).map(slugSegment)
  if (segments.at(-1) === 'index') segments.pop()
  return '/' + segments.join('/')
}

/** URL serving the raw markdown of a route (see nginx.conf). */
export function rawUrl (route: string) {
  return route === '/' ? '/index.md' : `${route}.md`
}

export function humanize (segment: string) {
  const text = stripOrderPrefix(segment.replace(/\.md$/i, '')).replace(/[-_]+/g, ' ').trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Heading anchor ids, shared by the renderer and the search index. */
export function slugifyHeading (text: string) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
