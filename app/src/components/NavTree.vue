<script setup lang="ts">
import type { NavItem } from '@/content/nav'

defineProps<{ items: NavItem[] }>()
</script>

<template>
  <template v-for="item in items" :key="item.type === 'page' ? item.page.route : item.path">
    <v-list-item
      v-if="item.type === 'page'"
      :prepend-icon="item.page.icon"
      :title="item.title"
      :to="item.page.route"
      exact
    />
    <v-list-group v-else :value="item.path">
      <template #activator="{ props }">
        <v-list-item v-bind="props" :prepend-icon="item.icon" :title="item.title" />
      </template>
      <NavTree :items="item.children" />
    </v-list-group>
  </template>
</template>
