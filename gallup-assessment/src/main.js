import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router.js'
import { initPermanentCodes } from './utils/storage.js'

initPermanentCodes()

const app = createApp(App)
app.use(router)
app.mount('#app')
