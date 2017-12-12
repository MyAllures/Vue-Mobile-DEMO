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

router.beforeEach(function (to, from, next) {
  store.commit(types.UPDATE_LOADING, {isLoading: true})
  next()
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
