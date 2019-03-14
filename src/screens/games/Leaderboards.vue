<template>
  <div class="leaderbaord-container">
    <div class="title">{{game.display_name}}</div>
    <div class="content">
      <div v-if="loading && !leaderboardData" class="text-center p-t-lg">
        <InlineLoading></InlineLoading>
      </div>
      <div v-else class="table-wrapper">
        <x-table full-bordered class="table">
          <thead>
            <tr>
              <td>彩种</td>
              <td>期数</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in leaderboard" :key="index">
              <td class="play text-center">
                <span v-if="item.type === 'in' || item.type === 'not_in'">{{item.type | typeFilter}} - {{item.title}}</span>
                <span v-else>{{item.title}} - {{item.type | typeFilter}}</span>
              </td>
              <td class="issue">
                {{item.num}}期
              </td>
            </tr>
          </tbody>
        </x-table>
      </div>
    </div>
  </div>
</template>

<script>
import { XTable, InlineLoading } from 'vux'
import { fetchStatistic } from '@/api'
import {HKL_GAMES} from '@/config'
import gameTranslator from '@/utils/gameTranslator'

export default {
  name: 'Leaderboards',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  filters: {
    typeFilter (val) {
      switch (val) {
        case 'dragon':
          return '龙'
        case 'tiger':
          return '虎'
        case 'bigger':
          return '大'
        case 'smaller':
          return '小'
        case 'great':
          return '极大'
        case 'tiny':
          return '极小'
        case 'outOfDefinition':
          return '无极值'
        case 'odd':
          return '单'
        case 'even':
          return '双'
        case 'straight':
          return '顺子'
        case 'half_straight':
          return '半顺'
        case 'misc_six':
          return '杂六'
        case 'pair':
          return '对子'
        case 'leopard':
          return '豹子'
        case 'blue':
          return '蓝波'
        case 'red':
          return '红波'
        case 'green':
          return '绿波'
        case 'equal':
          return '和'
        case 'gold':
          return '金'
        case 'wood':
          return '木'
        case 'water':
          return '水'
        case 'fire':
          return '火'
        case 'earth':
          return '土'
        case 'front_part_more':
          return '前多'
        case 'rear_part_more':
          return '后多'
        case 'odd_more':
          return '单多'
        case 'even_more':
          return '双多'
        case 'smaller_odd':
          return '小单'
        case 'smaller_even':
          return '小双'
        case 'bigger_odd':
          return '大单'
        case 'bigger_even':
          return '大双'
        case 'east':
          return '东'
        case 'west':
          return '西'
        case 'south':
          return '南'
        case 'north':
          return '北'
        case 'zhong':
          return '中'
        case 'fa':
          return '发'
        case 'bai':
          return '白'
        case 'sumodd':
          return '合数单'
        case 'sumeven':
          return '合数双'
        case 'sumbigger':
          return '合数大'
        case 'sumsmaller':
          return '合数小'
        case 'tailbigger':
          return '尾大'
        case 'tailsmaller':
          return '尾小'
        case 'tailprime':
          return '尾质'
        case 'tailcomposite':
          return '尾合'
        case 'prime':
          return '质'
        case 'composite':
          return '合'
        case 'in':
          return '必出号码'
        case 'not_in':
          return '不出号码'
        default:
          return val
      }
    }
  },
  components: {
    XTable, InlineLoading
  },
  data () {
    return {
      resultStatistic: null,
      leaderboardData: null,
      loading: false,
      firstFetch: true,
      gameType: HKL_GAMES.includes(this.game.code) ? 'hkl' : this.game.code
    }
  },
  computed: {
    leaderboard () {
      if (!this.leaderboardData) {
        return []
      }
      return this.leaderboardData.sort((a, b) => {
        return b.num - a.num
      })
    }
  },
  created () {
    this.fetchLeaderboard()
    this.pollLeaderboard()
  },
  methods: {
    fetchLeaderboard () {
      const code = this.game.code
      this.loading = true
      fetchStatistic(code).then(result => {
        if (Array.isArray(result) && !result.length) {
          this.leaderboardData = result
          this.loading = false
          return
        }
        const translator = gameTranslator[this.gameType]
        const frequencyStats = result.frequency_stats
        const keys = Object.keys(frequencyStats)
        const statistic = []
        keys.forEach((key) => {
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
        this.firstFetch = false
      })
    },
    pollLeaderboard () {
      this.interval = setInterval(() => {
        this.fetchLeaderboard()
      }, 60000)
    }
  },
  beforeDestroy () {
    clearInterval(this.interval)
  }
}
</script>

<style lang="less" scoped>
.leaderbaord-container {
  height: 100%;
  background-color: #fff;
  .title {
    font-size: 16px;
    height: 40px;
    line-height: 40px;
    background-color: #f5f5f5;
    text-align: center;
    z-index: 2;
  }
  .content {
    height: calc(~"100%" - 40px);
    overflow-y: auto;
  }
}

.table-wrapper {
  box-sizing: border-box;
  padding-bottom: 60px;
}

.table {
  background-color: #fff;
  .play, .issue {
    font-size: 18px;
  }
  .play {
    width: 60%;
    color: #4a4a4a;
  }
  .issue {
    color: @red;
  }
}

.vux-table {
  position: static;
}
</style>

