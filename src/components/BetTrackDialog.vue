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
        <div class="wrapper">
          <div class="header">
            <div class="title">确认追号</div>
          </div>
          <div>
            <div class="info-wrapper">
              <div>
                <span class="name">位置 :</span>
                <span class="value">{{dialog.data.forDisplay.play_code_pattern}}</span>
              </div>
              <div>
                <span class="name">号码 :</span>
                <span class="value">{{dialog.data.track_numbers.join(',')}}</span>
              </div>
              <div>
                <span class="name">单注 :</span>
                <span class="value">￥{{dialog.data.bet_amount}}</span>
              </div>
              <div>
                <span class="name">期数 :</span>
                <span class="value">{{dialog.data.forDisplay.type}}</span>
                <p class="issues">
                  <span class="grey" v-for="(s, i) in dialog.data.forDisplay.selectedSchedules" :key="i">
                    {{s.issue_number+ '期'}}
                  </span>
                </p>
              </div>
            </div>
            <div class="summary">
              <p>共 <span class="red">{{dialog.data.track_numbers.length}}</span> 组 中奖后即停止追号</p>
              <p>单期总金额： <span class="red">￥{{dialog.data.track_numbers.length * dialog.data.bet_amount}}</span></p>
          </div>
          </div>
          <flexbox class="buttons" justify="space-around">
            <flexbox-item :span="5">
              <x-button type="primary" @click.native="doBetTrack">确定</x-button>
            </flexbox-item>
            <flexbox-item :span="5">
              <x-button type="default" @click.native="dialogVisible = false">取消</x-button>
            </flexbox-item>
          </flexbox>
        </div>
      </x-dialog>
  </div>
</template>

<script>
import {Flexbox, FlexboxItem, XDialog, XButton, TransferDom} from 'vux'
import {betTrack} from '../api'
import FixScroll from '../directive/fixscroll'
import { msgFormatter } from '../utils'
import {pick} from 'lodash'

export default {
  name: 'BetTrackDialog',
  components: {
    Flexbox, FlexboxItem, XDialog, XButton
  },
  directives: {
    TransferDom,
    FixScroll
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  methods: {
    doBetTrack () {
      let submitData = pick(this.dialog.data, ['game_schedule', 'type', 'bet_amount', 'track_numbers', 'play_code_pattern'])
      betTrack(submitData).then((res) => {
        this.$store.dispatch('updateDialog', {
          name: 'bettrack',
          state: {
            visible: false,
            data: {
              game_schedule: 0,
              type: 0,
              bet_amount: 0,
              track_numbers: [],
              play_code_pattern: '',
              forDisplay: {
                type: '',
                play_code_pattern: '',
                selectedSchedules: []
              }
            },
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
  },
  computed: {
    dialog () {
      return this.$store.state.dialog.bettrack
    }
  },
  watch: {
    'dialog.visible': function (visible) {
      this.dialogVisible = visible
    },
    'dialogVisible': function (dialogVisible) {
      if (dialogVisible === false && this.dialog.visible !== dialogVisible) {
        this.$store.dispatch('updateDialog', {
          name: 'bettrack',
          state: Object.assign({}, this.dialog, {visible: false})
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
  margin-bottom: 15px;
}

.info-wrapper {
  padding: 15px 10px;
  border-bottom: 2px solid #eee;
  margin-bottom: 10px;
}

.summary {
  font-weight: 500;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.name {
  display: inline-block;
  width: 45px;
  color: #999;
  line-height: 2;
}

.value {
  color: #333;
  line-height: 2;
}

.issues {
  padding-left: 45px;
}
</style>
