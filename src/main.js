// polyfill for older browsers like: Safari 8
// eslint-disable-next-line
import "babel-polyfill"
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import router from './router'
import VueI18n from 'vue-i18n'
import VueCookie from 'vue-cookie'
import locales from './i18n/locales'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'
import { gethomePage, setCookie } from './api'
import * as types from './store/mutations/mutation-types'
import Vue2Filters from 'vue2-filters'
import { ToastPlugin, ConfigPlugin } from 'vux'
import qs from 'qs'

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
}

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(VueI18n)
Vue.use(VueCookie)
Vue.use(ToastPlugin, {position: 'middle', timing: 3000})
Vue.use(ConfigPlugin, {
  $layout: 'VIEW_BOX'
})

const i18n = new VueI18n({
  locale: 'cn',
  messages: locales
})

const token = Vue.cookie.get('access_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}
axios.interceptors.response.use(res => {
  let responseData = res.data
  if (responseData.code === 2000) {
    return responseData.data
  } else {
    if (responseData.code === 9007) {
      toLogin(router)
    } else if (responseData.code === 9011 || responseData.code === 9013) {
      axios.defaults.withCredentials = true
      Vue.cookie.set('sessionid', res.data.sessionid)
      return Promise.reject(responseData)
    }
    return Promise.reject(responseData.msg)
  }
}, (error) => {
  Vue.$vux.toast.show({
    text: '系统发生了错误, 请联系客服',
    type: 'warn'
  })
  return Promise.reject(error)
})

Vue.config.productionTip = false

const store = createStore()

const toLogin = function (router) {
  store.commit('RESET_USER')
  router.push({
    path: '/login'
  })
}

router.beforeEach((to, from, next) => {
  // fisrMacthed might be the top-level parent route of others
  const firstMatched = to.matched.length ? to.matched[0] : null
  if ((firstMatched || to).meta.requiresAuth) {
    if (from && from.matched[0] && from.matched[0].path === to.matched[0].path) {
      next()
    } else {
      store.dispatch('fetchUser')
        .then(res => {
          next()
        })
        .catch(error => {
          // can't get user info
          toLogin(router)
          return Promise.resolve(error)
        })
    }
  } else {
    next()
  }
})

router.afterEach(function (to) {
  store.commit(types.UPDATE_LOADING, {isLoading: false})
  const gaTrackingId = store.state.systemConfig.gaTrackingId
  if (gaTrackingId) {
    window.gtag('config', store.state.systemConfig.gaTrackingId, {page_path: to.path})
  }
})

sync(store, router)

Vue.mixin({
  methods: {
    performLogin () {
      toLogin(this.$router)
    }
  }
})

gethomePage().then(
  response => {
    let pref = response.global_preferences || {}
    store.dispatch('setSystemConfig',
      {
        homePageLogo: response.icon,
        customerServiceUrl: pref.customer_service_url,
        agentDashboardUrl: pref.agent_dashboard_url,
        global_preferences: pref,
        agentBusinessConsultingQQ: pref.agent_business_consulting_qq,
        isAllowNewPaymentWindow: pref.is_allow_new_payment_window,
        contactEmail: pref.contact_email,
        contactPhoneNumber: pref.contact_phone_number,
        openAccountConsultingQQ: pref.open_account_consulting_qq,
        chatroomEnabled: pref.chatroom_enabled,
        siteName: response.name,
        gaTrackingId: pref.ga_tracking_id,
        regPresentAmount: response.reg_present_amount,
        needBankinfo: response.need_bankinfo
      })
    if (pref.ga_tracking_id) {
      const ga = document.createElement('script')
      ga.type = 'text/javascript'
      ga.async = true
      ga.src = `https://www.googletagmanager.com/gtag/js?id=${pref.ga_tracking_id}`
      const s = document.getElementsByTagName('script')[0]
      s.parentNode.insertBefore(ga, s)
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

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App }
})
