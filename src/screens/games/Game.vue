<template>
  <div class="game-container">
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
        <div v-else-if="!gameClosed" :style="{padding: '5px'}">
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
      <div :class="['history-panel', {visible: isHistoryVisible}]" v-if="historyData.length>0">
        <div class="history-panel-content">
          <GameResult v-for="result in historyData" :key="result.issue_number" :result="result"/>
        </div>
      </div>
    </div>
    <div :class="['history-panel-mask', {visible: isHistoryVisible}]" @click="isHistoryVisible = false"></div>
    <div class="mode-tab">
      <div
        :class="['mode-tab-item', {active: mode==='bet'}]"
        @click="mode = 'bet'">投注</div>
      <div
        :class="['mode-tab-item', {active: mode==='bettrack'}]"
        @click="mode = 'bettrack'">追号</div>
    </div>
    <div :class="['bet-area', mode]">
      <div class="aside" v-fix-scroll>
        <div class="category-menu">
          <div
            v-for="(category, index) in categories"
            :class="['category-menu-item',{'active': activeCategory === category.id+''}]"
            @click="switchCategory(category.id)"
            :key="index">
            {{category.name}}
          </div>
        </div>
      </div>
      <div class="main" v-fix-scroll>
        <router-view
          v-if="activeCategory"
          :activeCategory="activeCategory"
          :key="$route.params.categoryId"
          :mode="mode"
          :game="currentGame"
          :gameClosed="gameClosed"
          :playReset="playReset"
          @updatePlays="updatePlays"
          @resetPlays="playReset = !playReset"/>
      </div>
      <div v-if="theme && promotedGame" class="bottom-prompt" :class="{ 'hidden' : !showBottomPrompt }">
        <div class="inner topbar" :style="{'background-color': theme}">
          <div class="close-btn small" @click="hideBottomPromot"></div>
          <div class="txt">开奖太慢？推荐您体验{{promotedGame.period_descroption}}的{{promotedGame.display_name}}</div>
          <x-button type="default" mini @click.native="forwardTo(promotedGame)">前往</x-button>
        </div>
      </div>
      <div class="amount-shortcut vux-1px-t" :class="{'collapsed' : !showShortcut }" v-if="user.bet_amount_count.length">
        <span class="tips">常用金额</span>
        <ul class="items">
          <template v-for="(item, index) in user.bet_amount_count">
            <li
              :key="index"
              v-if="index < 5"
              @click="amount=item.bet_amount + ''"
              class="vux-1px-l">{{ item.bet_amount }}</li>
          </template>
        </ul>
      </div>
    </div>
    <div class="footer" v-if="mode==='bet'">
      <div class="footer-item">
        <div class="balance">{{user.balance||0 | currency('￥')}}</div>
        <div class="playCount">已选 <span class="count">{{validPlays.length}}</span> 注</div>
      </div>
      <div class="footer-item">
        <div class="amount-input-wrapper">
            <AmountInput class="amount-input" placeholder="金额" v-model="amount" @focus.native="showShortcut=true" @blur.native="showShortcut=false"/>
          </div>
      </div>
      <div class="footer-item">
        <x-button type="primary" :disabled="submitBtnDisabled" @click.native="openDialog">{{$t('action.submit')}}</x-button>
      </div>
      <div class="footer-item">
        <x-button type="default" @click.native="playReset = !playReset;bettrackData = {track_numbers: [],forDisplay: {}}">{{$t('action.reset')}}</x-button>
      </div>
      <div v-if="gameClosed&&closeCountDown" class="gameclosed-mask">
        <div class="mask color"></div>
        <span class="text">已封盘</span>
      </div>
    </div>
    <div class="bettrack-footer" v-else>
      <div class="row1">
        <template v-if="validPlays.length>0">{{`${validPlays[0].group} - ${validPlays[0].display_name}`}}</template>
        <div class="amount-input-wrapper">
          投注金额：
          <AmountInput class="amount-input" v-model="amount" @focus.native="showShortcut=true" @blur.native="showShortcut=false"/>
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
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { fetchSchedule, fetchGameResult, fetchBetTrackSchedules, getGameHistoryData } from '../../api'
import { Indicator } from '../../utils'
import Countdown from '../../components/Countdown'
import GameResult from '../../components/GameResult'
import rowSkeleton from '../../components/skeletonPattern/rowSkeleton'
import AmountInput from '../../components/AmountInput'
import { TransferDom, XInput, XButton, Group, Grid, GridItem, XDialog, Flexbox, FlexboxItem, Toast, InlineLoading, CellBox, CheckIcon } from 'vux'
import FixScroll from '@/directive/fixscroll'

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
    TransferDom,
    FixScroll
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
      opts_combos_count: 1,
      indicator: null,
      diffBetweenServerAndClient: 0,
      hasDestroy: false,
      bettrack: {
        period: 1,
        multiple: 1
      },
      showShortcut: false,
      historyData: [],
      isHistoryVisible: false,
      mode: 'bet',
      showBottomPrompt: false
    }
  },
  computed: {
    submitBtnDisabled () {
      return !this.amount || this.validPlays.length === 0
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
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    },
    activeCategory () {
      return this.$route.params.categoryId
    },
    ...mapState([
      'systemConfig', 'user', 'latestResultMap', 'theme', 'games'
    ]),
    gameId () {
      return this.$route.params.gameId
    },
    categories () {
      if (!this.gameId) {
        return []
      }
      return this.$store.state.categories[this.gameId] || []
    },
    betDialog () {
      return this.$store.state.dialog.bet
    },
    betTrackDialog () {
      return this.$store.state.dialog.new_bettrack
    },
    promotedGame () {
      if (!this.currentGame) {
        return null
      }
      let code = this.currentGame.prompt_game
      return code ? this.games.find(game => {
        return game.code === code
      }) : null
    }
  },
  watch: {
    'currentGame.code': {
      handler: function (code) {
        if (code) {
          const game = this.currentGame
          this.fetchScheduleAndResult()
          if (game.prompt_game) {
            const bottomPromoteDateFlag = window.localStorage.getItem(`bottom-promot-${game.code}`)
            this.showBottomPrompt = bottomPromoteDateFlag ? this.$moment(bottomPromoteDateFlag).add(2, 'days').isBefore(this.$moment()) : true
          }
        }
      },
      immediate: true
    },
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
    'betTrackDialog.isSuccess': function (isSuccess) {
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
            gameName: '',
            visible: false,
            bets: []
          }
        })
      }
    })
  },
  methods: {
    setBottomPromotFlag () {
      window.localStorage.setItem(`bottom-promot-${this.currentGame.code}`, this.$moment().format('YYYY-MM-DD HH:mm:ss'))
    },
    hideBottomPromot () {
      this.setBottomPromotFlag()
      this.showBottomPrompt = false
      this.sendGaEvent({
        label: this.currentGame.display_name,
        category: 'bottom-promot',
        action: 'hide'
      })
    },
    forwardTo (game) {
      this.setBottomPromotFlag()
      this.sendGaEvent({
        label: game.name,
        category: 'bottom-promot',
        action: 'via-' + this.currentGame.display_name
      })
      this.$store.dispatch('saveLastGame', game.id)
      this.$router.push({path: `/game/${game.id}/`})
    },
    fetchBetTrackSchedules (type) {
      if (this.schedule.id) {
        fetchBetTrackSchedules(this.gameId, this.currentGame.code, type, this.schedule.id).then((res) => {
          this.schedules = _.takeRight(res, 3)
        })
      }
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
          gameName: this.currentGame.display_name,
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
      let play = this.validPlays[0]
      let data = {
        amount: this.amount,
        multiple: this.bettrack.multiple,
        period: this.bettrack.period,
        issue_number: this.schedule.issue_number,
        scheduleId: this.schedule.id,
        play: this.validPlays[0]
      }
      let betOptions
      if (play.activedOptions) {
        let options = []
        _.each(play.activedOptions, option => {
          options.push(option.num)
        })
        betOptions = { options: options }
      } else if (play.combinations) {
        betOptions = { options: play.combinations }
      }

      if (betOptions) {
        data.betOptions = betOptions
      }

      this.$store.dispatch('updateDialog', {
        name: 'new_bettrack',
        state: {
          visible: true,
          data
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

@data-section-zindex: 10;
@amount-shortcut-zindex: 6;
@aside-zindex: 5;
@gameclosed-mask-zindex: 3;
@history-panel-zindex: 6;

.game-container {
  position: relative;
  display: flex;
  overflow-x: hidden;
  flex-direction: column;
  height: 100%;
}

.data-section {
  z-index: @data-section-zindex;
  background: #fff;
  box-shadow: 0 0 3px 3px rgba(0, 0, 0, 0.15);
  position: relative;
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
  left: 0;
  right: 0;
  bottom: 0;
  z-index: @history-panel-zindex;
  visibility: hidden;
  &.visible {
    visibility: visible;
  }
  .history-panel-content {
    position: absolute;
    top: 0;
    width: 100%;
    background: #fff;
  }
}
.history-panel-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  visibility: hidden;
  z-index: @history-panel-zindex;
  background: rgba(0, 0, 0, 0.3);
  &.visible {
    visibility: visible;
  }
}

.mode-tab {
  flex: 0 0 auto;
  display: flex;
  height: 35px;
  background: #fff;
  .mode-tab-item {
    box-sizing: border-box;
    flex: 1 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    border-bottom: 2px solid;
    border-color: #fff;
    color: #999999;
    &.active {
      color: @azul;
      border-color: @azul;
    }
  }
}

.bet-area {
  position: relative;
  overflow: auto;
  display: flex;
  flex: 1 1 auto;
  &.bet {
    height: calc(~"100%" - 90px);
  }
  &.bettrack {
    height: calc(~"100%" - 130px);
  }
  .aside {
    flex: 0 0 auto;
    width: 90px;
    overflow-y: auto;
    box-shadow: 6px 0 3px -3px rgba(0, 0, 0, 0.15);
    z-index: @aside-zindex;
  }
  .main {
    flex: 1 1 auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .category-menu {
    flex: 0 0 auto;
    position: relative;
    display: flex;
    flex-direction: column;
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

.bottom-prompt {
  opacity: 0.9;
  width: 100%;
  position: absolute;
  bottom: 5px;
  transition: bottom 1s, opacity 1s;
  z-index: 5;
  justify-content: center;
  align-items: center;
  &.hidden {
    bottom: 100%;
    opacity: 0;
  }
  .inner {
    border-radius: 4px;
    display: flex;
    color: #fff;
    margin: 10px;
    padding: 10px 5px;
  }
  .close-btn {
    margin-left: 10px;
    align-self: center;
  }
  .txt {
    line-height: 1.2;
    font-size: 13px;
    align-self: center;
    padding: 0 10px;
  }

  .weui-btn.weui-btn_default {
    height: 32px;
    width: 80px;
    align-self: center;
  }
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
    position: relative;
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
  z-index: 10;
  box-shadow: 0 0px 3px 3px rgba(0, 0, 0, 0.15);
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

.amount-shortcut {
  display: flex;
  transition: max-height 0.5s ease-in; // ref: https://css-tricks.com/using-css-transitions-auto-dimensions/
  max-height: 300px;
  height: auto;
  box-shadow: 0 -2px 4px rgba(0,0,0, .2);
  text-align: center;
  background: #efefef;
  color: #666;
  width: 100%;
  position: absolute;
  z-index: @amount-shortcut-zindex; //hight than play group title and bottom game prompt
  bottom: 5px;
  overflow: hidden;
  align-items: center;
  &.collapsed {
    max-height: 0;
  }
  .tips {
    font-size: 13px;
    padding: 0 5px;
    color: #999;
  }
  .items {
    flex: 1;
    display: flex;
    align-content: space-between;
    align-items: center;
  }
  li {
    font-weight: 500;
    font-size: 16px;
    text-overflow: ellipsis;
    white-space: no-wrap;
    flex: 1;
    margin-bottom: -1px;
    line-height: 44px;
    height: 44px;
    overflow: hidden;
  }
}
.gameclosed-mask {
  position: absolute;
  z-index: @gameclosed-mask-zindex;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  .mask {
    width: 100%;
    height: 100%;
    background-color: @azul;
    opacity: .7;
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

.result-skeleton-wrapper {
  padding-right: 10px;
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 5px;
}

.border-shadow {
  height: 4px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%,rgba(0,0,0,0) 100%);
}
</style>
