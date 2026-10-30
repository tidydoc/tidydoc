import { describe, expect, it } from 'vitest'
import { buildSite } from '@/content/nav'
import { searchSite } from '@/search'

const site = buildSite({
  files: [
    { path: 'index.md', raw: '# Home\n\nWelcome' },
    { path: 'guides/webhooks.md', raw: '# Webhooks\n\nIntro\n\n## Verify signatures\n\nCheck the HMAC header of each request.' },
    { path: 'guides/secret.md', raw: '---\nhidden: true\n---\n# Secret HMAC' },
  ],
})

describe('searchSite', () => {
  it('finds sections and links to their anchor', () => {
    const [first] = searchSite(site, 'hmac')
    expect(first).toMatchObject({ id: '/guides/webhooks#verify-signatures', title: 'Webhooks', heading: 'Verify signatures' })
    expect(first!.excerpt).toContain('HMAC')
  })

  it('matches prefixes and typos', () => {
    expect(searchSite(site, 'webho')[0]?.title).toBe('Webhooks')
    expect(searchSite(site, 'signaturs')[0]?.heading).toBe('Verify signatures')
  })

  it('skips hidden pages', () => {
    expect(searchSite(site, 'secret')).toEqual([])
  })
})
