import type { HighlighterCore } from 'shiki/core'

let highlighter: HighlighterCore | undefined

const FENCE_LANG = /^\s*(?:```|~~~)\s*([\w+#-]+)/gm

export function collectLanguages (sources: string[]) {
  const langs = new Set<string>()
  for (const source of sources) {
    for (const match of source.matchAll(FENCE_LANG)) langs.add(match[1]!.toLowerCase())
  }
  return [...langs]
}

/** Loads Shiki and only the grammars used by the content, so the bundle stays small. */
export async function initHighlighter (langs: string[]) {
  const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, { bundledLanguages }, { bundledThemes }] = await Promise.all([
    import('shiki/core'),
    import('shiki/engine/javascript'),
    import('shiki/langs'),
    import('shiki/themes'),
  ])

  highlighter ??= await createHighlighterCore({
    themes: [bundledThemes['github-light'](), bundledThemes['github-dark-dimmed']()],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  })

  const known = langs.filter((lang): lang is keyof typeof bundledLanguages => lang in bundledLanguages)
  await Promise.all(known.map(lang => highlighter!.loadLanguage(bundledLanguages[lang]).catch(error => {
    console.warn(`[tidydoc] could not load language "${lang}"`, error)
  })))
}

function escapeHtml (code: string) {
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlight (code: string, lang: string) {
  if (highlighter && lang && highlighter.getLoadedLanguages().includes(lang)) {
    return highlighter.codeToHtml(code, {
      lang,
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
    })
  }
  return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
}
