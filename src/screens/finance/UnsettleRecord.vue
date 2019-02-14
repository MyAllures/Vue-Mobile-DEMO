<template>
  <div class="container">
    <div class="info-panel">
      <div class="info-panel-item">
        <div class="title">下注总计</div>
        <div class="amount">{{totalAmount | currency('￥')}}</div>
      </div>
      <div class="info-panel-item">
        <div class="title">可赢总计</div>
        <div class="amount">{{totalExpectedProfit | currency('￥')}}</div>
      </div>
    </div>
    <x-table
      v-infinite-scroll="loadMore"
      :infinite-scroll-distance="10"
      :cell-bordered="false"
      class="record-table">
      <thead>
        <tr class="record-thead">
          <th>{{$t('fin.date')}}</th>
          <th>{{$t('fin.issue_number')}}</th>
          <th>{{$t('fin.play')}}</th>
          <th>{{$t('fin.amount')}}/{{$t('fin.expected_win')}}</th>
        </tr>
      </thead>
      <tbody v-if="betRecords.length">
        <tr
            v-for="(record, index) in betRecords"
            :key="index">
          <td :style="{'line-height':'20px'}">
            <date-format :time="record.created_at"/>
          </td>
          <td>
            <span class="game">{{record.game.display_name}}</span>
            <span class="issue">{{record.issue_number}}</span>
          </td>
          <td class="play">
            <p>{{record.play.playgroup}}@{{record.play.display_name}}</p>
            <p class="play-options" v-if="record.bet_options&&record.bet_options.options">{{`共${record.bet_options.opts_combos_count}组 # ${record.bet_options.options.join(',')}`}}</p>
            <div class="odds">
              <span>{{record.odds}}</span>
              <span>{{record.play.return_rate && record.return_amount ? ` 返${Math.floor(record.play.return_rate*10000)/100}%`: ''}}</span>
            </div>
          </td>
          <td class="amount unsettled" :style="{'line-height':'20px'}">
            <div>{{record.bet_amount | currency('￥')}}</div>
            <div v-if="record.expected_profit === null">{{record.status | statusFilter}}</div>
            <div v-else>
              {{record.expected_profit | currency('￥')}}
            </div>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="loading">
        <tr class="no-data"></tr>
      </tbody>
      <tbody v-else>
        <tr class="no-data">
          <td colspan="4">{{$t('misc.no_data_yet')}}</td>
        </tr>
      </tbody>
    </x-table>
    <toast v-model="error.isExist" type="text" :width="error.msg.length > 10 ? '80vh' : '8em'">{{error.msg}}</toast>
    <loading :show="loading" :text="$t('misc.loading')"></loading>
  </div>
</template>

<script>
import { fetchBetHistory } from '../../api'
import { XTable, XButton, Box, Toast, Loading, Divider } from 'vux'
import { msgFormatter } from '../../utils'
import infiniteScroll from 'vue-infinite-scroll'
import Vue from 'vue'
const DateFormat = Vue.extend({
  render: function (createElement) {
    const timeFormat = this.$moment(this.time).format('YYYY-MM-DD HH:mm:ss').split(' ')
    return createElement('div', {class: 'time'}, [createElement('div', timeFormat[0]), createElement('div', timeFormat[1])])
  },
  props: {
    time: {
      type: String,
      required: true
    }
  }
})

export default {
  name: 'UnsettleRecord',
  filters: {
    statusFilter (value) {
      if (value === 'no_draw') {
        return '官方未开'
      } else if (value === 'cancelled') {
        return '已取消'
      } else {
        return '未结'
      }
    }
  },
  components: {
    XTable,
    Box,
    Toast,
    Loading,
    XButton,
    Divider,
    DateFormat
  },
  directives: {
    infiniteScroll
  },
  data () {
    return {
      betRecords: [],
      totalCount: 0,
      chunkSize: ~~((document.documentElement.clientHeight - 100) / 40), // clientHeight minus the height of top and bottom / height of each tr
      currentChunk: 1,
      loading: false,
      error: {
        isExist: false,
        msg: ''
      },
      totalExpectedProfit: 0,
      totalAmount: 0
    }
  },
  methods: {
    initFetchBetHistory () {
      this.loading = true
      fetchBetHistory({
        status: 'ongoing,cancelled,no_draw',
        offset: '0',
        limit: this.chunkSize,
        extras: 'expected_profit',
        totals: 'expected_profit,bet_amount'
      })
        .then(data => {
          this.totalCount = data.count
          this.betRecords = data.results
          this.currentPage = 1
          this.loading = false
          this.totalExpectedProfit = data.total_expected_profit
          this.totalAmount = data.total_bet_amount
        }, errorMsg => {
          this.loading = false
          this.error.msg = msgFormatter(errorMsg)
          this.error.isExist = true
        })
    },
    loadMore () {
      if (this.loading || this.betRecords.length >= this.totalCount) {
        return
      }
      this.loading = true
      fetchBetHistory({
        status: 'ongoing,cancelled,no_draw',
        offset: this.betRecords.length,
        limit: 10,
        extras: 'expected_profit'
      }).then(data => {
        this.currentChunk += 1
        this.betRecords.push(...data.results)
        this.loading = false
      }, () => {
        this.loading = false
      })
    },
    statusColor (val) {
      return val >= 0 ? val === 0 ? 'blue' : 'red' : 'green'
    }
  },
  computed: {
    date () {
      return this.$route.params.date
    }
  },
  created () {
    this.initFetchBetHistory()
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
}
.info-panel {
  width: 100%;
  display: flex;
}
.info-panel-item {
  width: 50%;
  text-align: center;
  background: @azul;
  padding: 10px 0;
  .title {
    width: 100%;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
  .amount {
    width: 100%;
    color: #fff;
    font-size: 18px;
  }
}
.record-table {
  .issue, .odds, .amount, .play-options{
    font-size: 12px;
  }
  .play {
    line-height: 20px;
  }
  .odds {
    color: #999;
  }
  .amount.unsettled {
    color: #999;
  }
}

.end {
  text-align: center;
  color: #ccc;
}
.game, .issue, .odds {
  display: block;
  line-height: 1.5;
}
.issue {
  color: #999;
}
</style>
