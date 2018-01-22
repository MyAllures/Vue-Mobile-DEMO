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
    state.unread = unread
  }
}
