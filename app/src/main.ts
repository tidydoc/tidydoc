import '@fontsource-variable/inter'
import './styles/main.css'
import './styles/prose.css'
import { createApp } from 'vue'
import App from './App.vue'
import { config } from './config'
import { loadContent } from './content/store'
import vuetify from './plugins/vuetify'
import router from './router'

function applyFont (font: string) {
  if (font && font !== 'Inter' && font !== 'system') {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700&display=swap`
    document.head.append(link)
  }
  const family = font === 'Inter' ? '"Inter Variable"' : font === 'system' ? 'system-ui' : `"${font}"`
  document.documentElement.style.setProperty('--v-font-body', `${family}, system-ui, -apple-system, sans-serif`)
}

applyFont(config.font)
document.title = config.title
if (config.favicon) document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href', config.favicon)

await loadContent()

createApp(App).use(vuetify).use(router).mount('#app')
