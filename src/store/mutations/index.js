import Vue from 'vue'
import * as types from './mutation-types'

export default {
  [types.SET_USER]: (state, { user }) => {
    Vue.set(state, 'user', {
      ...state.user,
      ...user
    })
  },
  [types.RESET_USER]: (state) => {
    state.user = {
      logined: false
    }
    Vue.cookie.delete('access_token')
    Vue.cookie.delete('refresh_token')
  },
  [types.UPDATE_LOADING]: (state, payload) => {
    state.isLoading = payload.isLoading
  },
  [types.SET_GAMES]: (state, { games }) => {
    state.games = games
  },
  [types.SET_CATEGORIES]: (state, categories) => {
    state.categories = categories
  },
  [types.SET_SYSTEM_CONFIG]: (state, data) => {
    state.systemConfig = data
  },
  [types.SET_UNREAD]: (state, { unread }) => {
    state.user.unread = unread
  },
  [types.SHOW_VERIFY_POPUP]: (state) => {
    state.showVerifyPopup = true
  },
  [types.CLOSE_VERIFY_POPUP]: (state) => {
    state.showVerifyPopup = false
  },
  [types.UPDATE_ENVELOPE]: (state, {id, data}) => {
    const envelope = state.envelope[id]
    if (!envelope) {
      Vue.set(state.envelope, id, data)
    } else {
      // 不能用優先度較低的狀態更新較高的 例如已領完不能覆蓋掉已領取
      if (envelope.status && data.status && data.status > envelope.status) {
        data.status = envelope.status
      }
      // 以人數多的為主
      if (envelope.users && data.users && data.users.length < envelope.users.length) {
        data.users = envelope.users
      }
      Object.assign(envelope, data)
    }
  },
  [types.INIT_EMOJI]: (state, emojis) => {
    state.emojis = emojis
  }
}
