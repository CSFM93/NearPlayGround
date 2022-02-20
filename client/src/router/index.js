import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    meta: { layout: "main-layout" },
    component: () => import('../views/Home')
  },
  {
    path: '/projects',
    name: 'projects',
    meta: { layout: "main-layout" },
    component: () => import('../views/Projects')
  },
  {
    path: '/project/:projectName',
    name: 'project',
    meta: { layout: "main-layout" },
    component: () => import('../views/Project')
  },

]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
