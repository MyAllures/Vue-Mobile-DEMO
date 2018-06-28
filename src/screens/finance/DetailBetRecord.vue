<template>
  <div class="container">
    <div class="info-panel">
      <div class="info-panel-item">
        <div class="title">下注总计</div>
        <div class="amount">{{totalAmount | currency('￥')}}</div>
      </div>
      <div class="info-panel-item">
        <div class="title">输赢总计</div>
        <div class="amount">{{totalProfit | currency('￥')}}</div>
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
          <th>{{$t('fin.amount')}}/{{$t('fin.win_lose')}}</th>
        </tr>
      </thead>
      <tbody v-if="betRecords.length">
        <tr
            v-for="(record, index) in betRecords"
            :key="index">
          <td>
            {{record.created_at|moment('HH:mm:ss')}}
          </td>
          <td>
            <span class="game">{{record.game.display_name}}</span>
            <span class="issue">{{record.issue_number}}</span>
          </td>
          <td class="play">
            <p>{{record.play.playgroup}}@{{record.play.display_name}}</p>
            <div class="odds">
              <span>{{record.odds}}</span>
              <span>{{record.play.return_rate && record.return_amount ? ` 返${Math.floor(record.play.return_rate*10000)/100}%`: ''}}</span>
            </div>
          </td>
          <td :class="['amount', {unsettled: record.profit === null}]" :style="{'line-height':'20px'}">
            <div>{{record.bet_amount | currency('￥')}}</div>
            <div v-if="record.profit === null">{{record.remarks | statusFilter}}</div>
            <div v-else :class="statusColor(record.profit)">
              {{record.profit | currency('￥')}}
            </div>
          </td>
        </tr>
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
import { fetchBetHistory, fetchBetTotal } from '../../api'
import { XTable, XButton, dateFormat, Box, Toast, Loading, Divider } from 'vux'
import { msgFormatter } from '../../utils'
import infiniteScroll from 'vue-infinite-scroll'

export default {
  name: 'DetailBetRecord',
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
    dateFormat,
    Box,
    Toast,
    Loading,
    XButton,
    Divider
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
      totalProfit: 0,
      totalAmount: 0
    }
  },
  methods: {
    initFetchBetHistory () {
      this.loading = true
      fetchBetHistory({
        status: 'win,lose,tie,ongoing,cancelled,no_draw',
        bet_date: this.date,
        offset: '0',
        limit: this.chunkSize
      })
        .then(data => {
          this.totalCount = data.count
          this.betRecords = data.results
          this.currentPage = 1
          this.loading = false
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
      fetchBetHistory({
        status: 'win,lose,tie,ongoing,cancelled,no_draw',
        bet_date: this.date,
        offset: this.betRecords.length,
        limit: 10
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
    fetchBetTotal(this.date).then(res => {
      this.totalProfit = res.profit
      this.totalAmount = res.amount
    }).catch(() => {})
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
  .info-panel-item {
    width: 50%;
    text-align: center;
    background: #166fd8;
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
}

.record-table {
  .issue, .odds, .amount{
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
