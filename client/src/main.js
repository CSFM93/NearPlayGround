import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import { store } from './store/index'
import MainLayout from './layouts/MainLayout.vue'

Vue.config.productionTip = false

Vue.component('main-layout', MainLayout)


export const bus = new Vue();


Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
