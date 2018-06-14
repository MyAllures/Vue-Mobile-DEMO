<template>
  <div class="game">
    <GameResult :gameid="$route.params.gameId"/>
    <Countdown
        :schedule="schedule"
        v-if="schedule.id"
        :currentGame="currentGame"
        :gameClosed="gameClosed"
        :closeCountDown="closeCountDown"
        :resultCountDown="resultCountDown"/>
    <div class="bet-area">
      <group class="aside">
        <cell-box
          :border-intent="false"
          :class="['category-menu-item',activeCategory===category.id+'' ? 'active' : '']"
          v-for="(category, index) in categories"
          @click.native="switchCategory(category.id)"
          :key="'category' + category.id">
          {{category.name}}
        </cell-box>
      </group>
      <div class="main">
        <router-view
        :key="$route.name + ($route.params.categoryId || '')"
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
            keyboard="number"
            placeholder="金额"
            v-model="amount"
            @on-change="inputAomunt"
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
      <div v-if="gameClosed" class="gameclosed-mask">已封盘</div>
    </div>
    <popup v-model="dialogVisible" is-transparent>
      <div class="bet-content">
        <div class="title">确认注单</div>
        <ul class="bet-items">
          <li
            class="bet-item"
            v-for="(play, index) in currentPlays"
            :key="index">
            <p class="bet-item-text">
              <span class="play">{{`【${play.display_name}】 @${play.odds} X `}}</span>
              <span class="amount">{{amount | currency('￥')}}</span>
            </p>
            <p v-if="play.optionDisplayNames" class="options"> {{`已选号码：${play.optionDisplayNames}`}} </p>
          </li>
        </ul>
        <div class="total">
          <span class="bet-num">共 <span class="red">{{currentPlays.length}}</span> 组</span>
          总金额：
          <span v-if="amountByCombination"
            class="amount">{{activePlays[0].combinations.length * amount | currency('￥')}}</span>
          <span v-else
            class="amount">{{currentPlays.length * amount | currency('￥')}}</span>
        </div>
        <check-icon v-if="hasPlanCheck" class="check-plan" :value.sync="hasPlan">
          将此笔注单分享至聊天室开放跟单
        </check-icon>
        <div v-if="loading" class="loading">
          <inline-loading></inline-loading>加载中
        </div>
        <flexbox v-else class="buttons">
          <flexbox-item :span="1/2">
            <x-button :disabled="!currentPlays.length" @click.native="placeOrder" type="primary">{{$t('action.confirm')}}</x-button>
          </flexbox-item>
          <flexbox-item :span="1/2">
            <x-button type="default" @click.native="dialogVisible = false">{{$t('action.cancel')}}</x-button>
          </flexbox-item>
        </flexbox>
      </div>
    </popup>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex'
import { fetchSchedule, placeBet } from '../../api'
import Countdown from '../../components/Countdown'
import GameResult from '../../components/GameResult'
import { msgFormatter } from '../../utils'
import { XInput, XButton, Group, Popup, Grid, GridItem, Flexbox, FlexboxItem, Toast, InlineLoading, CellBox, CheckIcon } from 'vux'
export default {
  name: 'Game',
  components: {
    Countdown,
    GameResult,
    XInput,
    XButton,
    Group,
    Popup,
    Grid,
    GridItem,
    Flexbox,
    FlexboxItem,
    Toast,
    InlineLoading,
    CellBox,
    CheckIcon
  },
  data () {
    return {
      schedule: {
        id: null
      },
      timer: '',
      closeCountDown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      resultCountDown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      currentPlays: [],
      dialogVisible: false,
      amount: localStorage.getItem('amount') || '10',
      validPlays: [],
      activePlays: [],
      playReset: false,
      loading: false,
      hasPlan: true
    }
  },
  computed: {
    gameClosed () {
      const c = this.closeCountDown
      return c.days + c.hours + c.minutes + c.seconds === 0
    },
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    },
    activeCategory () {
      return this.$route.params.categoryId
    },
    ...mapGetters([
      'categories'
    ]),
    ...mapState([
      'systemConfig', 'user'
    ]),
    playsForSubmit () {
      return _.filter(this.currentPlays, play => play.active).map(play => {
        return {
          game_schedule: this.schedule.id,
          bet_amount: parseFloat(play.bet_amount),
          play: play.id,
          bet_options: play.bet_options
        }
      })
    },
    amountByCombination () {
      // 自定義且有指定選項且有組合，總金額以組合數計算
      let play = this.activePlays[0]
      return play && play.isCustom && play.activedOptions && play.combinations
    },
    gameId () {
      return this.$route.params.gameId
    },
    amountForProp () {
      return parseInt(this.amount)
    },
    hasPlanCheck () {
      return this.systemConfig.chatroomEnabled && this.user.planMakerRoom && this.user.planMakerRoom.includes(parseInt(this.gameId))
    }
  },
  watch: {
    '$route': function (to, from) {
      if (!this.$route.params.categoryId && to.params.gameId === from.params.gameId) {
        this.$router.replace(`/game/${this.gameId}/${this.categories[0].id}`)
      }
    },
    'gameId': function (gameId) {
      this.init()
    }
  },
  created () {
    this.init()
  },
  methods: {
    inputAomunt (val) {
      let formatted = !val ? '' : val.replace(/^[0]|[^0-9]/g, '')
      this.$nextTick(() => {
        this.amount = formatted
      })
    },
    init () {
      this.updateSchedule()
      this.$store.dispatch('fetchCategories', this.gameId).then(res => {
        if (!this.$route.params.categoryId) {
          if (this.gameId) {
            this.$router.replace(`/game/${this.gameId}/${res[0].id}`)
          }
        }
      })
    },
    updateSchedule () {
      if (!this.gameId) {
        return
      }
      clearInterval(this.timer)
      fetchSchedule(this.gameId)
        .then(res => {
          this.schedule = _.find(res, schedule => {
            return schedule.id !== this.schedule.id &&
              this.$moment().isBefore(schedule.schedule_result) &&
              (schedule.status === 'open' || schedule.status === 'created')
          })
          this.$store.dispatch('updateGameInfo', {
            display_name: this.currentGame.display_name,
            issue_number: this.schedule.issue_number
          })
          this.startTimer()
        })
    },
    switchCategory (categoryId) {
      if (!categoryId) {
        return
      }
      this.$router.push({
        path: `/game/${this.$route.params.gameId}/${categoryId}`
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
      this.currentPlays = _.values(this.validPlays.map(play => {
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
          betOptions = { options: play.combinations }
          optionDisplayNames = [...play.combinations]
        } else {
          betOptions = {}
        }
        if (optionDisplayNames.length > 0) {
          optionDisplayNames = optionDisplayNames.join(',')
        } else {
          optionDisplayNames = ''
        }
        return {
          game_schedule: 10,
          display_name: play.hideName ? play.group : `${play.group} - ${play.display_name}`,
          odds: play.odds,
          bet_amount: play.amount,
          id: play.id,
          bet_options: betOptions,
          active: true,
          combinations: play.combinations,
          optionDisplayNames: optionDisplayNames
        }
      }))
      this.dialogVisible = true
    },
    placeOrder () {
      this.loading = true
      placeBet({send_bet_info: this.hasPlanCheck && this.hasPlan, bets: this.playsForSubmit})
        .then(res => {
          window.gtag('event', '投注', {'event_category': '遊戲投注', 'event_label': this.currentGame.display_name})
          if (res && res[0].member) {
            this.$set(this, 'playReset', !this.playReset)
            this.$vux.toast.show({
              text: '成功下单',
              type: 'success'
            })
            this.dialogVisible = false
            this.loading = false
            this.$store.dispatch('fetchUser')
          } else {
            this.$vux.toast.show({
              text: msgFormatter(res.msg),
              type: 'warn'
            })
            this.loading = false
          }
        },
        errRes => {
          const errStr = msgFormatter(errRes)
          if (errStr.length > 20) {
            this.$vux.toast.show({
              text: msgFormatter(errRes),
              type: 'warn',
              time: 5000,
              width: '12em'
            })
          } else {
            this.$vux.toast.show({
              text: msgFormatter(errRes),
              type: 'warn'
            })
          }
          this.loading = false
        })
    },
    updatePlays (plays) {
      this.activePlays = plays
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
    margin: auto; // fix the overflowing flexitem issue
    line-height: 18px;
    width: 100%;
    background: #f9f9f9;
  }
  .aside {
    display: flex;
    overflow-y: auto;
    justify-content: safe center;
    align-items: safe center;
    width: 100px;
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
  .bet-items {
    min-height: 150px;
    max-height: 300px;
    overflow-y: auto;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    color: #333;
    padding: 10px 0;
    .bet-item {
      text-align: left;
      padding-bottom: 5px;
      .bet-item-text {
        height: 25px;
        line-height: 25px;
      }
    }
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
    height: 50px;
  }
}
</style>
