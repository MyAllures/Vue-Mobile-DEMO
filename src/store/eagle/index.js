export default {
  namespaced: true,
  state: {
    ws: null,
    messages: [],
    permission: null,
    emojiMap: null
  },
  mutations: {
    setWs: (state, ws) => {
      state.ws = ws
    },
    init: (state, data) => {
      state.messages = data.recent_messages
      state.permission = data.user.chat_permission
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
    receiveMsg: ({ commit }, message) => {
      commit('receiveMsg', message)
    },
    initEmoji: ({commit}, emojiMap) => {
      commit('initEmoji', emojiMap)
    }
  }
}
