import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'

import { Quasar,Notify } from 'quasar'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import mitt from 'mitt';
const emitter = mitt();

// import io from 'socket.io-client';
// app.config.globalProperties.$soketio = io('');

loadFonts()


app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Quasar, {
    plugins: { Notify }, 
})

app.config.globalProperties.emitter = emitter;

app.mount('#app')

