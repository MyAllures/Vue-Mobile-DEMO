import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import router from '../../router'
import axios from 'axios'
import _ from 'lodash'
import {
  fetchUser,
  login,
  logout,
  fetchGames,
  fetchUnread,
  fetchCategories
} from '../../api'

const formatPlayInGroup = function (group) {
  let formattedPlays = _.chunk(group.plays, group.col_num)
  if (formattedPlays[formattedPlays.length - 1].length === 1) {
    if (group.col_num === 2) {
      // 將最後一組併入前一組
      let last = formattedPlays.pop()
      formattedPlays[formattedPlays.length - 1].push(last[0])
    } else {
      // 將最後一組與其前一組平分
      formattedPlays[formattedPlays.length - 1].unshift(formattedPlays[formattedPlays.length - 2].pop())
    }
  }
  return formattedPlays
}

export default {
  login: ({ commit, state }, { user }) => {
    return login(user).then(res => {
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
      commit(types.SET_USER, {
        user: {
          logined: true
        }
      })
      return Promise.resolve(res)
    }, error => {
      return Promise.reject(error)
    })
  },
  logout: ({ commit, state }) => {
    return logout().then(
      res => {
        router.push('/')
        Vue.cookie.delete('access_token')
        Vue.cookie.delete('refresh_token')
        commit(types.RESET_USER)
      },
      errRes => Promise.reject(errRes)
    )
  },
  fetchUser: ({ commit, state }) => {
    return fetchUser().then(res => {
      if (res.length > 0) {
        commit(types.SET_USER, {
          user: {
            ...res[0],
            logined: true
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
      const categories = res
      categories.forEach(category => {
        category.tabs.forEach(tab => {
          tab.groups.forEach(group => {
            group.plays = formatPlayInGroup(group)
          })
        })
      })
      commit(types.SET_CATEGORIES, categories)
      return categories
    })
  },
  setSystemConfig: ({ commit }, data) => {
    commit(types.SET_SYSTEM_CONFIG, data)
  }
}
