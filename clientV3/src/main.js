
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { Quasar,Notify } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import mitt from 'mitt';
const emitter = mitt();

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Quasar, {
    plugins: { Notify }, 
})

window.require = (name) => new URL(name, import.meta.url).href;

app.config.globalProperties.emitter = emitter;


app.mount('#app')