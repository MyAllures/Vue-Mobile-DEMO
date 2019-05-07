<template>
  <div :class="['history-container', compareTypes ? 'additional' : 'simple']">
    <div class="header">
      <span class="title">{{game.display_name}}</span>
      <div>
        <div v-if="game.code === 'hkl' || game.code === 'fc3d'" class="date-picker">
          <date-selector class="date-picker-input" :z-index="600" v-model="date" :max-date="new Date()" :column-count="2"></date-selector>
          <i class="solid-triangle point-down"></i>
        </div>
        <div v-else class="date-picker">
          <date-selector class="date-picker-input" :z-index="600" :max-date="new Date()" v-model="date"></date-selector>
          <i class="solid-triangle point-down"></i>
        </div>
      </div>
      <div class="type-btns" v-if="compareTypes">
        <x-button type="primary"
          :class="['type-btn', {'active': type === activeType}]"
          @click.native="activeType = type"
          v-for="(type, index) in compareTypes.types"
          :key="index">{{type | typeFilter}}</x-button>
      </div>
    </div>
    <div class="content">
      <x-table class="table">
        <tr
          v-for="(schedule, scheduleIndex) in records.results"
          :key="'scheduleIndex' + scheduleIndex">
          <td width="30%">
            <p class="issue-number">
              {{schedule.issue_number}}
              <span class="issued-at">{{schedule.schedule_result |dateFilter}}</span>
            </p>
          </td>
          <td>
            <div class="invalid text-center" v-if="schedule.result_status !== 'valid'">官方开奖无效</div>
            <div class="lottery-result" v-else>
              <lottery-record-num
                :activeType="activeType"
                :record="schedule"
                :gameType="gameType" />
            </div>
          </td>
        </tr>
        <tr v-if="loading">
          <td class="condition loading text-center p-t-lg">
            <inline-loading></inline-loading>
          </td>
        </tr>
        <tr v-else-if="!records.results.length">
          <td colspan="2"  class="condition" >
            <div class="no-more" v-if="!records.results.length">{{$t('misc.no_data_yet')}}</div>
            </td>
        </tr>
        <tr v-else-if="(pagination.total > records.results.length)">
          <td colspan="2" class="condition" >
            <x-button
              type="default"
              action-type="button"
              class="add-more"
              @click.native="addMore">
              <inline-loading v-if="addMoreLoading"></inline-loading>
              <span v-else>{{$t('misc.load_more')}}</span>
            </x-button>
          </td>
        </tr>
      </x-table>
    </div>
  </div>
</template>

<script>
import { Flexbox, FlexboxItem, XAddress, dateFormat, PopupRadio, TabItem, Group, XInput, XButton, InlineLoading, XTable } from 'vux'
import LotteryRecordNum from '@/components/LotteryRecordNum.vue'
import { getGameHistoryData } from '../api'
import {HKL_GAMES} from '../config'
import DateSelector from '@/components/DateSelector'
import {changeableCompareTypes} from '@/utils/lotteryRecordSetting'
import _ from 'lodash'
export default {
  name: 'LotterRecord',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      changeableCompareTypes,
      activeType: 'number',
      records: { results: [] },
      pagination: {
        total: 0,
        offset: 0
      },
      addMoreLoading: false,
      date: this.game.code === 'hkl' || this.game.code === 'fc3d' ? this.$moment().format('YYYY-MM') : this.$moment().format('YYYY-MM-DD')
    }
  },
  filters: {
    dateFilter (value) {
      return dateFormat(new Date(value), 'MM-DD HH:mm')
    },
    typeFilter (val) {
      switch (val) {
        case 'number':
          return '号码'
        case 'thanSize':
          return '大小'
        case 'oddEven':
          return '单双'
        case 'ballOfSumThanSize':
          return '合大小'
        case 'ballOfSumOddEven':
          return '合单双'
        case 'tailThanSize':
          return '尾大小'
        case 'zodiac':
          return '生肖'
        default:
          return val
      }
    }
  },
  created () {
    this.initRecords()
  },
  computed: {
    compareTypes () {
      return _.flatMap(this.changeableCompareTypes).find(l => l.games.includes(this.game.code))
    },
    gameType () {
      if (HKL_GAMES.includes(this.game.code)) {
        return 'hkl'
      }
      return this.game.code
    },
    queryTime () {
      const date = this.$moment(this.date)
      if (this.game.code === 'hkl' || this.game.code === 'fc3d') {
        return {
          schedule_result_0: date.date(1).format('YYYY-MM-DD'),
          schedule_result_1: date.add(1, 'months').date(0).format('YYYY-MM-DD')
        }
      } else {
        const dateFormat = date.format('YYYY-MM-DD')
        return {
          schedule_result_0: dateFormat,
          schedule_result_1: dateFormat
        }
      }
    }
  },
  watch: {
    'game': function () {
      this.initRecords()
    },
    'date': function (date) {
      this.initRecords()
    }
  },
  methods: {
    initRecords () {
      this.records.results = []
      this.pagination = {
        offset: 0,
        total: 0
      }
      this.getGameRecords()
    },
    getGameRecords () {
      if (this.loading) {
        return
      }
      this.loading = true
      let data = {
        game_code: this.game.code,
        offset: this.pagination.offset
      }
      Object.assign(data, this.queryTime)
      getGameHistoryData(data).then((response) => {
        this.pagination.total = response.count
        this.codeKl = false
        this.records = response
        this.loading = false
      })
    },
    addMore () {
      if (this.loading) {
        return
      }
      this.addMoreLoading = true
      this.pagination.offset += 30

      let data = {
        game_code: this.game.code,
        offset: this.pagination.offset
      }
      Object.assign(data, this.queryTime)
      getGameHistoryData(data).then((response) => {
        this.pagination.total = response.count
        this.records.results.push(...response.results)
        this.addMoreLoading = false
      })
    }
  },
  components: {
    XAddress,
    Flexbox,
    FlexboxItem,
    PopupRadio,
    dateFormat,
    TabItem,
    Group,
    XTable,
    XInput,
    XButton,
    InlineLoading,
    LotteryRecordNum,
    DateSelector
  }
}
</script>
<style lang="less" scoped>
.vux-table {
  line-height: 1.5;
}
.history-container {
  height: 100%;
  overflow: hidden;
  &.additional {
    .header {
      height: 80px;
    }
    .content {
      height: calc(~"100%" - 140px);
    }
  }

  &.simple {
    .header {
      height: 45px;
    }
    .content {
      height: calc(~"100%" - 105px);
    }
  }

  .header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding-left: 10px;
    padding-right: 10px;
    font-size: 16px;
    background-color: #f5f5f5;
    z-index: 2;
  }
  .content {
    padding-bottom: 70px;
    overflow-y: auto;
  }
}
.condition {
  padding: 5px;
}
.date-picker {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 135px;
  height: 40px;
  margin-left: auto;
  padding-right: 5px;
  &-input {
    padding: 0 5px 0 0;
    font-size: 14px;
    height: 40px;
    line-height: 40px;
    text-align: right;
    color: #999;
  }
  .solid-triangle {
    border-top: 5px solid #999;
  }
}

.issue-number {
  align-items: center;
  font-size: 14px;
  color: #666;
  .issued-at {
    display: block;
    color: #999;
    font-size: 13px;
  }
}

.lottery-result {
  color: #999;
  font-size: 13px;
}

.add-more, .no-more{
  width: 100%;
  position: relative;
  font-size: 14px;
}

.no-more {
  text-align: center;
  color: #666;
}

.invalid {
  line-height: 50px;
}

.type-btns {
  display: inline-block;
  width: 100%;
  height: 40px;
  white-space: nowrap;
  overflow-x: auto;
}

.type-btn {
  display: inline-block;
  width: 70px;
  height: 32px;
  font-size: 14px;
  margin-right: 5px;
  &.weui-btn {
    margin-top: 0;
  }
  &.active {
    font-weight: 700;
  }
}

.vux-table td {
  vertical-align: middle;
}
</style>
