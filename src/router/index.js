import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'

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
        showBack: true,
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
            tabbarHidden: true
          },
          children: [
            {
              path: ':categoryId',
              name: 'GameDetail',
              component: resolve => { require(['../screens/games/GameCategory.vue'], resolve) },
              meta: {
                tabbarHidden: true
              }
            }
          ]
        }
      ]
    },
    {
      path: '/unsettle',
      name: 'UnsettleRecord',
      component: resolve => { require(['../screens/finance/UnsettleRecord.vue'], resolve) },
      meta: {
        title: '未结明细',
        tabbarHidden: true
      }
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
          path: 'payment_record',
          name: 'PaymentRecord',
          meta: {
            title: '财务纪录',
            requiresAuth: true,
            showBack: true
          },
          component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
        },
        {
          path: 'withdraw_record',
          name: 'WithdrawRecord',
          meta: {
            title: '财务纪录',
            requiresAuth: true,
            showBack: true
          },
          component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
        },
        {
          path: 'promotion_record',
          name: 'PromotionRecord',
          meta: {
            title: '财务纪录',
            requiresAuth: true,
            showBack: true
          },
          component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
        },
        {
          path: 'bet_record/:date',
          name: 'DetailBetRecord',
          meta: {
            title: '财务纪录',
            requiresAuth: true,
            tabbarHidden: true,
            showBack: true
          },
          component: resolve => { require(['../screens/finance/DetailBetRecord.vue'], resolve) }
        },
        {
          path: 'bet_record',
          name: 'BetRecord',
          meta: {
            title: '财务纪录',
            requiresAuth: true,
            showBack: true
          },
          beforeEnter: (to, from, next) => {
            if (from.name !== 'DetailBetRecord') {
              store.dispatch('removeKeepAlive', 'BetRecord')
            }
            next()
          },
          component: resolve => { require(['../screens/finance/BetRecord.vue'], resolve) }
        }
      ]
    },
    {
      path: '/my',
      name: 'My',
      meta: {
        title: '我的账号',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/My.vue'], resolve) }
    },
    {
      path: '/my/deposit',
      name: 'Deposit',
      meta: {
        title: '充值',
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (from.path !== '/my/remit') {
          store.dispatch('removeKeepAlive', 'Deposit')
        }
        next()
      },
      component: resolve => { require(['../screens/my/Deposit.vue'], resolve) }
    },
    {
      path: '/my/remit',
      name: 'Remit',
      meta: {
        title: '转帐',
        showBack: true,
        requiresAuth: true
      },
      beforeEnter: (to, from, next) => {
        if (store.state.remitPayee) {
          next()
        } else {
          next('/my/deposit')
        }
      },
      component: resolve => { require(['../components/Remit.vue'], resolve) }
    },
    {
      path: '/my/password',
      name: 'changepassword',
      meta: {
        title: '修改密码',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Password.vue'], resolve) }
    },
    {
      path: '/my/profile',
      name: 'profile',
      meta: {
        title: '修改账户资料',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Profile.vue'], resolve) }
    },
    {
      path: '/my/bankinfo',
      name: 'bankinfo',
      meta: {
        title: '银行资讯',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Bankinfo.vue'], resolve) }
    },
    {
      path: '/my/withdraw',
      name: 'withdraw',
      meta: {
        title: '取款',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Withdraw.vue'], resolve) }
    },
    {
      path: '/my/wpassword',
      name: 'wpassword',
      meta: {
        title: '重置取款密码',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Wpassword.vue'], resolve) }
    },
    {
      path: '/my/message',
      name: 'message',
      meta: {
        title: '会员消息',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Message.vue'], resolve) }
    },
    {
      path: '/depositSuccess',
      name: 'depositSuccess',
      meta: {
        title: '支付成功',
        requiresAuth: true
      },
      component: resolve => { require(['../screens/depositSuccess.vue'], resolve) }
    },
    {
      path: '/promotions',
      name: 'Promotions',
      meta: {
        title: '优惠活动',
        showBack: true
      },
      component: resolve => { require(['../screens/Promotions.vue'], resolve) },
      children: [
        {
          path: ':promoId',
          name: 'PromotionDetail',
          meta: {
            title: '活动详情',
            showBack: true
          },
          component: resolve => { require(['../screens/PromoDetail.vue'], resolve) }
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
