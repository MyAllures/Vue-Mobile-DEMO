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
              <span class="direction"></span>
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
                ¥ {{record.profit | profitFilter}}
              </span>
              <icon type="waiting-circle" class="direction"></icon>
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
      <divider v-else>{{$t('misc.nomore_data')}}</divider>
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
  props: {
    date: {
      type: String
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
    Divider,
    Icon,
    Countup
  },
  methods: {
    initfetchDateBetRecords () {
      this.loading = true
      fetchDateBetRecords({ bet_date: this.date, offset: 0, limit: this.chunkSize })
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
      fetchDateBetRecords({ bet_date: this.date, offset: this.betRecords.length, limit: 10 }).then(data => {
        this.currentChunk += 1
        this.betRecords.push(...data.results)
        this.loadingMore = false
      }, () => {
        this.loadingMore = false
      })
    },
    statusColor (val) {
      return val > 0 ? 'green' : 'red'
    },
    fotmattedDate (time) {
      return dateFormat(new Date(time), 'YYYY-MM-DD')
    }
  },
  filters: {
    dateFilter (value) {
      return dateFormat(new Date(value), 'YYYY-MM-DD')
    },
    weekdayFilter (value) {
      const weekdayMap = {
        'Mon': '星期一',
        'Tue': '星期二',
        'Wed': '星期三',
        'Thu': '星期四',
        'Fri': '星期五',
        'Sat': '星期六',
        'Sun': '星期日'
      }
      return weekdayMap[(String(new Date(value)).split(' '))[0]]
    },
    profitFilter (val) {
      if (val && typeof val === 'number') {
        return val.toFixed(2).replace('-', '')
      }
    }
  },
  created () {
    this.initfetchDateBetRecords()
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

.direction {
  display: inline-block;
  width: 15%;
  color: #999;
  transform: rotate(-135deg);
  &:before {
    margin-left: 0;
    margin-right: 0;
  }
}

.profit-text {
  display: inline-block;
  width: 80%;
}
</style>
