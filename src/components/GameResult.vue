<template>
  <div class="result-balls">
    <div class="balls-text">{{gameLatestResult.issue_number}}{{$t('common.result_period')}}</div>
    <div :class="['balls-number', 'wrapper-' + gameLatestResult.game_code]" v-if="gameLatestResult">
      <span
        v-for="(num, index) in resultNums"
        :key="gameLatestResult.issue_number + index"
        :class="getResultClass(num)">
        <b> {{num}} </b>
        <p class="ball-zodiac" v-if="showZodiac"> {{zodiacs[index]}} </p>
      </span>
      <div class="ball-sum" v-if="showSum">
        {{$t('common.total')}}
        <span>
          <b>{{resultsSum}}</b>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import {fetchGameResult} from '../api'
import _ from 'lodash'

export default {
  props: {
    gameid: {
      type: String
    }
  },
  data () {
    return {
      gameLatestResult: '',
      drawTimeGap: '',
      zodiacs: '',
      showZodiac: false,
      showSum: false
    }
  },
  created () {
    this.fetchResult(this.gameid).then(res => { this.pollResult(this.gameid) })
  },
  computed: {
    resultNums () {
      let rawNums = this.gameLatestResult.result_str.split(',')
      let formattedNums = []
      if (this.gameLatestResult.game_code === 'bjkl8') {
        rawNums.pop()
      }
      rawNums.forEach((rawBall) => {
        if (rawBall[0] === '0' && rawBall !== '0') {
          formattedNums.push(rawBall.slice(1))
          return
        }
        formattedNums.push(rawBall)
      })
      if (!this.gameLatestResult.result_str) {
        return this.$t('navMenu.no_result')
      }
      return formattedNums
    },
    resultsSum () {
      return _.reduce(this.resultNums, (sum, nums) => { return sum + Number(nums) }, 0)
    }
  },
  watch: {
    'gameid': function (gameid) {
      this.showZodiac = false
      this.showSum = false
      clearInterval(this.interval)
      clearTimeout(this.timer)
      this.fetchResult(gameid).then(res => { this.pollResult(this.gameid) })
    },
    'gameLatestResult.game_code': function (code) {
      if (code === 'hkl') {
        this.showZodiac = true
      }
      if (code === 'pcdd') {
        this.showSum = true
      }
    }
  },
  methods: {
    getResultClass (resultNum) {
      let gameClass = `result-${this.gameLatestResult.game_code}`
      let resultClass = `resultnum-${resultNum}`
      return [gameClass, resultClass]
    },
    fetchResult (gameId) {
      return fetchGameResult(gameId).then(
      result => {
        if (!result || !result[0]) {
          return
        }
        this.gameLatestResult = result[0]
        this.zodiacs = result[0].zodiac.split(',')
        return result
      }
    )
    },
    pollResult (gameid) {
      if (!this.gameLatestResult) {
        return
      }

      let drawFromNow = this.$moment(this.gameLatestResult.next_draw).diff(this.$moment(), 'ms')
      let startPollingTime = drawFromNow < 8000 ? 8000 : drawFromNow

      let oldIssue = this.gameLatestResult.issue_number
      this.timer = setTimeout(() => {
        clearInterval(this.interval)
        this.interval = setInterval(() => {
          this.fetchResult(gameid).then(result => {
            if (!result || !result[0]) {
              clearInterval(this.interval)
            }

            let newIssue = result[0].issue_number
            if (newIssue !== oldIssue) {
              clearInterval(this.interval)
              clearInterval(this.timer)
              setTimeout(() => {
                this.$store.dispatch('fetchUser')
              }, 2000)
              this.pollResult(gameid)
            }
          })
        }, 1000)
        this.pollResult(gameid)
      }, startPollingTime)
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
    clearInterval(this.interval)
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/resultsball.scss";

.result-balls {
  width: 100%;
  display: flex;
  color: #f0f0f0;
  background-image: linear-gradient(to bottom, #006bb3, #00397c);
  .balls-text {
    font-size: 14px;
    flex: 1;
    align-self: center;
    text-align: center;
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
    margin-right: 5px;
  }
  .ball-sum {
    display: inline-block;
    font-size: 12px;
  }
  .wrapper-hkl span{
    margin-bottom: 10px;
  }
}
</style>
