<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{ html: string }>()

const router = useRouter()

function copyCode (button: HTMLElement) {
  const code = button.closest('.code-block')?.querySelector('pre')?.textContent ?? ''
  navigator.clipboard.writeText(code)
  const icon = button.querySelector('.mdi')
  icon?.classList.replace('mdi-content-copy', 'mdi-check')
  setTimeout(() => icon?.classList.replace('mdi-check', 'mdi-content-copy'), 1500)
}

function selectTab (button: HTMLElement) {
  const tabs = button.closest('.tabs')
  if (!tabs) return
  const index = button.dataset.tab
  for (const element of tabs.querySelectorAll<HTMLElement>(':scope > .tabs__list > .tabs__tab, :scope > .tabs__panel')) {
    element.classList.toggle('is-active', element.dataset.tab === index)
  }
}

function onClick (event: MouseEvent) {
  const target = event.target as HTMLElement

  const copy = target.closest<HTMLElement>('.code-block__copy')
  if (copy) return copyCode(copy)

  const tab = target.closest<HTMLElement>('.tabs__tab')
  if (tab) return selectTab(tab)

  const link = target.closest<HTMLAnchorElement>('a[href]')
  if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
  const href = link.getAttribute('href')!
  if (href.startsWith('#') || (href.startsWith('/') && !href.startsWith('/content/') && !/\.md(#|$)/.test(href))) {
    event.preventDefault()
    router.push(href.startsWith('#') ? { hash: href } : href)
  }
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- content comes from the site owner's markdown -->
  <div class="prose" @click="onClick" v-html="html" />
</template>
