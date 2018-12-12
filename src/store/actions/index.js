import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import axios from 'axios'
import {
  fetchUser,
  login as userLogin,
  logout,
  fetchGames,
  fetchGamesDetail,
  fetchCategories,
  getPromotions
} from '../../api'
import {HKL_GAMES} from '../../config'

const login = function ({ commit, state, dispatch }, { user }) {
  return userLogin(user).then(res => {
    if (state.user.logined) {
      commit('RESET_USER')
    }
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
      const tagTable = {}
      res.forEach(game => {
        if (HKL_GAMES.includes(game.code)) {
          game.type = 'hkl'
        }
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
      commit(types.SET_GAMES, {
        games: res
      })
      commit(types.TAG_TABLE, tagTable)
      fetchGamesDetail().then(gamesDetail => {
        gamesDetail.forEach(({id, categories, playpositions}) => {
          if (playpositions) {
            categories.push({
              code: 'playpositions',
              id: 'playpositions',
              name: '追号',
              playpositions
            })
          }
          commit(types.SET_CATEGORIES, {
            gameId: id,
            categories
          })
        })
      })
      return Promise.resolve(res)
    })
  },
  setUnread: ({commit}, count) => {
    commit(types.SET_UNREAD, count)
  },
  addUnread: ({commit}, count) => {
    commit(types.ADD_UNREAD, count)
  },
  fetchCategories: ({ commit, state }, gameId) => {
    return fetchCategories(gameId).then(res => {
      if (!state.categories[gameId]) {
        commit(types.SET_CATEGORIES, {
          gameId: gameId,
          categories: res
        })
      }
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
  updateDialog: ({commit}, option) => {
    commit(types.UPDATE_DIALOG, option)
  },
  setCustomTitle: ({commit}, title) => {
    commit(types.SET_TITLE, title)
  },
  setCurrentGameResult: ({ commit }, result) => {
    commit(types.SET_CURRENTGAME_RESULT, result)
  },
  removeNotification: ({ commit }) => {
    commit(types.REMOVE_NOTIFICATION)
  },
  addNotification: ({ commit }, notification) => {
    commit(types.ADD_NOTIFICATION, notification)
  },
  fetchPromotions: ({commit}) => {
    return getPromotions().then(response => {
      commit(types.SET_PROMOTION, response.filter(item => item.image_mobile))
    })
  },
  initLatestResultMap: ({ commit }, result) => {
    commit(types.INIT_LATEST_RESULT_MAP, result)
  },
  updateLatestResultMap: ({ commit }, {gameCode, latestResult}) => {
    commit(types.UPDATE_LATEST_RESULT_MAP, {gameCode, latestResult})
  },
  urgencySwitchGame: ({commit}, info) => {
    commit(types.SWITCH_GAME_STATE, info)
  },
  saveLastGame: ({commit}, id) => {
    commit(types.SAVE_LAST_GAME, id)
  },
  saveLastCategory: ({commit}, data) => {
    commit(types.SAVE_LAST_CATEGORY, data)
  }
}
