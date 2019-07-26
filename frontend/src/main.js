import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import io from 'socket.io-client'
import adapter from 'webrtc-adapter'


Vue.config.productionTip = false

new Vue({
  router,
  store,
  io,
  adapter,
  render: h => h(App)
}).$mount('#app')
