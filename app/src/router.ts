import { createRouter, createWebHistory } from 'vue-router'
import DocPage from '@/pages/DocPage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [{ path: '/:path(.*)*', component: DocPage }],
  scrollBehavior (to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: decodeURIComponent(to.hash), top: 24, behavior: 'smooth' }
    return { top: 0 }
  },
})
