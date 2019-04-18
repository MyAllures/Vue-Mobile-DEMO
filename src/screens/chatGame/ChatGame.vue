<template>
  <div class="chat-game-container">
    <div class="data-section">
      <div class="wrapper">
        <Countdown
          :schedule="schedule"
          :realSchedule="realSchedule"
          v-if="schedule.id"
          :currentGame="currentGame"
          :gameClosed="gameClosed"
          :closeCountDown="closeCountDown"
          :resultCountDown="resultCountDown"/>
        <div v-else :style="{padding: '5px'}">
          <rowSkeleton color="#f5f5f5" highlight="rgba(255,255,255,.5)" :seperatePoints="[20,40,60,80]"></rowSkeleton>
        </div>
      </div>
      <div class="wrapper">
        <GameResult v-if="result" :result="result" @click.native="isHistoryVisible = !isHistoryVisible"/>
        <div class="result-skeleton-wrapper" v-else>
          <rowSkeleton color="#f5f5f5" highlight="rgba(255,255,255,.5)" :seperatePoints="[30,40]"></rowSkeleton>
        </div>
        <i :class="['solid-triangle', isHistoryVisible ? 'point-top' : 'point-down']"></i>
      </div>
    </div>
    <div :class="['history-panel', {visible: isHistoryVisible}]" v-if="historyData.length>0">
      <div class="history-panel-mask" @click="isHistoryVisible = false"></div>
      <div class="history-panel-content">
        <GameResult v-for="result in historyData" :key="result.issue_number" :result="result"/>
      </div>
    </div>
    <chat-game-body :game="currentGame" :messages="messages"></chat-game-body>
    <chat-game-footer @openBetInterface="openBetInterface"></chat-game-footer>
    <popup
      :value="isBetInterfaceVisible"
      @on-hide="isBetInterfaceVisible = false"
      height="80%"
      v-transfer-dom
      :zIndex="200">
        <div class="bet-interface-container">
          <div class="header">{{mode==='bet'?'下注':'追号'}}</div>
          <div class="bet-area">
            <div class="aside">
              <div class="category-menu">
                <template v-for="(category, index) in categories">
                  <div
                    v-if="category.id!=='playpositions'"
                    :class="['category-menu-item',{'active': categoryId === category.id}]"
                    @click="switchCategory(category.id)"
                    :key="index">
                    {{category.name}}
                  </div>
                </template>
              </div>
            </div>
            <div class="main">
              <chat-game-category
                v-if="currentCategory"
                :category="currentCategory"
                :game="currentGame"
                :gameClosed="gameClosed"
                :playReset="playReset"
                @updatePlays="updatePlays"
                :mode="mode"
                @resetPlays="playReset = !playReset"/>
            </div>
          </div>
          <div class="footer" v-if="mode==='bet'">
            <div class="footer-item">
              <div class="balance">{{user.balance||0 | currency('￥')}}</div>
              <div class="playCount">已选 <span class="count">{{validPlays.length}}</span> 注</div>
            </div>
            <div class="footer-item">
              <div class="amount-input-wrapper">
                <AmountInput class="amount-input" placeholder="金额" v-model="amount"/>
              </div>
            </div>
            <div class="footer-item">
              <x-button type="primary" :disabled="submitBtnDisabled" @click.native="openDialog">{{$t('action.submit')}}</x-button>
            </div>
            <div class="footer-item">
              <x-button type="default" @click.native="playReset = !playReset">{{$t('action.reset')}}</x-button>
            </div>
            <div v-if="(gameClosed&&closeCountDown)" class="gameclosed-mask">
              <div class="mask color"></div>
              <span class="text">已封盘</span>
            </div>
          </div>
          <div class="bettrack-footer" v-else>
            <div class="row1">
              <template v-if="validPlays.length>0">{{`${validPlays[0].group} - ${validPlays[0].display_name}`}}</template>
              <div class="amount-input-wrapper">
                投注金额：
                <AmountInput class="amount-input" v-model="amount"/>
              </div>
            </div>
            <div class="row2">
              <div class="col">
                追&nbsp;
                <input
                  type="number"
                  class="period-input"
                  pattern="[0-9]*"
                  v-model="bettrack.period"/>&nbsp;期
              </div>
              <div class="col">
                翻倍：
                <input
                  type="number"
                  class="time-input"
                  pattern="[0-9]*"
                  v-model="bettrack.multiple"/>
              </div>
              <div class="col">
                <x-button type="primary" :disabled="submitBtnDisabled" @click.native="openBettrackDialog">提交</x-button>
              </div>
            </div>
            <div v-if="(gameClosed&&closeCountDown)" class="gameclosed-mask">
              <div class="mask color"></div>
              <span class="text">已封盘</span>
            </div>
          </div>
        </div>
    </popup>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { TransferDom, Popup, XButton } from 'vux'
import { fetchSchedule, fetchGameResult, getGameHistoryData } from '../../api'
import { Indicator } from '../../utils'
import Countdown from '../../components/Countdown'
import GameResult from '../../components/GameResult'
import rowSkeleton from '../../components/skeletonPattern/rowSkeleton'
import ChatGameBody from '@/screens/chatGame/ChatGameBody'
import ChatGameFooter from '@/screens/chatGame/ChatGameFooter'
import ChatGameCategory from '@/screens/chatGame/ChatGameCategory'
import AmountInput from '../../components/AmountInput'
import { EagleWebSocket } from '@/wsObj/eagle'

function to (scrollTop) {
  document.body.scrollTop = document.documentElement.scrollTop = scrollTop
}
function getScrollTop () {
  return document.body.scrollTop || document.documentElement.scrollTop
}
let scrollTop

export default {
  name: 'ChatGame',
  components: {
    Popup,
    Countdown,
    GameResult,
    rowSkeleton,
    ChatGameBody,
    ChatGameFooter,
    ChatGameCategory,
    XButton,
    AmountInput
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
      scheduleInterval: '',
      closeCountDown: null,
      resultCountDown: null,
      currentPlays: [],
      amount: localStorage.getItem('amount') || '10',
      validPlays: [],
      playReset: false,
      loading: false,
      opts_combos_count: 1,
      indicator: null,
      diffBetweenServerAndClient: 0,
      hasDestroy: false,
      isBetInterfaceVisible: false,
      categoryId: undefined,
      mode: 'bet',
      bettrack: {
        period: 1,
        multiple: 1
      },
      messages: [],
      historyData: [],
      isHistoryVisible: false,
      isFetchingJWT: false
    }
  },
  computed: {
    submitBtnDisabled () {
      return !this.amount || this.validPlays.length === 0
    },
    ...mapState([
      'systemConfig', 'user', 'latestResultMap'
    ]),
    ...mapState('eagle', {
      ws: state => state.ws
    }),
    eagleToken () {
      return this.$store.state.jwt_token.eagle
    },
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
    gameId () {
      return this.$route.params.gameId
    },
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    },
    categories () {
      return this.$store.state.categories[this.gameId] || []
    },
    currentCategory () {
      if (this.categories.length === 0) {
        return null
      }
      return this.categories.find(c => c.id === this.categoryId)
    },
    betDialog () {
      return this.$store.state.dialog.bet
    },
    newBetTrackDialog () {
      return this.$store.state.dialog.new_bettrack
    }
  },
  watch: {
    'currentGame.code': {
      handler: function (code) {
        if (code) {
          this.fetchScheduleAndResult()
          const game = this.currentGame
          if (game.rooms.length === 0) {
            this.$store.dispatch('eagle/init', {
              recent_messages: [],
              user: {
                chat_permission: false
              },
              is_manager: false
            })
          } else {
            if (!this.ws) {
              if (this.eagleToken && this.eagleToken !== 'pending') {
                this.$store.dispatch('eagle/setWs', new EagleWebSocket(this.eagleToken, game.rooms[0].id))
              } else {
                const unwatch = this.$watch('eagleToken', function (token) {
                  if (token && token !== 'pending') {
                    unwatch()
                    this.$store.dispatch('eagle/setWs', new EagleWebSocket(token, game.rooms[0].id))
                  }
                })
              }
            } else {
              this.$store.dispatch('eagle/clear')
              this.ws.joinRoom(game.rooms[0].id)
            }
          }
        }
      },
      immediate: true
    },
    'categories': {
      handler: function (categories) {
        let lastId = this.$store.state.lastGameData.lastCategory[this.gameId]
        if (lastId && lastId !== 'playpositions') {
          this.categoryId = lastId
        } else if (categories.length > 0) {
          this.categoryId = categories[0].id
        }
      },
      immediate: true
    },
    'betDialog.isSuccess': function (isSuccess) {
      if (isSuccess) {
        this.$set(this, 'playReset', !this.playReset)
      }
    },
    'newBetTrackDialog.isSuccess': function (isSuccess) {
      if (isSuccess) {
        this.$set(this, 'playReset', !this.playReset)
      }
    },
    '$store.state.urgencySwitchedGame': function ({ gameCode, issueNumber, closeLeft }) {
      if (this.currentGame.code === gameCode && this.schedule.issue_number === issueNumber) {
        let closeTime = this.$moment().add(closeLeft, 's')
        this.schedule.schedule_close = closeTime
        this.closeCountDown = this.diffTime(closeTime)
      }
    },
    'amount': function (amount) {
      localStorage.setItem('amount', amount)
    },
    'isBetInterfaceVisible': function (visible) {
      if (visible) {
        // 在弹出层显示之前，记录当前的滚动位置
        scrollTop = getScrollTop()

        // 使body脱离文档流
        document.body.classList.add('dialog-open')

        // 把脱离文档流的body拉上去，否则页面会回到顶部
        document.body.style.top = -scrollTop + 'px'
      } else {
        this.contentType = ''
        this.$set(this, 'playReset', !this.playReset)

        // body又回到了文档流中
        document.body.classList.remove('dialog-open')

        to(scrollTop)
      }
    },
    'result': {
      handler: function (result) {
        if (result) {
          getGameHistoryData({
            offset: 1,
            game_code: this.currentGame.code,
            limit: 9
          }).then(res => {
            this.historyData = res.results.map(d => {
              return {
                game_code: this.currentGame.code,
                result_str: d.result_str,
                issue_number: d.issue_number,
                status: d.result_status
              }
            })
          })
        }
      },
      immediate: true
    }
  },
  created () {
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
            bets: [],
            hasShared: true
          }
        })
      }
    })
  },
  methods: {
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
          // 六合彩至多149期，所以149期下一期跳001期為合理
          if (!schedule.issue_number.endsWith('001') || !result.issue_number.endsWith('149')) {
            let estimateScheduleIssueNumber = parseInt(schedule.issue_number)
            if (estimateScheduleIssueNumber - 1 > realScheduleIssueNumber) { // 差超過一期，表示可能尚未抓到開獎結果
              this.realSchedule = `${realScheduleIssueNumber + 1}`
            }
          }
        }

        this.$store.dispatch('updateGameInfo', {
          display_name: this.currentGame.display_name,
          issue_number: this.schedule.issue_number,
          game_code: this.currentGame.code
        })

        this.startScheduleTimer()
      }).catch(() => { })
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
    switchCategory (categoryId) {
      if (!categoryId) {
        return
      }
      const gameId = this.$route.params.gameId
      this.$store.dispatch('saveLastCategory', { gameId, categoryId })
      this.categoryId = categoryId
    },
    openDialog () {
      if (!this.amount) {
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
        const state = {
          visible: true,
          bets: bets,
          isSuccess: false
        }
        if (this.user.account_type) {
          state.hasShared = true
        }
        this.$store.dispatch('updateDialog', {
          name: 'bet',
          state
        })
      }
    },
    openBettrackDialog () {
      this.$store.dispatch('updateDialog', {
        name: 'new_bettrack',
        state: {
          visible: true,
          data: {
            amount: this.amount,
            multiple: this.bettrack.multiple,
            period: this.bettrack.period,
            issue_number: this.schedule.issue_number,
            scheduleId: this.schedule.id,
            play: this.validPlays[0]
          }
        }
      })
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
      let validPlays = _.flatMap(
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
      this.validPlays = validPlays
    },
    openBetInterface (mode) {
      this.isBetInterfaceVisible = true
      this.mode = mode
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
.chat-game-container {
  position: relative;
  display: flex;
  overflow-x: hidden;
  flex-direction: column;
  height: 100%;
}

.data-section {
  z-index: 10;
  background: #fff;
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.15);
  .wrapper {
    position: relative;
    .solid-triangle {
      position: absolute;
      top: 50%;
      right: 5px;
      transform: translateY(-50%);
      &.point-top {
        border-bottom: 5px solid #666;
      }
      &.point-down {
        border-top: 5px solid #666;
      }
    }
  }
}

.history-panel {
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  // transition: translate 1s;
  // transform: translate(0, -89%);
  // transform: translate(0, 11%);
  visibility: hidden;
  &.visible {
    visibility: visible;
  }
  .history-panel-content {
    position: absolute;
    top: 0;
    transform: translate(0, 11%);
    width: 100%;
    background: #fff;
  }
  .history-panel-mask {
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
  }
}

.header {
  flex: 0 0 auto;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #333;
  font-size: 16px;
}
.bet-area {
  display: flex;
  flex: 1 1 auto;
  .aside {
    flex: 0 0 auto;
    width: 90px;
    height: 100%;
    overflow-y: scroll;
  }
  .category-menu {
    flex: 0 0 auto;
    position: relative;
    display: flex;
    flex-direction: column;
    // overflow-y: scroll;
    width: 90px;
    color: #333;
    .category-menu-item {
      position: relative;
      display: flex;
      line-height: 18px;
      align-items: center;
      padding: 8px 12px;
      font-size: 15px;
      &.active {
        background: @azul;
        color: #fff;
      }
    }
  }
}
.main {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.footer {
  box-sizing: border-box;
  position: relative;
  flex: 0 0 auto;
  height: 50px;
  display: flex;
  color: #fff;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  padding: 5px;
  .footer-item {
    flex: 1;
  }
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
.bettrack-footer {
  box-sizing: border-box;
  position: relative;
  flex: 0 0 auto;
  height: 90px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 0 5px 0 10px;
  font-size: 14px;
  .amount-input {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    height: 25px;
    width: 60px;
    line-height: 25px;
    color: #333;
  }
  .row1 {
    display: flex;
    align-items: center;
    height: 40px;
    .amount-input-wrapper {
      margin-left: auto;
      box-sizing: border-box;
      height: 25px;
    }
  }
  .row2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    .col {
      display: flex;
      align-items: center;
    }
    input {
      box-sizing: border-box;
      height: 25px;
      line-height: 25px;
      width: 60px;
      padding: 0 5px;
      border: 1px solid #f0f0f0;
      border-radius: 4px;
      outline: 0;
      -webkit-appearance: none;
      background-color: #fff;
      font-size: inherit;
      color: #333;
    }
  }
  /deep/ .weui-btn {
    font-size: 14px;
    width: 80px;
    height: 40px;
  }
}

.bet-interface-popup /deep/ .cube-popup-content {
  height: 90%;
}
.bet-interface-container {
  height: 100%;
  width: 100%;
  background: #fff;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  display: flex;
  flex-direction: column;
  -webkit-overflow-scrolling: touch;
  z-index: 1;
}
.bet-interface-fade-enter,
.bet-interface-fade-leave-active {
  opacity: 0;
}

.bet-interface-fade-enter-active {
  transition: all 0.3s ease-in-out;
}
.bet-interface-fade-leave-active {
  transition: all 0.3s ease-in-out 0.3s;
}

.bet-interface-move-enter,
.bet-interface-move-leave-active {
  transform: translate3d(0, 100%, 0);
}
.bet-interface-move-enter-active {
  transition: transform 0.3s ease-in-out 0.3s;
}
.bet-interface-move-leave-active {
  transition: transform 0.3s ease-in-out;
}

.gameclosed-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .mask {
    width: 100%;
    height: 100%;
    background-color: @azul;
    opacity: 0.7;
  }
  .text {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    width: 100%;
    height: 100%;
    text-align: center;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
}
</style>

