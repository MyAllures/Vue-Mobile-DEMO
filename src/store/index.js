import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'

Vue.use(Vuex)

const isDebugMode = process.env.NODE_ENV !== 'production'
Vue.config.debug = isDebugMode
Vue.config.devtools = isDebugMode
const loadingImg = require('../assets/loading.gif')

export default new Vuex.Store({
  state: {
    user: {
      logined: 'pending',
      unread: 0
    },
    isLoading: false,
    showVerifyPopup: false,
    games: [],
    tagTable: {
      ' ': [{icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}],
      '  ': [{icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}],
      '   ': [{icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}, {icon: loadingImg}]
    },
    gameInfo: {
      display_name: '',
      game_code: '',
      countdown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      issue_number: ''
    },
    winNotification: [],
    winNotificationVisible: false,
    betDialog: {
      visible: false,
      bets: [],
      isSuccess: false
    },
    categories: {},
    systemConfig: {
      process: 'pending',
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
      smsValidationEnabled: false,
      appDownloadUrl: ''
    },
    envelope: {},
    currentGameResult: null,
    emojis: null,
    keepAlivePage: ['Home'],
    promotions: [],
    ws: {
      raven: null,
      eider: null
    },
    roomId: undefined,
    roomInfo: null,
    messages: [],
    announce: [],
    customTitle: '',
    personal_setting: {
      chat: {
        status: 0
      }
    }
  },
  actions,
  mutations,
  getters
})
