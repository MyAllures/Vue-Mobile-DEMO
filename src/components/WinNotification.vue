<template>
  <div class="wrapper">
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
    gameName: {
      type: String
    },
    type: {
      type: String
    },
    totalProfit: {
      type: Number
    },
    visible: {
      type: Boolean
    }
  },
  data () {
    return {
      timeout: null
    }
  },
  methods: {
    close () {
      this.$store.commit('HIDE_WINNOTIFICATION')
      this.$store.dispatch('removeWinNotification')
      this.timeout = null
    },
    handleTextClick () {
      this.$router.push({name: 'BetRecord'})
      this.close()
    },
    onClose () {
      this.$emit('onClose')
    }
  },
  beforeDestroy () {
    this.close()
  },
  created () {
    this.timeout = setTimeout(() => {
      this.close()
    }, 5000)
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
