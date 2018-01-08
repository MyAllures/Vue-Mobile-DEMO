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
      path: '/register',
      name: 'Register',
      meta: {
        tabbarHidden: true,
        title: '注册'
      },
      component: resolve => { require(['../screens/Register.vue'], resolve) }
    },
    {
      path: '/',
      name: 'Home',
      component: resolve => { require(['../screens/Home.vue'], resolve) }
    },
    {
      path: '/game',
      name: 'Game',
      component: resolve => { require(['../screens/GameHall.vue'], resolve) },
      meta: {
        requiresAuth: true,
        tabbarHidden: true
      },
      children: [
        {
          path: ':gameId',
          component: resolve => { require(['../screens/games/Game.vue'], resolve) },
          meta: {
            requiresAuth: true,
            tabbarHidden: true
          },
          children: [
            {
              path: ':categoryId',
              component: resolve => { require(['../screens/games/GameCategory.vue'], resolve) }
            }
          ]
        }
      ]
    },
    {
      path: '/fin',
      name: 'Fin',
      meta: {
        title: '财务',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/Fin.vue'], resolve) },
      children: [
        {
          path: 'recharge',
          name: 'Recharge',
          meta: {
            title: '充值',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/Recharge.vue'], resolve) }
        },
        {
          path: 'payment_record',
          name: 'PaymentRecord',
          meta: {
            title: '充值记录',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
        },
        {
          path: 'withdraw_record',
          name: 'WithdrawRecord',
          meta: {
            title: '取款记录',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
        },
        {
          path: 'bet_record/:date',
          name: 'DetailBetRecord',
          meta: {
            title: '注單',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/DetailBetRecord.vue'], resolve) }
        },
        {
          path: 'bet_record',
          name: 'BetRecord',
          meta: {
            title: '注單',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/BetRecord.vue'], resolve) }
        }
      ]
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
