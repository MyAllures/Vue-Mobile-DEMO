export default {
  namespaced: true,
  state: {
    ws: null,
    messages: [],
    emojiMap: null
  },
  mutations: {
    setWs: (state, ws) => {
      state.ws = ws
    },
    initMsg: (state, messages) => {
      state.messages = messages
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
    initMsg: ({ commit }, messages) => {
      commit('initMsg', messages)
    },
    receiveMsg: ({ commit }, message) => {
      commit('receiveMsg', message)
    },
    initEmoji: ({commit}, emojiMap) => {
      commit('initEmoji', emojiMap)
    }
  }
}
