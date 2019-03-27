<template>
  <div class="history-container">
    <div class="title">
      {{game.display_name}}
      <div v-if="game.code === 'hkl' || game.code === 'fc3d'" class="date-picker">
        <date-selector class="date-picker-input" :z-index="600" v-model="date" :max-date="new Date()" :column-count="2"></date-selector>
        <i class="solid-triangle point-down"></i>
      </div>
      <div v-else class="date-picker">
        <date-selector class="date-picker-input" :z-index="600" :max-date="new Date()" v-model="date"></date-selector>
        <i class="solid-triangle point-down"></i>
      </div>
    </div>
    <div class="content">
      <table class="history-table">
        <tr
          v-for="(schedule, scheduleIndex) in records.results"
          :key="'scheduleIndex' + scheduleIndex"
          class="row">
          <td class="show-time">
            <p class="periods-number">
              {{schedule.issue_number}}
            </p>
            <p class="periods-time">
              {{schedule.schedule_result |dateFilter}}
            </p>
          </td>
          <td class="show-count">
            <div class="invalid text-center" v-if="schedule.result_status !== 'valid'">官方开奖无效</div>
            <div class="lottery-result" v-else>
              <lottery-record-num
                :results="schedule.result_str"
                :gameType="gameType" />
              <div v-if="schedule.result_category && lotteryCompare" class="compare-content">
                <span class="lottery-compare"
                  v-for="(compareKey, index) in lotteryCompare"
                  :key="'subHead' + index">
                  {{schedule.result_category[compareKey] | changeDataType}}
                </span>
              </div>
            </div>
          </td>
        </tr>
        <tr class="condition loading text-center p-t-lg" v-if="loading">
          <inline-loading></inline-loading>
        </tr>
        <tr class="condition" v-else-if="!records.results.length">
          <div class="no-more" v-if="!records.results.length">{{$t('misc.no_data_yet')}}</div>
        </tr>
        <tr class="condition" v-else-if="(pagination.total > records.results.length)">
          <x-button
            type="default"
            action-type="button"
            class="add-more"
            @click.native="addMore">
            <inline-loading v-if="addMoreLoading"></inline-loading>
            <span v-else>{{$t('misc.load_more')}}</span>
          </x-button>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { XHeader, Flexbox, FlexboxItem, XAddress, dateFormat, PopupRadio, TabItem, Group, XInput, XButton, InlineLoading } from 'vux'
import LotteryRecordNum from '@/components/LotteryRecordNum.vue'
import { getGameHistoryData } from '../api'
import {HKL_GAMES} from '../config'
import DateSelector from '@/components/DateSelector'

const TransformerCompareList = ['sum_of_1st_2st', 'sum_of_1st_2st_than_size', 'sum_of_1st_2st_odd_even', 'dragon_tiger_1_10', 'dragon_tiger_2_9', 'dragon_tiger_3_8', 'dragon_tiger_4_7', 'dragon_tiger_5_6']
const sscCompareList = ['sum_of_ball', 'sum_of_ball_than_size', 'sum_of_ball_odd_even', 'dragon_tiger_1_5']
const cqlfCompareList = ['sum_of_ball', 'sum_of_ball_than_size', 'sum_of_ball_odd_even', 'sum_of_ball_tail_than_size']
const pcddCompareList = ['sum_of_ball', 'sum_of_ball_than_size', 'sum_of_ball_odd_even']
const jsk3CompareList = ['sum_of_ball', 'sum_of_ball_than_size']
const gd11x5CompareList = ['sum_of_ball', 'sum_of_ball_than_size', 'sum_of_ball_odd_even', 'sum_of_ball_tail_than_size', 'dragon_tiger_1_5']
const hklCompareList = ['sum_of_ball', 'sum_of_ball_odd_even', 'sum_of_ball_than_size', 'seven_color_wavelength']
const fc3dCompareList = ['three_balls_sum', 'ball_odd_even_1', 'ball_odd_even_2', 'ball_odd_even_3']
const gameTable = {
  'jspk10': TransformerCompareList,
  'cs60cr': TransformerCompareList,
  'bcr': TransformerCompareList,
  'mlaft': TransformerCompareList,
  'er75ft': TransformerCompareList,
  'cs600cr': TransformerCompareList,
  'cqssc': sscCompareList,
  'cs10fc': sscCompareList,
  'cs5fc': sscCompareList,
  'jsssc': sscCompareList,
  'xjssc': sscCompareList,
  'tjssc': sscCompareList,
  'csffc': sscCompareList,
  'cqlf': cqlfCompareList,
  'gdklsf': cqlfCompareList,
  'pcdd': pcddCompareList,
  'jnd28': pcddCompareList,
  'luckdd': pcddCompareList,
  'jsk3': jsk3CompareList,
  'msk3': jsk3CompareList,
  'bjk3': jsk3CompareList,
  'gd11x5': gd11x5CompareList,
  'hkl': hklCompareList,
  'cs600hkl': hklCompareList,
  'csjndhkl': hklCompareList,
  'cs75hkl': hklCompareList,
  'fc3d': fc3dCompareList
}
export default {
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      records: { results: [] },
      lotteryCompare: null,
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
    changeDataType (val) {
      switch (val) {
        case 'dragon':
          return '龙'
        case 'tiger':
          return '虎'
        case 'bigger':
          return '大'
        case 'smaller':
          return '小'
        case 'great':
          return '极大'
        case 'tiny':
          return '极小'
        case 'outOfDefinition':
          return '无极值'
        case 'odd':
          return '单'
        case 'even':
          return '双'
        case 'straight':
          return '顺子'
        case 'half_straight':
          return '半顺'
        case 'misc_six':
          return '杂六'
        case 'pair':
          return '对子'
        case 'leopard':
          return '豹子'
        case 'blue':
          return '蓝波'
        case 'red':
          return '红波'
        case 'green':
          return '绿波'
        case 'equal':
          return '和'
        case 'gold':
          return '金'
        case 'wood':
          return '木'
        case 'water':
          return '水'
        case 'fire':
          return '火'
        case 'earth':
          return '土'
        case 'front_part_more':
          return '前多'
        case 'rear_part_more':
          return '后多'
        case 'odd_more':
          return '单多'
        case 'even_more':
          return '双多'
        case 'prime':
          return '质'
        case 'composite':
          return '合'
        default:
          return val
      }
    }
  },
  created () {
    this.initRecords()
  },
  computed: {
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
        this.lotteryCompare = gameTable[this.gameType]
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
    XHeader,
    XAddress,
    Flexbox,
    FlexboxItem,
    PopupRadio,
    dateFormat,
    TabItem,
    Group,
    XInput,
    XButton,
    InlineLoading,
    LotteryRecordNum,
    DateSelector
  }
}
</script>
<style lang="less" scoped>
.history-container {
  height: 100%;
  .title {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
    font-size: 16px;
    line-height: 40px;
    height: 40px;

    background-color: #f5f5f5;
    top: 0;
    z-index: 2;
  }
  .content {
    height: calc(~"100%" - 40px);
    overflow-y: auto;
  }
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


.history-table {
  box-sizing: border-box;
  padding-bottom: 60px;
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow: auto;
  border-collapse: collapse;
  .condition {
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    padding: 5px;
    &.loading {
      border: none;
      padding-top: 20px;
    }
  }
  .row {
    display: flex;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
  }
}

.show-time {
  box-sizing: border-box;
  flex: 0 0 110px;
  width: auto;
  border-right: 1px solid #dcd9d9;
  .periods-number {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50%;
    width: 100%;
    font-size: 14px;

  }
  .periods-time {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 50%;
    width: 100%;
    font-size: 13px;
    color: #999;
  }
}


.show-count {
  flex: 1 0 auto;
  .lottery-result {
    width: 100%;
    color: #327bce;
  }
  .lottery-compare {
    color: #999;
    width: 100%;
    height: 25px;
    text-align: center;
    line-height: 25px;
    margin-right: 5px;
    font-size: 14px;
  }
  .compare-content {
    width: 100%;
    text-align: center;
  }
}

.add-more, .no-more{
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
</style>
