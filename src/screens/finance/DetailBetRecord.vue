<template>
  <div>
    <x-table full-bordered class="betrecord-table">
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
            <p>{{record.game.display_name}}</p>
            <p>{{record.issue_number}}</p>
          </td>
          <td>
            <p>{{record.play.display_name}}</p>
            <p>{{record.play.playgroup}}</p>
            <p>@ {{record.odds}}</p>
          </td>
          <td>
            <span>
              ￥{{record.bet_amount}}
            </span>
          </td>
          <td>
            <span :class="statusColor(record.profit)">
              ￥{{record.profit | profitFilter}}
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
      <divider v-else>{{$t('misc.nomore_data')}}</divider>
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
      fetchBetHistory({ bet_date: this.getDate, offset: 0, limit: this.chunkSize })
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
      fetchBetHistory({ bet_date: this.getDate, offset: this.betRecords.length, limit: 10 }).then(data => {
        this.currentChunk += 1
        this.betRecords.push(...data.results)
        this.loadingMore = false
      }, () => {
        this.loadingMore = false
      })
    },
    statusColor (val) {
      return val >= 0 ? 'green' : 'red'
    }
  },
  computed: {
    getDate () {
      return this.$route.path.split('/').pop()
    }
  },
  filters: {
    profitFilter (val) {
      if (val && typeof val === 'number') {
        return val.toFixed(2).replace('-', '')
      }
    }
  },
  created () {
    this.initFetchBetHistory()
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';
.betrecord-table {
  background-color: #fff;
}
.betrecord-thead {
  background-color: #fbf9fe;
}

.green {
  color: @green;
}

.red {
  color: @red;
}
</style>
