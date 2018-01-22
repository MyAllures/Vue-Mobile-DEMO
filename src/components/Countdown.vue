<template>
  <div class="countdown-panel">
    <p class="issue">{{schedule.issue_number}}{{$t('common.result_period')}}</p>
    <div class="schedule" v-if="schedule && schedule.issue_number">
      <div class="title">封盘</div>
      <span v-if="!gameClosed" class="label">
        <span v-if="closeCountDown.days > 0">{{closeCountDown.days}}天</span>
        <span v-if="closeCountDown.hours > 0">{{closeCountDown.hours | complete}}:</span>{{closeCountDown.minutes | complete}}:{{closeCountDown.seconds | complete}}
      </span>
      <span v-else class="label">已封盘</span>
    </div>
    <div class="schedule" v-if="schedule && schedule.issue_number">
      <div class="title">开奖</div>
      <span v-if="!ended" class="label">
        <span v-if="resultCountDown.days > 0">{{resultCountDown.days}}天</span>
        <span v-if="resultCountDown.hours > 0">{{resultCountDown.hours | complete}}:</span>{{resultCountDown.minutes | complete}}:{{resultCountDown.seconds | complete}}
      </span>
      <span v-else class="label">已结束</span>
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
  align-items: center;
  color: #f0f0f0;
  font-size: 14px;
  height: 40px;
}
.issue {
  flex: 1;
  font-size: 14px;
  text-align: center;
}
.countdown {
  font-size: 14px;
}
.schedule {
  flex: 1.25;
  .title {
    display: inline-block;
  }
  .label {
    display: inline-block;
    font-size: 14px;
    margin-left: 2px;
    background: #fff;
    color: #666;
    padding: 0 5px;
    border-radius: 4px;
  }
}
</style>
