export interface SidebarLink {
  title: string
  href: string
  icon?: string
}

export interface ThemeColors {
  primary: string
  sidebar: string
  background: string
}

export interface TidydocConfig {
  title: string
  showTitle: boolean
  description: string
  logo: string
  logoDark: string
  favicon: string
  colors: { light: ThemeColors, dark: ThemeColors }
  defaultTheme: 'system' | 'light' | 'dark'
  links: SidebarLink[]
  font: string
  search: boolean
  copyMarkdown: boolean
}

/** Environment variables exposed to the browser (see docker/entrypoint.sh). */
export const ENV_KEYS = [
  'SITE_TITLE',
  'SITE_DESCRIPTION',
  'SHOW_TITLE',
  'LOGO_URL',
  'LOGO_DARK_URL',
  'FAVICON_URL',
  'COLOR_PRIMARY',
  'COLOR_PRIMARY_DARK',
  'COLOR_SIDEBAR_BG',
  'COLOR_SIDEBAR_BG_DARK',
  'COLOR_BACKGROUND',
  'COLOR_BACKGROUND_DARK',
  'DEFAULT_THEME',
  'SIDEBAR_LINKS',
  'FONT_FAMILY',
  'ENABLE_SEARCH',
  'ENABLE_COPY_MARKDOWN',
] as const

export type RawEnv = Record<string, string | undefined>

declare global {
  interface Window {
    __TIDYDOC_ENV__?: RawEnv
  }
}

// Format: "Title|https://url|mdi-icon;Other|https://other"
export function parseLinks (value: string | undefined): SidebarLink[] {
  if (!value) return []
  return value
    .split(';')
    .map(entry => entry.split('|').map(part => part.trim()))
    .filter(([title, href]) => title && href)
    .map(([title, href, icon]) => ({ title: title!, href: href!, icon: icon || undefined }))
}

function bool (value: string | undefined, fallback: boolean) {
  if (value === undefined || value === '') return fallback
  return !['false', '0', 'no', 'off'].includes(value.toLowerCase())
}

export function parseConfig (env: RawEnv): TidydocConfig {
  const get = (key: string, fallback: string) => env[key]?.trim() || fallback
  const theme = get('DEFAULT_THEME', 'system')

  return {
    title: get('SITE_TITLE', 'Documentation'),
    showTitle: bool(env.SHOW_TITLE, true),
    description: get('SITE_DESCRIPTION', ''),
    logo: get('LOGO_URL', ''),
    logoDark: get('LOGO_DARK_URL', get('LOGO_URL', '')),
    favicon: get('FAVICON_URL', ''),
    colors: {
      light: {
        primary: get('COLOR_PRIMARY', '#18181b'),
        sidebar: get('COLOR_SIDEBAR_BG', '#f5f5f5'),
        background: get('COLOR_BACKGROUND', '#ffffff'),
      },
      dark: {
        primary: get('COLOR_PRIMARY_DARK', get('COLOR_PRIMARY', '#fafafa')),
        sidebar: get('COLOR_SIDEBAR_BG_DARK', '#111113'),
        background: get('COLOR_BACKGROUND_DARK', '#0a0a0a'),
      },
    },
    defaultTheme: (['system', 'light', 'dark'].includes(theme) ? theme : 'system') as TidydocConfig['defaultTheme'],
    links: parseLinks(env.SIDEBAR_LINKS),
    font: get('FONT_FAMILY', 'Inter'),
    search: bool(env.ENABLE_SEARCH, true),
    copyMarkdown: bool(env.ENABLE_COPY_MARKDOWN, true),
  }
}

export const config = parseConfig(typeof window === 'undefined' ? {} : window.__TIDYDOC_ENV__ ?? {})
