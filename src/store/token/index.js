import {getJWTToken} from '@/utils'
export default {
  namespaced: true,
  state: {
    eagle: getJWTToken('eagle')
  },
  mutations: {
    addToken: (state, {type, token}) => {
      state[type] = token
    },
    clear: (state) => {
      Object.keys(state).forEach(key => {
        state[key] = ''
      })
    }
  },
  actions: {
    addToken: ({ commit }, data) => {
      commit('addToken', data)
    },
    clear: ({ commit }) => {
      commit('clear')
    }
  }
}
