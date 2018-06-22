import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {
      logined: '',
      unread: 0
    },
    isLoading: false,
    showVerifyPopup: false,
    games: [],
    gameInfo: {
      display_name: '',
      countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      issue_number: ''
    },
    categories: {},
    systemConfig: {
      customerServiceUrl: '',
      agentDashboardUrl: '',
      homePageLogo: '',
      siteName: '',
      global_preferences: {
        send_chat_conditions: '{}'
      },
      chatroomEnabled: false,
      isAllowNewPaymentWindow: 'false',
      regPresentAmount: undefined,
      envelopeSettings: {},
      stickerGroups: [],
      smsValidationEnabled: false
    },
    envelope: {},
    emojis: null,
    keepAlivePage: [],
    ws: null,
    roomId: undefined,
    roomInfo: null,
    messages: [],
    announce: [],
    personal_setting: {
      chat: {
        status: 0
      }
    },
    customPlayGroups: [
      {
        // 广东11选5 连码
        id: 'gd11x5_ca-m_wc',
        component: 'WithCode',
        options: Array.from(Array(11).keys()).map(item => item + 1)
      },
      {
        // 广东11选5 直选
        id: 'gd11x5_ca-m_seq',
        component: 'gd11x5Seq',
        options: Array.from(Array(11).keys()).map(item => item + 1)
      },
      {
        // 重庆幸运农场 连码
        id: 'cqlf_ca-m_wc',
        component: 'WithCode',
        options: Array.from(Array(20).keys()).map(item => item + 1)
      },
      {
        // 广东快乐十分 连码
        id: 'gdklsf_ca-m_wc',
        component: 'WithCode',
        options: Array.from(Array(20).keys()).map(item => item + 1)
      },
      {
        // 香港六合彩 连码
        id: 'hkl_ca-m_wc',
        component: 'WithCode',
        options: Array.from(Array(49).keys()).map(item => item + 1)
      },
      {
        // 香港六合彩 连肖
        id: 'hkl_ca-m_exl',
        component: 'hk6Exl'
      },
      {
        // 香港六合彩 连尾
        id: 'hkl_ca-m_exltail',
        component: 'hk6Exl'
      },
      {
        // 香港六合彩 和肖
        id: 'hkl_ca-m_shxia',
        component: 'shxiaZdc',
        options: Array.from(Array(12).keys()).map(item => item)
      },
      {
        // 香港六合彩 自選不中
        id: 'hkl_ca-m_ntinfvr',
        component: 'shxiaZdc',
        options: Array.from(Array(49).keys()).map(item => item + 1)
      },
      {
        // 幸运六合彩 连码
        id: 'luckl_ca-m_wc',
        component: 'WithCode',
        options: Array.from(Array(49).keys()).map(item => item + 1)
      },
      {
        // 幸运六合彩 连肖
        id: 'luckl_ca-m_exl',
        component: 'hk6Exl'
      },
      {
        // 幸运六合彩 连尾
        id: 'luckl_ca-m_exltail',
        component: 'hk6Exl'
      },
      {
        // 幸运六合彩 和肖
        id: 'luckl_ca-m_shxia',
        component: 'shxiaZdc',
        options: Array.from(Array(12).keys()).map(item => item)
      },
      {
        // 幸运六合彩 自選不中
        id: 'luckl_ca-m_ntinfvr',
        component: 'shxiaZdc',
        options: Array.from(Array(49).keys()).map(item => item + 1)
      },
      {
        // 福彩3D 组选三
        id: 'fc3d_ca-m_pic',
        component: 'fc3dIc',
        options: Array.from(Array(10).keys())
      },
      {
        // 福彩3D 组选六
        id: 'fc3d_ca-m_msic',
        component: 'fc3dIc',
        options: Array.from(Array(10).keys())
      },
      {
        // 福彩3D 二字定位
        id: 'fc3d_ca-m_2df',
        component: 'fc3dCa2df',
        options: Array.from(Array(10).keys()).map(item => item)
      },
      {
        // 福彩3D 三字定位
        id: 'fc3d_ca-m_3df',
        component: 'fc3dCa2df',
        options: Array.from(Array(10).keys()).map(item => item)
      }
    ]
  },
  actions,
  mutations,
  getters
})
