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
      count: false,
      detail: {}
    },
    referral: {
      enabled: false,
      count: false,
      detail: {},
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
      if (detail) {
        state[type].enabled = enabled
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
    fetchActV2: ({ commit }) => {
      fetchActV2All().then(response => {
        const promises = []
        if (response.indexOf('engagement_boost') > -1) {
          promises.push(fetchActV2('engagement_boost'))
        }
        if (response.indexOf('referral') > -1) {
          promises.push(fetchActV2('referral'))
        }
        Promise.all(promises).then(response => {
          response.forEach(act => {
            if (act.type === 'engagement_boost') {
              commit('setAct', {
                type: 'boost',
                enabled: true,
                detail: act
              })
            } else if (act.type === 'referral') {
              commit('setAct', {
                type: 'referral',
                enabled: true,
                detail: act
              })
            }
          })
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
