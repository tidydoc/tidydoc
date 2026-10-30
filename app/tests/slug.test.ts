import { describe, expect, it } from 'vitest'
import { humanize, rawUrl, routeFromPath, slugifyHeading } from '@/content/slug'

describe('routeFromPath', () => {
  it.each([
    ['index.md', '/'],
    ['changelog.md', '/changelog'],
    ['01-getting-started/01-installation.md', '/getting-started/installation'],
    ['guides/index.md', '/guides'],
    ['02_Guides/My Page.md', '/guides/my-page'],
  ])('%s → %s', (path, route) => {
    expect(routeFromPath(path)).toBe(route)
  })
})

describe('rawUrl', () => {
  it('maps the home page to /index.md', () => expect(rawUrl('/')).toBe('/index.md'))
  it('appends .md', () => expect(rawUrl('/guides/install')).toBe('/guides/install.md'))
})

describe('humanize', () => {
  it('removes the order prefix and dashes', () => expect(humanize('01-getting-started')).toBe('Getting started'))
  it('removes the extension', () => expect(humanize('api_keys.md')).toBe('Api keys'))
})

describe('slugifyHeading', () => {
  it('handles accents and punctuation', () => expect(slugifyHeading('Où est l’API ? (v2)')).toBe('ou-est-lapi-v2'))
})
