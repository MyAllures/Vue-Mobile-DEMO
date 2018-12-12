import Vue from 'vue'
import * as types from './mutation-types'
import {saveLastGameData} from '../../utils'

export default {
  [types.SET_USER]: (state, user) => {
    Vue.set(state, 'user', {
      ...state.user,
      ...user
    })
  },
  [types.RESET_USER]: (state) => {
    state.user = {
      logined: false
    }
    if (state.ws.raven) {
      state.ws.raven.disconnect()
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
  [types.SET_CATEGORIES]: (state, {gameId, categories}) => {
    Vue.set(state.categories, gameId, categories)
  },
  [types.SET_SYSTEM_CONFIG]: (state, data) => {
    state.systemConfig = data
  },
  [types.SET_UNREAD]: (state, count) => {
    state.user.unread = count
  },
  [types.ADD_UNREAD]: (state, count) => {
    state.user.unread += count
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
  },
  [types.SET_WS]: (state, {ws, type}) => {
    state.ws[type] = ws
  },
  [types.INIT_PERSONAL_SETTING]: (state, setting) => {
    state.personal_setting = setting
  },
  [types.UPDATE_PERSONAL_SETTING]: (state, type) => {
    switch (type) {
      case 'unblock':
        state.personal_setting.blocked = false
        break
      case 'unbanned':
        state.personal_setting.banned = false
        break
      case 'blocked':
        state.personal_setting.blocked = true
        break
      case 'banned':
        state.personal_setting.banned = true
        break
    }
  },
  [types.INIT_MESSAGE]: (state, messages) => {
    state.messages = messages
  },
  [types.ADD_MESSAGE]: (state, message) => {
    state.messages.push(message)
  },
  [types.SET_ANNOUNCE]: (state, announce) => {
    state.announce = announce
  },
  [types.UPDATE_GAME_INFO]: (state, info) => {
    state.gameInfo = {...state.gameInfo, ...info}
  },
  [types.SET_ROOM_INFO]: (state, info) => {
    state.roomInfo = info
  },
  [types.SET_ROOM_ID]: (state, id) => {
    state.roomId = id
  },
  [types.UPDATE_DIALOG]: (state, option) => {
    state.dialog[option.name] = option.state
  },
  [types.SET_TITLE]: (state, title) => {
    state.customTitle = title
  },
  [types.SET_CURRENTGAME_RESULT]: (state, result) => {
    let obj = result[0] || result
    state.currentGameResult = obj
  },
  [types.SHOW_NOTIFICATION]: (state) => {
    state.notificationVisible = true
  },
  [types.HIDE_NOTIFICATION]: (state) => {
    state.notificationVisible = false
  },
  [types.ADD_NOTIFICATION]: (state, notification) => {
    state.notifications.push(notification)
  },
  [types.REMOVE_NOTIFICATION]: (state, index) => {
    state.notifications.shift()
  },
  [types.CLEAR_NOTIFICATION]: (state, index) => {
    state.notifications = []
  },
  [types.TAG_TABLE]: (state, table) => {
    state.tagTable = table
  },
  [types.SET_PROMOTION]: (state, promotions) => {
    state.promotions = promotions
  },
  [types.INIT_LATEST_RESULT_MAP]: (state, latestResultMap) => {
    state.latestResultMap = latestResultMap
  },
  [types.UPDATE_LATEST_RESULT_MAP]: (state, {gameCode, latestResult}) => {
    state.latestResultMap[gameCode] = latestResult
  },
  [types.SWITCH_GAME_STATE]: (state, info) => {
    state.urgencySwitchedGame = info
  },
  [types.SAVE_LAST_GAME]: (state, id) => {
    state.lastGameData.lastGame = id
    saveLastGameData(state.lastGameData)
  },
  [types.SAVE_LAST_CATEGORY]: (state, {gameId, categoryId}) => {
    state.lastGameData.lastCategory[gameId] = categoryId
    saveLastGameData(state.lastGameData)
  }
}
