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
            gaTitle: '充值纪录',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
        },
        {
          path: 'withdraw_record',
          name: 'WithdrawRecord',
          meta: {
            title: '财务纪录',
            gaTitle: '取款纪录',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
        },
        {
          path: 'promotion_record',
          name: 'PromotionRecord',
          meta: {
            title: '财务纪录',
            gaTitle: '优惠和红包纪录',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
        },
        {
          path: 'bet_record/:date',
          name: 'DetailBetRecord',
          meta: {
            title: '财务纪录',
            gaTitle: '投注记录',
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
            gaTitle: '投注记录',
            requiresAuth: true
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
      path: '/my/deposit/submit_success',
      name: 'SubmitSuccess',
      component: resolve => { require(['../screens/my/SubmitSuccess.vue'], resolve) },
      meta: {
        title: 'custom',
        gaTitle: '充值申请提交',
        showBack: false
      }
    },
    {
      path: '/my/deposit/withdraw_success',
      name: 'WithdrawSuccess',
      component: resolve => { require(['../screens/my/WithdrawSuccess.vue'], resolve) },
      meta: {
        title: '申請取款',
        gaTitle: '取款申请提交',
        showBack: true
      }
    },
    {
      path: '/my/deposit',
      name: 'Deposit',
      meta: {
        title: '充值',
        requiresAuth: true,
        showBack: false
      },
      component: resolve => { require(['../screens/my/Deposit.vue'], resolve) },
      children: [
        {
          path: 'remit',
          component: resolve => { require(['../screens/my/remit/Remit.vue'], resolve) },
          children: [
            {
              path: '',
              name: 'Remit',
              redirect: '/my/deposit'
            },
            {
              path: 'bank',
              name: 'Bank',
              meta: {
                title: '银行转帐',
                showBack: true
              },
              component: resolve => { require(['../screens/my/remit/Bank.vue'], resolve) }
            },
            {
              path: 'wechat',
              name: 'Wechat',
              meta: {
                title: '微信转帐',
                showBack: true
              },
              component: resolve => { require(['../screens/my/remit/ThirdParty.vue'], resolve) }
            },
            {
              path: 'alipay',
              name: 'Alipay',
              meta: {
                title: '支付宝转帐',
                showBack: true
              },
              component: resolve => { require(['../screens/my/remit/ThirdParty.vue'], resolve) }
            }
          ]
        }
      ]
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
        title: '基本資料',
        gaTitle: '基本资料',
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
        title: '申请取款',
        showBack: true,
        requiresAuth: true
      },
      component: resolve => { require(['../screens/my/Withdraw.vue'], resolve) }
    },
    {
      path: '/my/wpassword',
      name: 'wpassword',
      meta: {
        title: '修改取款密码',
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
