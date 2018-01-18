import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export function createStore () {
  return new Vuex.Store({
    state: {
      user: {
        logined: ''
      },
      games: [],
      categories: [],
      isLoading: false,
      systemConfig: {
        customerServiceUrl: '',
        agentDashboardUrl: '',
        homePageLogo: '',
        siteName: '',
        global_preferences: {
          send_chat_conditions: '{}'
        }
      }
    },
    actions,
    mutations,
    getters
  })
}
