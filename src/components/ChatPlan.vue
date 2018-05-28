<template>
  <div :class="['container', status]">
    <div class="title">
      <div class="game-name">{{betInfo.display_name}}</div>
      <div class="issue-number">{{betInfo.issue_number}}</div>
      <div class="countdown">
        <span v-if="status === 'expired'" :class="status">已开奖</span>
        <span v-else-if="status === 'closed'">已封盘</span>
        <span v-else>
          <span v-if="gameInfo.countdown.days > 0">{{gameInfo.countdown.days}}天</span>
          <span v-if="gameInfo.countdown.hours > 0">{{gameInfo.countdown.hours | complete}}:</span>{{gameInfo.countdown.minutes | complete}}:{{gameInfo.countdown.seconds | complete}}
        </span>
      </div>
    </div>
    <x-table :cell-bordered="false" :content-bordered="false">
      <thead class="thead">
        <tr>
          <th>玩法</th>
          <th>赔率</th>
          <th>金额</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(bet, index) in betInfo.bets" :key="index">
          <td>{{`${bet.play.playgroup} - ${bet.play.display_name}`}}</td>
          <td class="odd">{{bet.play.odds}}</td>
          <td>{{bet.bet_amount|currency('￥')}}</td>
        </tr>
      </tbody>
    </x-table>
    <x-button :disabled="status!=='ongoing'" class="bet-btn" type="primary" @click.native="$emit('showBetDialog', betInfo)">跟单</x-button>
  </div>
</template>
<script>
import { XTable, XButton } from 'vux'
import { mapState } from 'vuex'
export default {
  name: 'ChatPlan',
  components: {
    XTable,
    XButton
  },
  props: {
    betInfo: {
      type: Object
    }
  },
  filters: {
    complete (value) {
      value = parseInt(value)
      return value < 10 ? ('0' + value) : value
    }
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState([
      'gameInfo'
    ]),
    ended () {
      const r = this.gameInfo.countdown
      return r.hours + r.hours + r.seconds + r.minutes === 0
    },
    status () {
      if (this.betInfo.issue_number !== this.gameInfo.issue_number) {
        return 'expired'
      }
      if (this.ended) {
        return 'closed'
      }
      return 'ongoing'
    }
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';
.container {
  background: #fff;
  max-width: 264px;
  width: 100%;
  padding: 12px 12px 16px 12px;
  box-sizing: border-box;
  color: #333;
  font-size: 14px;
  .title {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    height: 39px;
    width: 100%;
    margin-bottom: 12px;
    .game-name {
      width: 50%;
      height: 22px;
      line-height: 22px;
      font-size: 16px;
      text-align: left;
    }
    .issue-number {
      width: 50%;
      height: 17px;
      line-height: 17px;
      font-size: 12px;
      color: #999;
      font-weight: lighter;
      text-align: left;
    }
    .countdown {
      width: 50%;
      height: 39px;
      line-height: 39px;
      color: @red;
      text-align: right;
      font-size: 20px;
      .expired {
        color: @green;
      }
    }
  }
  .vux-table {
    margin-bottom: 16px;
    line-height: 30px;
    th {
      color: #999;
      font-size: 12px;
      font-weight: lighter;
      text-align: left;
    }
    &::after {
      display: none;
    }
    td {
      text-align: left;
      &.odd{
        color: @red;
      }
      &::before {
        display: none;
      }
    }
  }
  .bet-btn {
    height: 36px;
    line-height: 36px;
  }
  &.ongoing {
    box-shadow: 0 16px 14px -10px rgba(37, 140, 211, 0.25), 0 4px 10px 0 rgba(62, 174, 252, 0.1);
  }
}
</style>

