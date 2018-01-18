<template>
  <div class="countdown-panel">
    <p class="issue">{{schedule.issue_number}}{{$t('common.result_period')}}</p>
    <div class="schedule" v-if="schedule && schedule.issue_number">
      <div class="title">封盘</div>
      <span v-if="!gameClosed">
        <span v-if="closeCountDown.days > 0">{{closeCountDown.days}}天 </span>
        <span v-if="closeCountDown.hours > 0">{{closeCountDown.hours | complete}}:</span>{{closeCountDown.minutes | complete}}:{{closeCountDown.seconds | complete}}
      </span>
      <span v-else>已封盘</span>
    </div>
    <div class="schedule" v-if="schedule && schedule.issue_number">
      <div class="title">开奖</div>
      <span v-if="!ended">
        <span v-if="resultCountDown.days > 0">{{resultCountDown.days}}天 </span>
        <span v-if="resultCountDown.hours > 0">{{resultCountDown.hours | complete}}:</span>{{resultCountDown.minutes | complete}}:{{resultCountDown.seconds | complete}}
      </span>
      <span v-else>已结束</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    schedule: {
      type: Object
    },
    currentGame: {
      type: Object
    },
    gameClosed: {
      type: Boolean
    },
    closeCountDown: {
      type: Object
    },
    resultCountDown: {
      type: Object
    }
  },
  computed: {
    ended () {
      const r = this.resultCountDown
      return r.hours + r.hours + r.seconds + r.minutes === 0
    }
  },
  filters: {
    complete (value) {
      value = parseInt(value)
      return value < 10 ? ('0' + value) : value
    }
  }
}
</script>
<style lang="less" scoped>
.countdown-panel {
  display: flex;
  background: #00397c;
  color: #fff;
  font-size: 14px;
  height: 30px;
}
.issue {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 34%;
}
.countdown {
  font-size: 14px;
}
.schedule {
  width: 33%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  .title {
    margin-right: 5px;
  }
}
</style>
