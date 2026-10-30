import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/manrope'
import './style.css'
import './responsive.css'
import App from './App.vue'
import router from './router'
createApp(App).use(createPinia()).use(router).mount('#app')
