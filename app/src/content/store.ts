import { shallowRef } from 'vue'
import { collectLanguages, initHighlighter } from '@/markdown/highlight'
import { buildSite, type ContentBundle, type Site } from './nav'

export const site = shallowRef<Site>()
export const loadError = shallowRef<string>()

export async function loadContent () {
  try {
    const response = await fetch('/content.json', { cache: 'no-cache' })
    if (!response.ok) throw new Error(`GET /content.json → ${response.status}`)
    const bundle: ContentBundle = await response.json()
    await initHighlighter(collectLanguages(bundle.files.map(file => file.raw)))
    site.value = buildSite(bundle)
  } catch (error) {
    console.error('[tidydoc]', error)
    loadError.value = error instanceof Error ? error.message : String(error)
  }
}
