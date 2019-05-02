import {
  fetchActV2All,
  fetchActV2,
  fetchActReCount
} from '@/api'

export default {
  namespaced: true,
  state: {
    boost: {
      enabled: false,
      count: 0,
      detail: {}
    },
    referral: {
      enabled: false,
      count: 0,
      detail: {}
    }
  },
  getters: {
    total: state => {
      return state.boost.count + state.referral.count
    }
  },
  mutations: {
    setAct: (state, { type, enabled, detail }) => {
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
    }
  },
  actions: {
    fetchActV2: ({ commit }) => {
      fetchActV2All().then(async response => {
        if (response.indexOf('engagement_boost') > -1) {
          await fetchActV2('engagement_boost').then(response => {
            commit('setAct', {
              type: 'boost',
              enabled: true,
              detail: response
            })
          })
        }
        if (response.indexOf('referral') > -1) {
          await fetchActV2('referral').then(response => {
            commit('setAct', {
              type: 'referral',
              enabled: true,
              detail: response
            })
          })
        }
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
    clearCount: ({ commit }) => {
      commit('clearCount')
    }
  }
}
