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
import { ToastPlugin } from 'vux'
import qs from 'qs'

let url = window.location.href
let params = qs.parse(url.slice(url.indexOf('?') + 1, url.length))
if (params.r) {
  setCookie('r=' + params.r).catch(() => {})
}

Vue.use(require('vue-moment'))
Vue.use(Vue2Filters)
Vue.use(VueI18n)
Vue.use(VueCookie)
Vue.use(ToastPlugin, {position: 'top'})

let navLang = navigator.language || navigator.userLanguage
if (navLang === 'zh-CNN' || navLang === 'zh-cn') {
  Vue.config.lang = 'cn'
} else if (navLang === 'en-US' || navLang === 'en-us') {
  Vue.config.lang = 'en'
} else {
  Vue.config.lang = 'cn'
}
const i18n = new VueI18n({
  locale: Vue.config.lang,
  messages: locales
})

const token = Vue.cookie.get('access_token')
if (token) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
}
axios.interceptors.response.use(res => {
  let responseData = res.data
  if (responseData.code === 2000) {
    if (responseData.data && responseData.data.trial_auth_req === 1) {
      router.push({
        path: '/login'
      })
      store.dispatch('openVerifyPopup')
    }
    return responseData.data
  } else {
    if (responseData.code === 9007) {
      router.push({
        path: '/login'
      })
    } else if (responseData.code === 9011 || responseData.code === 9013) {
      axios.defaults.withCredentials = true
      Vue.cookie.set('sessionid', res.data.sessionid)
      return Promise.reject(responseData)
    }
    return Promise.reject(responseData.msg)
  }
}, (error) => {
  return Promise.reject(error)
})

Vue.config.productionTip = false

const store = createStore()

const toLogin = function (router) {
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
    let pref = response.global_preferences
    store.dispatch('setSystemConfig',
      {
        homePageLogo: response.icon,
        customerServiceUrl: pref.customer_service_url,
        agentDashboardUrl: pref.agent_dashboard_url,
        global_preferences: pref,
        agentBusinessConsultingQQ: pref.agent_business_consulting_qq,
        contactEmail: pref.contact_email,
        contactPhoneNumber: pref.contact_phone_number,
        openAccountConsultingQQ: pref.open_account_consulting_qq,
        siteName: response.name
      })
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
