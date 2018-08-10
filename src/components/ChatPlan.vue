<template>
  <div :class="['container', status]">
    <div class="title">
      <div class="title-l">
        <div class="game-name">{{betInfo.display_name}}</div>
        <div class="issue-number">{{betInfo.issue_number}}</div>
      </div>
      <div class="countdown">
        <span v-if="status === 'expired'" class="expired">已开奖</span>
        <span class="closed" v-else-if="status === 'closed'">已封盘</span>
        <span class="open" v-else>
          <p class="text">封盘</p>
          <div class="clock">
            <span v-if="gameInfo.countdown.days > 0">{{gameInfo.countdown.days}}天</span>
            <span v-if="gameInfo.countdown.hours > 0">{{gameInfo.countdown.hours | complete}}:</span>{{gameInfo.countdown.minutes | complete}}:{{gameInfo.countdown.seconds | complete}}
          </div>
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
          <td>{{bet.bet_amount | currency('￥')}}</td>
        </tr>
      </tbody>
    </x-table>
    <x-button :disabled="status!=='ongoing'" class="bet-btn" type="primary" @click.native="openDialog">跟单</x-button>
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
  },
  methods: {
    openDialog () {
      this.$store.dispatch('openBetDialog', this.formatBetInfo(this.betInfo.bets))
    },
    formatBetInfo (betInfo) {
      return betInfo.map(bet => {
        let optsCombosCount = 1
        let optionDisplayNames = []
        let betAmount = bet.bet_amount
        if (bet.bet_options.opts_combos_count > 1) {
          optsCombosCount = bet.bet_options.opts_combos_count
          optionDisplayNames = bet.bet_options.options
          betAmount = betAmount / optsCombosCount
        }
        return {
          game_schedule: bet.game_schedule,
          display_name: `${bet.play.playgroup} - ${bet.play.display_name}`,
          bet_amount: betAmount,
          odds: bet.play.odds,
          play: bet.play.id,
          bet_options: bet.bet_options,
          opts_combos_count: optsCombosCount,
          optionDisplayNames: optionDisplayNames.join(',')
        }
      })
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
      height: 22px;
      line-height: 22px;
      font-size: 16px;
      text-align: left;
    }
    .issue-number {
      height: 17px;
      line-height: 17px;
      font-size: 12px;
      color: #999;
      font-weight: lighter;
      text-align: left;
    }
    .countdown {
      text-align: right;
      .open {
        display: flex;
        flex-direction: column;
        justify-content: center;
        .text {
          display: inline-block;
          padding-right: 15px;
          font-size: 12px;
          color: #999;
        }
        .clock {
          height: 17px;
          line-height: 17px;
          font-size: 20px;
          color: @red;
        }
      }

      .closed {
        font-size: 20px;
        color: @red;
      }

      .expired {
        font-size: 20px;
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

