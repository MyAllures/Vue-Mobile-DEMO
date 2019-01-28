<template>
  <div class="wrapper" v-if="notification">
    <x-icon type="ios-close" @click.native="close" class="dark-fill" size="24"></x-icon>
    <div @click="handleTextClick" class="text-area">
      {{text}} <span class="detail-link">明细</span>
    </div>
  </div>
</template>

<script>
import {filter} from 'lodash'

const isNonInstant = type => type.includes('batch')
export default {
  props: {
    notification: Object
  },
  data () {
    return {
      timer: null,
      changingTimer: null
    }
  },
  methods: {
    close () {
      this.$store.commit('HIDE_NOTIFICATION')
      this.$store.dispatch('removeNotification')
      clearTimeout(this.timer)
      this.timer = null
      if (this.$store.state.notifications.length > 0) {
        this.changingTimer = setTimeout(() => {
          this.$store.commit('SHOW_NOTIFICATION')
          this.startTimer()
        }, 1000)
      }
    },
    handleTextClick () {
      let currentNotification = Object.assign({}, this.notification)
      this.$emit('getCurrentNotificationDetail', currentNotification)
      this.close()
    },
    startTimer () {
      clearTimeout(this.changingTimer)
      this.changingTimer = null

      this.timer = setTimeout(() => {
        this.close()
      }, 8000)
    }
  },
  computed: {
    text () {
      let type = this.notification.type
      if (type.includes('win-notification')) {
        if (isNonInstant(type)) {
          return '恭喜中奖了！'
        } else {
          let gameName = this.notification.game_name
          let totalProfit = this.notification.total_profit
          return `${gameName}中奖 总额: ${this.$options.filters.currency(totalProfit, '￥')}`
        }
      }

      if (type.includes('bet-track-record')) {
        if (isNonInstant(type)) {
          return '追号单结果出炉了，赶紧去瞧瞧！'
        } else {
          let records = this.notification.bet_track_records
          let status = ''

          for (let i = 0; i < records.length; i++) {
            let r = records[i]
            status = r.status
            if (status === 'win') {
              let winningSchedule = filter(r.game_schedules, (s) => s.status === 'win')
              return `${r.game_name} ${winningSchedule[0].issue_number} 中奖了，已停止追号`
            }
            if (status === 'death' || status === 'lose') {
              return `${r.game_name}追号结束了，再试一把吧！`
            }
            if (status === 'cancelled') {
              return `${r.game_name}追号取消，赶紧去查看明细吧！`
            }
          }
        }
      }
    }
  },
  watch: {
    'notification': function (notification) {
      if (notification) {
        this.$store.commit('SHOW_NOTIFICATION')
        this.startTimer()
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.dark-fill {
  fill: rgba(0, 0, 0, .4);
}

.wrapper {
  position: fixed;
  display: inline-flex;
  align-items: center;
  bottom: 80px;
  left: 25px;
  z-index: 1;
}

.text-area {
  box-sizing: border-box;
  min-height: 32px;
  padding: 5px 10px;
  border-radius: 15px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 14px;
  letter-spacing: .5px;
}

.detail-link {
  color: #f8e71c;
  font-size: 13px;
  text-decoration: underline;
  vertical-align: middle;
}
</style>
