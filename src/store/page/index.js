export default {
  namespaced: true,
  state: {
    meta: {}
  },
  mutations: {
    updatePageSetting: (state, data) => {
      state.meta = data
    }
  },
  actions: {
    updatePageSetting: ({ commit }, data) => {
      commit('updatePageSetting', data)
    }
  }
}
