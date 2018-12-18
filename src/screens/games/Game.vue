<template>
  <div class="game">
    <div class="data-section">
      <div class="wrapper">
        <GameResult v-if="result" :result="result"/>
        <div class="result-skeleton-wrapper" v-else>
          <rowSkeleton highlight="#1568CA" :seperatePoints="[30,40]"></rowSkeleton>
        </div>
      </div>
      <div class="wrapper">
        <Countdown
          :schedule="schedule"
          :realSchedule="realSchedule"
          v-if="schedule.id"
          :currentGame="currentGame"
          :gameClosed="gameClosed"
          :closeCountDown="closeCountDown"
          :resultCountDown="resultCountDown"/>
          <div class="p" v-else-if="!gameClosed">
            <rowSkeleton highlight="#1568CA" :seperatePoints="[20,40,60,80]"></rowSkeleton>
          </div>
      </div>
    </div>
    <div class="bet-area">
      <group class="aside">
        <cell-box
          :border-intent="false"
          :class="['category-menu-item',{'active': activeCategory === category.id + ''}]"
          v-for="(category, index) in categories"
          @click.native="switchCategory(category.id)"
          :key="index">
          <template v-if="category.id === 'playpositions'">
            <span class="playposition-badge">{{category.name}}</span>
          </template>
          <template v-else>{{category.name}}</template>
        </cell-box>
      </group>
      <div class="main">
        <router-view
          :activeCategory="activeCategory"
          :schedules="schedules"
          :key="$route.params.categoryId"
          :game="currentGame"
          :gameClosed="gameClosed"
          :playReset="playReset"
          @updatePlays="updatePlays"
          @updateBetTrackData="updateBetTrackData"
          @resetPlays="playReset = !playReset"/>
      </div>
    </div>
    <div class="bet-input">
      <flexbox :gutter="0">
        <flexbox-item>
          <div class="balance">{{user.balance||0 | currency('￥')}}</div>
          <template>
            <div v-if="activeCategory === 'playpositions'" class="playCount">
              {{bettrackData.forDisplay.type}}
              <span class="count">{{bettrackData.forDisplay.play_code_pattern}}</span>
            </div>
            <div v-else class="playCount">已选 <span class="count">{{validPlays.length}}</span> 注</div>
          </template>
        </flexbox-item>
        <flexbox-item>
          <div class="amount-input-wrapper">
            <AmountInput class="amount-input" placeholder="金额" v-model="amount"/>
          </div>
        </flexbox-item>
        <flexbox-item>
          <x-button type="primary" :disabled="!amount" @click.native="openDialog">{{$t('action.submit')}}</x-button>
        </flexbox-item>
        <flexbox-item>
          <x-button type="default" @click.native="playReset = !playReset">{{$t('action.reset')}}</x-button>
        </flexbox-item>
      </flexbox>
      <div v-if="gameClosed && closeCountDown && activeCategory !== 'playpositions'" class="gameclosed-mask">已封盘</div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { fetchSchedule, fetchGameResult, fetchBetTrackSchedules } from '../../api'
import { Indicator } from '../../utils'
import Countdown from '../../components/Countdown'
import GameResult from '../../components/GameResult'
import rowSkeleton from '../../components/skeletonPattern/rowSkeleton'
import AmountInput from '../../components/AmountInput'
import { TransferDom, XInput, XButton, Group, Grid, GridItem, XDialog, Flexbox, FlexboxItem, Toast, InlineLoading, CellBox, CheckIcon } from 'vux'

export default {
  name: 'Game',
  components: {
    Countdown,
    GameResult,
    XInput,
    XButton,
    Group,
    Grid,
    GridItem,
    XDialog,
    Flexbox,
    FlexboxItem,
    Toast,
    InlineLoading,
    CellBox,
    CheckIcon,
    rowSkeleton,
    AmountInput
  },
  directives: {
    TransferDom
  },
  data () {
    return {
      realSchedule: null,
      schedules: [],
      schedule: {
        id: null
      },
      scheduleInterval: '',
      closeCountDown: null,
      resultCountDown: null,
      currentPlays: [],
      amount: localStorage.getItem('amount') || '10',
      validPlays: [],
      playReset: false,
      loading: false,
      hasPlan: true,
      opts_combos_count: 1,
      isBusy: false,
      indicator: null,
      diffBetweenServerAndClient: 0,
      hasDestroy: false,
      bettrackData: {
        forDisplay: {}
      }
    }
  },
  filters: {
    complete (value) {
      value = parseInt(value)
      return value < 10 ? ('0' + value) : value
    }
  },
  computed: {
    result () {
      if (this.currentGame) {
        return this.latestResultMap[this.currentGame.code]
      }
    },
    gameClosed () {
      if (this.realSchedule) {
        return true
      }
      if (!this.closeCountDown) {
        return false
      }
      const c = this.closeCountDown
      return c.days + c.hours + c.minutes + c.seconds === 0
    },
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    },
    activeCategory () {
      if (this.$route.name === 'PlayPositions') {
        return 'playpositions'
      } else {
        return this.$route.params.categoryId
      }
    },
    ...mapState([
      'systemConfig', 'user', 'latestResultMap'
    ]),
    gameId () {
      return this.$route.params.gameId
    },
    hasPlanCheck () {
      return this.systemConfig.chatroomEnabled && this.user.planMakerRoom && this.user.planMakerRoom.includes(parseInt(this.gameId))
    },
    categories () {
      if (!this.gameId) {
        return []
      }
      return this.$store.state.categories[this.gameId] || []
    },
    betDialog () {
      return this.$store.state.dialog.bet
    }
  },
  watch: {
    'gameClosed': function (closed) {
      if (closed) {
        this.fetchBetTrackSchedules(4)
      }
    },
    '$route': function (to, from) {
      if (to.path === `/game/${this.gameId}`) {
        this.chooseCategory()
      }
    },
    'betDialog.isSuccess': function (isSuccess) {
      if (isSuccess) {
        this.$set(this, 'playReset', !this.playReset)
      }
    },
    '$store.state.urgencySwitchedGame': function ({gameCode, issueNumber, closeLeft}) {
      if (this.currentGame.code === gameCode && this.schedule.issue_number === issueNumber) {
        let closeTime = this.$moment().add(closeLeft, 's')
        this.schedule.schedule_close = closeTime
        this.closeCountDown = this.diffTime(closeTime)
      }
    },
    'amount': function (amount) {
      localStorage.setItem('amount', amount)
    }
  },
  created () {
    this.fetchScheduleAndResult()

    if (!this.$route.params.categoryId) {
      if (this.categories.length > 0) {
        this.chooseCategory()
      } else {
        this.$store.dispatch('fetchCategories', this.gameId)
        const unwatch = this.$watch('categories', function (categories) {
          this.chooseCategory()
          unwatch()
        })
      }
    } else if (this.categories.length === 0) {
      this.$store.dispatch('fetchCategories', this.gameId)
    }

    this.indicator = new Indicator(() => {
      clearInterval(this.scheduleInterval)
      this.startScheduleTimer()
    }, () => {
      if (this.betDialog.visible) {
        this.$set(this, 'playReset', !this.playReset)
        this.$store.dispatch('updateDialog', {
          name: 'bet',
          state: {
            visible: false,
            bets: []
          }
        })
      }
    })
  },
  methods: {
    updateBetTrackData (bettrackData) {
      this.bettrackData = bettrackData
    },
    fetchBetTrackSchedules (type) {
      fetchBetTrackSchedules(this.gameId, this.currentGame.code, type, this.schedule.id).then((res) => {
        this.schedules = _.takeRight(res, 3)
      })
    },
    fetchScheduleAndResult () {
      if (!this.gameId) {
        return
      }

      return Promise.all([fetchSchedule(this.gameId, this.currentGame.code), fetchGameResult(this.gameId)]).then(results => {
        if (this.hasDestroy) {
          return
        }
        const schedule = results[0][0]

        if (schedule) {
          this.schedule = schedule
          let serverTime = this.$moment(this.schedule.schedule_result)
          this.schedule.schedule_result = this.$moment().add(schedule.result_left, 's')
          this.diffBetweenServerAndClient = serverTime.diff(this.schedule.schedule_result)
          this.schedule.schedule_close = this.$moment().add(schedule.close_left, 's')
          if (this.schedule.status === 'close') {
            this.fetchBetTrackSchedules(4)
          } else {
            this.fetchBetTrackSchedules(3)
          }
        } else {
          this.closeCountDown = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
          }
        }

        const result = results[1][0]

        if (this.currentGame.code === 'hkl') {
          let realScheduleIssueNumber = parseInt(result.issue_number)
          if (parseInt(schedule.issue_number) - 1 > realScheduleIssueNumber) { // 差超過一期，表示可能尚未抓到開獎結果
            this.realSchedule = `${realScheduleIssueNumber + 1}`
          }
        }

        this.$store.dispatch('updateGameInfo', {
          display_name: this.currentGame.display_name,
          issue_number: this.schedule.issue_number,
          game_code: this.currentGame.code
        })

        this.startScheduleTimer()
      }).catch(() => {})
    },
    chooseCategory () {
      let categoryId = this.$store.state.lastGameData.lastCategory[this.gameId] || this.categories[0].id
      this.$router.replace(`/game/${this.gameId}/${categoryId}`)
    },
    switchCategory (categoryId) {
      if (!categoryId) {
        return
      }
      const gameId = this.$route.params.gameId
      this.$store.dispatch('saveLastCategory', {gameId, categoryId})
      this.$router.push({
        path: `/game/${gameId}/${categoryId}`
      })
    },
    startScheduleTimer () {
      clearInterval(this.scheduleInterval)
      if (this.hasDestroy) {
        return
      }
      if (!this.schedule || !this.schedule.id) {
        return
      }
      this.scheduleInterval = setInterval(() => {
        const closeTime = this.schedule.schedule_close
        const resultTime = this.schedule.schedule_result
        this.closeCountDown = this.diffTime(closeTime)
        this.$store.dispatch('updateGameInfo', {
          countdown: {...this.closeCountDown}
        })
        this.resultCountDown = this.diffTime(resultTime, true)
      }, 1000)
    },
    diffTime (target, flag) {
      const duration = this.$moment.duration(target.diff())
      let days = duration.days()
      let hours = duration.hours()
      let minutes = duration.minutes()
      let seconds = duration.seconds()
      if (flag && (days + hours + minutes + seconds <= 0)) {
        clearInterval(this.scheduleInterval)
        this.fetchScheduleAndResult()
      }
      days = days < 0 ? 0 : days
      hours = hours < 0 ? 0 : hours
      minutes = minutes < 0 ? 0 : minutes
      seconds = seconds < 0 ? 0 : seconds
      return {
        days,
        hours,
        minutes,
        seconds
      }
    },
    openDialog () {
      if (!this.amount) {
        return
      }
      if (this.activeCategory === 'playpositions') {
        if (this.bettrackData.type && this.bettrackData.play_code_pattern) {
          this.bettrackData.bet_amount = parseFloat(this.amount)
          this.bettrackData.game_schedule = this.schedules[0].id

          this.$store.dispatch('updateDialog', {
            name: 'bettrack',
            state: {
              visible: true,
              data: this.bettrackData,
              isSuccess: false
            }
          })
        }
        return
      }
      const bets = this.formatBetInfo(this.validPlays)
      if (!bets.length) {
        return
      }
      let totalAmount
      let expectation
      let amount = parseFloat(this.amount)
      let optsCombosCount = bets[0].opts_combos_count
      if (optsCombosCount && optsCombosCount > 1) {
        totalAmount = amount * optsCombosCount
        expectation = amount * optsCombosCount * bets[0].odds - totalAmount
      } else {
        totalAmount = amount * bets.length
        expectation = bets.reduce((sum, bet) => sum + amount * bet.odds, 0) - totalAmount
      }
      if (totalAmount > this.user.balance) {
        this.$store.dispatch('updateDialog', {
          name: 'balance',
          state: {
            visible: true,
            total: totalAmount,
            expectation: expectation
          }
        })
      } else {
        this.$store.dispatch('updateDialog', {
          name: 'bet',
          state: {
            visible: true,
            bets: bets,
            isSuccess: false
          }
        })
      }
    },
    formatBetInfo (originPlays) {
      return originPlays.map(play => {
        let betOptions
        let optionDisplayNames = []
        if (play.activedOptions) {
          let options = []
          _.each(play.activedOptions, option => {
            options.push(option.num)
            optionDisplayNames.push(option.displayName || option.num)
          })
          betOptions = { options: options }
        } else if (play.combinations) {
          optionDisplayNames = [...play.combinations]
          betOptions = { options: play.combinations }
        } else {
          betOptions = {}
        }
        return {
          game_schedule: this.schedule.id,
          display_name: play.hideName ? play.group : `${play.group} - ${play.display_name}`,
          bet_amount: this.amount,
          odds: play.odds,
          play: play.id,
          bet_options: betOptions,
          opts_combos_count: this.opts_combos_count,
          optionDisplayNames: optionDisplayNames.join(',')
        }
      })
    },
    updatePlays (plays) {
      let play = plays[0]
      if (play && play.isCustom && play.activedOptions && play.combinations) {
        this.opts_combos_count = play.combinations.length
      } else {
        this.opts_combos_count = 1
      }

      this.validPlays = _.flatMap(
        plays,
        play => {
          if (play.combinations && !play.activedOptions) {
            return _.map(play.combinations, combination => {
              return {
                ...play,
                combinations: combination
              }
            })
          } else {
            return [play]
          }
        }
      )
    }
  },
  beforeDestroy () {
    this.hasDestroy = true
    clearInterval(this.scheduleInterval)
    clearTimeout(this.resultTimer)

    if (this.indicator) {
      this.indicator.destroy()
      this.indicator = null
    }
  }
}
</script>

<style lang="less" scoped>
@import "../../styles/vars.less";

.game {
  display: flex;
  overflow-x: hidden;
  flex-direction: column;
  height: 100%;

  .data-section {
    display: flex;
    flex-wrap: wrap;
    background: linear-gradient(to bottom, #166fd8, #1053A1);
    min-height: 80px;
    align-items: center
  }

  .wrapper {
    width: 100%;
  }
}

.active {
  background: @azul;
  color: #fff;
}

.bet-area {
  flex: 1 1 auto;
  display: flex;
  /deep/ .weui-cells {
    margin: 0;
    line-height: 18px;
    width: 100%;
    background: #f9f9f9;
    overflow-y: auto;
    &::after {
      display: none;
    }
  }
  .aside {
    display: flex;
    overflow-y: scroll;
    justify-content: safe center;
    width: 110px;
    border-width: 0 4px 0 0;
    border-style: solid;
    border-image: linear-gradient(to right, rgba(0, 0, 0, 0.2), transparent) 1 100%;
    background-color: #f9f9f9;
    color: #9b9b9b;
  }
  .main {
    width: calc(~"100%" - 104px);
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: #fff;
    -webkit-overflow-scrolling: touch;
  }
}
.bet-input {
  flex: 0 0 auto;
  box-sizing: border-box;
  position: relative;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  height: 55px;
  padding: 7px;
  .text {
    margin-right: 10px;
  }
  .count {
    background: @red;
    display: inline-block;
    border-radius: 4px;
    color: #fff;
    text-align: center;
    padding: 0 5px;
  }
  .balance {
    height: 20px;
    line-height: 20px;
    text-align: center;
    font-size: 12px;
  }
  .playCount {
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    text-align: center;
  }
  .content {
    height: 200px;
  }
  /deep/ .weui-btn {
    overflow: visible;
    width: 90%;
  }
  .amount-input-wrapper {
    box-sizing: border-box;
    height: 40px;
    padding: 0 5px;
    .amount-input {
      background: #fff;
      border: 1px solid #f0f0f0;
      border-radius: 5px;
      height: 40px;
      line-height: 40px;
      color: #333;
    }
  }
}
.gameclosed-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 64, 138, 0.7);
  color: #fff;
}

.bet-content {
  text-align: left;
  background-color: #fff;
  padding: 0 0 10px;
  .title {
    height: 44px;
    line-height: 44px;
    text-align: center;
  }
  .total {
    text-align: center;
    height: 30px;
    line-height: 30px;
    margin-bottom: 10px;
    .bet-num {
      margin-right: 10px;
    }
  }
  .check-plan {
    display: block;
    margin-bottom: 10px;
    height: 30px;
    line-height: 30px;
    text-align: center;
  }
  .amount {
    margin-right: 10px;
    color: @red;
  }
  .options,
  .combinations {
    width: 100%;
    padding-left: 10px;
  }
  .loading {
    width: 100%;
    height: 50px;
    line-height: 50px;
    font-size: 18px;
    text-align: center;
    .weui-loading {
      height: 30px;
      width: 30px;
    }
  }
  .play {
    color: #666;
  }
  .buttons {
    box-sizing: border-box;
    height: 50px;
    padding: 0 10px;
    .weui-btn {
      overflow: visible;
    }
  }
}

.result-skeleton-wrapper {
  padding-right: 10px;
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 5px;
}

.playposition-badge {
  position: relative;
  &:after {
    content: '';
    display: inline-block;
    width: 28px;
    height: 15px;
    vertical-align: middle;
    margin-left: 10px;
    background-image: url('../../assets/badge_new.svg');
    background-repeat: no-repeat;
  }
}
</style>
