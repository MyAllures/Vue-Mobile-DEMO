import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'

Vue.use(Router)

const router = new Router({ routes: [] })

const baseRoutes = [
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
      rightCtrl: 'info',
      customHeader: true
    },
    component: resolve => { require(['../screens/Home.vue'], resolve) }
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
              tabbarHidden: true,
              customHeader: true
            }
          }
        ]
      }
    ]
  },
  {
    path: '/chatroom',
    name: 'Chatroom',
    component: resolve => { require(['../screens/chatroom/Chatroom.vue'], resolve) },
    meta: {
      title: '聊天室',
      requiresAuth: true,
      tabbarHidden: true,
      leftCtrl: 'back',
      rightCtrl: 'info',
      backPage: {
        text: '首页',
        path: '/'
      }
    },
    beforeEnter: (to, from, next) => {
      if (from.name !== 'RedEnvelopeDetail') {
        store.dispatch('removeKeepAlive', 'Chatroom')
      }
      next()
    }
  },
  {
    path: '/fin',
    name: 'Fin',
    redirect: '/fin/deposit',
    meta: {
      title: '财务',
      requiresAuth: true
    },
    component: resolve => { require(['../screens/Fin.vue'], resolve) },
    children: [
      {
        path: 'deposit',
        name: 'Deposit',
        meta: {
          title: '充值',
          requiresAuth: true,
          rightCtrl: 'info',
          showBack: false
        },
        component: resolve => { require(['../screens/finance/Deposit.vue'], resolve) },
        children: [
          {
            path: 'submit_success',
            name: 'SubmitSuccess',
            component: resolve => { require(['../screens/finance/SubmitSuccess.vue'], resolve) },
            meta: {
              title: '充值已提交',
              gaTitle: '充值申请提交',
              leftCtrl: 'back',
              tabbarHidden: true,
              rightCtrl: 'info',
              showBack: false
            }
          },
          {
            path: 'remit',
            component: resolve => { require(['../screens/finance/remit/Remit.vue'], resolve) },
            children: [
              {
                path: '',
                name: 'Remit',
                redirect: '/fin/deposit'
              },
              {
                path: 'bank',
                name: 'Bank',
                meta: {
                  title: '银行转帐',
                  leftCtrl: 'back',
                  tabbarHidden: true
                },
                component: resolve => { require(['../screens/finance/remit/Bank.vue'], resolve) }
              },
              {
                path: 'wechat',
                name: 'Wechat',
                meta: {
                  title: '微信转帐',
                  leftCtrl: 'back',
                  tabbarHidden: true
                },
                component: resolve => { require(['../screens/finance/remit/ThirdParty.vue'], resolve) }
              },
              {
                path: 'alipay',
                name: 'Alipay',
                meta: {
                  title: '支付宝转帐',
                  leftCtrl: 'back',
                  tabbarHidden: true
                },
                component: resolve => { require(['../screens/finance/remit/ThirdParty.vue'], resolve) }
              }
            ]
          }
        ]
      },
      {
        path: 'withdraw',
        name: 'Withdrawal',
        meta: {
          title: '申请取款',
          rightCtrl: 'info',
          requiresAuth: true
        },
        component: resolve => { require(['../screens/finance/Withdraw.vue'], resolve) },
        children: [
          {
            path: 'withdraw_success',
            name: 'WithdrawSuccess',
            component: resolve => { require(['../screens/finance/WithdrawSuccess.vue'], resolve) },
            meta: {
              title: '申請取款',
              gaTitle: '取款申请提交',
              leftCtrl: 'back'
            }
          }
        ]
      },
      {
        path: 'record',
        name: 'FinanceRecord',
        redirect: '/fin/record/personal_report',
        meta: {
          title: '财务记录',
          rightCtrl: 'info',
          requiresAuth: true
        },
        component: resolve => { require(['../screens/finance/FinanceRecord.vue'], resolve) },
        children: [
          {
            path: 'bet_record',
            name: 'BetRecord',
            meta: {
              title: '投注记录',
              gaTitle: '投注记录',
              rightCtrl: 'info',
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
            path: 'deposit',
            name: 'DepositRecord',
            meta: {
              title: '充值记录',
              gaTitle: '充值纪录',
              rightCtrl: 'info',
              requiresAuth: true
            },
            component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
          },
          {
            path: 'withdraw',
            name: 'WithdrawRecord',
            meta: {
              title: '取款记录',
              gaTitle: '取款纪录',
              rightCtrl: 'info',
              requiresAuth: true
            },
            component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
          },
          {
            path: 'promotion',
            name: 'PromotionRecord',
            meta: {
              title: '优惠和红包',
              gaTitle: '优惠和红包纪录',
              rightCtrl: 'info',
              requiresAuth: true
            },
            component: resolve => { require(['../screens/finance/TransactionRecord.vue'], resolve) }
          },
          {
            path: 'return',
            name: 'ReturnRecord',
            meta: {
              title: '反水记录',
              gaTitle: '反水纪录',
              rightCtrl: 'info',
              requiresAuth: true
            },
            component: resolve => { require(['../screens/finance/ReturnRecord.vue'], resolve) }
          },
          {
            path: 'bet_record/:date',
            name: 'DetailBetRecord',
            meta: {
              title: '投注记录',
              gaTitle: '投注记录',
              rightCtrl: 'info',
              requiresAuth: true,
              tabbarHidden: true,
              leftCtrl: 'back',
              customHeader: true
            },
            component: resolve => { require(['../screens/finance/DetailBetRecord.vue'], resolve) }
          },
          {
            path: 'bettrack_record',
            name: 'BetTrackRecord',
            meta: {
              title: '追号纪录',
              gaTitle: '追号纪录',
              rightCtrl: 'info',
              requiresAuth: true
            },
            component: resolve => { require(['../screens/finance/BetTrackRecord.vue'], resolve) }
          },
          {
            path: 'personal_report',
            name: 'PersonalReport',
            meta: {
              title: '个人报表',
              rightCtrl: 'info',
              gaTitle: '个人报表',
              requiresAuth: true
            },
            component: resolve => { require(['../screens/finance/PersonalReport.vue'], resolve) }
          }
        ]
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
      title: '基本资料',
      gaTitle: '基本资料',
      leftCtrl: 'back',
      requiresAuth: true,
      tabbarHidden: true
    },
    component: resolve => { require(['../screens/my/Profile.vue'], resolve) }
  },
  {
    path: '/my/follow',
    name: 'follow',
    meta: {
      title: '我的关注',
      gaTitle: '我的关注',
      leftCtrl: 'back',
      requiresAuth: true,
      tabbarHidden: true
    },
    component: resolve => { require(['../screens/my/Follow.vue'], resolve) }
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
    path: '/my/red_envelopes',
    name: 'red_envelopes',
    meta: {
      title: '返利红包',
      leftCtrl: 'back',
      rightCtrl: 'info',
      requiresAuth: true,
      tabbarHidden: true
    },
    component: resolve => { require(['../screens/my/RedEnvelopes.vue'], resolve) }
  },
  {
    path: '/my/referral_link',
    name: 'referral_link',
    meta: {
      title: '推荐好友',
      leftCtrl: 'back',
      requiresAuth: true,
      tabbarHidden: true
    },
    component: resolve => { require(['../screens/my/ReferralLink.vue'], resolve) }
  },
  {
    path: '/my/referrals',
    name: 'referrals',
    meta: {
      title: '我的推荐',
      leftCtrl: 'back',
      requiresAuth: true,
      tabbarHidden: true
    },
    component: resolve => { require(['../screens/my/Referrals.vue'], resolve) }
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
    path: '/act/:type',
    name: 'RedEnvPromotion',
    meta: {
      title: '',
      leftCtrl: 'back',
      headerBgColor: '#d23f34',
      tabbarHidden: true
    },
    component: resolve => { require(['../screens/act/RedEnvPromotion.vue'], resolve) }
  },
  {
    path: '/red_envelope/:id',
    name: 'RedEnvelopeDetail',
    meta: {
      title: '红包领取详情',
      leftCtrl: 'back',
      requiresAuth: true,
      tabbarHidden: true,
      customHeader: true
    },
    component: resolve => { require(['../screens/chatroom/RedEnvelopeDetail.vue'], resolve) }
  },
  {
    path: '/CustomerSerivce',
    name: 'CustomerSerivce',
    meta: {
      title: '联系客服',
      leftCtrl: 'back',
      requiresAuth: true,
      tabbarHidden: true
    },
    component: resolve => { require(['../screens/CustomerService.vue'], resolve) }
  },
  {
    path: '*',
    redirect: '/'
  }
]

router.addRoutes(baseRoutes)
export default router
