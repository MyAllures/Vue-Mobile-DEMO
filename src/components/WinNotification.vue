<template>
  <div class="wrapper" v-if="notification">
    <x-icon type="ios-close" @click.native="close" class="dark-fill" size="24"></x-icon>
    <div @click="handleTextClick" class="text-area">
      <span>
        <span class="game-name" v-if="type === 'win-notification'">
          {{gameName}}中奖
        </span>
        <span class="congratulation" v-else>
          恭喜中奖了！
        </span>
      </span>
      <span class="amount">总额: {{totalProfit | currency('￥')}}</span>
      <span class="detail-link">明细</span>
    </div>
  </div>
</template>

<script>
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
      this.$store.commit('HIDE_WINNOTIFICATION')
      this.$store.dispatch('removeWinNotification')
      clearTimeout(this.timer)
      this.timer = null
      if (this.$store.state.winNotification.length > 0) {
        this.changingTimer = setTimeout(() => {
          this.$store.commit('SHOW_WINNOTIFICATION')
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
      }, 5000)
    }
  },
  computed: {
    gameName () {
      return this.notification.game_name
    },
    type () {
      return this.notification.type
    },
    totalProfit () {
      return this.notification.total_profit
    }
  },
  watch: {
    'notification': function (notification) {
      if (notification) {
        this.$store.commit('SHOW_WINNOTIFICATION')
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
  height: 32px;
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
