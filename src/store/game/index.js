export default {
  namespaced: true,
  state: {
    code: '',
    displayName: '',
    schedule: {
      issueNumber: '',
      id: ''
    },
    isClosed: true
  },
  mutations: {
    init: (state, game) => {
      state.schedule = {
        issueNumber: '',
        id: ''
      }
      state.code = game.code
      state.displayName = game.display_name
    },
    updateStatus: (state, status) => {
      state.isClosed = status
    },
    updateIssueNumber: (state, {id, issueNumber}) => {
      state.schedule.issueNumber = issueNumber
      state.schedule.id = id
    }
  },
  actions: {
    init: ({ commit }, game) => {
      commit('init', game)
    },
    updateStatus: ({ commit }, status) => {
      commit('updateStatus', status)
    },
    updateIssueNumber: ({ commit }, data) => {
      commit('updateIssueNumber', data)
    }
  }
}
