<template>
  <div v-transfer-dom>
    <x-dialog
        :show.sync="dialogVisible"
        :hide-on-blur="true"
        :dialog-style="{
          width: '90%',
          'max-width': '90%'
        }">
        <div class="wrapper" v-if="dialogData">
          <div class="header">
            <div class="title">确认注单</div>
          </div>
          <div class="input-panel">
            <div class="row1">
              {{`【${dialogData.play.group} - ${dialogData.play.display_name}】 @${dialogData.play.odds}`}}
              <div class="amount-input-wrapper">
                <AmountInput class="amount-input" v-model="bettrack.bet_amount"/>
              </div>
            </div>
            <p v-if="bettrack.optionDisplayNames" class="options"> {{`已选号码：${bettrack.optionDisplayNames}`}} </p>
            <div class="row2">
              <div class="col">
                追&nbsp;
                <input
                  type="number"
                  class="period-input"
                  pattern="[0-9]*"
                  v-positive-number="{integer: true}"
                  @update="bettrack.multiple=$event.target.value"
                  :value="bettrack.type"/>&nbsp;期
              </div>
              <div class="col">
                翻倍：
                <input
                  type="number"
                  class="time-input"
                  pattern="[0-9]*"
                  v-positive-number="{integer: true}"
                  @update="bettrack.multiple=$event.target.value"
                  :value="bettrack.multiple"/>
              </div>
            </div>
          </div>
          <div class="detail-table">
            <div class="detail-table-head">
              <span>期号</span>
              <span>投注金额</span>
            </div>
            <div class="detail-table-body-wrapper" v-fix-scroll>
              <div class="detail-table-body">
                <div class="detail-table-item" v-for="sched in predictSchedule" :key="sched.issueNumber">
                  <span>{{sched.issueNumber}}</span>
                  <span>{{sched.amount|currency('￥')}}</span>
                </div>
              </div>
            </div>
          </div>
          <cube-checkbox v-model="ifStopTracking">
            中奖后停止追号
          </cube-checkbox>
          <div v-if="loading"  class="loading">
            <inline-loading></inline-loading>加载中
          </div>
          <div v-else class="buttons">
            <x-button type="default" @click.native="dialogVisible = false">取消</x-button>
            <x-button type="primary" :disabled="isBtnDisabled" @click.native="doNewBetTrack">确定</x-button>
          </div>
        </div>
      </x-dialog>
  </div>
</template>

<script>
import { XDialog, XButton, TransferDom, InlineLoading } from 'vux'
import { newBetTrack } from '@/api'
import FixScroll from '@/directive/fixscroll'
import { msgFormatter } from '@/utils'
import { mapState } from 'vuex'
import AmountInput from '@/components/AmountInput'
import PositiveNumber from '@/directive/positiveNumber'

export default {
  name: 'NewBetTrackDialog',
  components: {
    XDialog, XButton, InlineLoading, AmountInput
  },
  directives: {
    TransferDom,
    FixScroll,
    PositiveNumber
  },
  data () {
    return {
      dialogVisible: false,
      loading: false,
      ifStopTracking: true,
      bettrack: {
        bet_amount: 0,
        play_ids: '',
        type: 1,
        multiple: 1,
        game_schedule: '',
        optionDisplayNames: ''
      }
    }
  },
  methods: {
    doNewBetTrack () {
      this.loading = true
      let submitData = {...this.bettrack}
      submitData.bet_amount = parseFloat(submitData.bet_amount)
      submitData.multiple = parseFloat(submitData.multiple)
      submitData.type = parseFloat(submitData.type)
      submitData.stopping_tracking_type = this.ifStopTracking ? 'when_win_stop' : 'never_stop'
      if (this.dialogData.betOptions) {
        submitData.betOptions = this.dialogData.betOptions
      }
      newBetTrack(submitData).then((res) => {
        this.sendGaEvent({
          label: this.gameName,
          category: '遊戲追號',
          action: '投注'
        })
        this.$store.dispatch('updateDialog', {
          name: 'new_bettrack',
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
    },
    isNumberKey (e) {
      const charCode = e.which ? e.which : e.keyCode
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        e.preventDefault()
      }
    }
  },
  computed: {
    ...mapState('game', {
      gameName: state => state.displayName
    }),
    dialog () {
      return this.$store.state.dialog.new_bettrack
    },
    dialogData () {
      return this.$store.state.dialog.new_bettrack.data
    },
    predictSchedule () {
      if (this.dialogData.issue_number === undefined) {
        return []
      }
      let number = parseInt(this.dialogData.issue_number)
      let amount = parseFloat(this.bettrack.bet_amount)
      return Array.from({length: this.bettrack.type}, (v, i) => {
        return {
          issueNumber: i + number,
          amount: amount * Math.pow(this.bettrack.multiple, i)
        }
      })
    },
    isBtnDisabled () {
      return !this.bettrack.bet_amount || !this.bettrack.type || !this.bettrack.multiple
    }
  },
  watch: {
    'dialog.visible': function (visible) {
      this.dialogVisible = visible
      if (visible) {
        this.bettrack.bet_amount = this.dialogData.amount
        this.bettrack.play_ids = this.dialogData.play.id
        this.bettrack.type = this.dialogData.period
        this.bettrack.multiple = this.dialogData.multiple
        this.bettrack.game_schedule = this.dialogData.scheduleId
        this.bettrack.optionDisplayNames = this.dialogData.optionDisplayNames
        this.ifStopTracking = true
      }
    },
    dialogVisible: function (dialogVisible) {
      if (dialogVisible === false && this.dialog.visible !== dialogVisible) {
        this.$store.dispatch('updateDialog', {
          name: 'new_bettrack',
          state: Object.assign({}, this.dialog, {visible: false, data: null})
        })
      }
    },
    'bettrack.type': function (v, oldVal) {
      if (v && v > 30) {
        this.bettrack.type = oldVal
        this.$vux.toast.show({
          text: '不得大于30期',
          type: 'warn',
          time: 3000,
          width: '12em'
        })
      }
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

.input-panel {
  box-sizing: border-box;
  flex: 0 0 auto;
  background: #fff;
  color: #333;
  padding: 10px 5px 10px 0;
  font-size: 14px;
  .amount-input {
    background: #fff;
    border: 1px solid #bfbfbf;
    border-radius: 4px;
    height: 25px;
    width: 60px;
    line-height: 25px;
    color: #333;
  }
  .row1 {
    display: flex;
    align-items: center;
    height: 25px;
    .amount-input-wrapper {
      margin-left: auto;
      box-sizing: border-box;
      height: 25px;
    }
  }
  .options {
    width: 100%;
    padding-left: 10px;
  }
  .row2 {
    display: flex;
    align-items: center;
    padding: 10px 0 0 10px;
    .col {
      display: flex;
      align-items: center;
      margin-right: 20px;
    }
    input {
      box-sizing: border-box;
      height: 25px;
      line-height: 25px;
      width: 60px;
      padding: 0 5px;
      border: 1px solid #bfbfbf;
      border-radius: 4px;
      outline: 0;
      -webkit-appearance: none;
      background-color: #fff;
      font-size: inherit;
      color: #333;
    }
  }
}

.detail-table {
  height: 140px;
  font-size: 12px;
  padding: 0 35px;
  background: #eee;
  .detail-table-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 25px;
    color: #999;
    border-bottom: 1px solid #e5e5e5;
  }
  .detail-table-body-wrapper {
    height: 115px;
    overflow-y: auto;
    .detail-table-body {
      color: #333;
      .detail-table-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 20px;
      }
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
