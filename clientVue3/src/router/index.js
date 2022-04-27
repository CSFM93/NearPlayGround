import Home from '../views/Home.vue'
import Projects from '../views/Projects.vue'
import Project from '../views/Project.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/contracts',
      name: 'contracts',
      component: Projects
    },
    {
      path: '/contract/:contractId',
      name: 'contract',
      component: Project
    },
  
  ]
})













export default router