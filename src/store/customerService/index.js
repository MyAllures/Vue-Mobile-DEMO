import {findIndex} from 'lodash'

export default {
  namespaced: true,
  state: {
    unread: 0,
    messages: []
  },
  mutations: {
    setServiceUnread: (state, count) => {
      state.unread = +count
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
    }
  },
  actions: {
    setServiceUnread: ({ commit }, count) => {
      commit('setServiceUnread', count)
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
    }
  }
}
