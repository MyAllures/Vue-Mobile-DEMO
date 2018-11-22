<template>
  <div v-if="$store.state.user.account_type" class="container">
    <div class="filter-area">
      <div class="icon"></div>
      <datetime class="filter" clear-text="起日" v-model="startdate"></datetime>
      <datetime class="filter" clear-text="迄日" :start-date="enddateBegin" v-model="enddate"></datetime>
    </div>
    <div class="info">
      <div class="stamp-wrapper">
        <div class="stamp">
          <div class="title">
            <span class>总计</span>
          </div>
          <div style="width: 100%">
            <div class="item quarter">
              <div class="item-title">{{$t('fin.bet_number')}}</div>
              <div class="item-content">{{totalData.bet_count}}</div>
            </div>
            <div class="item quarter">
              <div class="item-title">{{$t('fin.bet_amount')}}</div>
              <div class="item-content">{{totalData.bet_amount| currency('￥')}}</div>
            </div>
            <div class="item quarter">
              <div class="item-title">{{$t('fin.return_amount')}}</div>
              <div class="item-content">{{totalData.return_amount| currency('￥')}}</div>
            </div>
            <div class="item quarter">
              <div class="item-title">{{$t('fin.profit')}}</div>
              <div class="item-content">
                <span :class="{'red': totalData.profit > 0 , 'green': totalData.profit < 0}">{{totalData.profit| currency('￥')}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <x-table
      v-infinite-scroll="loadMore"
      :infinite-scroll-distance="10"
      :cell-bordered="false"
      class="record-table">
      <thead>
        <tr class="record-thead">
          <th>{{$t('fin.game')}}</th>
          <th>{{$t('fin.bet_number')}}</th>
          <th>
            <span class="amount text-left">{{$t('fin.bet_amount')}}</span>
          </th>
          <th>{{$t('fin.return_amount')}}</th>
          <th>{{$t('fin.profit')}}</th>
        </tr>
      </thead>
      <tbody v-if="gameRecords.length">
        <tr v-for="(record, index) in gameRecords" :key="index">
          <td>
            <span>{{record.game.display_name}}</span>
          </td>
          <td>
            <span>{{record.bet_count}}</span>
          </td>
          <td>
            <span class="amount text-left">{{record.bet_amount| currency('￥')}}</span>
          </td>
          <td>
            <span>{{record.return_amount| currency('￥')}}</span>
          </td>
          <td>
            <span :class="{'red': record.profit > 0 , 'green': record.profit < 0}">{{ record.profit| currency('￥') }}</span>
          </td>
        </tr>
      </tbody>
      <tbody v-else-if="loading">
        <tr class="no-data"></tr>
      </tbody>
      <tbody v-else>
        <tr class="no-data">
          <td colspan="5">{{$t('misc.no_data_yet')}}</td>
        </tr>
      </tbody>
    </x-table>
    <toast v-model="error.isExist" type="text" :width="error.msg.length > 10 ? '80vh' : '8em'">{{error.msg}}</toast>
    <loading :show="loading" :text="$t('misc.loading')"></loading>
  </div>

  <div v-else class="tip">
    <p>请注册会员后访问</p>
    <x-button type="primary" link="/register">立即注册</x-button>
  </div>
</template>

<script>
import { fetchPersonalReport } from '../../api'
import { XTable, XButton, Toast, Loading, Divider, TransferDom, Datetime, PopupPicker } from 'vux'
import { msgFormatter } from '../../utils'
import Vue from 'vue'
import infiniteScroll from 'vue-infinite-scroll'

const dateFormatChecker = (format, dateString) => {
  // Params for a formatted String
  // Returns a Boolean whether this string is in the format that momentjs valid
  if (!dateString || typeof dateString !== 'string') {
    return false
  }
  let date = dateString || 'undefined'
  return Vue.moment(date).isValid() && (Vue.moment(date).format(format) === date)
}

export default {
  name: 'PersonalReport',
  components: {
    XTable,
    Toast,
    Loading,
    XButton,
    Divider,
    Datetime,
    PopupPicker
  },
  directives: {
    infiniteScroll,
    TransferDom
  },
  data () {
    return {
      totalCount: 0,
      chunkSize: ~~((document.documentElement.clientHeight - 100) / 40) + 5, // clientHeight minus the height of top and bottom / height of each tr
      loading: false,
      error: {
        isExist: false,
        msg: ''
      },
      currentChunk: 1,
      gameRecords: [],
      startdate: this.$route.query.startdate,
      enddate: this.$route.query.enddate,
      enddateBegin: '',
      totalData: {}
    }
  },
  computed: {
    conditions () {
      return {
        startdate: this.startdate,
        enddate: this.enddate
      }
    }
  },
  watch: {
    'conditions': function (query) {
      this.$router.push({query})
    },
    '$route': function (to) {
      if (to.name === 'PersonalReport') {
        this.startdate = to.query.startdate
        this.enddate = to.query.enddate
        this.initPersonalReport(this.conditions)
      }
    },
    'startdate': {
      handler: function (startdate) {
        this.enddateBegin = startdate
        if (Vue.moment(startdate).isAfter(this.enddate)) {
          this.enddate = startdate
        }
      },
      immediate: true
    }
  },
  created () {
    let query = this.$route.query
    if (!dateFormatChecker('YYYY-MM-DD', query.startdate) || !dateFormatChecker('YYYY-MM-DD', query.enddate)) {
      const today = Vue.moment()
      const yesterday = today.add(-1, 'days').format('YYYY-MM-DD')
      const weekPast = today.add(-6, 'days').format('YYYY-MM-DD')

      this.startdate = weekPast
      this.enddate = yesterday
      this.$router.replace({query: this.conditions})
    } else {
      this.initPersonalReport(this.conditions)
    }
  },
  methods: {
    initPersonalReport (option) {
      this.loading = true
      fetchPersonalReport({...option, offset: 0, limit: this.chunkSize}).then(data => {
        this.totalData = {
          bet_count: data.total_bet_count,
          bet_amount: data.total_bet_amount,
          return_amount: data.total_return_amount,
          profit: data.total_profit
        }
        this.gameRecords = data.results

        this.totalCount = data.count
      }).catch(errorMsg => {
        this.error.msg = msgFormatter(errorMsg)
        this.error.isExist = true
      }).finally(() => {
        this.loading = false
      })
    },
    loadMore () {
      if (this.loading || this.gameRecords.length >= this.totalCount) {
        return
      }
      this.loading = true
      fetchPersonalReport({ ...this.conditions, offset: this.gameRecords.length, limit: 10 }).then(data => {
        this.currentChunk += 1
        this.gameRecords.push(...data.results)
        this.loading = false
      }).catch(() => {

      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
@import '../../styles/vars.less';
.filter-area {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  box-sizing: border-box;
  height: 30px;
  width: 100%;
  background: #fff;
  border-bottom: 2px solid #eee;
  color: #666;
  font-size: 13px;
  overflow: hidden;
  .icon {
    flex: 0 0 auto;
    box-sizing: border-box;
    height: 100%;
    width: 40px;
    padding: 3px 0;
    background: url('../../assets/icon_filter.svg') no-repeat;
    background-position: center center;
    background-size: contain;
  }
  .filter {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1 0 auto;
    line-height: 30px;
    border-left: 1px solid #eee;
    padding: 0 16px;
    color: #666;
    .text {
      height: 100%;
      width: 100px;
    }
    &::after {
      display: block;
      content: '';
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 6px 4px 0 4px;
      border-color: #999 rgba(0, 0, 0, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0);
    }
  }
}
.record-table {
  td {
    padding: 0 0 0 12px;
    font-size: 14px;
    @media screen and (max-width: 375px) {
      font-size: 12px;
    }
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

.info {
  margin-top: 12px;
}

</style>
