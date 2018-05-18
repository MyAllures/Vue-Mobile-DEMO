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
  [types.SET_REMIT]: (state, remitPayee) => {
    state.remitPayee = remitPayee
  },
  [types.ADD_KEEP_ALIVE]: (state, page) => {
    if (!state.keepAlivePage.includes(page)) {
      state.keepAlivePage.push(page)
    }
  },
  [types.REMOVE_KEEP_ALIVE]: (state, page) => {
    let index = state.keepAlivePage.indexOf(page)
    if (index > -1) {
      state.keepAlivePage.splice(index, 1)
    }
  }
}
