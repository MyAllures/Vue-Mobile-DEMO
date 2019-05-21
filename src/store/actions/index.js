import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import {
  axiosGhost,
  axiosEagle,
  fetchUser,
  login as userLogin,
  logout,
  fetchGames,
  fetchGamesDetail,
  fetchCategories,
  getPromotions,
  fetchBanner,
  fetchUnreadCount,
  fetchAnnouncements,
  eagle
} from '../../api'
import {take, find} from 'lodash'
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
      axiosGhost.defaults.withCredentials = true
      axiosGhost.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      axiosEagle.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      if (res.agent) {
        commit(types.SET_USER, {
          ...user,
          agent: res.agent
        })
      }
    }
    return dispatch('fetchUser')
  }, error => {
    return Promise.reject(error)
  })
}

export default {
  login: login,
  logout: ({ commit, state, dispatch }) => {
    return logout().then(
      res => {
        commit(types.RESET_USER)
        dispatch('customerService/clearMessage')
        dispatch('customerService/setServiceUnread', false)
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
  fetchBanner: ({commit, state}) => {
    fetchBanner().then(res => {
      const banners = res.map((banner, index) => {
        return {
          url: 'javascript:',
          img: banner.image
        }
      })
      commit(types.SET_BANNERS, take(banners, 1))

      setTimeout(() => {
        commit(types.SET_BANNERS, banners)
      }, 1000)
    }).catch(() => {})
  },
  fetchAnnouncements: ({commit, state}) => {
    fetchAnnouncements().then(result => {
      const datas = []
      result.forEach((item) => {
        if (item.platform !== 1) {
          datas.push(item)
        }
      })

      if (datas.length > 0) {
        datas.sort((a, b) => {
          return a.rank - b.rank
        })
      }
      commit(types.SET_ANNOUNCE, {page: 'homepage', announce: datas.map(data => data.announcement)})
    }
    )
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
      const { gameGroups } = res.filter(group => group.group_tag)
        .sort((p, l) => p.group_tag.rank - l.group_tag.rank)
        .reduce((merged, g, index) => ({
          ...merged,
          gameGroups: {
            ...merged.gameGroups,
            [g.group_tag.name]: g.group_tag.default
          }
        }), {})
      Object.keys(gameGroups).forEach(d => {
        gameGroups[d] = gameGroups[d].filter(gameCode => !!find(res, {code: gameCode})).map(gameCode => find(res, {code: gameCode}))
      })

      const tagTable = {
        '热门游戏': res.slice(0, 23)
      }

      commit(types.SET_GAMES, {
        games: res
      })
      commit(types.TAG_TABLE, {...tagTable, ...gameGroups})
      fetchGamesDetail().then(gamesDetail => {
        const totalBettrackPositions = {}
        gamesDetail.forEach(({id, categories, playpositions}) => {
          if (playpositions) {
            totalBettrackPositions[id] = {
              max_opts: playpositions.max_opts,
              positions: playpositions.data
            }
          }
          commit(types.SET_CATEGORIES, {
            gameId: id,
            categories
          })
        })
        commit(types.SET_BETTRACK_POSITIONS, totalBettrackPositions)
      })
      return Promise.resolve(res)
    })
  },
  setUnread: ({commit}, count) => {
    commit(types.SET_UNREAD, count)
  },
  initUnread: ({commit}) => {
    fetchUnreadCount().then(res => {
      commit(types.ADD_UNREAD, res.message_count)
    })
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
  setAnnounce: ({ commit }, data) => {
    commit(types.SET_ANNOUNCE, data)
  },
  setBanners: ({ commit }, banners) => {
    commit(types.SET_BANNERS, banners)
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
  },
  setTheme: ({commit}, id) => {
    commit(types.SET_THEME, id)
  },
  showRightMenu: ({commit}) => {
    commit(types.SHOW_RIGHT_MENU)
  },
  hideRightMenu: ({commit}) => {
    commit(types.HIDE_RIGHT_MENU)
  },
  fetchChatRoomUserInfo: ({commit, state}) => {
    Promise.all([eagle.fetchChatRoomUserInfo(state.user.username), eagle.fetchFolloweeList().catch(() => []), eagle.fetchFilters(state.user.username)]).then(([user, followeeList, filters]) => {
      commit(types.SET_USER, {
        followeeList,
        followable: user.followable,
        filters
      })
    }).catch(e => {

    })
  },
  toggleFollowee: ({commit}, followee) => {
    return eagle.toggleFollowee(followee.username).then(res => {
      commit(types.TOGGLE_FOLLOWEE, followee)
      return res
    })
  },
  updateFilters: ({ commit }, data) => {
    commit(types.UPDATE_FILTERS, data)
  }
}
