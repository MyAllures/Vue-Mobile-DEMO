<template>
  <div>
    <x-table
      v-infinite-scroll="loadMore"
      :infinite-scroll-distance="10"
      :cell-bordered="false"
      class="record-table">
      <thead>
        <tr class="record-thead">
          <th>{{$t('fin.time')}}</th>
          <th>{{$t('fin.records_count')}}</th>
          <th>
            <div>
              <span class="profit-text">
                {{$t('fin.win_lose')}}
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody v-if="betRecords.length">
        <tr
            v-for="(record, index) in betRecords" :key="index"
            @click="$router.push(`bet_record/${fotmattedDate(record.time)}`)">
          <td>
            <span>{{record.time | dateFilter}}</span>
          </td>
          <td>
            <countup :tag="'span'"
              :start-val="0"
              :end-val="record.betrecord_count"
              :duration="2"></countup>
          </td>
          <td>
            <div>
              <span :class="['profit-text', statusColor(record.profit)]">
                {{record.profit | currency('￥')}}
              </span>
              <i class="arrow-right icon"></i>
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
import { fetchDateBetRecords } from '../../api'
import { XTable, XButton, dateFormat, Box, Toast, Loading, Divider, Icon, Countup } from 'vux'
import { msgFormatter } from '../../utils'
import infiniteScroll from 'vue-infinite-scroll'

export default {
  name: 'BetRecord',
  components: {
    XTable,
    dateFormat,
    Box,
    Toast,
    Loading,
    XButton,
    Divider,
    Icon,
    Countup
  },
  directives: {
    infiniteScroll
  },
  data () {
    return {
      betRecords: [],
      totalCount: 0,
      chunkSize: ~~((document.documentElement.clientHeight - 100) / 40) + 5, // clientHeight minus the height of top and bottom / height of each tr
      loading: false,
      error: {
        isExist: false,
        msg: ''
      },
      loadingMore: false
    }
  },
  methods: {
    initfetchDateBetRecords () {
      this.loading = true
      fetchDateBetRecords({ status: 'win,lose,tie,ongoing,cancelled,no_draw', offset: 0, limit: this.chunkSize })
        .then(data => {
          if (data.results) {
            this.totalCount = data.count
            this.betRecords = data.results
          } else {
            this.totalCount = data.length
            this.betRecords = data
          }

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
      this.loading = true
      fetchDateBetRecords({ status: 'win,lose,tie,ongoing,cancelled,no_draw', offset: this.betRecords.length, limit: 10 }).then(data => {
        let received = data.results || data
        this.betRecords.push(...received)
        this.loading = false
      }, () => {
        this.loading = false
      })
    },
    statusColor (val) {
      return val >= 0 ? val === 0 ? 'blue' : 'red' : 'green'
    },
    fotmattedDate (time) {
      return dateFormat(new Date(time), 'YYYY-MM-DD')
    }
  },
  filters: {
    dateFilter (value) {
      return dateFormat(new Date(value), 'YYYY-MM-DD')
    }
  },
  created () {
    this.initfetchDateBetRecords()
  }
}
</script>

<style lang="less" scoped>
.record-table {
  td {
    font-size: 14px;
    line-height: 20px;
  }
}
.end {
  color: #ccc;
}
.profit-text {
  display: inline-block;
  width: 80%;
}
.icon {
  margin-right: 10px;
}
</style>
