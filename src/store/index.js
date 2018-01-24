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
      isLoading: false,
      games: [],
      categories: [],
      systemConfig: {
        customerServiceUrl: '',
        agentDashboardUrl: '',
        homePageLogo: '',
        siteName: '',
        global_preferences: {
          send_chat_conditions: '{}'
        }
      },
      unread: 0,
      customPlayGroups: [
        {
          // 广东11选5 连码
          id: '176-连码',
          component: 'WithCode',
          options: Array.from(Array(11).keys())
        }
      ]
    },
    actions,
    mutations,
    getters
  })
}
