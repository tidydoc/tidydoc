<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { site } from '@/content/store'
import { searchSite } from '@/search'

const model = defineModel<boolean>({ required: true })

const router = useRouter()
const query = ref('')
const selected = ref(0)

const results = computed(() => site.value && query.value.trim().length > 1 ? searchSite(site.value, query.value) : [])

watch(results, () => { selected.value = 0 })
watch(model, open => { if (open) query.value = '' })

function go (id: string) {
  model.value = false
  router.push(id)
}

function onKeydown (event: KeyboardEvent) {
  const count = results.value.length
  if (!count) return
  if (event.key === 'ArrowDown') selected.value = (selected.value + 1) % count
  else if (event.key === 'ArrowUp') selected.value = (selected.value - 1 + count) % count
  else if (event.key === 'Enter') go(results.value[selected.value]!.id)
  else return
  event.preventDefault()
  document.getElementById(`search-result-${selected.value}`)?.scrollIntoView({ block: 'nearest' })
}
</script>

<template>
  <v-dialog v-model="model" class="search-dialog" max-width="640" scrollable>
    <v-card rounded="xl">
      <v-text-field
        v-model="query"
        autofocus
        class="search-dialog__input"
        density="comfortable"
        hide-details
        placeholder="Search documentation…"
        prepend-inner-icon="mdi-magnify"
        variant="solo"
        flat
        @keydown="onKeydown"
      >
        <template #append-inner>
          <kbd class="search-dialog__esc">Esc</kbd>
        </template>
      </v-text-field>
      <v-divider />
      <v-card-text class="pa-2 search-dialog__results">
        <p v-if="query.trim().length > 1 && !results.length" class="text-medium-emphasis text-center py-8">
          No results for “{{ query }}”
        </p>
        <p v-else-if="!results.length" class="text-medium-emphasis text-center py-8">
          Type to search the documentation
        </p>
        <v-list v-else density="compact" nav>
          <v-list-item
            v-for="(result, index) in results"
            :id="`search-result-${index}`"
            :key="result.id"
            :active="index === selected"
            color="primary"
            @click="go(result.id)"
            @mouseenter="selected = index"
          >
            <v-list-item-title class="font-weight-medium">
              {{ result.title }}<template v-if="result.heading"> <span class="text-medium-emphasis">›</span> {{ result.heading }}</template>
            </v-list-item-title>
            <v-list-item-subtitle v-if="result.excerpt" class="search-dialog__excerpt">{{ result.excerpt }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
