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
        leftCtrl: 'back'
      },
      component: resolve => { require(['../screens/Login.vue'], resolve) }
    },
    {
      path: '/register',
      name: 'Register',
      meta: {
        leftCtrl: 'back',
        tabbarHidden: true,
        title: '注册'
      },
      component: resolve => { require(['../screens/Register.vue'], resolve) }
    },
    {
      path: '/',
      name: 'Home',
      meta: {
        rightCtrl: 'info'
      },
      component: resolve => { require(['../screens/Home.vue'], resolve) }
    },
    {
      path: '/game',
      name: 'Game',
      component: resolve => { require(['../screens/games/GameHall.vue'], resolve) },
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
              path: 'playpositions',
              name: 'PlayPositions',
              component: resolve => { require(['../screens/games/TrackBet.vue'], resolve) },
              meta: {
                tabbarHidden: true
              }
            },
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
      path: '/chat_gamehall',
      name: 'ChatGameHall',
      component: resolve => { require(['../screens/games/ChatGameHall.vue'], resolve) },
      meta: {
        requiresAuth: true,
        tabbarHidden: true
      },
      children: [
        {
          path: ':gameId',
          component: resolve => { require(['../screens/games/ChatGame.vue'], resolve) },
          meta: {
            tabbarHidden: true
          }
        }
      ]
    },
    {
      path: '/unsettle',
      name: 'UnsettleRecord',
      component: resolve => { require(['../screens/finance/UnsettleRecord.vue'], resolve) },
      meta: {
        title: '未结明细',
        tabbarHidden: true,
        leftCtrl: 'back'
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
          path: 'return_record',
          name: 'ReturnRecord',
          meta: {
            title: '财务纪录',
            gaTitle: '反水纪录',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/ReturnRecord.vue'], resolve) }
        },
        {
          path: 'bet_record/:date',
          name: 'DetailBetRecord',
          meta: {
            title: '财务纪录',
            gaTitle: '投注记录',
            requiresAuth: true,
            tabbarHidden: true,
            leftCtrl: 'back'
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
        },
        {
          path: 'personal_report',
          name: 'PersonalReport',
          meta: {
            title: '个人报表',
            gaTitle: '个人报表',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/PersonalReport.vue'], resolve) }
        },
        {
          path: 'bettrack_record',
          name: 'BetTrackRecord',
          meta: {
            title: '追号纪录',
            gaTitle: '追号纪录',
            requiresAuth: true
          },
          component: resolve => { require(['../screens/finance/BetTrackRecord.vue'], resolve) }
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
        leftCtrl: 'back'
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
                leftCtrl: 'back',
                tabbarHidden: true
              },
              component: resolve => { require(['../screens/my/remit/Bank.vue'], resolve) }
            },
            {
              path: 'wechat',
              name: 'Wechat',
              meta: {
                title: '微信转帐',
                leftCtrl: 'back',
                tabbarHidden: true
              },
              component: resolve => { require(['../screens/my/remit/ThirdParty.vue'], resolve) }
            },
            {
              path: 'alipay',
              name: 'Alipay',
              meta: {
                title: '支付宝转帐',
                leftCtrl: 'back',
                tabbarHidden: true
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
        leftCtrl: 'back',
        requiresAuth: true,
        tabbarHidden: true
      },
      component: resolve => { require(['../screens/my/Password.vue'], resolve) }
    },
    {
      path: '/my/profile',
      name: 'profile',
      meta: {
        title: '基本資料',
        gaTitle: '基本资料',
        leftCtrl: 'back',
        requiresAuth: true,
        tabbarHidden: true
      },
      component: resolve => { require(['../screens/my/Profile.vue'], resolve) }
    },
    {
      path: '/my/bankinfo',
      name: 'bankinfo',
      meta: {
        title: '银行资讯',
        leftCtrl: 'back',
        requiresAuth: true,
        tabbarHidden: true
      },
      component: resolve => { require(['../screens/my/Bankinfo.vue'], resolve) }
    },
    {
      path: '/my/withdraw',
      name: 'withdraw',
      meta: {
        title: '申请取款',
        leftCtrl: 'back',
        requiresAuth: true,
        tabbarHidden: true
      },
      component: resolve => { require(['../screens/my/Withdraw.vue'], resolve) }
    },
    {
      path: '/my/wpassword',
      name: 'wpassword',
      meta: {
        title: '修改取款密码',
        leftCtrl: 'back',
        requiresAuth: true,
        tabbarHidden: true
      },
      component: resolve => { require(['../screens/my/Wpassword.vue'], resolve) }
    },
    {
      path: '/my/message',
      name: 'message',
      meta: {
        title: '会员消息',
        leftCtrl: 'back',
        requiresAuth: true,
        tabbarHidden: true
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
        leftCtrl: 'back'
      },
      component: resolve => { require(['../screens/Promotions.vue'], resolve) },
      children: [
        {
          path: ':promoId',
          name: 'PromotionDetail',
          meta: {
            title: '活动详情',
            leftCtrl: 'back'
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
