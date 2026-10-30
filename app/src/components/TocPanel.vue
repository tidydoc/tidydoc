<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Heading } from '@/markdown'

const props = defineProps<{ headings: Heading[] }>()

const active = ref<string>()
let frame = 0

function update () {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(() => {
    let current: string | undefined = props.headings[0]?.id
    for (const heading of props.headings) {
      const element = document.getElementById(heading.id)
      if (element && element.getBoundingClientRect().top < 120) current = heading.id
    }
    // At the bottom of the page, the last headings can never reach the top.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = props.headings.at(-1)?.id
    }
    active.value = current
  })
}

watch(() => props.headings, () => nextTick(update))
onMounted(() => {
  window.addEventListener('scroll', update, { passive: true })
  update()
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', update)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <nav aria-label="On this page" class="toc">
    <p class="toc__title"><v-icon icon="mdi-text" size="16" /> On this page</p>
    <ul>
      <li
        v-for="heading in headings"
        :key="heading.id"
        :class="['toc__item', `toc__item--h${heading.level}`, { 'is-active': heading.id === active }]"
      >
        <router-link :to="{ hash: `#${heading.id}` }">{{ heading.text }}</router-link>
      </li>
    </ul>
  </nav>
</template>
