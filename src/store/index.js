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
          options: Array.from(Array(11).keys()).map(item => item + 1)
        },
        {
          // 广东11选5 直选
          id: '176-直选',
          component: 'gd11x5Seq',
          options: Array.from(Array(11).keys()).map(item => item + 1)
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
          // 香港六合彩 连码
          id: '178-连码',
          component: 'WithCode',
          options: Array.from(Array(49).keys()).map(item => item + 1)
        },
        {
          // 香港六合彩 连肖
          id: '178-连肖',
          component: 'hk6Exl'
        },
        {
          // 香港六合彩 连尾
          id: '178-连尾',
          component: 'hk6Exl'
        },
        {
          // 香港六合彩 和肖
          id: '178-合肖',
          component: 'shxiaZdc',
          options: Array.from(Array(12).keys()).map(item => item)
        },
        {
          // 香港六合彩 自選不中
          id: '178-自选不中',
          component: 'shxiaZdc',
          options: Array.from(Array(49).keys()).map(item => item + 1)
        },
        {
          // 福彩3D 组选三
          id: '197-组选三',
          component: 'fc3dIc',
          options: Array.from(Array(10).keys())
        },
        {
          // 福彩3D 组选六
          id: '197-组选六',
          component: 'fc3dIc',
          options: Array.from(Array(10).keys())
        }
      ]
    },
    actions,
    mutations,
    getters
  })
}
