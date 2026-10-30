import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { config, type ThemeColors } from '@/config'

export const THEME_STORAGE_KEY = 'tidydoc-theme'

function storedTheme () {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' || value === 'system' ? value : undefined
  } catch {
    return undefined
  }
}

function colors (theme: ThemeColors) {
  return {
    primary: theme.primary,
    background: theme.background,
    surface: theme.background,
    sidebar: theme.sidebar,
  }
}

export default createVuetify({
  theme: {
    defaultTheme: storedTheme() ?? config.defaultTheme,
    themes: {
      light: { dark: false, colors: colors(config.colors.light) },
      dark: { dark: true, colors: colors(config.colors.dark) },
    },
  },
  defaults: {
    VBtn: { rounded: 'lg' },
    VListItem: { rounded: 'lg' },
  },
})
