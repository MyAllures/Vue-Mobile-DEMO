import Vue from 'vue'
import App from './App'
import router from './router'
import VueI18n from 'vue-i18n'
import locales from './i18n/locales'
import { createStore } from './store'
import { sync } from 'vuex-router-sync'
import * as types from './store/mutations/mutation-types'

Vue.use(VueI18n)

let navLang = navigator.language || navigator.userLanguage
if (navLang === 'zh-CN' || navLang === 'zh-cn') {
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

Vue.config.productionTip = false

const store = createStore()

const toLogin = function (router) {
  router.push({
    path: '/login'
  })
}

router.beforeEach((to, from, next) => {
  store.commit(types.UPDATE_LOADING, {isLoading: true})
  next()
})

router.beforeEach((to, from, next) => {
  // fisrMacthed might be the top-level parent route of others
  const firstMatched = to.matched.length ? to.matched[0] : null
  if ((firstMatched || to).meta.requiresAuth) {
    if (from && from.matched[0] && from.matched[0].path === to.matched[0].path) {
      next()
    } else {
      store.dispatch('fetchUser')
        .then(res => {
          // got user info
          if (res.account_type === 0 && to.matched[0].path === '/account') {
            toLogin(router)
          } else {
            next()
          }
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

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  template: '<App/>',
  components: { App }
})
