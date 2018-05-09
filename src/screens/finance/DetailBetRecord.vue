<template>
  <div>
    <div class="title">{{date}} 投注记录</div>
    <x-table :cell-bordered="false" class="betrecord-table">
      <thead>
        <tr class="betrecord-thead">
          <th>{{$t('fin.issue_number')}}</th>
          <th>{{$t('fin.play')}}</th>
          <th>{{$t('fin.amount')}}</th>
          <th>{{$t('fin.win_lose')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="text-sm"
            v-if="betRecords.length"
            v-for="(record, index) in betRecords"
            :key="index">
          <td>
            <span class="game">{{record.game.display_name}}</span>
            <span class="issue">{{record.issue_number}}</span>
          </td>
          <td>
            <p class="play">{{record.play.playgroup}} - {{record.play.display_name}}</p>
            <div class="odds">
              <span class="red">@ {{record.odds}}</span>
              <span>{{record.play.return_rate && record.return_amount ? `${Math.floor(record.play.return_rate*10000)/100}%(￥${record.return_amount})`: ''}}</span>
            </div>
          </td>
          <td>
            <span>
              ￥{{record.bet_amount}}
            </span>
          </td>
          <td>
            <span v-if="record.profit===null">{{record.remarks | statusFilter}}</span>
            <span v-else :class="statusColor(record.profit)">
              {{record.profit | currency('￥')}}
            </span>
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
import { fetchBetHistory } from '../../api'
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
      fetchBetHistory({ status: 'win,lose,tie,ongoing,cancelled,no_draw', bet_date: this.date, offset: 0, limit: this.chunkSize })
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
      fetchBetHistory({ status: 'win,lose,tie,ongoing,cancelled,no_draw', bet_date: this.date, offset: this.betRecords.length, limit: 10 }).then(data => {
        this.currentChunk += 1
        this.betRecords.push(...data.results)
        this.loadingMore = false
      }, () => {
        this.loadingMore = false
      })
    },
    statusColor (val) {
      return val >= 0 ? 'red' : 'green'
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
.title {
  font-size: 14px;
  text-align: center;
  margin-top: 10px;
  color: #666;
}
.betrecord-table {
  margin-top: 10px;
  background-color: #fff;
}
.betrecord-thead {
  background-color: #fbf9fe;
}
.end {
  text-align: center;
  color: #ccc;
}
.game, .issue, .play, .odds {
  display: block;
  line-height: 1.5;
}
.game, .play {
  margin-top: 8px;
}
.issue, .odds {
   margin-bottom: 8px;
}
.issue {
  color: #999;
}
</style>
