<template>
  <div ref="recordBox" class="history-container">
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
          <div class="invalid text-center" v-else-if="!schedule.result_category" >暂无统计资料</div>
          <div class="lottery-result" v-else>
            <lottery-record-num
              :results="schedule.result_str"
              :gameType="gameType" />
            <div v-if="lotteryCompare" class="compare-content">
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
</template>

<script>
import { XHeader, Flexbox, FlexboxItem, XAddress, Datetime, dateFormat, PopupRadio, TabItem, Group, XInput, XButton, Box, InlineLoading } from 'vux'
import LotteryRecordNum from '@/components/LotteryRecordNum.vue'
import { getGameHistoryData } from '../api'
import {HKL_GAMES} from '../config'

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
  'cqssc': sscCompareList,
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
  'gd11x5': gd11x5CompareList,
  'hkl': hklCompareList,
  'fc3d': fc3dCompareList
}
export default {
  props: {
    gameCode: {
      type: String,
      required: true
    },
    currentGame: {
      type: Object
    },
    date: {
      type: String
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
      addMoreLoading: false
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
      if (HKL_GAMES.includes(this.gameCode)) {
        return 'hkl'
      }
      return this.gameCode
    },
    queryTime () {
      if (this.gameCode === 'hkl' || this.gameCode === 'fc3d') {
        const date = this.$moment(this.date)
        return {
          created_at_0: date.date(1).format('YYYY-MM-DD'),
          created_at_1: date.add(1, 'months').date(0).format('YYYY-MM-DD')
        }
      } else {
        return {
          date: this.date
        }
      }
    }
  },
  watch: {
    'currentGame': function () {
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
        game_code: this.gameCode,
        offset: this.pagination.offset
      }
      Object.assign(data, this.queryTime)
      getGameHistoryData(data).then((response) => {
        this.pagination.total = response.count
        this.codeKl = false
        this.records = response
        this.lotteryCompare = gameTable[this.gameType]
        this.loading = false
        this.$refs.recordBox && this.$refs.recordBox.scrollIntoView()
      })
    },
    addMore () {
      if (this.loading) {
        return
      }
      this.addMoreLoading = true
      this.pagination.offset += 30

      let data = {
        game_code: this.gameCode,
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
    Datetime,
    PopupRadio,
    dateFormat,
    TabItem,
    Group,
    XInput,
    XButton,
    Box,
    InlineLoading,
    LotteryRecordNum
  }
}
</script>
<style lang="less" scoped>
.history-container {
  height: calc(~"100% - "40px);
}
.history-table {
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
    border-bottom: 1px solid #ddd;
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
  flex: 0 0 100px;
  width: auto;
  padding: 0px 5px;
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
