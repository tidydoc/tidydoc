<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import AppSidebar from '@/components/AppSidebar.vue'
import SearchDialog from '@/components/SearchDialog.vue'
import { config } from '@/config'
import { loadError } from '@/content/store'

const { mdAndDown } = useDisplay()
const drawer = ref(!mdAndDown.value)
const searchOpen = ref(false)

watch(mdAndDown, mobile => { drawer.value = !mobile })

function onKeydown (event: KeyboardEvent) {
  if (config.search && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchOpen.value = !searchOpen.value
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <v-app>
    <AppSidebar v-model="drawer" @search="searchOpen = true" />

    <v-app-bar v-if="!drawer" border="b" density="comfortable" flat>
      <v-app-bar-nav-icon aria-label="Open navigation" @click="drawer = true" />
      <v-app-bar-title class="font-weight-semibold">{{ config.title }}</v-app-bar-title>
      <template #append>
        <v-btn v-if="config.search" aria-label="Search" icon="mdi-magnify" @click="searchOpen = true" />
      </template>
    </v-app-bar>

    <v-main>
      <v-alert v-if="loadError" class="ma-8" title="Could not load documentation" type="error" variant="tonal">
        {{ loadError }}
      </v-alert>
      <router-view v-else />
    </v-main>

    <SearchDialog v-if="config.search" v-model="searchOpen" />
  </v-app>
</template>
