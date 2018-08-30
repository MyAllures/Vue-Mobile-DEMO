<template>
  <div class="result-balls">
    <div class="balls-text">{{result&&result.issue_number}}{{$t('common.result_period')}}</div>
    <div :class="['balls-number', 'wrapper-' + result.game_code]" v-if="result && !loading">
      <div class="balls-frame">
        <div v-if="result.status!=='valid'">官方开奖无效</div>
        <div
          v-else
          v-for="(num, index) in resultNums"
          :key="index"
          :class="getResultClass(num)">
          <b> {{num.data}} </b>
          <p class="ball-zodiac" v-if="resultZodiac"> {{resultZodiac[index]}} </p>
        </div>
      </div>
    </div>
    <game-result-animate v-else-if="result" :gameCode="result.game_code" :resultNums="resultNums" />
  </div>
</template>

<script>
import GameResultAnimate from './GameResultAnimate'
import _ from 'lodash'

export default {
  props: {
    result: Object,
    loading: Boolean
  },
  components: {
    GameResultAnimate
  },
  computed: {
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
          formattedNums.push({type: 'num', data: rawBall.slice(1)})
          return
        }
        formattedNums.push({type: 'num', data: rawBall})
      })
      if (this.result.game_code === 'luckl' || this.result.game_code === 'hkl') {
        formattedNums.splice(6, 0, {type: 'text', data: '＋'})
      } else if (this.result.game_code === 'pcdd' || this.result.game_code === 'jnd28' || this.result.game_code === 'luckdd') {
        formattedNums.push({type: 'text', data: '总和'})
        const sum = _.reduce(rawNums, (sum, nums) => { return sum + Number(nums) }, 0)
        formattedNums.push({type: 'num', data: sum})
      }
      return formattedNums
    },
    resultZodiac () {
      if (this.result.zodiac) {
        const arr = this.result.zodiac.slice()
        arr.splice(6, 0, '＋')
        return arr
      } else {
        return null
      }
    }
  },
  methods: {
    getResultClass (num) {
      if (num.type === 'text') {
        return ['text', 'ball']
      }
      let gameClass = `result-${this.result.game_code}`
      let resultClass = `resultnum-${num.data}`
      return [gameClass, resultClass, 'ball']
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/resultsball.scss";

.result-balls {
  width: 100%;
  flex:0 0 auto;
  display: flex;
  color: #f0f0f0;
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
      display: none;
    }
  }

  .ball {
    margin-right: 3px;
  }
  .ball-sum {
    display: inline-block;
    font-size: 12px;
  }
  .wrapper-hkl .ball{
    margin-bottom: 10px;
  }
  .wrapper-luckl .ball{
    margin-bottom: 10px;
  }
}
</style>
