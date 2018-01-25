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
        },
        {
          // 广东11选5 直选
          id: '176-直选',
          component: 'gd11x5Seq',
          options: Array.from(Array(11).keys())
        },
        {
          // 重庆幸运农场 连码
          id: '174-连码',
          component: 'WithCode',
          options: Array.from(Array(20).keys()).map(item => item + 1)
        },
        {
          // 广东快乐十分 连码
          id: '177-连码',
          component: 'WithCode',
          options: Array.from(Array(20).keys()).map(item => item + 1)
        },
        {
          // 香港六合彩 和肖
          id: '178-合肖',
          component: 'shxiaZdc',
          options: Array.from(Array(12).keys()).map(item => item)
        }
      ]
    },
    actions,
    mutations,
    getters
  })
}
