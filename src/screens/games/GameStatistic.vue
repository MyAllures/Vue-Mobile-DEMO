<template>
  <div>
    <road-beads
      v-if="currentGame && $route.name === 'RoadBeads'"
      :gameCode="currentGame.code"
      :resultStatistic="resultStatistic">
    </road-beads>
    <div class="game-selector text-center" @click="showGameMenu = true">
      <span :class="['option', {'selected': currentGame.id}]">{{currentGame.display_name}}</span>
    </div>
    <x-address style="display: none"
      title="请选择"
      v-model="currentGameId"
      :list="games"
      :show.sync="showGameMenu">
    </x-address>
  </div>
</template>

<script>
import { XAddress } from 'vux'
import { mapGetters } from 'vuex'
import RoadBeads from './RoadBeads'
import { fetchStatistic } from '../../api'
import _ from 'lodash'

export default {
  name: 'GameStastics',
  data () {
    return {
      currentGameId: [],
      games: [],
      showGameMenu: false,
      resultStatistic: {}
    }
  },
  methods: {
    fetchStatistic () {
      const code = this.currentGame.code
      fetchStatistic(code).then(result => {
        this.resultStatistic = {
          resultSingleStatistic: result.result_single_statistic,
          historyStatistic: result.result_category_statistic
        }
      })
    },
    pollStatistic () { // todo: use websocket
      this.interval = setInterval(() => {
        this.fetchStatistic()
      }, 10000)
    }
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    currentGame () {
      let code = _.find(this.allGames, game => (game.id + '') === this.currentGameId[0])
      return code || { display_name: '請選擇' }
    }
  },
  watch: {
    'currentGame.code': function (to) {
      this.fetchStatistic(to.code)
      this.pollStatistic()
    },
    'allGames': function (allGames) {
      this.currentGameId = [allGames[0].id + '']
      _.each(this.allGames, (game) => {
        if (game.code !== 'hkl' && game.code !== 'fc3d') {
          this.games.push(
            {
              name: game.display_name,
              value: game.id + ''
            }
        )
        }
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('fetchGames')
    })
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  components: {
    XAddress,
    RoadBeads
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';

.game-selector {
  position: fixed;
  width: 100%;
  height: 45px;
  line-height: 45px;
  background-color: #fff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.5);
  .option {
    font-size: 14px;
    color: #c8c8cd;
    &.selected {
      color: @azul;
    }
  }
}

</style>
