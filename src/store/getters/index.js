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
  },
  categoriesByGameId: (state, getters) => gameId => {
    return _.filter(state.categories, item => (item.game_id + '') === gameId)
  },
  categoryByName: (state, getters) => categoryName => {
    return _.find(state.categories, item => (item.name) === categoryName)
  },
  categories: (state) => {
    return state.categories
  },
  customPlayGroupsById: (state, getters) => gameCode => {
    let playGroup = _.find(state.customPlayGroups, item => (item.code + '') === gameCode)
    return playGroup.component
  }
}
