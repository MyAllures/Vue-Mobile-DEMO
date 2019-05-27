import {find} from 'lodash'

export default {
  user: (state, getters) => {
    return state.user
  },
  allGames: (state, getters) => {
    return state.games
  },
  sortedGames: state => {
    return state.games.reduce((acc, cur) => {
      (acc[cur.group_tag.rank] = acc[cur.group_tag.rank] || {}).name = cur.group_tag.name;
      (acc[cur.group_tag.rank].data = acc[cur.group_tag.rank].data || []).push({
        code: cur.code,
        name: cur.display_name
      })
      return acc
    }, {})
  },
  gameById: (state, getters) => id => {
    return find(state.games, game => (game.id + '') === id)
  }
}
