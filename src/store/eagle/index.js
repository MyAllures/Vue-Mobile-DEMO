export default {
  namespaced: true,
  state: {
    ws: null,
    messages: [],
    permission: null,
    emojiMap: null,
    isManager: false,
    loading: true
  },
  mutations: {
    setWs: (state, ws) => {
      state.ws = ws
    },
    init: (state, data) => {
      state.loading = false
      state.messages = data.recent_messages
      state.permission = data.user.chat_permission
      state.isManager = data.user.is_manager
    },
    clear: (state, data) => {
      state.loading = true
      state.messages = []
      state.permission = null
      state.isManager = false
    },
    receiveMsg: (state, message) => {
      state.messages.push(message)
    },
    initEmoji: (state, emojiMap) => {
      state.emojiMap = emojiMap
    }
  },
  actions: {
    setWs: ({ commit }, ws) => {
      commit('setWs', ws)
    },
    init: ({ commit }, data) => {
      commit('init', data)
    },
    clear: ({ commit }, data) => {
      commit('clear', data)
    },
    receiveMsg: ({ commit }, message) => {
      commit('receiveMsg', message)
    },
    initEmoji: ({commit}, emojiMap) => {
      commit('initEmoji', emojiMap)
    }
  }
}
