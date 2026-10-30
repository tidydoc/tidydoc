import MarkdownIt, { type Env, type Token } from 'markdown-it'
import anchor from 'markdown-it-anchor'
import { slugifyHeading } from '@/content/slug'
import { containers } from './containers'
import { highlight } from './highlight'
import { isExternal, rewriteHref, rewriteSrc } from './links'

export interface Heading {
  id: string
  text: string
  level: number
}

export interface RenderEnv extends Env {
  /** Source file, relative to the content root. Used to resolve relative links. */
  path: string
}

function inlineText (token: Token | undefined) {
  return (token?.children ?? [])
    .filter(child => child.type === 'text' || child.type === 'code_inline')
    .map(child => child.content)
    .join('')
    .trim()
}

function createMarkdown () {
  const md = new MarkdownIt({ html: true, linkify: true })

  md.use(anchor, {
    slugify: slugifyHeading,
    level: [2, 3, 4],
    permalink: anchor.permalink.linkInsideHeader({ symbol: '#', placement: 'after', class: 'header-anchor' }),
  })
  md.use(containers)

  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx]!
    const [lang = '', ...rest] = token.info.trim().split(/\s+/)
    const label = rest.join(' ').replace(/^title=["']?|["']$/g, '')
    const copy = '<button type="button" class="code-block__copy" aria-label="Copy code"><i class="mdi mdi-content-copy"></i></button>'
    const header = label
      ? `<div class="code-block__header"><span>${md.utils.escapeHtml(label)}</span>${copy}</div>`
      : copy
    return `<div class="code-block${label ? ' code-block--titled' : ''}">${header}${highlight(token.content.replace(/\n$/, ''), lang.toLowerCase())}</div>\n`
  }

  const defaultLinkOpen = md.renderer.rules.link_open ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]!
    const href = String(token.attrGet('href') ?? '')
    if (isExternal(href) && /^https?:/i.test(href)) {
      token.attrSet('target', '_blank')
      token.attrSet('rel', 'noopener')
    } else {
      token.attrSet('href', rewriteHref(href, (env as RenderEnv).path))
    }
    return defaultLinkOpen(tokens, idx, options, env, self)
  }

  const defaultImage = md.renderer.rules.image!
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]!
    token.attrSet('src', rewriteSrc(String(token.attrGet('src') ?? ''), (env as RenderEnv).path))
    token.attrSet('loading', 'lazy')
    return defaultImage(tokens, idx, options, env, self)
  }

  md.renderer.rules.table_open = () => '<div class="table-wrapper"><table>\n'
  md.renderer.rules.table_close = () => '</table></div>\n'

  return md
}

export const md = createMarkdown()

export function collectHeadings (tokens: Token[], levels = [2, 3]): Heading[] {
  const headings: Heading[] = []
  tokens.forEach((token, i) => {
    const level = Number(token.tag.slice(1))
    if (token.type !== 'heading_open' || !levels.includes(level)) return
    headings.push({ id: String(token.attrGet('id') ?? ''), text: inlineText(tokens[i + 1]), level })
  })
  return headings
}

export function renderMarkdown (source: string, env: RenderEnv) {
  const tokens = md.parse(source, env)
  return { html: md.renderer.render(tokens, md.options, env), headings: collectHeadings(tokens) }
}

export interface Section {
  id: string
  heading: string
  text: string
}

/** Splits a document into heading sections of plain text, for the search index. */
export function extractSections (source: string, env: RenderEnv): Section[] {
  const tokens = md.parse(source, env)
  const sections: Section[] = [{ id: '', heading: '', text: '' }]
  tokens.forEach((token, i) => {
    if (token.type === 'heading_open' && ['h2', 'h3'].includes(token.tag)) {
      sections.push({ id: String(token.attrGet('id') ?? ''), heading: inlineText(tokens[i + 1]), text: '' })
    } else if (token.type === 'inline' && tokens[i - 1]?.type !== 'heading_open') {
      sections.at(-1)!.text += inlineText(token) + ' '
    } else if (token.type === 'fence' || token.type === 'code_block') {
      sections.at(-1)!.text += token.content + ' '
    }
  })
  return sections.filter(section => section.heading || section.text.trim())
}
