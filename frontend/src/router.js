import Vue from 'vue'
import Router from 'vue-router'
import Join from './views/JoinRoom.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path : '/',
      name: 'Join',
      component : Join
    }
  ]
})
