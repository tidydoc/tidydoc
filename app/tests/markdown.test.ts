import { describe, expect, it } from 'vitest'
import { extractSections, renderMarkdown } from '@/markdown'
import { rewriteHref, rewriteSrc } from '@/markdown/links'

describe('links', () => {
  it('turns relative .md links into routes', () => {
    expect(rewriteHref('./02-config.md#env', 'guides/01-install.md')).toBe('/guides/config#env')
    expect(rewriteHref('../index.md', 'guides/01-install.md')).toBe('/')
    expect(rewriteHref('/01-start/install.md', 'guides/a.md')).toBe('/start/install')
  })

  it('keeps external, absolute and anchor links', () => {
    expect(rewriteHref('https://acme.com', 'a.md')).toBe('https://acme.com')
    expect(rewriteHref('/guides/a', 'a.md')).toBe('/guides/a')
    expect(rewriteHref('#top', 'a.md')).toBe('#top')
  })

  it('serves relative assets from /content', () => {
    expect(rewriteHref('./file.pdf', 'guides/a.md')).toBe('/content/guides/file.pdf')
    expect(rewriteSrc('../_assets/my logo.png', 'guides/a.md')).toBe('/content/_assets/my%20logo.png')
  })
})

describe('renderMarkdown', () => {
  it('collects h2/h3 headings with ids', () => {
    const { headings } = renderMarkdown('## Hello `world`\n\n### Sub section\n\n#### Ignored', { path: 'a.md' })
    expect(headings).toEqual([
      { id: 'hello-world', text: 'Hello world', level: 2 },
      { id: 'sub-section', text: 'Sub section', level: 3 },
    ])
  })

  it('renders callouts', () => {
    const { html } = renderMarkdown('::: warning Careful\nText\n:::', { path: 'a.md' })
    expect(html).toContain('callout--warning')
    expect(html).toContain('<p class="callout__title">Careful</p>')
  })

  it('renders cards with a column count', () => {
    const { html } = renderMarkdown('::: cards 3\n- [A](./a.md) desc\n:::', { path: 'x/b.md' })
    expect(html).toContain('--cards-columns: 3')
    expect(html).toContain('href="/x/a"')
  })

  it('renders tabs', () => {
    const { html } = renderMarkdown('::: tabs\n@tab npm\n\nnpm i\n\n@tab pnpm\n\npnpm add\n:::', { path: 'a.md' })
    expect(html).toContain('data-tab="0">npm</button>')
    expect(html).toContain('data-tab="1">pnpm</button>')
    expect(html.match(/tabs__panel/g)).toHaveLength(2)
    expect(html).not.toContain('@tab')
  })

  it('wraps code blocks with a title', () => {
    const { html } = renderMarkdown('```ts title="a.ts"\nconst a = 1\n```', { path: 'a.md' })
    expect(html).toContain('<span>a.ts</span>')
    expect(html).toContain('const a = 1')
  })

  it('opens external links in a new tab', () => {
    const { html } = renderMarkdown('[x](https://acme.com)', { path: 'a.md' })
    expect(html).toContain('target="_blank"')
  })
})

describe('extractSections', () => {
  it('splits text by heading', () => {
    const sections = extractSections('Intro text\n\n## Install\n\nRun it\n\n```bash\nnpm i\n```', { path: 'a.md' })
    expect(sections.map(section => [section.id, section.heading])).toEqual([['', ''], ['install', 'Install']])
    expect(sections[1]!.text).toContain('npm i')
  })
})
