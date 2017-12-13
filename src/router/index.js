import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      meta: {
        tabbarHidden: true,
        title: '登录',
        showBack: true
      },
      component: resolve => { require(['../screens/Login.vue'], resolve) }
    },
    {
      path: '/',
      name: 'Home',
      meta: {
        title: '首页'
      },
      component: resolve => { require(['../screens/Home.vue'], resolve) }
    },
    {
      path: '/game',
      name: 'Game',
      meta: {
        title: '游戏',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/Game.vue'], resolve) }
    },
    {
      path: '/fin',
      name: 'Fin',
      meta: {
        title: '财务',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/Fin.vue'], resolve) }
    },
    {
      path: '/my',
      name: 'My',
      meta: {
        title: '我的',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/My.vue'], resolve) }
    }
  ]
})
