import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import { getLastGameData } from '../utils'
import page from './page'
import eagle from './eagle'
import game from './game'

Vue.use(Vuex)

const isDebugMode = process.env.NODE_ENV !== 'production'
Vue.config.debug = isDebugMode
Vue.config.devtools = isDebugMode
const loadingImg = require('../assets/loading.gif')

export default new Vuex.Store({
  state: {
    theme: 0,
    themeId: 0,
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
      issue_number: '',
      isClosed: false
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
      },
      new_bettrack: {
        visible: false,
        data: null,
        isSuccess: false
      },
      expert_bettrack: {
        visible: false,
        data: null,
        isSuccess: false
      }
    },
    categories: {},
    systemConfig: {
      process: 'pending',
      customerServiceUrl: '',
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
      envelopeActivityId: ''
    },
    envelope: {},
    urgencySwitchedGame: null,
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
    bettrackPositions: {},
    jwt_token: {
      venom: '',
      raven: '',
      eider: '',
      eagle: ''
    }
  },
  actions,
  mutations,
  getters,
  modules: {
    page,
    eagle,
    game
  }
})
