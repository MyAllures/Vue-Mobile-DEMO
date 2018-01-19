<template>
  <div>
    <x-table :cell-bordered="false" :content-bordered="false" class="transaction-table">
      <thead>
        <tr class="transaction-thead">
          <th>{{$t('fin.time')}}</th>
          <th>
            <span class="amount text-left">{{$t('my.balance')}}</span>
          </th>
          <th>{{$t('fin.transaction_way')}}</th>
          <th>{{$t('fin.status')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="transactionRecords.length"
          class="text-sm"
          v-for="(record, index) in transactionRecords" :key="index">
          <td>
            <span>{{record.created_at | dateFilter}}</span>
          </td>
          <td>
            <span class="amount text-left">¥ {{record.amount | profitFilter }}</span>
          </td>
          <td>
            <span>{{record.transaction_type.display_name}}</span>
          </td>
          <td>
            <span :class="statusColor(record.status)">{{translateStatus(record.status)}}</span>
          </td>
        </tr>
        <tr v-else>
          <td>{{$t('misc.no_data_yet')}}</td>
        </tr>
      </tbody>
    </x-table>
    <box gap="10px 10px">
      <x-button v-if="totalCount > transactionRecords.length"
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
import { fetchTransactionRecord } from '../../api'
import { XTable, XButton, dateFormat, Box, Toast, Loading, Divider } from 'vux'
import { msgFormatter } from '../../utils'

export default {
  name: 'PaymentRecord',
  data () {
    return {
      transactionRecords: [],
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
      this.loadingMore = true
      fetchTransactionRecord({ transaction_type: this.transactionType, offset: this.transactionRecords.length, limit: 10 }).then(data => {
        this.currentChunk += 1
        this.transactionRecords.push(...data.results)
        this.loadingMore = false
      }, () => {
        this.loadingMore = false
      })
    },
    statusColor (value) {
      if (value === 1) {
        return 'green'
      } else if (value === 3) {
        return 'normal'
      } else {
        return 'red'
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
      }
    }
  },
  computed: {
    transactionType () {
      if (this.$route.name === 'PaymentRecord') {
        return 'online_pay,remit'
      } else {
        return 'withdraw'
      }
    }
  },
  watch: {
    '$route': function () {
      this.initFetchTransactionRecord()
    }
  },
  filters: {
    dateFilter (value) {
      return dateFormat(new Date(value), 'YYYY-MM-DD')
    },
    profitFilter (val) {
      if (val && typeof val === 'number') {
        return val.toFixed(2).replace('-', '')
      }
    }
  },
  created () {
    this.initFetchTransactionRecord()
  }
}
</script>
<style lang="less" scoped>
@import '../../styles/vars.less';
.transaction-table {
  background-color: #fff;
}

.transaction-thead {
  background-color: #fbf9fe;
}

.green {
  color: @green;
}

.red {
  color: @red;
}

.amount {
  display: inline-block;
  width: 100%;
}
</style>
