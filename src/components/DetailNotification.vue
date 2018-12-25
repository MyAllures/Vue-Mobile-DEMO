<template>
  <div v-transfer-dom>
    <x-dialog
      class="dialog"
      :show.sync="dialogVisible"
      :hide-on-blur="true"
      :dialog-style="{
        width: '85%',
        'max-width': '85%'
      }">
      <div class="notification">
        <div class="top">
          <span class="text">{{title}}</span>
          <div class="close-btn" @click="handleClose"></div>
        </div>
        <div class="body">
          <div class="total-sum" v-if="total.value">
            <span>{{total.text}}</span>
            <span class="amount" :class="getAmountColor(total.value)">{{total.value | currency('￥')}}</span>
          </div>
          <div class="listitem-wrapper" v-for="(item, index) in list" :key="index">
            <div class="li-head">
              <div>
                <p class="main">{{item.liHead.left.main}}</p>
                <p class="sub">{{item.liHead.left.sub}}</p>
              </div>
              <p class="right" :class="item.liHead.right.class">
                {{item.liHead.right.main}}
              </p>
            </div>
            <ul class="li-body">
              <li class="result" v-for="(obj, i) in item.liBody" :key="i">
                <span>{{obj.left.main}}</span>
                <span v-html="obj.right.main" :class="obj.right.class"></span>
                <p class="full-width p-l" v-if="obj.left.sub">bet.comb_desc</p>
              </li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <x-button @click.native="handleFooterClick()" type="primary">查看{{footer}}</x-button>
        </div>
      </div>
    </x-dialog>
  </div>
</template>

<script>
import {TransferDom, XDialog, XButton, dateFormat} from 'vux'
import {each, map} from 'lodash'
export default {
  components: {
    XDialog, XButton
  },
  directives: {
    TransferDom
  },
  props: {
    notification: Object
  },
  data () {
    let type
    let typeStr = this.notification.type
    if (typeStr.includes('win-notification')) {
      type = `win`
    }
    if (typeStr.includes('bet-track-record')) {
      type = `bettrack`
    }
    return {
      dialogVisible: true,
      type
    }
  },
  methods: {
    getAmountColor (amount) {
      if (amount > 0) {
        return 'red'
      } else if (amount < 0) {
        return 'green'
      }
    },
    handleClose () {
      this.$emit('closeDetailNotification')
      this.dialogVisible = false
    },
    handleFooterClick () {
      const today = dateFormat(new Date(), 'YYYY-MM-DD')

      if (this.type === 'win') {
        if (this.notification.type === 'win-notification-batch') {
          this.$router.push({ name: 'BetRecord' })
        } else {
          this.$router.push({ name: 'DetailBetRecord', params: {date: today} })
        }
      } else {
        this.$router.push({name: 'BetTrackRecord', params: {date: today}})
      }

      this.handleClose()
    }
  },
  computed: {
    title () {
      if (this.type === 'win') {
        return `中奖明细`
      }
      if (this.type === 'bettrack') {
        return `追号明细`
      }
    },
    total () {
      let text
      let value

      text = (this.type === 'win') ? '中奖明细' : '盈亏总计'
      value = this.formatted.total_profit
      return {
        text,
        value
      }
    },
    list () {
      if (this.type === 'bettrack') {
        return map(this.formatted.bet_track_records, (r) => {
          return {
            liHead: {
              left: {
                main: r.game_name,
                sub: `${r.play_position} - ${r.track_numbers.join(', ')}`,
                class: ''
              },
              right: {
                class: this.getAmountColor(r.profit),
                main: r.profit ? this.$options.filters.currency(r.profit, '￥') : ''
              }
            },
            liBody: map(r.game_schedules, (s) => {
              let statusHTML = ''
              let statusClass = ''
              if (s.status === 'win') {
                statusHTML = '中'
                statusClass = 'red'
              } else if (s.status === 'death' || s.status === 'lose') {
                statusHTML = '挂'
                statusClass = 'grey'
              } else if (s.status === 'stop') {
                statusHTML = '停止追号'
              } else if (s.status === 'cancelled') {
                let cancelledIcon = `<i class="cancelled-icon" data-msg="${r.reason}">!</i>`
                statusHTML = r.reason ? ('取消' + cancelledIcon) : '取消'
              } else {
                statusHTML = '-'
              }

              return {
                left: {
                  main: `${s.issue_number}期`,
                  sub: '',
                  class: ''
                },
                right: {
                  main: statusHTML,
                  sub: '',
                  class: statusClass
                }
              }
            })
          }
        })
      }

      if (this.type === 'win') {
        let list = []
        let item = {}

        each(this.formatted.win_notifications, (n) => {
          item.liHead = {
            left: {
              main: n.game_name,
              sub: `${n.issue_number}期`,
              class: ''
            },
            right: {
              main: this.$options.filters.currency(n.total_profit, '￥'),
              sub: '',
              class: ''
            }
          }

          item.liBody = map(n.win_bets, (b, i) => {
            let profit = (b.profit || b.total_profit)
            return {
              left: {
                main: `${i + 1}. ${b.playgroup_name} @ ${b.play_name}`,
                sub: `${b.comb_desc || ''}`
              },
              right: {
                main: this.$options.filters.currency(profit, '￥'),
                class: this.getAmountColor(profit)
              }
            }
          })

          list.push(item)
        })

        return list
      }
    },
    footer () {
      if (this.type === 'win') {
        return `投注记录`
      }
      if (this.type === 'bettrack') {
        return `追号纪录`
      }
    },
    formatted () {
      if (this.type === 'win') {
        if (this.notification.type === 'win-notification-batch') {
          return this.notification
        } else {
          let game = {
            game_name: this.notification.game_name,
            issue_number: this.notification.issue_number,
            total_profit: this.notification.total_profit,
            win_bets: this.notification.win_bets
          }

          return {
            type: this.notification.type,
            win_notifications: [game]
          }
        }
      }
      if (this.type === 'bettrack') {
        return this.notification
      }
    }
  }
}
</script>


<style lang="less" scoped>
.font-style (@size, @color, @weight, @spacing) {
  font-size: @size;
  color: @color;
  font-weight: @weight;
  letter-spacing: @spacing;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  &::before,&::after{
    background-color: #999;
  }
}

.notification {
  width: auto;
  max-height: 480px;
  overflow-y: auto;

  .top {
    height: 50px;
    line-height: 50px;
    border-bottom: 2px solid #eee;
    text-align: center;
    .font-style(18px, #333, 500, inherit);
  }

  .body {
    max-height: 380px;
    overflow-y: auto;
  }

  .footer {
    width: 80%;
    margin: 0 auto;
    padding-bottom: 10px;
  }

  .total-sum {
    height: 40px;
    line-height: 40px;
    text-align: center;
    .font-style(16px, #333, normal, inherit);
    .amount {
      .font-style(inherit, #d0021b, 600, inherit);
    }
  }

  .listitem-wrapper {
    padding: 15px ;
  }

  .li-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px dashed #ddd;
    text-align: left;
    .main {
      .font-style(16px, #026bb3, 500, inherit);
    }
    .sub {
      .font-style(14px, #026bb3, inherit, .5px);
    }
    .right {
      font-size: 14px;
    }
  }

  .li-body {
    display: block;
    overflow-y: auto;
    max-height: 290px;
    padding-left: 10px;
    letter-spacing: 0.5px;
    overflow: visible;
    .font-style(12px,  #666, inherit, inherit);
    .result {
      display: inline-flex;
      width: 100%;
      justify-content: space-between;
      flex-wrap: wrap;
      line-height: 2.2;
      font-size: 13px;
    }
    .full-width {
      width: 100%;
      text-align: left;
    }
  }
}


</style>
<style lang="less">

.cancelled-icon {
  position: relative;
  display: inline-block;
  border-radius: 100%;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border: 2px solid red;
  font-weight: bold;
  font-style: normal;
  color: red;
  // tooltip
  &::before {
    content: '';
    position: absolute;
    display: inline-block;
    top: 10px;
    right: 2px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px;
    border-color:  transparent transparent #333 transparent;
  }
  &::after {
    content: attr(data-msg);
    position: absolute;
    display: inline-block;
    white-space: nowrap;
    border-radius: 3px;
    top: 21px;
    right: 0;
    padding: 5px;
    font-size: 12px;
    background-color: #333;
    color: #eee;
  }
  &::before, &::after {
    opacity: 0;
    transition: opacity .1s;
  }
  &:active {
    &::before, &::after {
      opacity: 1;
    }
  }
}
</style>
