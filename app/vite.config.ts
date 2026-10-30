/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { contentPlugin } from './vite/content-plugin'

export default defineConfig({
  plugins: [
    Vue({ template: { transformAssetUrls } }),
    Vuetify({ autoImport: true }),
    contentPlugin({ dir: process.env.TIDYDOC_CONTENT_DIR ?? '../docs' }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('src', import.meta.url)) },
  },
  test: {
    environment: 'node',
  },
})
