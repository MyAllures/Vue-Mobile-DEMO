<template>
  <div class="game">
    <div class="fifa-header" v-if="isFifa">
      <div class="image-section">
        <img class="img" src="../../assets/2018fifa.png" alt="FIFA">
      </div>
      <div v-if="currentMatch" class="match-info">
        <span>
          {{`[ ${this.$moment(currentMatch.startTime).format('HH:mm')} ${currentMatch.name} ]`}}
        </span>
        <span class="schedule" v-if="schedule && schedule.issue_number">
          <span class="title">封盘</span>
          <span v-if="!closeCountDown" class="label"></span>
          <span v-else-if="!gameClosed" class="label">
            <span v-if="closeCountDown.days > 0">{{closeCountDown.days}}天</span>
            <span v-if="closeCountDown.hours > 0">{{closeCountDown.hours | complete}}:</span>
            {{closeCountDown.minutes | complete}}:{{closeCountDown.seconds | complete}}
          </span>
          <span v-else class="label">已封盘</span>
        </span>
      </div>
    </div>
    <div v-else>
      <GameResult :gameid="$route.params.gameId"/>
      <Countdown
        :schedule="schedule"
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
        @getCurrentMatch="getCurrentMatch"
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
            keyboard="number"
            placeholder="金额"
            v-model="amount"
            @on-change="inputAmount"
            label-width="100px"
            :show-clear="false">
          </x-input>
        </flexbox-item>
        <flexbox-item>
          <x-button type="primary" @click.native="openDialog">{{$t('action.submit')}}</x-button>
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
import { setIndicator } from '../../utils'
import { mapState } from 'vuex'
import { fetchSchedule } from '../../api'
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
      schedule: {
        id: null
      },
      timer: '',
      closeCountDown: null,
      resultCountDown: null,
      currentPlays: [],
      dialogVisible: false,
      amount: localStorage.getItem('amount') || '10',
      validPlays: [],
      playReset: false,
      loading: false,
      hasPlan: true,
      currentMatch: null,
      opts_combos_count: 1
    }
  },
  filters: {
    complete (value) {
      value = parseInt(value)
      return value < 10 ? ('0' + value) : value
    }
  },
  computed: {
    isFifa () {
      if (this.currentGame) {
        return !!this.currentGame.game_type
      }
    },
    gameClosed () {
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
      return parseInt(this.amount)
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
    'currentMatch': function (match) {
      if (this.currentGame.game_type && match) {
        clearInterval(this.timer)
        this.schedule = match.schedule
        this.$store.dispatch('updateGameInfo', {
          display_name: this.currentGame.display_name,
          game_code: this.currentGame.code,
          issue_number: this.schedule.issue_number
        })
        this.startTimer()
      }
    },
    'betDialog.isSuccess': function (isSuccess) {
      if (isSuccess) {
        this.$set(this, 'playReset', !this.playReset)
      }
    }
  },
  created () {
    this.updateSchedule()
    let isSportsGame = !!this.currentGame.game_type
    if (!this.$route.params.categoryId) {
      if (this.categories.length > 0) {
        this.chooseCategory()
      } else {
        if (isSportsGame) {
          let matchId = this.currentGame.matches.length ? this.currentGame.matches[0].id : ''
          if (matchId) { this.$store.dispatch('fetchMatchCategories', {game: this.currentGame, matchId}) }
        } else {
          this.$store.dispatch('fetchCategories', this.gameId)
        }

        const unwatch = this.$watch('categories', function (categories) {
          this.chooseCategory()
          unwatch()
        })
      }
    } else if (this.categories.length === 0) {
      if (isSportsGame) {
        let matchId = this.currentGame.matches.length ? this.currentGame.matches[0].id : ''
        if (matchId) { this.$store.dispatch('fetchMatchCategories', {game: this.currentGame, matchId}) }
      } else {
        this.$store.dispatch('fetchCategories', this.gameId)
      }
    }

    setIndicator(() => {

    }, () => {

    })
  },
  methods: {
    getCurrentMatch (match) {
      this.currentMatch = match
    },
    chooseCategory () {
      const categoryId = localStorage.getItem(this.gameId + '-lastCategory') || this.categories[0].id
      this.$router.replace(`/game/${this.gameId}/${categoryId}`)
    },
    inputAmount (val) {
      let formatted = !val ? '' : val.replace(/^[0]|[^0-9]/g, '')
      this.$nextTick(() => {
        this.amount = formatted
      })
    },
    updateSchedule () {
      if (!this.gameId || (this.currentGame && this.currentGame.game_type)) {
        return
      }
      clearInterval(this.timer)
      fetchSchedule(this.gameId)
        .then(res => {
          this.schedule = _.find(res, schedule => {
            return schedule.id !== this.schedule.id &&
              this.$moment().isBefore(schedule.schedule_result) &&
              (schedule.status === 'open' || schedule.status === 'created')
          }) || {}
          this.$store.dispatch('updateGameInfo', {
            display_name: this.currentGame.display_name,
            issue_number: this.schedule.issue_number,
            game_code: this.currentGame.code
          })
          this.startTimer()
        }).catch(() => {})
    },
    switchCategory (categoryId) {
      if (!categoryId) {
        return
      }
      const gameId = this.$route.params.gameId

      if (!this.currentGame.game_type) {
        localStorage.setItem(gameId + '-lastCategory', categoryId)
      }

      this.$router.push({
        path: `/game/${gameId}/${categoryId}`
      })
    },
    startTimer () {
      if (!this.schedule) {
        return
      }
      this.timer = setInterval(() => {
        const closeTime = this.$moment(this.schedule.schedule_close)
        const resultTime = this.$moment(this.schedule.schedule_result)
        if (this.$moment().isAfter(resultTime)) {
          clearInterval(this.timer)
          return
        }
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
        this.updateSchedule()
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
      this.$store.dispatch('openBetDialog', this.formatBetInfo(this.validPlays))
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
    clearInterval(this.timer)
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

.fifa-header {
  width: 100%;
  .image-section {
    width: 100%;
    padding: 10px 10px 0 10px;
    background-image: linear-gradient(to bottom, #166fd8, #1568CA);
    .img {
      width: 80%;
      height: auto;
    }
  }
  .match-info {
    background-image: linear-gradient(to bottom, #1568CA, #1053A1);
    white-space: nowrap;
    color: #fff;
    font-size: 22px;
    padding: 0 10px 10px 10px;
  }
  @media screen and (max-width: 375px) {
      .match-info {
        font-size: 16px;
      }
    }
}
</style>
