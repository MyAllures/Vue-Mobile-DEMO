import {
  fetchActV2,
  fetchActReCount
} from '@/api'

export default {
  namespaced: true,
  state: {
    boost: {
      enabled: false,
      count: false,
      detail: null
    },
    referral: {
      enabled: false,
      count: false,
      detail: null,
      list: []
    }
  },
  getters: {
    total: state => {
      return state.boost.count + state.referral.count
    }
  },
  mutations: {
    setAct: (state, { type, enabled, detail }) => {
      if (enabled !== undefined) {
        state[type].enabled = enabled
      }
      if (detail) {
        state[type].detail = detail
      }
    },
    setCount: (state, { type, count }) => {
      if (count !== null) {
        state[type].count = count
      }
    },
    clearCount: state => {
      state.boost.count = 0
      state.referral.count = 0
    },
    setRefList: (state, data) => {
      state.referral.list = data
    },
    setRefRemainCount: (state, { id, count }) => {
      const index = state.referral.list.findIndex(ref => ref.id === id)
      if (index > -1) {
        state.referral.list[index].envelope_count = count
      }
    }
  },
  actions: {
    setActEnabled ({ commit }, { boost, referral }) {
      commit('setAct', {
        type: 'boost',
        enabled: boost
      })
      commit('setAct', {
        type: 'referral',
        enabled: referral
      })
    },
    getAct: ({ commit, state }, type) => {
      const endpoints = {
        boost: 'engagement_boost',
        referral: 'referral'
      }
      fetchActV2(endpoints[type]).then(response => {
        commit('setAct', {
          type: type,
          detail: response
        })
      })
    },
    fetchActReCount: ({ commit }) => {
      fetchActReCount().then(response => {
        commit('setCount', {
          type: 'boost',
          count: response.remain_engagement_boost_envelope_count
        })
        commit('setCount', {
          type: 'referral',
          count: response.remain_referral_envelope_count
        })
      })
    },
    setCount: ({ commit }, { type, count }) => {
      commit('setCount', { type, count })
    },
    clearCount: ({ commit }) => {
      commit('clearCount')
    },
    setRefList: ({ commit }, data) => {
      commit('setRefList', data)
    },
    setRefRemainCount: ({ commit }, { id, count }) => {
      commit('setRefRemainCount', { id, count })
    }
  }
}
