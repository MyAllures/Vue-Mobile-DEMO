<template>
  <div class="result-balls">
    <div class="balls-text">{{result&&result.issue_number}}{{$t('common.result_period')}}</div>
    <div :class="['balls-number', 'wrapper-' + result.game_code]" v-if="result && !loading">
      <div v-if="result.status!=='valid'">官方开奖无效</div>
      <span
        v-else
        v-for="(num, index) in resultNums"
        :key="index"
        :class="getResultClass(num)">
        <b> {{num}} </b>
        <p class="ball-zodiac" v-if="result.zodiac"> {{result.zodiac[index]}} </p>
      </span>
      <div class="ball-sum" v-if="showSum">
        {{$t('common.total')}}
        <span>
          <b>{{resultsSum}}</b>
        </span>
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
      let rawNums = this.result.result_str.split(',')
      let formattedNums = []
      if (this.result.game_code === 'bjkl8') {
        rawNums.pop()
      }
      rawNums.forEach((rawBall) => {
        if (rawBall[0] === '0' && rawBall !== '0') {
          formattedNums.push(rawBall.slice(1))
          return
        }
        formattedNums.push(rawBall)
      })
      if (!this.result.result_str) {
        return this.$t('navMenu.no_result')
      }
      return formattedNums
    },
    resultsSum () {
      return _.reduce(this.resultNums, (sum, nums) => { return sum + Number(nums) }, 0)
    },
    showSum () {
      if (!this.result) {
        return false
      }
      return this.result.game_code === 'pcdd' || this.result.game_code === 'jnd28' || this.result.game_code === 'luckdd'
    }
  },
  methods: {
    getResultClass (resultNum) {
      let gameClass = `result-${this.result.game_code}`
      let resultClass = `resultnum-${resultNum}`
      return [gameClass, resultClass]
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
    flex: 2.5;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    text-align: center;
    height: 100%;
  }
  span {
    display: inline-block;
    margin-right: 3px;
  }
  .ball-sum {
    display: inline-block;
    font-size: 12px;
  }
  .wrapper-hkl span{
    margin-bottom: 10px;
  }
  .wrapper-luckl span{
    margin-bottom: 10px;
  }
}
</style>
