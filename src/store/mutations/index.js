import * as types from './mutation-types'

export default {
  [types.UPDATE_LOADING]: (state, payload) => {
    state.isLoading = payload.isLoading
  }
}
