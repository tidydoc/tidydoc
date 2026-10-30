import { describe, expect, it } from 'vitest'
import { buildSite, type NavFolder } from '@/content/nav'

const site = buildSite({
  files: [
    { path: 'index.md', raw: '---\ntitle: Welcome\n---\nHello' },
    { path: 'changelog.md', raw: '# Changelog\n\nNews' },
    { path: '02-guides/b.md', raw: '# B' },
    { path: '02-guides/a.md', raw: '# A' },
    { path: '02-guides/first.md', raw: '---\norder: 0\n---\n# First' },
    { path: '02-guides/secret.md', raw: '---\nhidden: true\n---\n# Secret' },
    { path: '02-guides/advanced/index.md', raw: '# Advanced' },
    { path: '02-guides/advanced/01-z.md', raw: '# Z' },
    { path: '01-start/_meta.json', raw: '{ "title": "Get started", "icon": "mdi-rocket" }' },
    { path: '01-start/install.md', raw: 'No heading' },
    { path: 'empty/_meta.json', raw: '{}' },
  ],
})

describe('buildSite', () => {
  it('indexes every page by route, hidden ones included', () => {
    expect([...site.pages.keys()].sort()).toEqual([
      '/', '/changelog', '/guides/a', '/guides/advanced', '/guides/advanced/z', '/guides/b', '/guides/first', '/guides/secret', '/start/install',
    ])
  })

  it('derives titles from frontmatter, H1, then file name', () => {
    expect(site.pages.get('/')!.title).toBe('Welcome')
    expect(site.pages.get('/changelog')!.title).toBe('Changelog')
    expect(site.pages.get('/start/install')!.title).toBe('Install')
  })

  it('strips the H1 used as title from the body', () => {
    expect(site.pages.get('/changelog')!.body.trim()).toBe('News')
  })

  it('puts root files first, home page first', () => {
    expect(site.rootPages.map(item => item.page.route)).toEqual(['/', '/changelog'])
  })

  it('orders sections by prefix and applies _meta.json', () => {
    expect(site.sections.map(section => [section.title, section.icon])).toEqual([
      ['Get started', 'mdi-rocket'],
      ['Guides', undefined],
    ])
  })

  it('orders by frontmatter order, then title, and hides hidden pages', () => {
    const guides = site.sections[1]!
    expect(guides.children.map(item => item.title)).toEqual(['First', 'A', 'Advanced', 'B'])
    const advanced = guides.children[2] as NavFolder
    expect(advanced.children.map(item => item.title)).toEqual(['Advanced', 'Z'])
  })

  it('lists visible pages in navigation order', () => {
    expect(site.flat.map(page => page.route)).toEqual([
      '/', '/changelog', '/start/install', '/guides/first', '/guides/a', '/guides/advanced', '/guides/advanced/z', '/guides/b',
    ])
  })
})
