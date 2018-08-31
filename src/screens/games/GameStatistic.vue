<template>
  <div class="container">
    <div class="wrapper" v-if="contentType === 'roadbeads' && gameCode">
      <road-beads :loading="loading"
        :firstFetch="firstFetch"
        v-if="!noRoadBeadGames.includes(gameCode)"
        :gameCode="gameCode"
        :resultStatistic="resultStatistic">
      </road-beads>
      <p v-else class="no-data text-center">暂无路珠统计</p>
    </div>
    <div class="wrapper" v-if="contentType === 'leaderboard' && gameCode">
      <leaderboards v-if="!noLeaderBoardGames.includes(gameCode)"
        :loading="loading"
        :firstFetch="firstFetch"
        :listItems="leaderboard">
      </leaderboards>
      <p v-else class="no-data text-center">暂无排行榜</p>
    </div>
  </div>
</template>

<script>
import RoadBeads from './RoadBeads'
import Leaderboards from './Leaderboards'
import { fetchStatistic } from '../../api'
import gameTranslator from '../../utils/gameTranslator'
import _ from 'lodash'
const noRoadBeadGames = ['fc3d', 'hkl', 'luckl']
const noLeaderBoardGames = []

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
      games: [],
      resultStatistic: {},
      leaderboardData: [],
      loading: false,
      noRoadBeadGames,
      noLeaderBoardGames,
      firstFetch: true

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
    pollStatistic () {
      this.interval = setInterval(() => {
        this.fetchStatistic()
        this.firstFetch = false
      }, 10000)
    },
    pollLeaderboard () {
      this.interval = setInterval(() => {
        this.fetchLeaderboard()
        this.firstFetch = false
      }, 10000)
    },
    initFetch () {
      clearInterval(this.interval)
      if (this.contentType === 'leaderboard') {
        this.fetchLeaderboard()
        this.pollLeaderboard()
      } else {
        this.fetchStatistic()
        this.pollStatistic()
      }
    }
  },
  computed: {
    leaderboard () {
      return this.leaderboardData.sort((a, b) => {
        return b.num - a.num
      })
    }
  },
  watch: {
    'gameCode': function (to) {
      this.initFetch()
    },
    'contentType': {
      handler: function (type) {
        this.initFetch()
      },
      immediate: true
    }
  },
  created () {
  },
  beforeDestroy () {
    clearInterval(this.interval)
  },
  components: {
    RoadBeads, Leaderboards
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';

.container {
  height: 100%;
}

.wrapper {
  height: calc(~"100% - "40px);
}

.no-data {
  color: #666;
  font-size: 20px;
  padding-top: 40px;
}
</style>
