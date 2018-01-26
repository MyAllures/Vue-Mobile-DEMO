<template>
  <div>
    <x-table :cell-bordered="false" class="betrecord-table">
      <thead>
        <tr class="betrecord-thead">
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
      <tbody>
        <tr v-if="betRecords.length"
            v-for="(record, index) in betRecords" :key="index"
            class="text-sm"
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
                {{record.profit | profitFilter | currency('￥')}}
              </span>
              <i class="arrow-right icon"></i>
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
import { fetchDateBetRecords } from '../../api'
import { XTable, XButton, dateFormat, Box, Toast, Loading, Divider, Icon, Countup } from 'vux'
import { msgFormatter } from '../../utils'

export default {
  name: 'BetRecord',
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
    Divider,
    Icon,
    Countup
  },
  methods: {
    initfetchDateBetRecords () {
      this.loading = true
      fetchDateBetRecords({ status: 'win,lose,tie,ongoing,cancelled,no_draw', offset: 0, limit: this.chunkSize })
        .then(data => {
          console.log('init')
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
      fetchDateBetRecords({ status: 'win,lose,tie,ongoing,cancelled,no_draw', offset: this.betRecords.length, limit: 10 }).then(data => {
        this.currentChunk += 1
        this.betRecords.push(...data.results)
        this.loadingMore = false
      }, () => {
        this.loadingMore = false
      })
    },
    statusColor (val) {
      return val > 0 ? 'red' : 'green'
    },
    fotmattedDate (time) {
      return dateFormat(new Date(time), 'YYYY-MM-DD')
    }
  },
  filters: {
    dateFilter (value) {
      return dateFormat(new Date(value), 'YYYY-MM-DD')
    },
    profitFilter (val) {
      if (val && typeof val === 'number') {
        return val.toFixed(2)
      }
    }
  },
  created () {
    this.initfetchDateBetRecords()
  }
}
</script>

<style lang="less" scoped>
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
.profit-text {
  display: inline-block;
  width: 80%;
}
.icon {
  margin-right: 10px;
}
</style>
