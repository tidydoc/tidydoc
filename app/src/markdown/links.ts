import { routeFromPath } from '@/content/slug'

const EXTERNAL = /^([a-z][a-z\d+.-]*:|\/\/)/i

/** Joins `target` to the folder of `fromFile`, both relative to the content root. */
export function resolvePath (fromFile: string, target: string) {
  const segments = target.startsWith('/') ? [] : fromFile.split('/').slice(0, -1)
  for (const part of target.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') segments.pop()
    else segments.push(part)
  }
  return segments.join('/')
}

function splitHash (href: string): [string, string] {
  const index = href.search(/[?#]/)
  return index === -1 ? [href, ''] : [href.slice(0, index), href.slice(index)]
}

export function isExternal (href: string) {
  return EXTERNAL.test(href)
}

/**
 * Rewrites a link found in `fromFile`:
 * `./install.md#setup` → `/guides/install#setup`, `./diagram.png` → `/content/guides/diagram.png`.
 */
export function rewriteHref (href: string, fromFile: string) {
  if (!href || href.startsWith('#') || isExternal(href)) return href
  const [path, hash] = splitHash(href)
  if (!path) return href

  if (/\.md$/i.test(path)) return routeFromPath(resolvePath(fromFile, path)) + hash
  if (href.startsWith('/')) return href
  const resolved = resolvePath(fromFile, path)
  if (/\.[a-z\d]+$/i.test(path)) return encodeURI(`/content/${resolved}`) + hash
  return routeFromPath(resolved) + hash
}

export function rewriteSrc (src: string, fromFile: string) {
  if (!src || src.startsWith('/') || isExternal(src)) return src
  return encodeURI(`/content/${resolvePath(fromFile, src)}`)
}
