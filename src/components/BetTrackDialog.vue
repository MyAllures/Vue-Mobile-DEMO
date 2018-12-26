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
              <div class="row">
                <span class="name">位置 :</span>
                <span class="value">{{dialog.data.forDisplay.play_code_pattern}}</span>
              </div>
              <div class="row">
                <span class="name">号码 :</span>
                <span class="value">{{dialog.data.track_numbers.join(',')}}</span>
              </div>
              <div class="row">
                <span class="name">单注 :</span>
                <span class="value">￥{{dialog.data.bet_amount}}</span>
              </div>
              <div class="row">
                <span class="name">期数 :</span>
                <span class="value">
                  <span class="schedule-text" v-for="(s, i) in dialog.data.forDisplay.selectedSchedules" :key="i">{{s}}</span>{{dialog.data.forDisplay.type}}
                </span>
              </div>
            </div>
            <div class="summary">
              <p>一期<span class="red"> {{dialog.data.track_numbers.length}} </span>注 总金额：<span class="red">￥{{dialog.data.track_numbers.length * dialog.data.bet_amount}}</span></p>
              <p>如有一期中奖即停止追号</p>
          </div>
          </div>
          <div v-if="loading"  class="loading">
            <inline-loading></inline-loading>加载中
          </div>
          <flexbox v-else class="buttons" justify="space-around">
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
import {Flexbox, FlexboxItem, XDialog, XButton, TransferDom, InlineLoading} from 'vux'
import {betTrack} from '../api'
import FixScroll from '../directive/fixscroll'
import { msgFormatter } from '../utils'
import {pick} from 'lodash'
import { mapState } from 'vuex'

export default {
  name: 'BetTrackDialog',
  components: {
    Flexbox, FlexboxItem, XDialog, XButton, InlineLoading
  },
  directives: {
    TransferDom,
    FixScroll
  },
  data () {
    return {
      dialogVisible: false,
      loading: false
    }
  },
  methods: {
    doBetTrack () {
      this.loading = true
      let submitData = pick(this.dialog.data, ['game_schedule', 'type', 'bet_amount', 'track_numbers', 'play_code_pattern'])
      betTrack(submitData).then((res) => {
        this.sendGaEvent({
          label: this.gameInfo.display_name,
          category: '遊戲追號',
          action: '投注'
        })
        this.$store.dispatch('updateDialog', {
          name: 'bettrack',
          state: {
            visible: false,
            data: {
              track_numbers: [],
              forDisplay: {}
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
    ...mapState(['gameInfo']),
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
  height: 50px;
  margin-bottom: 15px;
}

.info-wrapper {
  padding: 15px 10px;
  border-bottom: 2px solid #eee;
  margin-bottom: 10px;
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
