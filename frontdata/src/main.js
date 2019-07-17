import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import './plugins/vuetify'
import App from './App.vue'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import WebRTC from 'vue-webrtc'

Vue.use(WebRTC)

Vue.config.productionTip = false

export const eventBus = new Vue()

new Vue({
  render: h => h(App)
}).$mount('#app')
