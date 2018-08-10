import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import router from '../../router'
import axios from 'axios'

import {
  fetchUser,
  login as userLogin,
  logout,
  fetchGames,
  fetchUnread,
  fetchCategories,
  fetchChatInfo,
  fetchRoomInfo
} from '../../api'

const login = function ({ commit, state }, { user }) {
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
    Vue.nextTick(() => {
      commit(types.SET_USER, {
        user: {
          logined: true
        }
      })
    })
    return Promise.resolve(res)
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
  fetchUser: ({ commit, state }) => {
    return fetchUser().then(res => {
      if (res.length > 0) {
        const user = res[0]
        if (user.account_type && !state.user.planMakerRoom) {
          fetchChatInfo(user.username).then(res => {
            commit(types.SET_USER, {
              user: {
                planMakerRoom: res.data.plan_maker_rooms || []
              }
            })
          }).catch(e => { })
        }
        if (!state.roomInfo) {
          fetchRoomInfo().then(res => {
            const roomInfo = {}
            res.forEach(room => {
              roomInfo[room.id] = {name: room.title, status: room.status}
            })
            commit(types.SET_ROOM_INFO, roomInfo)
          }).catch(() => {})
        }
        commit(types.SET_USER, {
          user: {
            ...user,
            logined: true,
            planMakerRoom: state.user.planMakerRoom || []
          }
        })
        return Promise.resolve(res[0])
      } else {
        return Promise.reject(res[0])
      }
    }, error => {
      commit(types.SET_USER, {
        user: {
          logined: false
        }
      })
      return Promise.reject(error)
    })
  },
  fetchGames: ({ commit, state }) => {
    return fetchGames().then(res => {
      commit(types.SET_GAMES, {
        games: res
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
  setWs: ({commit}, ws) => {
    commit(types.SET_WS, ws)
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
  }
}
