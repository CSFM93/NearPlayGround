import Home from '../views/Home.vue'
import Projects from '../views/Projects.vue'
import Project from '../views/Project.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
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
      path: '/contract/name=:contractName',
      name: 'contract',
      component: Project
    },
  
  ]
})













export default router