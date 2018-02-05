import Vue from 'vue'
import * as types from '../mutations/mutation-types'
import router from '../../router'
import axios from 'axios'
import {
  fetchUser,
  login as userLogin,
  register,
  logout,
  fetchGames,
  fetchUnread,
  fetchCategories
} from '../../api'

const login = function ({ commit, state }, { user }) {
  return userLogin(user).then(res => {
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
}

export default {
  login: login,
  tryDemo ({ commit, state }, verification) {
    if (!verification) {
      verification = {}
    }
    commit('UPDATE_LOADING', {isLoading: true})
    return register({
      account_type: 0,
      verification_code_0: verification.verification_code_0,
      verification_code_1: verification.verification_code_1
    }).then(user => {
      commit('UPDATE_LOADING', {isLoading: false})
      return login({ commit, state }, { user })
    }).catch(error => {
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
      commit(types.SET_CATEGORIES, res)
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
  }
}
