import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/screens/Home'
import Game from '@/screens/Game'
import Fin from '@/screens/Fin'
import My from '@/screens/My'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/game',
      name: 'Game',
      component: Game
    },
    {
      path: '/fin',
      name: 'fin',
      component: Fin
    },
    {
      path: '/my',
      name: 'my',
      component: My
    }
  ]
})
