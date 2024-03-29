<template>
  <div v-if="$store.state.user.account_type">
    <x-table
      v-infinite-scroll="loadMore"
      :infinite-scroll-distance="10"
      :cell-bordered="false"
      class="record-table">
      <thead>
        <tr class="record-thead">
          <th>{{$t('fin.time')}}</th>
          <th>
            <span class="amount text-left">{{$t('my.balance')}}</span>
          </th>
          <th>{{$t('fin.transaction_way')}}</th>
          <th>{{$t('fin.status')}}</th>
        </tr>
      </thead>
      <tbody v-if="transactionRecords.length">
        <tr
          v-for="(record, index) in transactionRecords" :key="index">
          <td :style="{'line-height':'20px'}">
            <date-format :time="record.created_at"/>
          </td>
          <td>
            <span class="amount text-left">¥ {{record.amount | profitFilter }}</span>
          </td>
          <td>
            <span v-if="record.red_envelope_type">{{record.red_envelope_type|envelopFilter}}</span>
            <span v-else>{{record.transaction_type.display_name}}</span>
          </td>
          <td>
            <span :class="statusColor(record.status)">{{translateStatus(record.status)}}</span>
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
  <register-tips v-else></register-tips>
</template>

<script>
import { fetchTransactionRecord } from '../../api'
import { XTable, XButton, Box, Toast, Loading, Divider } from 'vux'
import { msgFormatter } from '../../utils'
import Vue from 'vue'
import infiniteScroll from 'vue-infinite-scroll'
import RegisterTips from '../../components/RegisterTips'

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
  name: 'PaymentRecord',
  components: {
    XTable,
    DateFormat,
    Box,
    Toast,
    Loading,
    XButton,
    Divider,
    RegisterTips
  },
  directives: {
    infiniteScroll
  },
  data () {
    return {
      transactionRecords: [],
      totalCount: 0,
      chunkSize: ~~((document.documentElement.clientHeight - 100) / 40) + 5, // clientHeight minus the height of top and bottom / height of each tr
      currentChunk: 1,
      loading: false,
      error: {
        isExist: false,
        msg: ''
      }
    }
  },
  methods: {
    initFetchTransactionRecord () {
      this.loading = true
      fetchTransactionRecord({
        transaction_type: this.transactionType, offset: 0, limit: this.chunkSize
      }).then(data => {
        this.totalCount = data.count
        this.transactionRecords = data.results
        this.loading = false
      }, errorMsg => {
        this.loading = false
        this.error.msg = msgFormatter(errorMsg)
        this.error.isExist = true
      })
    },
    loadMore () {
      if (this.loading || this.transactionRecords.length >= this.totalCount) {
        return
      }
      this.loading = true
      fetchTransactionRecord({ transaction_type: this.transactionType, offset: this.transactionRecords.length, limit: 10 }).then(data => {
        this.currentChunk += 1
        this.transactionRecords.push(...data.results)
        this.loading = false
      }, () => {
        this.loading = false
      })
    },
    statusColor (val) {
      switch (val) {
        case 1:
          return 'green'
        case 3:
          return 'yellow'
        case 2:
        case 4:
        case 5:
          return 'red'
        case 6:
          return 'blue'
        default:
          return 'blue'
      }
    },
    translateStatus (val) {
      switch (val) {
        case 1:
          return this.$t('misc.success')
        case 2:
          return this.$t('misc.failed')
        case 3:
          return this.$t('misc.ongoing')
        case 4:
          return this.$t('misc.cancelled')
        case 5:
          return this.$t('misc.denied')
        case 6:
          return this.$t('misc.payment_pending')
        default:
          return this.$t('misc.payment_pending')
      }
    }
  },
  computed: {
    transactionType () {
      const routeName = this.$route.name
      if (routeName === 'DepositRecord') {
        return 'online_pay,remit'
      } else if (routeName === 'WithdrawRecord') {
        return 'withdraw'
      } else {
        return 'discount,envelope,engagement_boost_envelope,referral_envelope,reg_present'
      }
    }
  },
  watch: {
    '$route': function () {
      this.initFetchTransactionRecord()
    }
  },
  filters: {
    profitFilter (val) {
      if (val && typeof val === 'number') {
        return val.toFixed(2).replace('-', '')
      }
    },
    envelopFilter (value) {
      switch (value) {
        case 1:
          return '发送红包'
        case 2:
          return '接收红包'
        case 3:
          return '返还红包'
        default:
          return '红包'
      }
    }
  },
  created () {
    this.initFetchTransactionRecord()
  }
}
</script>
<style lang="less" scoped>
.record-table {
  td {
    font-size: 14px;
  }
  .time {
    font-size: 13px;
  }
}
.end {
  text-align: center;
  color: #ccc;
}
.amount {
  display: inline-block;
  width: 100%;
}
.tip {
  height: 80vh;
  display: flex;
  margin: 0 20px;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  color: #999;
  p {
    margin-bottom: 10px;
  }
}

</style>
