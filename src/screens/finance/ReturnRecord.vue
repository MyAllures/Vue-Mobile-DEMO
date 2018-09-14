<template>
  <div v-if="$store.state.user.account_type" class="container">
    <div class="filter-area">
      <div class="icon"></div>
      <datetime class="filter" v-model="date"></datetime>
      <popup-picker
        class="filter"
        :data="gameOptions"
        :show-name="true"
        v-model="selectedGame"
        value-text-align="left"
        placeholder="选择游戏">
        </popup-picker>
    </div>
    <x-table
      v-infinite-scroll="loadMore"
      :infinite-scroll-distance="10"
      :cell-bordered="false"
      class="record-table">
      <thead>
        <tr class="record-thead">
          <th>{{$t('fin.time')}}</th>
          <th>{{$t('fin.game')}}</th>
          <th>
            <span class="amount text-left">{{$t('fin.accumulation')}}</span>
          </th>
          <th>{{$t('fin.status')}}</th>
        </tr>
      </thead>
      <tbody v-if="records.length">
        <tr
          v-for="(record, index) in records" :key="index">
          <td :style="{'line-height':'20px'}">
            <date-format :record="record"/>
          </td>
          <td>
            <span>{{record.display_name}}</span>
          </td>
          <td>
            <span class="amount text-left">¥ {{record.return_amount | profitFilter }}</span>
          </td>
          <td>
            <span :class="{green: record.finish_return_amount}">{{record.finish_return_amount?'已派发':'等待派发中'}}</span>
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
  <div v-else class="tip">
    <p>请注册会员后访问</p>
    <x-button type="primary" link="/register">立即注册</x-button>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchReturnRecord } from '../../api'
import { XTable, XButton, Box, Toast, Loading, Divider, TransferDom, Datetime, PopupPicker } from 'vux'
import { msgFormatter } from '../../utils'
import Vue from 'vue'
import infiniteScroll from 'vue-infinite-scroll'
const today = Vue.moment().format('YYYY-MM-DD')
const DateFormat = Vue.extend({
  render: function (createElement) {
    if (this.record.finish_return_amount) {
      let timeFormat = this.$moment(this.record.created_at).format('YYYY-MM-DD HH:mm').split(' ')
      return createElement('div', {class: 'time'}, [createElement('div', timeFormat[0]), createElement('div', timeFormat[1])])
    } else {
      let timeFormat = this.$moment(this.record.date).format('YYYY-MM-DD')
      return createElement('div', {class: 'time'}, [createElement('div', timeFormat)])
    }
  },
  props: {
    record: {
      type: Object,
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
    Datetime,
    PopupPicker
  },
  directives: {
    infiniteScroll,
    TransferDom
  },
  filters: {
    profitFilter (val) {
      if (val && typeof val === 'number') {
        return val.toFixed(2).replace('-', '')
      }
    }
  },
  data () {
    return {
      records: [],
      totalCount: 0,
      chunkSize: ~~((document.documentElement.clientHeight - 100) / 40) + 5, // clientHeight minus the height of top and bottom / height of each tr
      loading: false,
      error: {
        isExist: false,
        msg: ''
      },
      currentChunk: 1,
      selectedGame: [this.$route.query.game || ''],
      date: this.$route.query.date || today,
      isDatePickerVisible: false
    }
  },
  computed: {
    conditions () {
      return {
        game: this.selectedGame[0] || '',
        date: this.date
      }
    },
    ...mapGetters([
      'allGames'
    ]),
    gameOptions () {
      return [[{name: '全部', value: ''}, ...this.allGames.map(game => {
        return {
          name: game.display_name,
          value: game.code
        }
      })]]
    }
  },
  watch: {
    'conditions': function (conditions) {
      this.$router.push({
        query: conditions
      })
    },
    '$route': function (to) {
      if (to.name === 'ReturnRecord') {
        this.selectedGame = [to.query.game]
        this.date = to.query.date
        this.initFetchReturnRecord(this.conditions)
      }
    }
  },
  created () {
    if (Object.keys(this.$route.query).length === 0) {
      this.$router.replace({query: this.conditions})
    } else {
      this.initFetchReturnRecord(this.conditions)
    }
  },
  methods: {
    initFetchReturnRecord (option) {
      this.loading = true
      fetchReturnRecord({ ...option, offset: 0, limit: this.chunkSize
      }).then(data => {
        this.totalCount = data.count
        this.records = data.results
      }).catch(errorMsg => {
        this.error.msg = msgFormatter(errorMsg)
        this.error.isExist = true
      }).finally(() => {
        this.loading = false
      })
    },
    loadMore () {
      if (this.loading || this.records.length >= this.totalCount) {
        return
      }
      this.loading = true
      fetchReturnRecord({ ...this.conditions, offset: this.records.length, limit: 10 }).then(data => {
        this.currentChunk += 1
        this.records.push(...data.results)
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
