<template>
  <div class="container">
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
    <div class="tab">
      <div
        :class="['tab-item', {active: selectedTabIdx===tabIdx}]"
        v-for="(text, tabIdx) in selectedSetting.tabs"
        :key="tabIdx"
        @click="chooseTabIdx(tabIdx)">{{text}}</div>
    </div>
    <div class="total-section">
      <table class="table total">
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
      <div v-show="!loading">
        <table class="table record" ref="record-table">
          <tbody>
            <tr v-for="(rec, recIdx) in records" :key="recIdx">
              <td :style="{width: firstColWidth+'px'}" class="first-col col">{{rec.issue_number}}</td>
              <td :style="{width: colWidth+'px'}" class="col" v-for="(num, index) in rec.numbers" :key="index">{{num}}</td>
            </tr>
          </tbody>
        </table>
        <canvas class="canvas" ref="line"></canvas>
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
  </div>
</template>
<script>
import { settings } from '@/utils/trendDiagramSetting'
import { fetchTrendChart } from '@/api'
import { throttle } from 'lodash'
import { XButton, InlineLoading } from 'vux'

export default {
  name: 'TrendDiagram',
  props: {
    gameCode: {
      type: String
    }
  },
  components: {
    XButton,
    InlineLoading
  },
  data () {
    const currentSettings = settings[this.gameCode]
    return {
      selectedSetting: currentSettings[0],
      selectedTabIdx: 0,
      selectedDate: new Date(),
      settings: currentSettings,
      isCalendarVisible: false,
      records: [],
      cumulation: [],
      ctx: null,
      ratio: 1,
      canvas: null,
      canvasWidth: 0,
      canvasHeight: 0,
      colWidth: 0,
      firstColWidth: 100,
      total_count: 0,
      next_cursor: undefined,
      loading: false,
      addMoreLoading: false,
      noMoreData: false
    }
  },
  computed: {
    conditions () {
      let date = this.$moment(this.selectedDate).format('YYYY-MM-DD')
      return {
        game_code: this.gameCode,
        type: this.selectedSetting.type,
        target: this.selectedTabIdx + 1,
        start_date: date,
        end_date: date,
        limit: 30
      }
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
    this.colWidth = (window.innerWidth - this.firstColWidth) / (this.selectedSetting.cumulationNames.length)
  },
  mounted () {
    const ctx = this.$refs.line.getContext('2d')
    this.ctx = ctx
    this.canvas = this.$refs.line
    // 屏幕的设备像素比
    let devicePixelRatio = window.devicePixelRatio || 1
    // 浏览器在渲染canvas之前存储画布信息的像素比
    let backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                        ctx.mozBackingStorePixelRatio ||
                        ctx.msBackingStorePixelRatio ||
                        ctx.oBackingStorePixelRatio ||
                        ctx.backingStorePixelRatio || 1
    // canvas的实际渲染倍率
    this.ratio = devicePixelRatio / backingStoreRatio
    window.addEventListener('resize', this.reDraw)
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
            this.initCanvas()
          })
        })
        .catch(() => {})
        .finally(() => {
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
            this.initCanvas()
          })
        })
        .catch(() => {
          this.loading = false
        })
    },
    reDraw: throttle(function (e) {
      this.colWidth = (window.innerWidth - this.firstColWidth) / (this.selectedSetting.cumulationNames.length)
      this.initCanvas()
    }, 200),
    initCanvas () {
      let canvasStyleWidth = this.canvasWidth = window.innerWidth - this.firstColWidth
      let canvasStyleHeight = this.canvasHeight = this.$refs['record-table'].clientHeight

      this.canvas.style.width = canvasStyleWidth + 'px'
      this.canvas.style.height = canvasStyleHeight + 'px'
      this.canvas.width = canvasStyleWidth * this.ratio
      this.canvas.height = canvasStyleHeight * this.ratio
      this.drawLine()
    },
    drawLine () {
      const ratio = this.ratio
      const ctx = this.ctx
      let w = this.canvasWidth / (this.selectedSetting.cumulationNames.length) * ratio
      let h = this.canvasHeight / this.records.length * ratio
      const hitList = []
      const axis = []
      this.records.forEach((rec, i) => {
        let xIdx = rec.numbers.indexOf(0)
        hitList.push(xIdx)
        axis.push([xIdx * w + w / 2, i * h + h / 2])
      })
      ctx.beginPath()
      ctx.lineWidth = 1 * this.ratio
      axis.forEach(xy => {
        ctx.lineTo(xy[0], xy[1])
      })
      ctx.strokeStyle = '#166fd8'
      ctx.stroke()
      ctx.closePath()

      ctx.font = `${14 * this.ratio}px Avenir,Helvetica,Arial,sans-serif`
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'
      axis.forEach((xy, i) => {
        ctx.beginPath()
        ctx.fillStyle = '#166fd8'
        ctx.arc(xy[0], xy[1], 10 * this.ratio, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.fillText(this.selectedSetting.cumulationNames[hitList[i]], xy[0], xy[1] + 1 * this.ratio)
        ctx.closePath()
      })
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
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.reDraw)
  }
}
</script>
<style lang="less" scoped>
.container {
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
.total-section {
  flex: 0 0 auto;
}
.record-section {
  position: relative;
  flex: 1 1 auto;
  background: #f5f5f5;
  box-shadow: 0 0 10px rgba(0,0,0,.12) inset;
  overflow-y: auto;
  .canvas {
    position: absolute;
    top: 0;
    right: 0;
  }
}
.table {
  width: 100%;
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


