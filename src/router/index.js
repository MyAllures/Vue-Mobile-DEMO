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
      rightCtrl: 'info'
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
        component: resolve => { require(['../screens/finance/deposit.vue'], resolve) },
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
              leftCtrl: 'back'
            },
            component: resolve => { require(['../screens/finance/DetailBetRecord.vue'], resolve) }
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
const oldBetTrackRecord = {
  path: 'bettrack',
  name: 'BetTrackRecord',
  meta: {
    title: '追号纪录',
    gaTitle: '追号纪录',
    requiresAuth: true
  },
  component: resolve => { require(['../screens/finance/BetTrackRecord.vue'], resolve) }
}

const newBetTrackRecord = {
  path: 'bettrack',
  name: 'BetTrackRecord',
  meta: {
    title: '追号纪录',
    gaTitle: '追号纪录',
    requiresAuth: true
  },
  component: resolve => { require(['../screens/finance/NewBetTrackRecord.vue'], resolve) }
}

const oldGame = {
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
}

const newGame = {
  path: '/game',
  name: 'Game',
  component: resolve => { require(['../screens/chatGame/ChatGameHall.vue'], resolve) },
  meta: {
    requiresAuth: true,
    tabbarHidden: true
  },
  children: [
    {
      path: ':gameId',
      component: resolve => { require(['../screens/chatGame/ChatGame.vue'], resolve) },
      meta: {
        tabbarHidden: true
      }
    }
  ]
}

let routes = createRoute(baseRoutes, 'new')
router.addRoutes(routes)
export default router

function createRoute (routes, version) {
  let result = []
  if (version === 'new') {
    result.push(newGame)
  } else {
    result.push(oldGame)
  }
  routes.forEach(route => {
    let copyRoute = { ...route }
    if (copyRoute.children) {
      copyRoute.children = createRoute(copyRoute.children, version)
    }
    if (copyRoute.path === '/fin') {
      const targetChild = copyRoute.children.find(route => {
        return route.name === 'FinanceRecord'
      })
      targetChild.children.push(version === 'new' ? newBetTrackRecord : oldBetTrackRecord)
    }
    result.push(copyRoute)
  })
  return result
}

export function switchRouter (version) {
  const newRouter = new Router({ route: [] })

  router.matcher = newRouter.matcher
  let routes = createRoute(baseRoutes, version)
  router.addRoutes(routes)
}
