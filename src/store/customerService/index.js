export default {
  namespaced: true,
  state: {
    unread: false,
    received: {
      welcome: [],
      history: [],
      offline: [],
      common: [],
      error: []
    }
  },
  mutations: {
    setServiceUnread: (state, bool) => {
      state.unread = bool
    },
    receiveMessages: (state, { category, messages, replace }) => {
      if (replace) {
        state.received[category] = messages
      } else {
        state.received[category].push(...messages)
      }
    },
    clearMessage: (state) => {
      state.received.welcome = []
      state.received.history = []
      state.received.offline = []
      state.received.common = []
      state.messages = []
    }
  },
  actions: {
    setServiceUnread: ({ commit }, bool) => {
      commit('setServiceUnread', bool)
    },
    receiveMessages: ({ commit }, { category, messages, replace = true }) => {
      commit('receiveMessages', { category, messages, replace })
    },
    clearMessage: ({ commit }) => {
      commit('clearMessage')
    }
  }
}
