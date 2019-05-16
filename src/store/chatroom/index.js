import {eagle} from '@/api'
import Vue from 'vue'

export default {
  namespaced: true,
  state: {
    ws: null,
    currentRoomId: '',
    status: '',
    messages: [],
    permission: null,
    emojiMap: null,
    isManager: false,
    loading: true,
    roomList: [],
    isRoomExist: true,
    redEnvelopeStatus: {},
    roomName: '聊天室'
  },
  mutations: {
    setStatus: (state, status) => {
      state.status = status
    },
    setWs: (state, ws) => {
      state.ws = ws
    },
    setRoomInfo: (state, data) => {
      Object.assign(state, data)
    },
    init: (state, data) => {
      state.loading = false
      state.messages = data.recent_messages
      state.permission = data.user.chat_permission
      state.isManager = data.user.is_manager
      state.redEnvelopeStatus = data.red_envelopes || {}
      state.roomName = data.room.display_name
    },
    roomList: (state, roomList) => {
      state.roomList = roomList
    },
    removeRoom: (state, id) => {
      let idx = state.roomList.indexOf(id)
      if (idx !== -1) {
        state.roomList.splice(idx, 1)
      }
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
    setRoomInfo: ({commit}, data) => {
      commit('setRoomInfo', data)
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
    removeRoom: ({ commit }, id) => {
      commit('removeRoom', id)
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
