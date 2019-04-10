import {findIndex} from 'lodash'

export default {
  namespaced: true,
  state: {
    unread: false,
    messages: [],
    hasHistory: false
  },
  mutations: {
    setServiceUnread: (state, bool) => {
      state.unread = bool
    },
    addMessages: (state, messages) => {
      state.messages.push(...messages)
    },
    insertHistoryMessages: (state, messages) => {
      state.messages.splice(0, 0, ...messages)
    },
    updateMessage: (state, {msgid, newMessage}) => {
      const index = findIndex(state.messages, msg => msg.id === msgid)
      if (index !== -1) state.messages[index] = newMessage
    },
    deleteMessage: (state, {msgid}) => {
      const index = findIndex(state.messages, msg => msg.id === msgid)
      if (index !== -1) state.messages.splice(index, 1)
    },
    clearMessage: (state) => {
      state.messages = []
    },
    updateIsHasHistory: (state, isHas) => {
      state.hasHistory = isHas
    }
  },
  actions: {
    setServiceUnread: ({ commit }, bool) => {
      commit('setServiceUnread', bool)
    },
    addMessages: ({ commit }, messages) => {
      commit('addMessages', messages)
    },
    insertHistoryMessages: ({ commit }, messages) => {
      commit('insertHistoryMessages', messages)
    },
    updateMessage: ({ commit }, {msgid, newMessage}) => {
      commit('updateMessage', {msgid, newMessage})
    },
    deleteMessage: ({ commit }, {msgid}) => {
      commit('updateMessage', {msgid})
    },
    clearMessage: ({ commit }) => {
      commit('clearMessage')
    },
    updateIsHasHistory: ({ commit }, isHas) => {
      commit('updateIsHasHistory', isHas)
    }
  }
}
