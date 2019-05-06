<template>
  <div v-transfer-dom>
    <x-dialog
        class="bet-dialog"
        :show.sync="dialogVisible"
        :hide-on-blur="true"
        :dialog-style="{
          width: '95%',
          'max-width': '95%'
        }">
        <div class="bet-content">
          <div class="title vux-1px-b">确认注单</div>
          <div class="game" v-if="betDialog.showGameName">{{betDialog.gameName}}</div>
          <ul class="bet-items" ref="bets" v-fix-scroll>
            <li
              class="bet-item"
              v-for="(bet, index) in betDialog.bets"
              :key="index">
              <label class="amount-input-wrapper">
                {{`【${bet.display_name}】 @${bet.odds} X `}}
                <AmountInput class="amount-input" v-model="betAmounts[index]" @on-focus="focusInput"/>
              </label>
              <p v-if="bet.optionDisplayNames" class="options"> {{`已选号码：${bet.optionDisplayNames}`}} </p>
            </li>
          </ul>
          <div class="total">
            <span class="bet-num">共 <span class="red">{{totalCount}}</span> 组</span>
            总金额：
            <span class="amount">{{totalAmount | currency('￥')}}</span>
          </div>
          <cube-checkbox v-model="isShared" v-if="betDialog.hasShared">
            分享我的注单
          </cube-checkbox>
          <div v-if="loading" class="loading">
            <inline-loading></inline-loading>加载中
          </div>
          <div v-else class="buttons">
            <x-button type="default" @click.native="dialogVisible = false">{{$t('action.cancel')}}</x-button>
            <x-button :disabled="!betDialog.bets.length||totalAmount>user.balance" @click.native="placeOrder" type="primary">{{$t('action.confirm')}}</x-button>
          </div>
        </div>
      </x-dialog>
  </div>
</template>

<script>
import { placeBet } from '../api'
import { mapState } from 'vuex'
import { msgFormatter } from '../utils'
import {Flexbox, FlexboxItem, XDialog, XInput, CheckIcon, XButton, TransferDom, InlineLoading} from 'vux'
import FixScroll from '../directive/fixscroll'
import AmountInput from './AmountInput'
const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)

export default {
  name: 'BetDialog',
  components: {
    Flexbox, FlexboxItem, XDialog, XInput, CheckIcon, XButton, InlineLoading, AmountInput
  },
  directives: {
    TransferDom,
    FixScroll
  },
  data () {
    return {
      dialogVisible: false,
      loading: false,
      betAmounts: null,
      currentFocusInput: null,
      isShared: true
    }
  },
  computed: {
    ...mapState([
      'systemConfig', 'user'
    ]),
    betDialog () {
      return this.$store.state.dialog.bet
    },
    totalCount () {
      if (this.betDialog.bets.length === 0) {
        return 0
      }
      let optsCombosCount = this.betDialog.bets[0].opts_combos_count
      if (optsCombosCount && optsCombosCount > 1) {
        return optsCombosCount
      } else {
        return this.betDialog.bets.length
      }
    },
    totalAmount () {
      if (this.betDialog.bets.length === 0) {
        return 0
      }
      if (!this.betAmounts || this.betAmounts.length === 0) {
        return 0
      }
      let optsCombosCount = this.betDialog.bets[0].opts_combos_count
      if (optsCombosCount && optsCombosCount > 1) {
        return this.betAmounts[0] * optsCombosCount
      } else {
        let total = 0
        this.betAmounts.forEach(amount => {
          let num = parseFloat(amount)
          if (num) {
            total += num
          }
        })
        return total
      }
    }
  },
  watch: {
    'betDialog.visible': function (visible) {
      this.loading = false
      this.dialogVisible = visible
      if (visible) {
        const betAmounts = []
        this.betDialog.bets.forEach(bet => {
          betAmounts.push(bet.bet_amount + '')
        })
        this.betAmounts = betAmounts
      }
    },
    'dialogVisible': function (dialogVisible) {
      if (dialogVisible === false && this.betDialog.visible !== dialogVisible) {
        this.$store.dispatch('updateDialog', {
          name: 'bet',
          state: {
            gameName: '',
            visible: false,
            bets: []
          }
        })
      }
    }
  },
  mounted () {
    if (iOS) {
      this.$refs.bets.addEventListener('scroll', this.scrollHandler)
    }
  },
  methods: {
    focusInput (val, e) {
      this.currentFocusInput = e.target
    },
    scrollHandler () {
      if (this.currentFocusInput) {
        this.currentFocusInput.blur()
        this.currentFocusInput = null
      }
    },
    placeOrder () {
      this.loading = true
      const formatBet = this.betDialog.bets.map((bet, i) => {
        return {
          bet_options: bet.bet_options,
          game_schedule: bet.game_schedule,
          play: bet.play,
          bet_amount: parseFloat(this.betAmounts[i])
        }
      })
      const betData = {bets: formatBet}
      if (this.betDialog.hasShared) {
        betData.share_bet_info = this.isShared
      }
      placeBet(betData)
        .then(res => {
          window.gtag('event', '投注', {'event_category': '遊戲投注', 'event_label': this.betDialog.gameName})
          if (res && res[0].member) {
            this.$vux.toast.show({
              text: '成功下单',
              type: 'success'
            })
            this.$store.dispatch('updateDialog', {
              name: 'bet',
              state: {
                gameName: '',
                visible: false,
                bets: [],
                isSuccess: true
              }
            })
            this.dialogVisible = false
            this.loading = false
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
    }
  },
  beforeDestroy () {
    if (iOS) {
      this.$refs.bets.removeEventListener('scroll', this.scrollHandler)
    }
  }
}
</script>
<style lang="less" scoped>
.game {
  text-align: center;
  margin-top: 5px;
}
.bet-content {
  width: 100%;
  text-align: left;
  background-color: #fff;
  padding: 0 0 10px;
  overflow: hidden;
  .title {
    height: 44px;
    line-height: 44px;
    text-align: center;
  }
  .bet-items {
    min-height: 150px;
    max-height: 300px;
    overflow-y: auto;
    border-top: none;
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
      .amount-input-wrapper {
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding-right: 5px;
        .amount-input {
          width: 60px;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 5px;
          padding-left: 5px;
          height: 25px;
        }
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
    display: flex;
    justify-content: space-between;
    height: 40px;
    width: 270px;
    margin: 15px auto;
    /deep/ .weui-btn {
      margin: 0;
      width: 130px;
    }
    /deep/ .weui-btn + .weui-btn {
      margin: 0;
    }
  }
}
</style>
