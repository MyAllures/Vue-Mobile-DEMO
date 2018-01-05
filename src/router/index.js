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
    },
    {
      path: '/person/Password',
      name: 'changepassword',
      meta: {
        title: '修改密码',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/person/Password.vue'], resolve) }
    },
    {
      path: '/person/Profile',
      name: 'profile',
      meta: {
        title: '修改账户资料',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/person/Profile.vue'], resolve) }
    },
    {
      path: '/person/Bankinfo',
      name: 'bankinfo',
      meta: {
        title: '银行资讯',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/person/Bankinfo.vue'], resolve) }
    },
    {
      path: '/person/Wpassword',
      name: 'wpassword',
      meta: {
        title: '重置取款密码',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/person/Wpassword.vue'], resolve) }
    },
    {
      path: '/person/Massage',
      name: 'massage',
      meta: {
        title: '会员消息',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/person/Massage.vue'], resolve) }
    }
  ]
})
