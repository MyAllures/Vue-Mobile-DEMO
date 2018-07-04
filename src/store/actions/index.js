import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import router from '../../router'
import axios from 'axios'
import _ from 'lodash'

import {
  fetchUser,
  login as userLogin,
  logout,
  fetchGames,
  fetchUnread,
  fetchCategories,
  fetchMatchCategory,
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
        router.push('/')
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
  fetchMatchCategories: ({ commit, state }, {game, matchId}) => {
    return fetchMatchCategory(game.id, matchId).then(res => {
      let dateToMatchMap = {}
      let matches = game.matches
      let matchCategories = []

      _.each(matches, (match) => {
        let gamedate = Vue.moment(match.start_time).format('MM月DD日')
        if (dateToMatchMap[gamedate]) {
          dateToMatchMap[gamedate].push(match)
        } else {
          dateToMatchMap[gamedate] = []
          dateToMatchMap[gamedate].push(match)
        }
      })

      let dateKeys = Object.keys(dateToMatchMap)
      matchCategories = _.map(dateKeys, (key, index1) => {
        let tabs = _.map(dateToMatchMap[key], (match) => {
          return {
            name: `${match.home_team.display_name} vs ${match.away_team.display_name}`,
            startTime: match.start_time,
            groups: res[0].tabs[0].groups,
            matchId: match.id,
            schedule: match.schedule
          }
        })
        return {
          id: 5000 + index1,
          name: key,
          code: `fifa_${key}`,
          tabs: tabs
        }
      })

      res = matchCategories

      commit(types.SET_CATEGORIES, {
        gameId: game.id,
        categories: res
      })
      return res
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
  setRemit: ({ commit }, remitPayee) => {
    commit(types.SET_REMIT, remitPayee)
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
  }
}
