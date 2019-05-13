import {eagle} from '@/api'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    ws: null,
    status: '',
    messages: [],
    permission: null,
    emojiMap: null,
    isManager: false,
    loading: true,
    roomList: [],
    isRoomExist: true,
    redEnvelopeStatus: {}
  },
  mutations: {
    setStatus: (state, status) => {
      state.status = status
    },
    setWs: (state, ws) => {
      state.ws = ws
    },
    init: (state, data) => {
      state.loading = false
      state.messages = data.recent_messages
      state.permission = data.user.chat_permission
      state.isManager = data.user.is_manager
      state.redEnvelopeStatus = data.red_envelopes || {}
    },
    roomList: (state, roomList) => {
      state.roomList = roomList
    },
    clear: (state, data) => {
      state.loading = true
      state.messages = []
      state.permission = null
      state.isManager = false
    },
    receiveMsg: (state, message) => {
      if (state.messages.length > 300) {
        state.messages = state.messages.slice(100)
      }
      state.messages.push(message)
    },
    initEmoji: (state, emojiMap) => {
      state.emojiMap = emojiMap
    },
    updateRedEnvelopeStatus: (state, {id, status}) => {
      Vue.set(state.redEnvelopeStatus, id, status)
    },
    updatePermission: (state, permission) => {
      state.permission = permission
    }
  },
  actions: {
    setStatus: ({ commit }, status) => {
      commit('setStatus', status)
    },
    setWs: ({ commit }, ws) => {
      commit('setWs', ws)
    },
    init: ({ commit }, data) => {
      commit('init', data)
    },
    roomList: ({ commit }) => {
      return eagle.fetchGlobalData().then(res => {
        commit('roomList', res.available_rooms)
        return res.available_rooms
      })
    },
    clear: ({ commit }, data) => {
      commit('clear', data)
    },
    receiveMsg: ({ commit }, message) => {
      commit('receiveMsg', message)
    },
    initEmoji: ({commit}) => {
      eagle.fetchStickers().then(res => {
        const emojiMap = {}
        res.forEach((series, index) => {
          emojiMap[series.id] = { ...series, order: index }
        })
        commit('initEmoji', emojiMap)
      }).catch(() => {

      })
    },
    updateRedEnvelopeStatus: ({commit}, data) => {
      commit('updateRedEnvelopeStatus', data)
    },
    updatePermission: ({commit}, data) => {
      commit('updatePermission', data)
    }
  }
}
