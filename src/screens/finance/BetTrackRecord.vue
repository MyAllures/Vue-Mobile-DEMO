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
          <th>位置/号码</th>
          <th>结果</th>
          <th>单注/输赢</th>
        </tr>
      </thead>
      <tbody v-if="records.length">
        <tr
          v-for="(record, index) in records" :key="index">
          <td :style="{'line-height':'20px'}">
            <date-format :record="record"/>
          </td>
          <td>
            <p>{{record.game.display_name}}</p>
            <span :class="['item', {win: num === record.winning_schedule}]" v-for="(num, index) in record.issue_numbers" :key="index">{{num.slice(-3)}}</span>
          </td>
          <td>
            <p>{{record.play_position }}</p>
            <span :class="['item', {win: num === record.winning_number}]" v-for="(num, index) in record.track_numbers" :key="index">{{num}}</span>
          </td>
          <td>
            <span :class="getStatusClass(record.status)">{{record.status | statusFilter}}</span>
            <i v-if="record.message && (record.status === 'cancelled')" class="cancelled-icon" :data-msg="record.message">!</i>
          </td>
          <td>
            <p>{{record.bet_amount| currency('￥')}}</p>
            <p :class="record.profit > 0 ? 'red' : !record.profit ? '' : 'green'">
              <template v-if="record.profit">{{record.profit | currency('￥')}}</template>
              <template v-else>-</template>
            </p>
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
import { mapGetters } from 'vuex'
import { fetchBetTrackRecord } from '../../api'
import { XTable, XButton, Box, Toast, Loading, Divider, TransferDom, Datetime, PopupPicker, Popover } from 'vux'
import { msgFormatter } from '../../utils'
import Vue from 'vue'
import infiniteScroll from 'vue-infinite-scroll'
const today = Vue.moment().format('YYYY-MM-DD')
const DateFormat = Vue.extend({
  render: function (createElement) {
    if (this.record.created_at) {
      let timeFormat = this.$moment(this.record.created_at).format('YYYY-MM-DD HH:mm').split(' ')
      return createElement('div', {class: 'time'}, [createElement('div', timeFormat[1])])
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
    PopupPicker,
    Popover
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
    },
    statusFilter (value) {
      if (value === 'win') {
        return '中'
      } else if (value === 'cancelled') {
        return '取消'
      } else if (value === 'ongoing') {
        return '进行中'
      } else if (value === 'death' || value === 'lose') {
        return '挂'
      } else {
        return '-'
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
      if (to.name === 'BetTrackRecord') {
        this.selectedGame = [to.query.game]
        this.date = to.query.date
        this.initFetchBetTrackRecord(this.conditions)
      }
    }
  },
  created () {
    if (Object.keys(this.$route.query).length === 0) {
      this.$router.replace({query: this.conditions})
    } else {
      this.initFetchBetTrackRecord(this.conditions)
    }
  },
  methods: {
    initFetchBetTrackRecord (option) {
      this.loading = true
      fetchBetTrackRecord({ ...option, offset: 0, limit: this.chunkSize }).then(data => {
        this.totalCount = data.count
        this.records = data.results
      }).catch(errorMsg => {
        this.error.msg = msgFormatter(errorMsg)
        this.error.isExist = true
      }).finally(() => {
        this.loading = false
      })
    },
    getStatusClass (value) {
      if (value === 'win') {
        return 'red'
      } else if (value === 'cancelled') {
        return ''
      } else if (value === 'ongoing') {
        return 'blue'
      } else {
        return 'grey'
      }
    },
    loadMore () {
      if (this.loading || this.records.length >= this.totalCount) {
        return
      }
      this.loading = true
      fetchBetTrackRecord({ ...this.conditions, offset: this.records.length, limit: 10 }).then(data => {
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
    line-height: 1.5;
    font-size: 13px;
  }
  .time {
    font-size: 13px;
  }

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

.cancelled-icon {
  position: relative;
  display: inline-block;
  border-radius: 100%;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border: 2px solid red;
  font-weight: bold;
  font-style: normal;
  color: red;
  // tooltip
  &::before {
    content: '';
    position: absolute;
    display: inline-block;
    top: 10px;
    right: 2px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 6px;
    border-color:  transparent transparent #333 transparent;
  }
  &::after {
    content: attr(data-msg);
    position: absolute;
    display: inline-block;
    white-space: nowrap;
    border-radius: 3px;
    top: 21px;
    right: 0;
    padding: 5px;
    font-size: 12px;
    background-color: #333;
    color: #eee;
  }
  &::before, &::after {
    opacity: 0;
    transition: opacity .1s;
  }
  &:active {
    &::before, &::after {
      opacity: 1;
    }
  }
}

.item {
  color: #999;
  font-size: 12px;
  &.win {
    color: red;
  }
  &:not(:last-child):after {
    content: ', ';
    color: #999;
  }
}
</style>
