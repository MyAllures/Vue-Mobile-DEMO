import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import axios from 'axios'

import {
  fetchUser,
  login as userLogin,
  logout,
  fetchGames,
  fetchGamesDetail,
  fetchUnread,
  fetchCategories,
  getPromotions
} from '../../api'

const login = function ({ commit, state, dispatch }, { user }) {
  return userLogin(user).then(res => {
    let expires = new Date(res.expires_in)
    if (res.access_token && res.refresh_token) {
      localStorage.setItem('token_expire', res.expires_in)
      Vue.cookie.set('access_token', res.access_token, {
        expires: expires
      })
      Vue.cookie.set('refresh_token', res.refresh_token, {
        expires: expires
      })
      axios.defaults.withCredentials = true
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
    }
    return dispatch('fetchUser')
  }, error => {
    return Promise.reject(error)
  })
}

export default {
  login: login,
  logout: ({ commit, state }) => {
    return logout().then(
      res => {
        commit(types.RESET_USER)
      },
      errRes => Promise.reject(errRes)
    )
  },
  setUser: ({commit}, data) => {
    commit(types.SET_USER, data)
  },
  resetUser: ({commit}) => {
    commit(types.RESET_USER)
  },
  fetchUser: ({ commit, state }) => {
    return fetchUser().then(res => {
      if (res.length > 0) {
        const user = res[0]
        commit(types.SET_USER, {
          ...user,
          logined: true
        })
        return Promise.resolve(res[0])
      } else {
        return Promise.reject(res[0])
      }
    }, error => {
      commit(types.SET_USER, {
        logined: false
      })
      return Promise.reject(error)
    })
  },
  fetchGames: ({ commit, state }) => {
    return fetchGames().then(res => {
      commit(types.SET_GAMES, {
        games: res
      })
      const tagTable = {}
      res.forEach(game => {
        game.tag.forEach(t => {
          let gamesForTag
          if (tagTable[t]) {
            gamesForTag = tagTable[t]
          } else {
            gamesForTag = []
            tagTable[t] = gamesForTag
          }
          gamesForTag.push(game)
        })
      })
      commit(types.TAG_TABLE, tagTable)
      fetchGamesDetail().then(gamesDetial => {
        gamesDetial.forEach(({id, categories}) => {
          commit(types.SET_CATEGORIES, {
            gameId: id,
            categories: categories
          })
        })
      })
      return Promise.resolve(res)
    })
  },
  fetchUnread: ({ commit, state }) => {
    return fetchUnread().then(res => {
      commit(types.SET_UNREAD, {
        unread: res.message_count
      })
    })
  },
  fetchCategories: ({ commit, state }, gameId) => {
    return fetchCategories(gameId).then(res => {
      commit(types.SET_CATEGORIES, {
        gameId: gameId,
        categories: res
      })
      return res
    })
  },
  setSystemConfig: ({ commit }, data) => {
    commit(types.SET_SYSTEM_CONFIG, data)
  },
  openVerifyPopup: ({ commit }) => {
    commit(types.SHOW_VERIFY_POPUP)
  },
  closeVerifyPopup: ({ commit }) => {
    commit(types.CLOSE_VERIFY_POPUP)
  },
  updateEnvelope: ({commit}, setting) => {
    commit(types.UPDATE_ENVELOPE, setting)
  },
  initEmoji: ({commit}, emoji) => {
    commit(types.INIT_EMOJI, emoji)
  },
  addKeepAlive: ({ commit }, page) => {
    commit(types.ADD_KEEP_ALIVE, page)
  },
  removeKeepAlive: ({ commit }, page) => {
    commit(types.REMOVE_KEEP_ALIVE, page)
  },
  setWs: ({commit}, {ws, type}) => {
    commit(types.SET_WS, {ws, type})
  },
  initMessage: ({ commit }, messages) => {
    commit(types.INIT_MESSAGE, messages)
  },
  addMessage: ({ commit }, message) => {
    commit(types.ADD_MESSAGE, message)
  },
  initPersonalSetting: ({ commit }, setting) => {
    commit(types.INIT_PERSONAL_SETTING, setting)
  },
  updatePersonalSetting: ({ commit }, type) => {
    commit(types.UPDATE_PERSONAL_SETTING, type)
  },
  setAnnounce: ({ commit }, announce) => {
    commit(types.SET_ANNOUNCE, announce)
  },
  updateGameInfo: ({commit}, info) => {
    commit(types.UPDATE_GAME_INFO, info)
  },
  openBetDialog: ({commit}, bets) => {
    commit(types.OPEN_BET_DIALOG, bets)
  },
  closeBetDialog: ({commit}, isSuccess) => {
    commit(types.CLOSE_BET_DIALOG, isSuccess)
  },
  setCustomTitle: ({commit}, title) => {
    commit(types.SET_TITLE, title)
  },
  setCurrentGameResult: ({ commit }, result) => {
    commit(types.SET_CURRENTGAME_RESULT, result)
  },
  removeWinNotification: ({ commit }) => {
    commit(types.REMOVE_WINNOTIFICATION)
  },
  addWinNotification: ({ commit }, notification) => {
    commit(types.ADD_WINNOTIFICATION, notification)
  },
  fetchPromotions: ({commit}) => {
    return getPromotions().then(response => {
      commit(types.SET_PROMOTION, response.filter(item => item.image_mobile))
    })
  }
}
