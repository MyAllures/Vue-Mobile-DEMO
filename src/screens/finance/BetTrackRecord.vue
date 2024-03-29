<template>
  <div v-if="$store.state.user.account_type" class="container">
    <div class="filter-area">
      <div class="icon"></div>
      <date-selector class="filter" v-model="date"></date-selector>
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
          <th>游戏/追号期数</th>
          <th>玩法</th>
          <th>单注/翻倍</th>
          <th>盈亏</th>
        </tr>
      </thead>
      <tbody v-if="records.length">
        <tr
          v-for="(record, index) in records" :key="index">
          <td :style="{'line-height':'20px'}">
            <date-format :record="record"/>
            <span v-if="record.bet_type==='is_expert_plan'" class="issue-number">专家计划</span>
          </td>
          <td>
            <p>{{record.game.display_name}}</p>
            <span v-if="record.issue_numbers.length<=1" class="issue-number">{{record.issue_numbers[0].slice(-3)}}期</span>
            <span v-else class="issue-number">
              {{`${record.issue_numbers.length}期(${record.issue_numbers[0].slice(-3)}-${record.issue_numbers[record.issue_numbers.length-1].slice(-3)}期)`}}
            </span>
          </td>
          <td>
            <span v-if="record.play">{{`${record.play.playgroup} @ ${record.play.display_name}`}}</span>
            <template v-else>
              <p>{{record.play_position }}</p>
              <span :class="['item', {win: num === record.winning_number}]" v-for="(num, index) in record.track_numbers" :key="index">{{num}}</span>
            </template>
          </td>
          <td>
            <p>{{record.bet_amount | currency('￥')}}</p>
            <p>{{record.multiple}}倍</p>
          </td>
          <td>
            <span v-if="record.status === 'cancelled'">取消 <i v-if="record.message" class="cancelled-icon" :data-msg="record.message">!</i></span>
            <span v-else-if="record.status === 'ongoing'" :class="getStatusClass(record.status)">{{record.status | statusFilter}}</span>
            <p v-else :class="record.profit > 0 ? 'red' : !record.profit ? '' : 'green'">
              {{record.profit | currency('￥')}}
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
    <loading :show="loading" :text="$t('misc.loading')"></loading>
  </div>
  <register-tips v-else ></register-tips>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchNewBetTrackRecord } from '@/api'
import { XTable, XButton, Toast, Loading, TransferDom, PopupPicker } from 'vux'
import DateSelector from '@/components/DateSelector'
import { msgFormatter } from '@/utils'
import Vue from 'vue'
import infiniteScroll from 'vue-infinite-scroll'
import RegisterTips from '../../components/RegisterTips'

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
    Toast,
    Loading,
    XButton,
    PopupPicker,
    DateSelector,
    RegisterTips
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
    conditions: function (conditions) {
      this.$router.push({
        query: conditions
      })
    },
    $route: function (to) {
      if (to.name === 'BetTrackRecord') {
        this.selectedGame = [to.query.game]
        this.date = to.query.date
        this.initFetchNewBetTrackRecord(this.conditions)
      }
    }
  },
  created () {
    if (Object.keys(this.$route.query).length === 0) {
      this.$router.replace({query: this.conditions})
    } else {
      this.initFetchNewBetTrackRecord(this.conditions)
    }
  },
  methods: {
    initFetchNewBetTrackRecord (option) {
      this.loading = true
      fetchNewBetTrackRecord({ ...option, offset: 0, limit: this.chunkSize }).then(data => {
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
      fetchNewBetTrackRecord({ ...this.conditions, offset: this.records.length, limit: 10 }).then(data => {
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
.container {
  padding-bottom: 50px;
}
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
    color: #999;
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
.issue-number {
  color: #999;
  font-size: 12px;
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
