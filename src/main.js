// polyfill for older browsers like: Safari 8
// eslint-disable-next-line
import "babel-polyfill"
import Vue from 'vue'
import axios from 'axios'
import './plugins/cube-ui'
import App from './App'
import router from './router'
import VueI18n from 'vue-i18n'
import VueCookie from 'vue-cookie'
import locales from './i18n/locales'
import VueLazyload from 'vue-lazyload'
import store from './store'
import { sync } from 'vuex-router-sync'
import { gethomePage, setCookie, fetchChatUserInfo, fetchRoomInfo, sendHeartBeat, fetchServiceUnread, fetchEiderJWTToken, fetchVenomJWTToken } from './api'
import * as types from './store/mutations/mutation-types'
import Vue2Filters from 'vue2-filters'
import { ToastPlugin, ConfirmPlugin } from 'vux'
import qs from 'qs'
import sign from './utils/sign'
import {checkJWTTokenAlive, JWT} from './utils/jwtToken'
import urls from './api/urls'
import {HTTP_ERROR, JS_ERROR, AUTH_ERROR, report} from './report'
import GhostSocketObj from './wsObj/eider'
import VenomSocketObj from './wsObj/venom'

const sendGaEvent = ({label, category, action}) => {
  if (store.state.systemConfig.gaTrackingId) {
    window.gtag('event', action, {'event_category': category, 'event_label': label})
  }
}
function initData () {
  store.dispatch('fetchGames')
  store.dispatch('fetchAnnouncements')
  store.dispatch('fetchBanner')

  gethomePage().then(
    response => {
      let pref = response.global_preferences || {}
      const chatroomEnabled = pref.chatroom_enabled === 'true'

      const customerServiceUrl = pref.customer_service_url
      const enableBuiltInCustomerService = pref.enable_built_in_customer_service === 'true'
      let serviceAction = null
      if (enableBuiltInCustomerService) {
        if (store.state.user.account_type) {
          serviceAction = () => {
            sendGaEvent({
              label: '我的',
              category: '點擊/進入客服',
              action: '點擊'
            })
            router.push({path: '/CustomerSerivce'})
          }
        } else {
          serviceAction = () => {
            Vue.$vux.toast.show({
              text: '请先登入会员，如未有会员帐号请先注册',
              type: 'warn'
            })
          }
        }
      } else {
        if (customerServiceUrl) {
          serviceAction = () => { window.open(customerServiceUrl) }
        } else {
          serviceAction = null
        }
      }
      store.dispatch('setSystemConfig',
        {
          process: 'fulfilled',
          homePageLogo: response.icon,
          mobileLogo: response.mobile_logo,
          agentDashboardUrl: pref.agent_dashboard_url,
          global_preferences: pref,
          agentBusinessConsultingQQ: pref.agent_business_consulting_qq,
          isAllowNewPaymentWindow: pref.is_allow_new_payment_window,
          contactEmail: pref.contact_email,
          contactPhoneNumber: pref.contact_phone_number,
          openAccountConsultingQQ: pref.open_account_consulting_qq,
          chatroomEnabled: chatroomEnabled,
          siteName: response.name,
          gaTrackingId: pref.ga_tracking_id,
          regPresentAmount: response.reg_present_amount,
          needBankinfo: response.need_bankinfo,
          stickerGroups: response.sticker_groups || [],
          envelopeSettings: pref.red_envelope_settings || {},
          smsValidationEnabled: pref.sms_validation_enabled === 'true',
          appDownloadUrl: pref.app_download_url,
          planSiteUrl: pref.plan_site_url,
          serviceAction,
          appIcon: response.app_icon
        })

      const themeId = response.theme || 1
      store.dispatch('setTheme', themeId)
      document.body.classList.add(`theme${themeId}`)
      if (pref.ga_tracking_id) {
        let gaScript = document.getElementById('ga-script')
        if (!gaScript) {
          const ga = document.createElement('script')
          ga.type = 'text/javascript'
          ga.async = true
          ga.id = 'ga-script'
          ga.src = `https://www.googletagmanager.com/gtag/js?id=${pref.ga_tracking_id}`
          const s = document.getElementsByTagName('script')[0]
          s.parentNode.insertBefore(ga, s)
        }
      }
      // if (pref.script_content) {
      //   const dynamicScript = document.createElement('script')
      //   dynamicScript.type = 'text/javascript'
      //   dynamicScript.async = true
      //   dynamicScript.text = `try{${pref.script_content}}catch(e){console.log(e)}`
      //   const s = document.getElementsByTagName('script')[0]
      //   s.parentNode.insertBefore(dynamicScript, s)
      // }
    }
  )
}
// 移动端触发active
document.addEventListener('touchstart', function () {}, true)
window.onerror = function (errorMessage, scriptURI, lineNo, columnNo, error) {
  report({
    type: JS_ERROR,
    error
  })
  throw error
}
Vue.config.errorHandler = (error, vm, info) => {
  report({
    type: JS_ERROR,
    error,
    memo: info
  })
  throw error
}

let url = window.location.href
const HTTPS = process.env.HTTPS
if (HTTPS && HTTPS.replace(/"/g, '') === '1') {
  if (window.location.protocol === 'http:') {
    window.location.replace(url.replace(/http:/, 'https:'))
  }
}
let params = qs.parse(url.slice(url.indexOf('?') + 1, url.length))
if (params.r) {
  setCookie('r=' + params.r).catch(() => {})
  axios.defaults.headers.common['x-r'] = params.r
}

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(VueI18n)
Vue.use(VueCookie)
Vue.use(ToastPlugin, {position: 'middle', timing: 3000})
Vue.use(ConfirmPlugin)
Vue.use(VueLazyload, {
  error: require('./assets/error.png'),
  loading: require('./assets/loading.gif'),
  attempt: 1
})

const i18n = new VueI18n({
  locale: 'cn',
  messages: locales
})

axios.interceptors.request.use((config) => {
  const fromVenom = config.url.includes(urls.venomHost)
  const fromRaven = config.url.includes(urls.ravenHost)
  if (fromVenom) {
    config.headers['Authorization'] = `JWT ${Vue.cookie.get(JWT.venom + '_token')}`
  }
  if (fromRaven) {
    config.headers['Authorization'] = `JWT ${Vue.cookie.get(JWT.raven + '_token')}`
  }
  if (config.url.indexOf('v2') !== -1) {
    let t = new Date()
    config.headers.common['x-sign'] = sign.ink(t)
    config.headers.common['x-date'] = sign.blot(t)
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

const pollingApi = [urls.unread, urls.game_result]
axios.interceptors.response.use(res => {
  const fromVenom = res.config.url.includes(urls.venomHost)
  const fromRaven = res.config.url.includes(urls.ravenHost)
  let responseData = res.data
  if (fromVenom) {
    return responseData
  }
  if (fromRaven) {
    return responseData
  }
  if (responseData.code === 2000) {
    return responseData.data
  } else if (responseData.code === 9001) {
    return responseData
  } else {
    if (responseData.code === 9007) {
      if (!pollingApi.some(url => res.config.url.indexOf(url) !== -1)) { // 忽略輪詢api
        report({
          type: AUTH_ERROR,
          url: res.config.url,
          msg: '9007身份认证信息未提供'
        })
        toLogin(router)
      }
    } else if (responseData.code === 9011 || responseData.code === 9013) {
      axios.defaults.withCredentials = true
      Vue.cookie.set('sessionid', res.data.sessionid)
      return Promise.reject(responseData)
    }
    return Promise.reject(responseData)
  }
}, (error) => {
  report({
    type: HTTP_ERROR,
    error
  })
  // Vue.$vux.toast.show({
  //   text: '网路服务异常，请稍后再试',
  //   type: 'warn'
  // })
  return Promise.reject(error)
})

Vue.config.productionTip = false

const toLogin = function (router) {
  store.dispatch('resetUser')
  router.push({
    path: '/login'
  })
}

// router config
router.beforeEach((to, from, next) => {
  if (!from || to.name !== from.name) {
    store.dispatch('page/updatePageSetting', to.meta || {})
  }
  // fisrMacthed might be the top-level parent route of others
  const firstMatched = to.matched.length ? to.matched[0] : null
  if ((firstMatched || to).meta.requiresAuth) {
    if (from && from.matched[0] && from.matched[0].path === to.matched[0].path) {
      next()
    } else {
      const user = store.state.user
      if (user.logined === 'pending') {
        const unwatch = store.watch((state) => {
          return state.user.logined
        }, (logined) => {
          unwatch()
          if (logined) {
            next()
          } else {
            toLogin(router)
          }
        })
      } else if (user.logined === true) {
        next()
      } else {
        toLogin(router)
      }
    }
  } else {
    next()
  }
})

router.afterEach(function (to) {
  store.commit(types.UPDATE_LOADING, {isLoading: false})
  const gaTrackingId = store.state.systemConfig.gaTrackingId
  if (gaTrackingId && to.name !== 'DetailBetRecord' && to.name !== 'GameDetail') {
    window.gtag('config', store.state.systemConfig.gaTrackingId, {page_path: to.path, page_title: to.meta.gaTitle || to.meta.title})
  }
})

sync(store, router)

Vue.mixin({
  methods: {
    performLogin () {
      toLogin(this.$router)
    },
    sendGaEvent ({label, category, action}) {
      sendGaEvent({label, category, action})
    }
  }
})

const setChatRoomSetting = (username) => {
  if (store.state.systemConfig.chatroomEnabled) {
    fetchChatUserInfo(store.state.user.username).then(res => {
      store.dispatch('setUser', {
        planMakerRoom: res.data.plan_maker_rooms || []
      })
    }).catch(() => {})
    fetchRoomInfo().then(res => {
      if (!res) {
        return
      }
      const roomInfo = {}
      res.data.data.forEach(room => {
        roomInfo[room.id] = {name: room.title, status: room.status}
      })
      store.commit(types.SET_ROOM_INFO, roomInfo)
    }).catch(() => {})
  }
}

// init data
const token = Vue.cookie.get('access_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
  store.dispatch('fetchUser').then(() => {
    checkJWTTokenAlive(JWT.venom + '_token', fetchServiceUnread, fetchVenomJWTToken)
  }).catch(() => {
    initData()
  })
} else {
  Vue.nextTick(() => {
    store.dispatch('resetUser')
    initData()
  })
}

store.dispatch('fetchGames')

let heartBeatInterval
const setHeartBeatInterval = () => {
  sendHeartBeat().catch(() => {})
  clearInterval(heartBeatInterval)
  heartBeatInterval = setInterval(() => {
    sendHeartBeat().catch(() => {})
  }, 5 * 60 * 1000)
}

store.watch((state) => {
  return state.user.logined
}, (logined) => {
  store.dispatch('fetchPromotions')
  if (store.state.user.account_type) {
    if (store.state.systemConfig.process === 'pending') {
      const unwatch = store.watch((state) => {
        return state.systemConfig.process
      }, (configProcess) => {
        unwatch()
        if (configProcess === 'fulfilled') {
          setChatRoomSetting()
        }
      })
    } else {
      setChatRoomSetting()
    }
  }
  if (logined) {
    fetchVenomJWTToken().then(() => {
      let token = Vue.cookie.get(`${JWT.venom}_token`)
      store.dispatch('setWs', { ws: new VenomSocketObj(token), type: 'venom' })
    })
    fetchEiderJWTToken().then(() => {
      let token = Vue.cookie.get(`${JWT.eider}_token`)
      store.dispatch('setWs', { ws: new GhostSocketObj(token), type: 'eider' })
    })
    store.dispatch('initUnread')
    setHeartBeatInterval()
    initData()
  } else {
    clearInterval(heartBeatInterval)
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App }
})
