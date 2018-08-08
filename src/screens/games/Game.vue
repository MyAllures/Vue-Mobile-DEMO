<template>
  <div class="game">
    <div class="data-section">
      <GameResult :result="result" :loading="resultLoading"/>
      <Countdown
        :schedule="schedule"
        :realSchedule="realSchedule"
        v-if="schedule.id"
        :currentGame="currentGame"
        :gameClosed="gameClosed"
        :closeCountDown="closeCountDown"
        :resultCountDown="resultCountDown"/>
    </div>
    <div class="bet-area">
      <group class="aside">
        <cell-box
          :border-intent="false"
          :class="['category-menu-item',{'active': activeCategory === category.id + ''}]"
          v-for="(category, index) in categories"
          @click.native="switchCategory(category.id)"
          :key="index">
          {{category.name}}
        </cell-box>
      </group>
      <div class="main">
        <router-view
        :activeCategory="activeCategory"
        :key="$route.params.categoryId"
        :game="currentGame"
        :gameClosed="gameClosed"
        :amount="amountForProp"
        :playReset="playReset"
        @updatePlays="updatePlays"
        @resetPlays="playReset = !playReset"
        />
      </div>
    </div>

    <div class="bet-input">
      <flexbox :gutter="0">
        <flexbox-item>
          <div class="balance">{{user.balance||0 | currency('￥')}}</div>
          <div class="playCount">已选 <span class="count">{{validPlays.length}}</span> 注</div>
        </flexbox-item>
        <flexbox-item>
          <x-input
            class="weui-vcode"
            placeholder="金额"
            v-model="amount"
            @on-change="inputAmount"
            label-width="100px"
            :show-clear="false">
          </x-input>
        </flexbox-item>
        <flexbox-item>
          <x-button type="primary" :disabled="!amount" @click.native="openDialog">{{$t('action.submit')}}</x-button>
        </flexbox-item>
        <flexbox-item>
          <x-button type="default" @click.native="playReset = !playReset">{{$t('action.reset')}}</x-button>
        </flexbox-item>
      </flexbox>
      <div v-if="gameClosed&&closeCountDown" class="gameclosed-mask">已封盘</div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { fetchSchedule, fetchGameResult } from '../../api'
import { Indicator, validateAmount } from '../../utils'
import Countdown from '../../components/Countdown'
import GameResult from '../../components/GameResult'
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
    CheckIcon
  },
  directives: {
    TransferDom
  },
  data () {
    return {
      realSchedule: null,
      schedule: {
        id: null
      },
      result: null,
      scheduleTimer: '',
      resultTimer: null,
      resultInterval: null,
      resultLoading: false,
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
      diffBetweenServerAndClient: 0
    }
  },
  filters: {
    complete (value) {
      value = parseInt(value)
      return value < 10 ? ('0' + value) : value
    }
  },
  computed: {
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
      return this.$route.params.categoryId
    },
    ...mapState([
      'systemConfig', 'user', 'betDialog'
    ]),
    gameId () {
      return this.$route.params.gameId
    },
    amountForProp () {
      return this.amount
    },
    hasPlanCheck () {
      return this.systemConfig.chatroomEnabled && this.user.planMakerRoom && this.user.planMakerRoom.includes(parseInt(this.gameId))
    },
    categories () {
      if (!this.gameId) {
        return []
      }
      return this.$store.state.categories[this.gameId] || []
    }
  },
  watch: {
    '$route': function (to, from) {
      if (to.path === `/game/${this.gameId}`) {
        this.chooseCategory()
      }
    },
    'betDialog.isSuccess': function (isSuccess) {
      if (isSuccess) {
        this.$set(this, 'playReset', !this.playReset)
      }
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
      clearInterval(this.scheduleTimer)
      this.startScheduleTimer()
    }, () => {
      if (this.betDialog.visible) {
        this.$set(this, 'playReset', !this.playReset)
        this.$store.dispatch('closeBetDialog')
      }
    })
  },
  methods: {
    pollResult () {
      if (!this.result) {
        return
      }
      let drawFromNow = this.$moment(this.result.next_draw).subtract(this.diffBetweenServerAndClient).diff(this.$moment(), 'ms')
      let startPollingTime = drawFromNow < 8000 ? 8000 : drawFromNow

      let oldIssue = this.result.issue_number
      this.resultTimer = setTimeout(() => { // 從表定開獎時間之後開始輪詢
        clearInterval(this.resultInterval)
        let pollingLimiter = null
        /**
         * 若以暫時期數代替真實開獎結果，可能發生該期未開，使得下期持續被關閉的情況
         * 故以10分鐘為限，若在時限內未獲得真實開獎結果，則直接開放下期
         */
        if (this.realSchedule && drawFromNow < 0) {
          const leaveTime = 10 * 60 * 1000 + drawFromNow
          if (leaveTime < 0) { // 距離開獎時間已過十分鐘則直接開獎
            this.realSchedule = ''
          } else {
            pollingLimiter = setTimeout(() => { // 剩餘時間內沒抓到開獎結果則直接開放
              this.realSchedule = ''
            }, leaveTime)
          }
        }
        this.resultInterval = setInterval(() => {
          fetchGameResult(this.gameId).then(result => {
            if (!result || !result[0]) {
              clearInterval(this.resultInterval)
            }
            result = result[0]
            if (result.zodiac) {
              result.zodiac = result.zodiac.split(',')
            }
            let newIssue = result.issue_number
            if (newIssue !== oldIssue) { // 表示抓到開獎結果
              if (pollingLimiter) { // 成功抓取結果後限制器可關掉
                clearTimeout(pollingLimiter)
                pollingLimiter = null
              }
              clearInterval(this.resultInterval)
              clearInterval(this.resultTimer)
              this.resultLoading = true // 開獎動畫開始
              this.result = result
              setTimeout(() => {
                this.resultLoading = false
                if (this.realSchedule) {
                  this.realSchedule = '' // 恢復使用表定開獎時間
                }
              }, 3000)
              setTimeout(() => {
                this.$store.dispatch('fetchUser')
              }, 2000)
            }
          })
        }, 1000)
      }, startPollingTime)
    },
    fetchScheduleAndResult () {
      Promise.all([fetchSchedule(this.gameId), fetchGameResult(this.gameId)]).then(results => {
        const schedule = results[0][0]
        this.schedule = schedule
        let serverTime = this.$moment(this.schedule.schedule_result)
        this.schedule.schedule_result = this.$moment().add(schedule.result_left, 's')
        this.diffBetweenServerAndClient = serverTime.diff(this.schedule.schedule_result)
        this.schedule.schedule_close = this.$moment().add(schedule.close_left, 's')
        const result = results[1][0]
        if (result.zodiac) {
          result.zodiac = result.zodiac.split(',')
        }
        this.result = result
        this.pollResult()

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
      const categoryId = localStorage.getItem(this.gameId + '-lastCategory') || this.categories[0].id
      this.$router.replace(`/game/${this.gameId}/${categoryId}`)
    },
    inputAmount (val) {
      if (!val) {
        this.amount = ''
      }
      if (val && !validateAmount(val)) {
        this.$nextTick(() => {
          this.amount = val.slice(0, -1)
        })
      }
    },
    switchCategory (categoryId) {
      if (!categoryId) {
        return
      }
      const gameId = this.$route.params.gameId

      localStorage.setItem(gameId + '-lastCategory', categoryId)

      this.$router.push({
        path: `/game/${gameId}/${categoryId}`
      })
    },
    startScheduleTimer () {
      if (!this.schedule || !this.schedule.id) {
        return
      }
      this.scheduleTimer = setInterval(() => {
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
      if (flag && (days + hours + minutes + seconds === 0)) {
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
      this.$store.dispatch('openBetDialog', this.formatBetInfo(this.validPlays))
    },
    formatBetInfo (originPlays) {
      return originPlays.map(play => {
        if (play.amount <= 0) {
          return
        }

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
          bet_amount: play.amount,
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
    clearTimeout(this.scheduleTimer)
    clearTimeout(this.resultTimer)
    clearInterval(this.resultInterval)

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
    background: #1568CA;
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
  /deep/ .vux-x-input {
    color: #333;
    padding: 0 5px;
    .weui-cell__bd.weui-cell__primary {
      background: #fff;
      border: 1px solid #f0f0f0;
      border-radius: 5px;
      height: 40px;
      box-sizing: border-box;
      input {
        color: #333;
        height: 100%;
        box-sizing: border-box;
        padding-left: 5px;
      }
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
</style>
