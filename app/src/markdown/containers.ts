import type { MarkdownIt } from 'markdown-it'
import container from 'markdown-it-container'

const CALLOUTS: Record<string, string> = {
  note: 'mdi-information-outline',
  info: 'mdi-information-outline',
  tip: 'mdi-lightbulb-on-outline',
  warning: 'mdi-alert-outline',
  danger: 'mdi-alert-octagon-outline',
}

function params (info: string, name: string) {
  return info.trim().slice(name.length).trim()
}

/**
 * Callouts:  ::: tip Optional title
 * Cards:     ::: cards [columns]   wrapping a bullet list of `[Title](link) description`
 * Tabs:      ::: tabs              with `@tab Name` paragraphs splitting the panels
 */
export function containers (md: MarkdownIt) {
  const escape = md.utils.escapeHtml

  for (const [name, icon] of Object.entries(CALLOUTS)) {
    md.use(container, name, {
      render (tokens: any[], idx: number) {
        const token = tokens[idx]
        if (token.nesting !== 1) return '</div></div>\n'
        const title = params(token.info, name)
        return `<div class="callout callout--${name}"><i class="callout__icon mdi ${icon}" aria-hidden="true"></i><div class="callout__body">`
          + (title ? `<p class="callout__title">${escape(title)}</p>\n` : '\n')
      },
    })
  }

  md.use(container, 'cards', {
    render (tokens: any[], idx: number) {
      const token = tokens[idx]
      if (token.nesting !== 1) return '</div>\n'
      const columns = Number.parseInt(params(token.info, 'cards'), 10)
      return columns > 0 ? `<div class="cards" style="--cards-columns: ${columns}">\n` : '<div class="cards">\n'
    },
  })

  md.use(container, 'tabs', {
    render (tokens: any[], idx: number) {
      const token = tokens[idx]
      if (token.nesting !== 1) return (token.meta?.hasPanels ? '</div>' : '') + '</div>\n'
      const tabs: string[] = token.meta?.tabs ?? []
      const buttons = tabs.map((tab, i) =>
        `<button type="button" role="tab" class="tabs__tab${i === 0 ? ' is-active' : ''}" data-tab="${i}">${escape(tab)}</button>`,
      ).join('')
      return `<div class="tabs"><div class="tabs__list" role="tablist">${buttons}</div>\n`
    },
  })

  // Turns `@tab Name` paragraphs into panel boundaries, once block tokens exist.
  md.core.ruler.after('block', 'tidydoc_tabs', state => {
    const tokens = state.tokens
    const stack: any[] = []
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!
      if (token.type === 'container_tabs_open') {
        token.meta = { tabs: [] }
        stack.push(token)
        continue
      }
      if (token.type === 'container_tabs_close') {
        token.meta = { hasPanels: stack.pop()?.meta.tabs.length > 0 }
        continue
      }
      const current = stack.at(-1)
      if (!current || token.type !== 'paragraph_open' || token.level !== current.level + 1) continue

      const match = tokens[i + 1]?.content.match(/^@tab\s+(.+)$/)
      if (!match) continue

      const index = current.meta.tabs.push(match[1].trim()) - 1
      const html = new state.Token('html_block', '', 0)
      html.content = `${index > 0 ? '</div>' : ''}<div class="tabs__panel${index === 0 ? ' is-active' : ''}" data-tab="${index}">\n`
      tokens.splice(i, 3, html)
    }
  })
}
