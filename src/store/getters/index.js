import _ from 'lodash'

export default {
  user: (state, getters) => {
    return state.user
  },
  allGames: (state, getters) => {
    return state.games
  },
  gameById: (state, getters) => id => {
    return _.find(state.games, game => (game.id + '') === id)
  }
}
