<template>
  <div class="result-balls">
    <div class="balls-text">{{result&&result.issue_number}}{{$t('common.result_period')}}</div>
    <div :class="['balls-number', 'wrapper-' + gameType]" v-if="result && !result.loading">
      <div class="balls-frame">
        <div v-if="result.status!=='valid'">官方开奖无效</div>
        <div
          v-else
          v-for="(num, index) in resultNums"
          :key="index"
          :class="getResultClass(num)">
          <span class="num">{{num.data}}</span>
          <p class="ball-zodiac" v-if="resultZodiac"> {{resultZodiac[index]}} </p>
        </div>
      </div>
    </div>
    <game-result-animate
      v-else-if="result"
      :gameCode="result.game_code"
      :lastNums="lastNums"
      :resultNums="resultNums" />
  </div>
</template>

<script>
import GameResultAnimate from './GameResultAnimate'
import _ from 'lodash'
import {HKL_GAMES} from '../config'

export default {
  props: {
    result: Object
  },
  components: {
    GameResultAnimate
  },
  data () {
    return {
      lastNums: []
    }
  },
  watch: {
    'result': function (code) {
      this.lastNums = []
    }
  },
  computed: {
    gameType () {
      if (HKL_GAMES.includes(this.result.game_code)) {
        return 'hkl'
      }
      return this.result.game_code
    },
    resultNums () {
      if (!this.result.result_str) {
        return this.$t('navMenu.no_result')
      }
      let rawNums = this.result.result_str.split(',')
      let formattedNums = []
      if (this.result.game_code === 'bjkl8') {
        rawNums.pop()
      }

      rawNums.forEach((rawBall) => {
        if (rawBall[0] === '0' && rawBall !== '0') {
          rawBall = rawBall.slice(1)
        }
        formattedNums.push({type: 'num', data: rawBall})

        this.lastNums.push(rawBall)
      })

      if (this.gameType === 'hkl') {
        formattedNums.splice(6, 0, {type: 'text', data: '＋'})
      } else if (this.result.game_code === 'pcdd' || this.result.game_code === 'jnd28' || this.result.game_code === 'luckdd') {
        formattedNums.push({type: 'text', data: '总和'})

        this.lastNums.push('')
        const sum = _.reduce(rawNums, (sum, nums) => { return sum + Number(nums) }, 0)
        formattedNums.push({type: 'num', data: sum})

        this.lastNums.push(sum)
      }
      return formattedNums
    },
    resultZodiac () {
      if (this.result.zodiac) {
        let arr
        if (typeof (this.result.zodiac) === 'string') {
          arr = this.result.zodiac.split(',')
        } else {
          arr = this.result.zodiac.slice()
        }

        arr.splice(6, 0, '+')
        return arr
      } else {
        return null
      }
    }
  },
  methods: {
    getResultClass (num) {
      if (num.type === 'text') {
        return ['text', 'result']
      }
      let gameClass = `result-${this.result.game_code}`
      let resultClass = `resultnum-${num.data}`
      return [gameClass, resultClass, 'result']
    }
  }
}
</script>

<style lang="scss" scoped>

.result-balls {
  width: 100%;
  flex:0 0 auto;
  display: flex;
  color: #999;
  padding: 5px 0;
  .balls-text {
    font-size: 14px;
    flex: 1;
    align-self: center;
    text-align: center;
    white-space: nowrap;
  }
  @media screen and (max-width: 320px) {
    .balls-text {
      font-size: 12px;
    }
  }
  .balls-number {
    display: flex;
    flex: 2.5;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
    .balls-frame {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      max-width: 265px;
    }
  }
  .text {
    font-size: 12px;
    .ball-zodiac {
      text-indent: -9999px;
    }
  }

  .result {
    margin-right: 3px;
  }
  .ball-sum {
    display: inline-block;
    font-size: 12px;
  }
  .ball-zodiac {
    text-align: center;
    font-size: 13px;
    margin-left: 1px;
  }
  .wrapper-hkl .result{
    margin-bottom: 2px;
  }
  .result-bjkl8,.result-auluck8  {
    margin-bottom: 2px;
  }
}
</style>
