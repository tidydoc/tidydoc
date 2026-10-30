<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import DocContent from '@/components/DocContent.vue'
import PageActions from '@/components/PageActions.vue'
import TocPanel from '@/components/TocPanel.vue'
import { config } from '@/config'
import { site } from '@/content/store'
import { renderMarkdown } from '@/markdown'
import NotFound from './NotFound.vue'

const route = useRoute()
const { lgAndUp } = useDisplay()

const page = computed(() => {
  const path = decodeURIComponent(route.path).replace(/\/+$/, '').toLowerCase() || '/'
  return site.value?.pages.get(path)
})

const rendered = computed(() => page.value && renderMarkdown(page.value.body, { path: page.value.path }))

const siblings = computed(() => {
  const flat = site.value?.flat ?? []
  const index = page.value ? flat.indexOf(page.value) : -1
  return index === -1 ? {} : { prev: flat[index - 1], next: flat[index + 1] }
})

watchEffect(() => {
  document.title = page.value && page.value.route !== '/' ? `${page.value.title} · ${config.title}` : config.title
})
</script>

<template>
  <NotFound v-if="!page || !rendered" />
  <div v-else class="doc-layout">
    <article class="doc">
      <header class="doc__header">
        <h1 class="doc__title">{{ page.title }}</h1>
        <p v-if="page.description" class="doc__description">{{ page.description }}</p>
      </header>

      <PageActions v-if="config.copyMarkdown" :page="page" />

      <DocContent :key="page.route" :html="rendered.html" />

      <nav v-if="siblings.prev || siblings.next" class="doc__pager">
        <router-link v-if="siblings.prev" class="pager-link" :to="siblings.prev.route">
          <span class="pager-link__label"><v-icon icon="mdi-arrow-left" size="14" /> Previous</span>
          <span class="pager-link__title">{{ siblings.prev.title }}</span>
        </router-link>
        <router-link v-if="siblings.next" class="pager-link pager-link--next" :to="siblings.next.route">
          <span class="pager-link__label">Next <v-icon icon="mdi-arrow-right" size="14" /></span>
          <span class="pager-link__title">{{ siblings.next.title }}</span>
        </router-link>
      </nav>
    </article>

    <aside v-if="lgAndUp && rendered.headings.length" class="doc-layout__toc">
      <TocPanel :headings="rendered.headings" />
    </aside>
  </div>
</template>
