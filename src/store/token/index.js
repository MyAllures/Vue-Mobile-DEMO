import {getJWTToken} from '@/utils'
export default {
  namespaced: true,
  state: {
    eagle: getJWTToken('eagle')
  },
  mutations: {
    addToken: (state, {type, token}) => {
      state[type] = token
    }
  },
  actions: {
    addToken: ({ commit }, data) => {
      commit('addToken', data)
    }
  }
}
