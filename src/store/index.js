import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import { getLastGameData } from '../utils'
import page from './page'
import customerService from './customerService'
import actv2 from './actv2'

Vue.use(Vuex)

const isDebugMode = process.env.NODE_ENV !== 'production'
Vue.config.debug = isDebugMode
Vue.config.devtools = isDebugMode
const loadingImg = require('../assets/loading.gif')

export default new Vuex.Store({
  state: {
    theme: '#166FD8',
    user: {
      logined: 'pending',
      unread: 0
    },
    isLoading: false,
    showVerifyPopup: false,
    isRightMenuVisible: false,
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
    notifications: [],
    notificationVisible: false,
    dialog: {
      bet: {
        visible: false,
        bets: [],
        isSuccess: false
      },
      balance: {
        visible: false,
        total: 0,
        expectation: 0
      },
      bettrack: {
        visible: false,
        data: {
          track_numbers: [],
          forDisplay: {}
        },
        isSuccess: false
      }
    },
    categories: {},
    systemConfig: {
      process: 'pending',
      agentDashboardUrl: '',
      mobileLogo: '',
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
      appDownloadUrl: '',
      planSiteUrl: '',
      envelopeActivityId: '',
      serviceAction: null
    },
    envelope: {},
    urgencySwitchedGame: null,
    currentGameResult: null,
    emojis: null,
    keepAlivePage: ['Home'],
    promotions: [],
    ws: {
      raven: null,
      eider: null,
      venom: null
    },
    roomId: undefined,
    roomInfo: null,
    messages: [],
    announce: {
      chatroom: [],
      homepage: []
    },
    banners: [],
    customTitle: '',
    personal_setting: {
      chat: {
        status: 0
      }
    },
    latestResultMap: {},
    lastGameData: getLastGameData(),
    dataSectionStyle: {'padding-top': '5px'},
    serviceUnread: 0
  },
  actions,
  mutations,
  getters,
  modules: {
    page,
    customerService,
    actv2
  }
})
