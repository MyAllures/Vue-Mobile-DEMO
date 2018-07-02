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
    <x-table :cell-bordered="false" class="record-table">
      <thead>
        <tr class="record-thead">
          <th>{{$t('fin.time')}}</th>
          <th>{{$t('fin.issue_number')}}</th>
          <th>{{$t('fin.play')}}</th>
          <th>{{$t('fin.amount')}}/{{$t('fin.win_lose')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr
            v-if="betRecords.length"
            v-for="(record, index) in betRecords"
            :key="index">
          <td>
            {{record.created_at|moment('HH:mm:ss')}}
          </td>
          <td>
            <span class="game">{{record.game.display_name}}</span>
            <span class="issue">
              {{record.match || record.issue_number}}
            </span>
          </td>
          <td class="play">
            <p>{{record.play.playgroup}} - {{record.play.display_name}}</p>
            <div class="odds">
              <span class="red">@ {{record.odds}}</span>
              <span>{{record.play.return_rate && record.return_amount ? `${Math.floor(record.play.return_rate*10000)/100}%`: ''}}</span>
            </div>
            <div v-if="record.play.return_rate && record.return_amount">({{record.return_amount| currency('￥')}})</div>
          </td>
          <td :class="['amount', {unsettled: record.profit === null}]" :style="{'line-height':'20px'}">
            <div>{{record.bet_amount | currency('￥')}}</div>
            <div v-if="record.profit === null">{{record.remarks | statusFilter}}</div>
            <div v-else :class="statusColor(record.profit)">
              {{record.profit | currency('￥')}}
            </div>
          </td>
        </tr>
        <tr v-else>
          <td>{{$t('misc.no_data_yet')}}</td>
        </tr>
      </tbody>
    </x-table>
    <box gap="10px 10px">
      <x-button v-if="totalCount > betRecords.length"
                type="primary"
                :disabled="loadingMore"
                @click.native="loadMore(currentChunk)"
                :show-loading="loadingMore">
        <span>{{$t('misc.load_more')}}</span>
      </x-button>
      <div class="end" v-else>{{$t('misc.nomore_data')}}</div>
    </box>
    <toast v-model="error.isExist" type="text" :width="error.msg.length > 10 ? '80vh' : '8em'">{{error.msg}}</toast>
    <loading :show="loading" :text="$t('misc.loading')"></loading>
  </div>
</template>

<script>
import { fetchBetHistory, fetchBetTotal } from '../../api'
import { XTable, XButton, dateFormat, Box, Toast, Loading, Divider } from 'vux'
import { msgFormatter } from '../../utils'

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
      totalAmount: 0,
      loadingMore: false
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
      this.loadingMore = true
      fetchBetHistory({
        status: 'win,lose,tie,ongoing,cancelled,no_draw',
        bet_date: this.date,
        offset: this.betRecords.length,
        limit: 10
      }).then(data => {
        this.currentChunk += 1
        this.betRecords.push(...data.results)
        this.loadingMore = false
      }, () => {
        this.loadingMore = false
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
    .title {
      height: 30px;
      width: 100%;
      line-height: 30px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }
    .amount {
      height: 40px;
      width: 100%;
      line-height: 40px;
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
