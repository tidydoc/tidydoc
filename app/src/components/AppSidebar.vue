<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import NavTree from '@/components/NavTree.vue'
import { config } from '@/config'
import type { NavItem } from '@/content/nav'
import { site } from '@/content/store'
import { THEME_STORAGE_KEY } from '@/plugins/vuetify'

const model = defineModel<boolean>({ required: true })
defineEmits<{ search: [] }>()

const route = useRoute()
const theme = useTheme()
const { mdAndDown } = useDisplay()

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform)
const logo = computed(() => theme.current.value.dark ? config.logoDark : config.logo)

function defaultOpened (items: NavItem[], out: string[] = []) {
  for (const item of items) {
    if (item.type !== 'folder') continue
    if (!item.collapsed) out.push(item.path)
    defaultOpened(item.children, out)
  }
  return out
}

const opened = ref<string[]>(defaultOpened(site.value?.sections.flatMap(section => section.children) ?? []))

// Expand the groups leading to the current page.
watch(() => route.path, () => {
  const page = site.value?.pages.get(route.path.replace(/\/$/, '') || '/')
  if (!page) return
  const segments = page.path.split('/').slice(0, -1)
  const ancestors = segments.map((_, i) => segments.slice(0, i + 1).join('/'))
  opened.value = [...new Set([...opened.value, ...ancestors])]
}, { immediate: true })

const themeMode = computed({
  get: () => theme.isSystem.value ? 'system' : theme.name.value,
  set: (value: string) => {
    theme.change(value)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, value)
    } catch {}
  },
})
</script>

<template>
  <v-navigation-drawer
    v-model="model"
    border="e"
    class="sidebar"
    color="sidebar"
    :temporary="mdAndDown"
    :width="300"
  >
    <div class="sidebar__header">
      <router-link class="sidebar__brand" to="/">
        <img v-if="logo" :alt="config.title" class="sidebar__logo" :src="logo">
        <span v-if="config.showTitle || !logo">{{ config.title }}</span>
      </router-link>
      <v-btn
        aria-label="Hide navigation"
        density="comfortable"
        icon="mdi-dock-left"
        size="small"
        variant="text"
        @click="model = false"
      />
    </div>

    <div v-if="config.search" class="px-4 pb-2">
      <button class="search-trigger" type="button" @click="$emit('search')">
        <v-icon icon="mdi-magnify" size="18" />
        <span>Search</span>
        <span class="search-trigger__keys">
          <kbd>{{ isMac ? '⌘' : 'Ctrl' }}</kbd><kbd>K</kbd>
        </span>
      </button>
    </div>

    <v-list v-if="site" v-model:opened="opened" class="sidebar__nav" color="primary" density="compact" nav>
      <template v-if="config.links.length">
        <v-list-item
          v-for="link in config.links"
          :key="link.href"
          class="sidebar__link"
          :href="link.href"
          :prepend-icon="link.icon"
          rel="noopener"
          target="_blank"
          :title="link.title"
        />
        <div class="sidebar__spacer" />
      </template>

      <v-list-item
        v-for="item in site.rootPages"
        :key="item.page.route"
        exact
        :prepend-icon="item.page.icon ?? (item.page.route === '/' ? 'mdi-home-outline' : undefined)"
        :title="item.title"
        :to="item.page.route"
      />

      <template v-for="section in site.sections" :key="section.path">
        <div class="sidebar__section">
          <v-icon v-if="section.icon" :icon="section.icon" size="16" />
          {{ section.title }}
        </div>
        <NavTree :items="section.children" />
      </template>
    </v-list>

    <template #append>
      <div class="sidebar__footer">
        <v-btn-toggle v-model="themeMode" class="theme-toggle" density="compact" mandatory variant="text">
          <v-btn aria-label="Light theme" icon="mdi-white-balance-sunny" size="small" value="light" />
          <v-btn aria-label="System theme" icon="mdi-monitor" size="small" value="system" />
          <v-btn aria-label="Dark theme" icon="mdi-weather-night" size="small" value="dark" />
        </v-btn-toggle>
        <a class="sidebar__powered" href="https://tidydoc.dev" rel="noopener" target="_blank">
          Powered by tidydoc
        </a>
      </div>
    </template>
  </v-navigation-drawer>
</template>
