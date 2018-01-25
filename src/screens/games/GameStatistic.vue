<template>
  <div>
    <road-beads
      v-if="currentGame && $route.name === 'RoadBeads'"
      :gameCode="currentGame.code"
      :resultStatistic="resultStatistic">
    </road-beads>
    <div class="game-selector text-center" @click="selectGame()">
      <span :class="['option', {'selected': currentGame.id}]">{{currentGame.display_name}}</span>
      <inline-loading v-if="loading"></inline-loading>
      <span class="arrow" v-else></span>
    </div>
    <leaderboards :listItems="leaderboard" v-if="currentGame && $route.name === 'Leaderboards'"></leaderboards>
    <x-address style="display: none"
      title="请选择"
      v-model="currentGameId"
      :list="games"
      :show.sync="showGameMenu">
    </x-address>
  </div>
</template>

<script>
import { XAddress, InlineLoading } from 'vux'
import { mapGetters } from 'vuex'
import RoadBeads from './RoadBeads'
import Leaderboards from './Leaderboards'
import { fetchStatistic } from '../../api'
import gameTranslator from '../../utils/gameTranslator'
import _ from 'lodash'

export default {
  name: 'GameStastics',
  data () {
    return {
      currentGameId: [],
      games: [],
      showGameMenu: false,
      resultStatistic: {},
      leaderboardData: [],
      loading: false
    }
  },
  methods: {
    selectGame () {
      if (this.loading) {
        return
      }
      this.showGameMenu = true
    },
    fetchStatistic () {
      const code = this.currentGame.code
      this.loading = true
      fetchStatistic(code).then(result => {
        this.resultStatistic = {
          resultSingleStatistic: result.result_single_statistic,
          historyStatistic: result.result_category_statistic
        }
        this.loading = false
      })
    },
    fetchLeaderboard () {
      const code = this.currentGame.code
      this.loading = true
      fetchStatistic(code).then(result => {
        const translator = gameTranslator[code]
        const frequencyStats = result.frequency_stats
        const keys = Object.keys(frequencyStats)
        const statistic = []
        _.each(keys, (key) => {
          let item = frequencyStats[key]
          let type = Object.keys(item)
          if (type.length === 0) {
            return
          }
          type = type[0]
          if (item[type] < 3) { // 連續三期以上
            return
          }
          let translated = translator(key)
          if (!translated[0]) {
            return
          }
          statistic.push({
            title: translated[0],
            type: translated[1] ? translated[1] + type : type,
            num: item[type]
          })
        })

        this.leaderboardData = statistic
        this.loading = false
      })
    },
    pollStatistic () { // todo: use websocket
      this.interval = setInterval(() => {
        this.fetchStatistic()
      }, 10000)
    },
    pollLeaderboard () {
      this.interval = setInterval(() => {
        this.fetchLeaderboard()
      }, 10000)
    }
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    currentGame () {
      let code = _.find(this.allGames, game => (game.id + '') === this.currentGameId[0])
      return code || { display_name: '请选择' }
    },
    leaderboard () {
      return this.leaderboardData.sort((a, b) => {
        return b.num - a.num
      })
    }
  },
  watch: {
    'currentGame.code': function (to) {
      clearInterval(this.interval)
      if (this.$route.name === 'Leaderboards') {
        this.fetchLeaderboard()
        this.pollLeaderboard()
      } else {
        this.fetchStatistic()
        this.pollStatistic()
      }
    },
    'allGames': function (allGames) {
      const played = localStorage.getItem('lastGame')
      this.currentGameId = played ? [played] : [allGames[0].id + '']
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
    XAddress, RoadBeads, Leaderboards, InlineLoading
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
  .arrow {
    display: inline-block;
    height: 6px;
    width: 6px;
    border-width: 2px 2px 0 0;
    border-color: #C8C8CD;
    border-style: solid;
    transform: rotate(135deg);
    margin-left: 3px;
    margin-bottom: 2px;
  }
}

</style>
