<template>
  <div v-transfer-dom>
    <popup v-model="dialogVisible" is-transparent v-if="betInfo">
      <div class="bet-content">
        <div class="title">确认注单</div>
        <ul class="bet-items">
          <li
            class="bet-item"
            v-for="(bet, index) in betInfo.bets"
            :key="index">
            <p class="bet-item-text">
              <span class="play">{{`【${bet.play.display_name}】 @${bet.play.odds} X `}}</span>
              <span class="amount">{{bet.bet_amount | currency('￥')}}</span>
            </p>
            <p v-if="bet.optionDisplayNames" class="options"> {{`已选号码：${bet.optionDisplayNames}`}} </p>
          </li>
        </ul>
        <div class="total">
          <span class="bet-num">共 <span class="red">{{betInfo.bets.length}}</span> 组</span>
          总金额：
          <span class="amount">{{betInfo.bets.length * betInfo.bets[0].bet_amount | currency('￥')}}</span>
        </div>
        <check-icon v-if="hasPlanCheck"class="check-plan" :value.sync="hasPlan">
          将此笔注单分享至聊天室开放跟单
        </check-icon>
        <div v-if="loading" class="loading">
          <inline-loading></inline-loading>加载中
        </div>
        <flexbox v-else class="buttons">
          <flexbox-item :span="1/2">
            <x-button :disabled="!betInfo.bets.length" @click.native="placeOrder" type="primary">{{$t('action.confirm')}}</x-button>
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
import { placeBet } from '../api'
import { mapState } from 'vuex'
import { msgFormatter } from '../utils'
import {Flexbox, FlexboxItem, Popup, CheckIcon, XButton, TransferDom, InlineLoading} from 'vux'
export default {
  name: 'BetDialog',
  components: {
    Flexbox, FlexboxItem, Popup, CheckIcon, XButton, InlineLoading
  },
  directives: {
    TransferDom
  },
  props: {
    isShowDialog: {
      type: Boolean
    },
    betInfo: {
      type: Object
    }
  },
  data () {
    return {
      dialogVisible: false,
      loading: false,
      hasPlan: true
    }
  },
  computed: {
    ...mapState([
      'systemConfig', 'user'
    ]),
    gameId () {
      return this.$route.params.gameId
    },
    hasPlanCheck () {
      return this.systemConfig.chatroomEnabled && this.user.planMakerRoom && this.user.planMakerRoom.includes(parseInt(this.gameId))
    }
  },
  watch: {
    'isShowDialog': function (isShowDialog) {
      this.dialogVisible = isShowDialog
    },
    'dialogVisible': function (dialogVisible) {
      this.$emit('toggleDialog', dialogVisible)
    }
  },
  methods: {
    placeOrder () {
      this.loading = true
      const formatBet = this.betInfo.bets.map(bet => {
        return {...bet, play: bet.play.id}
      })
      placeBet({send_bet_info: this.hasPlanCheck && this.hasPlan, bets: formatBet})
        .then(res => {
          if (res && res[0].member) {
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
    }
  }
}
</script>
<style lang="less" scoped>
@import "../styles/vars.less";

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
