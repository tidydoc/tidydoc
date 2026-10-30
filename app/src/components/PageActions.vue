<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Page } from '@/content/nav'
import { rawUrl } from '@/content/slug'

const props = defineProps<{ page: Page }>()

const copied = ref(false)
const markdownUrl = computed(() => rawUrl(props.page.route))
const absoluteMarkdownUrl = computed(() => new URL(markdownUrl.value, window.location.origin).href)
const prompt = computed(() => encodeURIComponent(`Read ${absoluteMarkdownUrl.value} so I can ask questions about it.`))

async function copyMarkdown () {
  await navigator.clipboard.writeText(props.page.raw)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}
</script>

<template>
  <div class="page-actions">
    <v-btn
      class="text-none"
      density="comfortable"
      :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
      size="small"
      variant="outlined"
      @click="copyMarkdown"
    >
      {{ copied ? 'Copied' : 'Copy Markdown' }}
    </v-btn>

    <v-menu location="bottom start">
      <template #activator="{ props: activator }">
        <v-btn
          v-bind="activator"
          append-icon="mdi-chevron-down"
          class="text-none"
          density="comfortable"
          size="small"
          variant="outlined"
        >
          Open
        </v-btn>
      </template>
      <v-list density="compact" min-width="220">
        <v-list-item :href="markdownUrl" prepend-icon="mdi-language-markdown-outline" target="_blank" title="View as Markdown" />
        <v-list-item :href="`https://chatgpt.com/?hints=search&q=${prompt}`" prepend-icon="mdi-open-in-new" rel="noopener" target="_blank" title="Open in ChatGPT" />
        <v-list-item :href="`https://claude.ai/new?q=${prompt}`" prepend-icon="mdi-open-in-new" rel="noopener" target="_blank" title="Open in Claude" />
      </v-list>
    </v-menu>

    <span class="page-actions__hint">
      Reading this with electronic eyes? Add <a :href="markdownUrl" target="_blank">.md</a> for the Markdown version.
    </span>
  </div>
</template>
