import { parse } from 'yaml'

export interface Frontmatter {
  title?: string
  description?: string
  order?: number
  icon?: string
  hidden?: boolean
  [key: string]: unknown
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/

export function parseFrontmatter (raw: string): { data: Frontmatter, body: string } {
  const match = raw.match(FRONTMATTER)
  if (!match) return { data: {}, body: raw }

  let data: Frontmatter = {}
  try {
    const parsed = parse(match[1]!)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) data = parsed
  } catch (error) {
    console.warn('[tidydoc] invalid frontmatter', error)
  }
  return { data, body: raw.slice(match[0].length) }
}

/** First `# Heading` of the document, ignoring fenced code. */
export function firstH1 (body: string): string | undefined {
  let inFence = false
  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (inFence) continue
    const match = line.match(/^#\s+(.+?)\s*#*\s*$/)
    if (match) return match[1]
  }
  return undefined
}

/** Removes a leading H1: the page header already displays the title. */
export function stripLeadingH1 (body: string) {
  return body.replace(/^\s*#\s+.+\r?\n?/, '')
}
