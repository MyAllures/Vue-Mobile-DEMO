<template>
  <div class="wrapper">
    <road-beads
      v-if="gameCode && contentType === 'roadbeads'"
      :gameCode="gameCode"
      :resultStatistic="resultStatistic">
    </road-beads>
    <leaderboards :listItems="leaderboard"
      :gameCode="gameCode"
      v-if="gameCode && contentType === 'leaderboard'">
    </leaderboards>
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
  props: {
    gameCode: {
      type: String
    },
    contentType: {
      type: String
    }
  },
  data () {
    return {
      currentGameId: [],
      games: [],
      resultStatistic: {},
      leaderboardData: [],
      loading: false
    }
  },
  methods: {
    fetchStatistic () {
      const code = this.gameCode
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
      const code = this.gameCode
      this.loading = true
      fetchStatistic(code).then(result => {
        if (Array.isArray(result) && !result.length) {
          this.leaderboardData = result
          this.loading = false
          return
        }
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
    leaderboard () {
      return this.leaderboardData.sort((a, b) => {
        return b.num - a.num
      })
    }
  },
  watch: {
    'gameCode': function (to) {
      clearInterval(this.interval)
      if (this.contentType === 'leaderboard') {
        this.fetchLeaderboard()
        this.pollLeaderboard()
      } else {
        this.fetchStatistic()
        this.pollStatistic()
      }
    },
    'allGames': function (allGames) {
      this.games = []
      const played = localStorage.getItem('lastGame')
      const noRoadBeadGames = ['fc3d', 'hkl', 'luckl']
      const current = _.find(allGames, game => (game.id + '') === played + '')
      let formattedAllGames = _.clone(allGames)

      if (this.contentType === 'roadbeads') {
        if (played) {
          this.currentGameId = noRoadBeadGames.includes(current.code) ? [allGames[0].id + ''] : [played]
        } else {
          this.currentGameId = [allGames[0].id + '']
        }

        formattedAllGames = _.reject(formattedAllGames, (o) => { return _.includes(noRoadBeadGames, o.code) })
      }

      if (this.contentType === 'leaderboard') {
        this.currentGameId = played ? [played] : [allGames[0].id + '']
      }
      _.each(formattedAllGames, (game) => {
        this.games.push(
          {
            name: game.display_name,
            value: game.id + ''
          }
        )
      })
    },
    'contentType': function (type) {
      clearInterval(this.interval)
      if (type === 'leaderboard') {
        this.fetchLeaderboard()
        this.pollLeaderboard()
      } else {
        this.fetchStatistic()
        this.pollStatistic()
      }
    }
  },
  created () {
    this.$store.dispatch('fetchGames')
    clearInterval(this.interval)
    if (this.contentType === 'leaderboard') {
      this.fetchLeaderboard()
      this.pollLeaderboard()
    } else {
      this.fetchStatistic()
      this.pollStatistic()
    }
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
.wrapper {
  height: calc(~"100% - "40px);
}

</style>
