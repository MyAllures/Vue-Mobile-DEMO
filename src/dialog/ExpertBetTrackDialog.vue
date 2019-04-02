<template>
  <div v-transfer-dom>
    <x-dialog
        v-fix-scroll
        :show.sync="dialogVisible"
        :hide-on-blur="true"
        :dialog-style="{
          width: '90%',
          'max-width': '90%'
        }">
        <div class="wrapper" v-if="dialogData">
          <div class="header">
            <div class="title">确认追号</div>
          </div>
          <div>
            <div class="info-wrapper">
              <div class="row">
                <span class="name">位置 :</span>
                <span class="value">{{currentSetting[dialogData.position-1]}}</span>
              </div>
              <div class="row">
                <span class="name">号码 :</span>
                <span class="value">{{dialogData.bet_numbers.join(',')}}</span>
              </div>
              <div class="row">
                <span class="name">单注 :</span>
                <div class="amount-input-wrapper">
                  <AmountInput class="amount-input" v-model="bettrack.bet_amount"/>
                </div>
              </div>
              <div class="row">
                <span class="name">期数 :</span>
                <span class="value">
                  {{dialogData.issue_numbers.length | periodFilter}}
                  <span class="schedule-text" v-for="(s, i) in dialogData.issue_numbers" :key="i">{{s}}</span>
                </span>
              </div>
            </div>
            <div class="summary">
              <p>一期<span class="red"> {{dialogData.bet_numbers.length}} </span>注 总金额：<span class="red">￥{{dialogData.bet_numbers.length * bettrack.bet_amount}}</span></p>
              <p>如有一期中奖即停止追号</p>
          </div>
          </div>
          <div v-if="loading"  class="loading">
            <inline-loading></inline-loading>加载中
          </div>
          <div v-else class="buttons">
            <x-button type="default" @click.native="dialogVisible = false">取消</x-button>
            <x-button type="primary" @click.native="doBetTrack">确定</x-button>
          </div>
        </div>
      </x-dialog>
  </div>
</template>

<script>
import {XDialog, XButton, TransferDom, InlineLoading} from 'vux'
import {expertBetTrack} from '@/api'
import FixScroll from '@/directive/fixscroll'
import { msgFormatter } from '@/utils'
import AmountInput from '@/components/AmountInput'
import { setting } from '@/utils/expertPlanSetting'

export default {
  name: 'ExpertBetTrackDialog',
  components: {
    XDialog, XButton, InlineLoading, AmountInput
  },
  directives: {
    TransferDom,
    FixScroll
  },
  filters: {
    periodFilter (v) {
      switch (v) {
        case 1:
          return '单期'
        case 2:
          return '两期'
        case 3:
          return '三期'
        default:
          return ''
      }
    }
  },
  data () {
    return {
      dialogVisible: false,
      loading: false,
      currentSetting: [],
      bettrack: {
        game: '',
        issue_numbers: '',
        position: '',
        bet_numbers: '',
        bet_amount: 10
      }
    }
  },
  computed: {
    dialog () {
      return this.$store.state.dialog.expert_bettrack
    },
    dialogData () {
      return this.$store.state.dialog.expert_bettrack.data
    }
  },
  watch: {
    'dialog.visible': function (visible) {
      this.dialogVisible = visible
      if (visible) {
        this.bettrack.game = this.dialogData.game
        this.bettrack.issue_numbers = this.dialogData.issue_numbers.map(n => parseInt(n))
        this.bettrack.position = this.dialogData.position
        this.bettrack.bet_numbers = this.dialogData.bet_numbers.map(n => parseInt(n))
        this.currentSetting = setting[this.dialogData.game]
      }
    },
    'dialogVisible': function (dialogVisible) {
      if (dialogVisible === false && this.dialog.visible !== dialogVisible) {
        this.$store.dispatch('updateDialog', {
          name: 'expert_bettrack',
          state: Object.assign({}, this.dialog, {visible: false, data: null})
        })
      }
    }
  },
  methods: {
    doBetTrack () {
      this.loading = true
      expertBetTrack(this.bettrack).then((res) => {
        this.$store.dispatch('updateDialog', {
          name: 'expert_bettrack',
          state: {
            visible: false,
            data: null,
            isSuccess: true
          }
        })
        this.$vux.toast.show({
          text: '成功下单',
          type: 'success'
        })
        this.loading = false
        this.dialogVisible = false
      }).catch(errRes => {
        const errStr = msgFormatter(errRes)
        if (errStr && errStr.length > 20) {
          this.$vux.toast.show({
            text: msgFormatter(errRes),
            type: 'warn',
            time: 5000,
            width: '12em'
          })
        } else {
          this.$vux.toast.show({
            text: msgFormatter(errRes) || 'error',
            type: 'warn'
          })
        }
      }).finally(() => {
        this.loading = false
        this.dialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.wrapper {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  text-align: left;
  background-color: #fff;
  overflow: hidden;
}

.header {
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-bottom: 2px solid #eee;
}

.title {
  font-size: 18px;
  color: #333;
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

.info-wrapper {
  padding: 15px 10px;
  border-bottom: 2px solid #eee;
  margin-bottom: 10px;
}

.amount-input-wrapper {
  box-sizing: border-box;
  height: 25px;
  .amount-input {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    height: 25px;
    width: 60px;
    line-height: 25px;
    color: #333;
  }
}

.summary {
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.row {
  display: flex;
}

.name {
  display: inline-block;
  width: 50px;
  color: #999;
  line-height: 2;
}

.value {
  color: #333;
  line-height: 2;
}

.schedule-text {
  &:not(:last-child) {
    &:after {
      content: ', '
    }
  }
}
.loading {
  width: 100%;
  height: 50px;
  line-height: 50px;
  font-size: 18px;
  text-align: center;
  margin-bottom: 15px;
  .weui-loading {
    height: 30px;
    width: 30px;
  }
}
</style>
