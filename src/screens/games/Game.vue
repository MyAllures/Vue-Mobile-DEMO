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
      <div class="aside">
        <ul :class="{short: categories.length < 11}">
          <li
            :class="['category-menu-item',activeCategory===category.name?'active':'']"
            v-for="(category, index) in categories"
            :key="'category' + category.name"
            @click="switchCategory(category.name)">{{category.name}}</li>
        </ul>
      </div>
      <div class="main">
        <router-view
        :key="$route.name + ($route.params.categoryName || '')"
        :game="currentGame"
        :gameClosed="gameClosed"
        :amount="amount"
        :playReset="playReset"
        @updatePlays="updatePlays"
        @resetPlays="playReset = !playReset"
        />
      </div>
    </div>
    <div class="bet-input">
      <flexbox>
        <flexbox-item>
          <div class="balance">{{user.balance||0 | currency('￥')}}</div>
          <div class="playCount">已选 <span class="count">{{validPlays.length}}</span> 注</div>
        </flexbox-item>
        <flexbox-item>
          <x-input class="weui-vcode" type="number" v-model.number="amount" label-width="100px" :show-clear="false">
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
        <ul>
          <li
            v-for="(play, index) in currentPlays"
            :key="index">
            <p>
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
    <toast v-model="showMessage" :type="msgType" :time="2000" :position="'middle'">{{errors||'成功下单'}}</toast>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { fetchSchedule, placeBet } from '../../api'
import Countdown from '../../components/Countdown'
import GameResult from '../../components/GameResult'
import { XInput, XButton, Group, Popup, Grid, GridItem, Flexbox, FlexboxItem, Toast, InlineLoading } from 'vux'
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
    InlineLoading
  },
  data () {
    return {
      gameId: this.$route.params.gameId,
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
      amount: parseInt(localStorage.getItem('amount')) || 1,
      validPlays: [],
      activePlays: [],
      playReset: false,
      showMessage: false,
      errors: '',
      loading: false
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
      return this.$route.params.categoryName
    },
    ...mapGetters([
      'categories', 'user'
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
    msgType () {
      return this.errors ? 'warn' : 'success'
    },
    amountByCombination () {
      // 自定義且有指定選項且有組合，總金額以組合數計算
      let play = this.activePlays[0]
      return play && play.isCustom && play.activedOptions && play.combinations
    }
  },
  created () {
    this.updateSchedule()
    if (!this.$route.params.categoryName) {
      const categories = this.$store.getters.categoriesByGameId(this.gameId)
      if (!categories.length) {
        this.$store.dispatch('fetchCategories', this.gameId)
          .then((res) => {
            this.$router.push(`/game/${this.gameId}/${res[0].name}`)
          }).catch(() => { })
      } else {
        this.$router.push(`/game/${this.gameId}/${categories[0].name}`)
      }
    }
  },
  methods: {
    updateSchedule () {
      clearInterval(this.timer)
      fetchSchedule(this.gameId)
        .then(res => {
          this.schedule = _.find(res, schedule => {
            return schedule.id !== this.schedule.id &&
              this.$moment().isBefore(schedule.schedule_result) &&
              (schedule.status === 'open' || schedule.status === 'created')
          })
          this.startTimer()
        })
    },
    switchCategory (categoryName) {
      if (!categoryName) {
        return
      }
      this.$router.push({
        path: `/game/${this.$route.params.gameId}/${categoryName}`
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
      this.errors = ''
      placeBet(this.playsForSubmit)
        .then(res => {
          if (res && res[0].member) {
            this.$set(this, 'playReset', !this.playReset)
            this.showMessage = true
            this.dialogVisible = false
            this.loading = false
            this.$store.dispatch('fetchUser')
          } else {
            let messages = []
            res.msg.forEach(error => {
              messages.push(error)
            })
            this.errors = messages.join(', ')
            this.showMessage = true
            this.loading = false
          }
        },
        errRes => {
          this.errors = errRes.join()
          setTimeout(() => {
            this.showMessage = true
            this.loading = false
          }, 3000)
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
  flex-direction: column;
  height: calc(~"100vh" - 78px);
}
.bet-area {
  flex: 1 1 auto;
  display: flex;
  .aside {
    overflow-y: auto;
    width: 100px;
    box-sizing: border-box;
    border-width: 0 4px 0 0;
    border-style: solid;
    border-image: linear-gradient(to right, rgba(0, 0, 0, 0.2), transparent) 1 100%;
    display: flex;
    align-items: center;
    background-color: #f9f9f9;
    color: #9b9b9b;
    ul {
      max-height: 100%;
      width: 100%;
      background-color: #f9f9f9;
      li {
        padding: 10px 0;
        overflow:hidden;
        text-align: center;
        box-sizing: border-box;
        width: 100%;
        line-height: 20px;
        border-top: 1px solid #d8d8d8;
        &:last-child{
          border-bottom: 1px solid #d8d8d8;
        }
        &.active {
          color: #156fd8;
          background: #f0f0f0;
        }
      }
      &.short li {
        padding: 13px 0;
      }
    }
  }
  .main {
    width: calc(~"100%" - 80px);
    overflow-y: auto;
    background-color: #fff;
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
        color: #000;
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
  ul {
    min-height: 150px;
    max-height: 300px;
    overflow-y: auto;
    border-top: 1px solid #f0f0f0;
    border-bottom: 1px solid #f0f0f0;
    color: #000;
    padding: 10px 0;
    li {
      text-align: left;
      padding-bottom: 5px;
      p {
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
  button.weui-btn {
    width: 80%;
  }
  .play {
    color: #666;
  }
  .buttons {
    height: 50px;
  }
}
</style>
