import { MSG_TYPE } from '@/utils/CustomerService'

export default {
  namespaced: true,
  state: {
    unread: false,
    received: {
      welcome: [],
      history: [],
      offline: [],
      common: [],
      error: [],
      thank: ''
    },
    lastArchive: 0
  },
  getters: {
    currentSession (state) {
      const length = state.received.common.length
      return length ? state.received.common[length - 1].session : false
    }
  },
  mutations: {
    setServiceUnread: (state, bool) => {
      state.unread = bool
    },
    receiveMessages: (state, { category, messages, once }) => {
      if (once) {
        if (state.received[category].length === 0) {
          state.received[category] = messages
        }
      } else {
        state.received[category].push(...messages)
      }
    },
    setThankMessage: (state, message) => {
      state.received.thank = message
    },
    clearMessage: (state) => {
      state.received.welcome = []
      state.received.history = []
      state.received.offline = []
      state.received.common = []
      state.messages = []
    },
    deleteReview: (state, id) => {
      const index = state.received.common.findIndex(msg => msg.id === id)
      const msg = state.received.common[index + 1]
      msg.text = '您已清除本次对话的满意度调查'
      msg.type = MSG_TYPE.reviewCancel
      state.received.common.splice(index, 1)
    },
    archiveSession: (state, currentSession) => {
      const index = state.received.common.findIndex(msg => msg.session === currentSession && msg.type === MSG_TYPE.review)
      if (index === -1) {
        state.lastArchive = Date.now()
      }
    }
  },
  actions: {
    setServiceUnread: ({ commit }, bool) => {
      commit('setServiceUnread', bool)
    },
    receiveMessages: ({ commit }, { category, messages, once = true }) => {
      commit('receiveMessages', { category, messages, once })
    },
    setThankMessage: ({ commit }, message) => {
      commit('setThankMessage', message)
    },
    clearMessage: ({ commit }) => {
      commit('clearMessage')
    },
    deleteReview: ({ commit }, id) => {
      commit('deleteReview', id)
    },
    archiveSession: ({ commit, getters }) => {
      commit('archiveSession', getters.currentSession)
    }
  }
}
