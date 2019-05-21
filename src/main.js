// polyfill for older browsers like: Safari 8
// eslint-disable-next-line
import "babel-polyfill"
import Vue from 'vue'
import './plugins/cube-ui'
import App from './App'
import router from './router'
import VueI18n from 'vue-i18n'
import VueCookie from 'vue-cookie'
import locales from './i18n/locales'
import VueLazyload from 'vue-lazyload'
import store from './store'
import { sync } from 'vuex-router-sync'
import { axiosGhost, axiosEagle, axiosVenom, urls, gethomePage, setCookie, sendHeartBeat, fetchJWTToken, fetchServiceUnread } from './api'
import * as types from './store/mutations/mutation-types'
import Vue2Filters from 'vue2-filters'
import { ToastPlugin, ConfirmPlugin, LoadingPlugin } from 'vux'
import qs from 'qs'
import sign from './utils/sign'
import {getJWTToken} from './utils'
import {HTTP_ERROR, JS_ERROR, AUTH_ERROR, report} from './report'
import GhostSocketObj from './wsObj/eider'

const sendGaEvent = ({label, category, action}) => {
  if (store.state.systemConfig.gaTrackingId) {
    window.gtag('event', action, {'event_category': category, 'event_label': label})
  }
}

let serviceUnreadInterval = null

const pollServiceUnread = () => {
  const getUnread = () => {
    fetchServiceUnread().then((res) => {
      store.dispatch('customerService/setServiceUnread', res.has_unread)
    }).catch((e) => {
      clearInterval(serviceUnreadInterval)
    })
  }
  serviceUnreadInterval = setInterval(() => {
    getUnread()
  }, 5000)
}

function initData () {
  store.dispatch('fetchGames')
  store.dispatch('fetchAnnouncements')
  store.dispatch('fetchBanner')
  store.dispatch('chatroom/roomList').catch(() => {})

  store.dispatch('setSystemConfig', {...store.state.systemConfig, state: 'pending'})

  gethomePage().then(
    response => {
      let pref = response.global_preferences || {}
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
          customerServiceUrl: pref.customer_service_url,
          agentDashboardUrl: pref.agent_dashboard_url,
          global_preferences: pref,
          agentBusinessConsultingQQ: pref.agent_business_consulting_qq,
          isAllowNewPaymentWindow: pref.is_allow_new_payment_window,
          contactEmail: pref.contact_email,
          contactPhoneNumber: pref.contact_phone_number,
          openAccountConsultingQQ: pref.open_account_consulting_qq,
          siteName: response.name,
          gaTrackingId: pref.ga_tracking_id,
          regPresentAmount: response.reg_present_amount,
          needBankinfo: response.need_bankinfo,
          stickerGroups: response.sticker_groups || [],
          chatroomEnvelopeSettings: pref.chatroom_red_envelope_eagle || {},
          smsValidationEnabled: pref.sms_validation_enabled === 'true',
          appDownloadUrl: pref.app_download_url,
          planSiteUrl: pref.plan_site_url,
          appIcon: response.app_icon,
          envelopeActivityId: response.envelope_activity_id,
          serviceAction,
          enableBuiltInCustomerService: pref.enable_built_in_customer_service === 'true'
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
  axiosGhost.defaults.headers.common['x-r'] = params.r
}

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(VueI18n)
Vue.use(VueCookie)
Vue.use(ToastPlugin, {position: 'middle', timing: 3000})
Vue.use(ConfirmPlugin)
Vue.use(LoadingPlugin)
Vue.use(VueLazyload, {
  error: require('./assets/error.png'),
  loading: require('./assets/loading.gif'),
  attempt: 1
})

const i18n = new VueI18n({
  locale: 'cn',
  messages: locales
})

axiosGhost.interceptors.request.use((config) => {
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
axiosGhost.interceptors.response.use(res => {
  let responseData = res.data

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
      axiosGhost.defaults.withCredentials = true
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

axiosEagle.interceptors.response.use(res => {
  return res.data
}, (error) => {
  report({
    type: HTTP_ERROR,
    error
  })
  return Promise.reject(error.response)
})

axiosVenom.interceptors.response.use(res => {
  return res.data
}, (error) => {
  report({
    type: HTTP_ERROR,
    error
  })
  return Promise.reject(error.response)
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
      if (store.state.systemConfig.gaTrackingId) {
        window.gtag('event', action, {'event_category': category, 'event_label': label})
      }
    }
  }
})

// init data
const token = Vue.cookie.get('access_token')
if (token) {
  axiosGhost.defaults.headers.common['Authorization'] = 'Bearer ' + token
  axiosEagle.defaults.headers.common['Authorization'] = 'Bearer ' + token
  store.dispatch('fetchUser').catch(() => { })
} else {
  Vue.nextTick(() => {
    store.dispatch('resetUser')
  })
}
initData()

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
    const unwatch = store.watch((state) => {
      return state.systemConfig.process
    }, (configProcess) => {
      if (configProcess === 'fulfilled') {
        if (store.state.systemConfig.enableBuiltInCustomerService) {
          let venomTokenPromise
          let venomToken = getJWTToken('venom')

          if (venomToken) {
            venomTokenPromise = Promise.resolve(venomToken)
          } else if (!venomToken) {
            venomTokenPromise = fetchJWTToken('venom').then(setting => {
              localStorage.setItem('venom_setting', JSON.stringify(setting))
              return setting.token
            }).catch(() => {})
          }
          venomTokenPromise.then(token => {
            axiosVenom.defaults.headers.common['Authorization'] = 'Bearer ' + token
            pollServiceUnread()
          }).catch(() => {})
        }
        unwatch()
      }
    })
  }

  if (logined) {
    store.dispatch('fetchChatRoomUserInfo')
    let eiderTokenPromise
    let eiderToken = getJWTToken('eider')
    if (eiderToken) {
      eiderTokenPromise = Promise.resolve(eiderToken)
    } else {
      eiderTokenPromise = fetchJWTToken('eider').then(setting => {
        localStorage.setItem('eider_setting', JSON.stringify(setting))
        return setting.token
      })
    }

    eiderTokenPromise.then(token => {
      store.dispatch('setWs', { ws: new GhostSocketObj(token), type: 'eider' })
    }).catch(() => {})

    store.dispatch('initUnread')
    setHeartBeatInterval()
  } else {
    if (store.state.ws.eider) {
      store.state.ws.eider.closeConnect()
    }
    if (store.state.ws.venom) {
      store.state.ws.venom.closeConnect()
    }
    clearInterval(serviceUnreadInterval)
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
