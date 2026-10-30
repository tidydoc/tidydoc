import MiniSearch from 'minisearch'
import type { Site } from '@/content/nav'
import { extractSections } from '@/markdown'

interface SearchDoc {
  id: string
  route: string
  title: string
  heading: string
  text: string
}

export interface SearchResult {
  id: string
  title: string
  heading: string
  excerpt: string
}

let cache: { site: Site, index: MiniSearch<SearchDoc> } | undefined

function buildIndex (site: Site) {
  const index = new MiniSearch<SearchDoc>({
    fields: ['title', 'heading', 'text'],
    storeFields: ['title', 'heading', 'text'],
    searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 4, heading: 2 } },
  })
  for (const page of site.pages.values()) {
    if (page.hidden) continue
    index.addAll(extractSections(page.body, { path: page.path }).map(section => ({
      id: section.id ? `${page.route}#${section.id}` : page.route,
      route: page.route,
      title: page.title,
      heading: section.heading,
      text: section.text.replace(/\s+/g, ' ').trim(),
    })))
  }
  return index
}

function excerpt (text: string, terms: string[], length = 140) {
  const lower = text.toLowerCase()
  const position = Math.min(...terms.map(term => lower.indexOf(term)).filter(index => index >= 0), Number.POSITIVE_INFINITY)
  if (!Number.isFinite(position) || position < length / 2) return text.slice(0, length) + (text.length > length ? '…' : '')
  const start = position - Math.floor(length / 3)
  return '…' + text.slice(start, start + length) + (start + length < text.length ? '…' : '')
}

export function searchSite (site: Site, query: string, limit = 12): SearchResult[] {
  if (cache?.site !== site) cache = { site, index: buildIndex(site) }
  return cache.index.search(query).slice(0, limit).map(result => ({
    id: result.id,
    title: result.title,
    heading: result.heading,
    excerpt: excerpt(result.text, result.terms),
  }))
}
