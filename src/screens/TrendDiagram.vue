<template>
  <div class="trend-diagram-container">
    <div class="header">
      <div class="type-tab">
        <div
          :class="['type-tab-item', {active: setting.type===selectedSetting.type}]"
          v-for="setting in settings"
          :key="setting.type"
          @click="chooseSetting(setting)">{{setting.displayName}}</div>
      </div>
      <div class="divide"></div>
      <div class="calendar-icon" @click="showDatePicker"></div>
    </div>
    <div class="tab" v-if="selectedSetting.tabs">
      <div
        :class="['tab-item', {active: selectedTabIdx===tabIdx}]"
        v-for="(text, tabIdx) in selectedSetting.tabs"
        :key="tabIdx"
        @click="chooseTabIdx(tabIdx)">{{text}}</div>
    </div>
    <div :class="['table__container', {'has-more': records.length<total_count}]" v-if="selectedSetting.cumulationNames.length>10">
      <div :class="['table__fix-column', {'at-middle': !isTableAtRight}]" :style="{width: `${firstColWidth}px`}">
        <div class="total-section">
          <table class="table total" :style="{width: `${firstColWidth}px`}">
            <thead class="thead">
              <tr>
                <th class="first-col col">{{selectedSetting.cumulationType}}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="first-col col">今日总次数</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="record-section" ref="fcBody">
          <div class="table-wrapper">
            <table class="table record" >
              <tbody>
                <tr v-for="(rec, recIdx) in records" :key="recIdx">
                  <td :style="{width: firstColWidth+'px'}" class="first-col col">{{rec.issue_number}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div :class="['table__rest-column', {'at-middle': !isTableAtRight}]" :style="{width: `calc(100% - ${firstColWidth}px)`}">
        <div class="total-section" ref="rcHead">
          <table class="table total" :style="{width: `${selectedSetting.cumulationNames.length*colWidth}px`}">
            <thead class="thead">
              <tr>
                <th :style="{width: colWidth+'px'}" class="col" v-for="(name, index) in selectedSetting.cumulationNames" :key="index">{{name}}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="col" v-for="(num, index) in selectedSetting.cumulationNames" :key="index">{{cumulation[index]||0}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="record-section" ref="rcBody">
          <div class="table-wrapper">
            <table class="table record" ref="restRecordTable" :style="{width: `${selectedSetting.cumulationNames.length*colWidth}px`}">
              <tbody>
                <tr v-for="(rec, recIdx) in records" :key="recIdx">
                  <td :style="{width: colWidth+'px'}" class="col" v-for="(num, index) in rec.numbers" :key="index">{{num}}</td>
                </tr>
              </tbody>
            </table>
            <div class="line-panel" :style="{width: `${svgPanelWidth}px`, top: `${svgH/2}px`}">
              <svg width="100%" :height="`${tableHeight}px`">
                <template v-for="(res, idx) in resultList">
                  <line v-if="resultList[idx+1]!==undefined" :key="idx" :x1="colWidth/2+res[0]*colWidth" :y1="svgH*idx" :x2="colWidth/2+resultList[idx+1][0]*colWidth" :y2="svgH*(idx+1)" style="stroke: #156fd8;stroke-width: 1px"/>
                </template>
              </svg>
            </div>
            <div class="circle-panel" :style="{width: `${svgPanelWidth}px`}">
              <svg width="100%" :height="`${tableHeight}px`">
                <template v-for="(res, idx) in resultList">
                  <circle :key="`circle${idx}`" :cx="colWidth/2+res[0]*colWidth" :cy="svgH/2+svgH*idx" r="10" fill="#156fd8" />
                  <text :key="`text${idx}`" :x="colWidth/2+res[0]*colWidth" :y="svgH/2+svgH*idx" dominant-baseline="central" text-anchor="middle" style="fill:#fff;font-size:14px;">{{res[1]}}</text>
                </template>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div class="loading" v-show="loading">
        <inline-loading></inline-loading>
      </div>
      <template  v-if="!loading">
        <div class="foot bottom" v-if="records.length<total_count && footAreaBottomVisible">
          <x-button
            type="default"
            action-type="button"
            class="add-more"
            @click.native="addMore">
            <inline-loading v-if="addMoreLoading"></inline-loading>
            <span v-else>{{$t('misc.load_more')}}</span>
          </x-button>
        </div>
        <div class="foot top" v-else-if="total_count===0">
          <div class="no-more" >{{$t('misc.no_data_yet')}}</div>
        </div>
      </template>
    </div>
    <template v-else>
      <div class="total-section">
        <table class="table total" :style="{width: `${firstColWidth + selectedSetting.cumulationNames.length*colWidth}px`}">
          <thead class="thead">
            <tr>
              <th :style="{width: firstColWidth+'px'}" class="first-col col">{{selectedSetting.cumulationType}}</th>
              <th :style="{width: colWidth+'px'}" class="col" v-for="(name, index) in selectedSetting.cumulationNames" :key="index">{{name}}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="first-col col">今日总次数</td>
              <td class="col" v-for="(num, index) in selectedSetting.cumulationNames" :key="index">{{cumulation[index]||0}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="record-section">
        <div class="loading" v-show="loading">
          <inline-loading></inline-loading>
        </div>
        <div class="table-wrapper" v-show="!loading">
          <table class="table record" ref="recordTable">
            <tbody>
              <tr v-for="(rec, recIdx) in records" :key="recIdx">
                <td :style="{width: firstColWidth+'px'}" class="first-col col">{{rec.issue_number}}</td>
                <td :style="{width: colWidth+'px'}" class="col" v-for="(num, index) in rec.numbers" :key="index">
                  {{num}}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="line-panel" :style="{width: `${svgPanelWidth}px`, top: `${svgH/2}px`}">
            <svg width="100%" :height="`${tableHeight}px`">
              <template v-for="(res, idx) in resultList">
                <line v-if="resultList[idx+1]!==undefined" :key="idx" :x1="colWidth/2+res[0]*colWidth" :y1="svgH*idx" :x2="colWidth/2+resultList[idx+1][0]*colWidth" :y2="svgH*(idx+1)" style="stroke: #156fd8;stroke-width: 1px"/>
              </template>
            </svg>
          </div>
          <div class="circle-panel" :style="{width: `${svgPanelWidth}px`}">
            <svg width="100%" :height="`${tableHeight}px`">
              <template v-for="(res, idx) in resultList">
                <circle :key="`circle${idx}`" :cx="colWidth/2+res[0]*colWidth" :cy="svgH/2+svgH*idx" r="10" fill="#156fd8" />
                <text :key="`text${idx}`" :x="colWidth/2+res[0]*colWidth" :y="svgH/2+svgH*idx" dominant-baseline="central" text-anchor="middle" style="fill:#fff;font-size:14px;">{{res[1]}}</text>
              </template>
            </svg>
          </div>
          <template  v-if="!loading">
            <div class="foot" v-if="records.length<total_count">
              <x-button
                type="default"
                action-type="button"
                class="add-more"
                @click.native="addMore">
                <inline-loading v-if="addMoreLoading"></inline-loading>
                <span v-else>{{$t('misc.load_more')}}</span>
              </x-button>
            </div>
            <div class="foot" v-else-if="total_count===0">
              <div class="no-more" >{{$t('misc.no_data_yet')}}</div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { settings } from '@/utils/trendDiagramSetting'
import { fetchTrendChart } from '@/api'
import { XButton, InlineLoading } from 'vux'

export default {
  name: 'TrendDiagram',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  components: {
    XButton,
    InlineLoading
  },
  data () {
    const currentSettings = settings[this.game.code]
    return {
      selectedSetting: currentSettings[0],
      selectedTabIdx: currentSettings[0].tabs ? 0 : undefined,
      selectedDate: new Date(),
      settings: currentSettings,
      isCalendarVisible: false,
      records: [],
      cumulation: [],
      colWidth: 0,
      firstColWidth: 100,
      total_count: 0,
      next_cursor: undefined,
      loading: false,
      addMoreLoading: false,
      noMoreData: false,
      footAreaBottomVisible: false,
      isTableAtRight: true,
      resultList: [],
      svgH: 0,
      tableHeight: 0
    }
  },
  computed: {
    conditions () {
      let date = this.$moment(this.selectedDate).format('YYYY-MM-DD')
      const conditions = {
        game_code: this.game.code,
        type: this.selectedSetting.type,
        start_date: date,
        end_date: date,
        limit: 30
      }
      if (this.selectedTabIdx !== undefined) {
        conditions.target = this.selectedTabIdx + 1
      }
      return conditions
    },
    svgPanelWidth () {
      return this.colWidth * this.selectedSetting.cumulationNames.length
    }
  },
  watch: {
    'conditions': {
      handler: function (conditions) {
        this.initFetch()
      },
      immediate: true
    }
  },
  created () {
    let num = this.selectedSetting.cumulationNames.length
    num = num <= 10 ? num : 10
    this.colWidth = (window.innerWidth - this.firstColWidth) / num
  },
  mounted () {
    if (this.selectedSetting.cumulationNames.length > 10) {
      const fcBody = this.$refs.fcBody
      const rcBody = this.$refs.rcBody
      const rcHead = this.$refs.rcHead
      const rcBodyInitLeft = rcBody.scrollLeft
      const rcBodyClientHeight = rcBody.clientHeight
      let self = this
      rcBody.addEventListener('scroll', function () {
        fcBody.scrollTop = this.scrollTop
        rcHead.scrollLeft = this.scrollLeft
        if ((this.scrollHeight - (this.scrollTop + rcBodyClientHeight)) <= 0) {
          self.footAreaBottomVisible = true
        } else {
          self.footAreaBottomVisible = false
        }
        if (this.scrollLeft === rcBodyInitLeft) {
          self.isTableAtRight = true
        } else {
          self.isTableAtRight = false
        }
      }, { passive: true })
    }
  },
  methods: {
    chooseSetting (setting) {
      if (this.loading || this.addMoreLoading) {
        return
      }
      this.selectedSetting = setting
    },
    chooseTabIdx (tabIdx) {
      if (this.loading || this.addMoreLoading) {
        return
      }
      this.selectedTabIdx = tabIdx
    },
    addMore () {
      if (this.addMoreLoading) {
        return
      }
      this.addMoreLoading = true
      fetchTrendChart({...this.conditions, cursor: this.next_cursor})
        .then(res => {
          this.total_count = res.count
          this.cumulation = res.frequency_stats.numbers
          this.records = this.records.concat(res.results)
          this.next_cursor = res.next_cursor
          this.$nextTick(() => {
            this.saveLineInfo()
          })
        })
        .catch(() => {})
        .finally(() => {
          this.footAreaBottomVisible = false
          this.addMoreLoading = false
        })
    },
    initFetch () {
      if (this.loading) {
        return
      }
      this.loading = true
      fetchTrendChart({...this.conditions, offset: 0})
        .then(res => {
          this.loading = false

          this.cumulation = res.frequency_stats.numbers
          this.total_count = res.count
          this.records = res.results
          this.next_cursor = res.next_cursor
          this.$nextTick(() => {
            if (this.selectedSetting.hotArea) {
              const rcBody = this.$refs.rcBody
              const rcHead = this.$refs.rcHead
              rcBody.scrollLeft = this.colWidth * this.selectedSetting.hotArea
              rcHead.scrollLeft = this.colWidth * this.selectedSetting.hotArea
            }
            this.saveLineInfo()
          })
        })
        .catch(() => {
          this.loading = false
        })
    },
    saveLineInfo () {
      let tableWidth
      let tableHeight
      if (this.selectedSetting.cumulationNames.length > 10) {
        tableWidth = this.$refs['restRecordTable'].clientWidth
        tableHeight = this.$refs['restRecordTable'].clientHeight
      } else {
        tableWidth = window.innerWidth - this.firstColWidth
        tableHeight = this.$refs['recordTable'].clientHeight
      }
      this.svgW = tableWidth / (this.selectedSetting.cumulationNames.length)
      this.svgH = tableHeight / this.records.length
      this.tableHeight = tableHeight

      const resultList = []
      this.records.forEach((rec, i) => {
        let xIdx = rec.numbers.indexOf(0)
        resultList.push([xIdx, this.selectedSetting.cumulationNames[xIdx]])
      })
      this.resultList = resultList
    },
    showDatePicker () {
      if (this.loading || this.addMoreLoading) {
        return
      }
      let maxDate = new Date()
      let minDate = new Date(maxDate.getFullYear() - 5, 0, 1)
      this.$createDatePicker({
        min: minDate,
        max: maxDate,
        value: this.selectedDate,
        zIndex: 600,
        format: {
          year: 'YYYY',
          month: 'MM',
          date: 'DD'
        },
        onSelect: (date) => { this.selectedDate = date }
      }).show()
    }
  }
}
</script>
<style lang="less" scoped>
.trend-diagram-container {
  display: flex;
  height: 100%;
  flex-direction: column;
}
.header {
  box-sizing: border-box;
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 40px;
  background: #f5f5f5;
  border: 1px solid #e6e6e6;
  .type-tab {
    margin-right: auto;
    display: flex;
    font-size: 14px;
    color: #999;
    .type-tab-item {
      height: 40px;
      line-height: 40px;
      text-align: center;
      padding: 0 10px;
      &.active {
        color: #333;
      }
    }
  }
  .divide {
    width: 2px;
    height: 24px;
    background: #e6e6e6;
  }
  .calendar-icon {
    box-sizing: border-box;
    height: 100%;
    width: 44px;
    background: url("../assets/icon_calendar.svg") center no-repeat;
    background-size: 60%;
  }
}
.tab {
  flex: 0 0 auto;
  display: flex;
  height: 50px;
  background: #f5f5f5;
  .tab-item {
    box-sizing: border-box;
    flex: 1 0 auto;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    height: 100%;
    padding-bottom: 3px;
    border-bottom: 1px solid;
    border-color: #f5f5f5;
    color: #999999;
    &.active {
      color: @azul;
      border-color: @azul;
    }
  }
}
.table__container {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  .foot {
    position: absolute;
    right: 0;
    &.top {
      top: 65px;
    }
    &.bottom {
      bottom: 60px;
    }
  }
  &.has-more {
    .table-wrapper {
      padding-bottom: 105px;
    }
  }
  .loading {
    position: absolute;
    width: 100%;
    right: 0;
    top: 65px;
  }
}
.table__fix-column {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  &.at-middle {
    box-shadow: 5px 0 10px -5px rgba(0,0,0,.12);
  }
}
.table__rest-column {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  .total-section {
    width: 100%;
    overflow-x: auto;
  }
  &.at-middle {
    .record-section {
      box-shadow: 5px 5px 10px -5px rgba(0,0,0,.12) inset;
    }
  }
  .record-section {
    .line-panel{
      position: absolute;
      top: 0;
      left: 0;
      right: auto;
      line-height: 1;
      svg {
        display: block
      }
    }
    .circle-panel{
      position: absolute;
      top: 0;
      left: 0;
      right: auto;
      line-height: 0;
      svg {
        display: block
      }
    }
  }
}





.total-section {
  flex: 0 0 auto;
}
.record-section {
  position: relative;
  flex: 1 1 auto;
  background: #f5f5f5;
  box-shadow: 0 5px 10px -5px rgba(0,0,0,.12) inset;
  overflow: auto;
  .line-panel{
    position: absolute;
    top: 0;
    right: 0;
    line-height: 1;
    svg {
      display: block
    }
  }
  .circle-panel{
    position: absolute;
    top: 0;
    right: 0;
    line-height: 0;
    svg {
      display: block
    }
  }
}
.table-wrapper {
  position: relative;
  box-sizing: border-box;
  padding-bottom: 60px;
}
.table {
  table-layout:fixed;
  border-collapse: collapse;
  color: #333;
  font-size: 14px;
  .col {
    box-sizing: border-box;
    border: 1px solid #eee;
    vertical-align: middle;
    text-align: center;
    padding: 4px 0;
  }
  &.total {
    .thead,
    .first-col {
      color: #999;
    }
  }
  &.record {
    .first-col.col {
      color: #333;
    }
    .col {
      color: rgba(22, 111, 216, 0.5)
    }
  }
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 20px;
}

.foot {
  box-sizing: border-box;
  width: 100%;
  padding: 5px;
  border-bottom: 1px solid #ddd;
  text-align: center;
  .add-more {
    font-size: 14px;
  }
  .no-more {
    font-size: 14px;
    text-align: center;
    color: #666;
  }
}

</style>


