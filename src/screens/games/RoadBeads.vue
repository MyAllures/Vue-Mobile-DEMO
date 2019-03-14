<template>
  <div class="roadbead-container">
    <div class="selector-area">
      <template v-if="subOptionMap">
        <div
          class="selector"
          @click="chooseMainName">
          <div class="desc">位置</div>
          <div class="text">{{mainName || '请选择'}}</div>
          <div class="arrow"></div>
        </div>
        <div
          class="selector"
          @click="chooseSubName">
          <div class="desc">玩法</div>
          <div class="text">{{subName || '请选择'}}</div>
          <div class="arrow"></div>
        </div>
      </template>
      <div
        v-else
        class="selector full"
        @click="chooseMainName">
        <div class="desc">玩法</div>
        <div class="text">{{mainName || '请选择'}}</div>
        <div class="arrow"></div>
      </div>
    </div>
    <div class="diagram-area">
      <div class="diagram-header">
        <div v-if="hasMoreRoad" class="title">大路</div>
        <div class="cumulative-panel">
          <div class="text">累计次数</div>
          <div class="count" v-for="option in cumulatives" :key="option.key">
            <span :class="option.key">{{option.key|typeFilter}}: </span>
            {{option.num||0}}
          </div>
        </div>
      </div>
      <div class="trend-diagram-wrapper" ref="daRoad" @touchstart="daRoadUsing = true" @touchend="daRoadUsing = false">
        <table class="trend-diagram daRoad">
          <tbody>
            <tr v-if="mainName==='总和色波'">
              <td width="4%" class="column" v-for="(num, index) in 25" :key="index">
                <template v-for="(k,i) in daRoadList[index]">
                  <div v-if="['red','blue','green'].includes(k)" :class="['hollow-ball', k]" :key="i"></div>
                  <div v-else class="font" :key="i">{{k}}</div>
                </template>
              </td>
            </tr>
            <tr v-else-if="mainName==='五行'">
              <td width="4%" class="column" v-for="(num, index) in 25" :key="index">
                <div class="font" v-for="(k,i) in daRoadList[index]" :key="i">{{k|typeFilter}}</div>
              </td>
            </tr>
            <tr v-else>
              <td width="4%" class="column" v-for="(num, index) in 25" :key="index">
                <div :class="['hollow-ball', k]" v-for="(k,i) in daRoadList[index]" :key="i"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <template v-if="hasMoreRoad">
        <div class="diagram-header">
          <div class="title">大眼仔路</div>
        </div>
        <div class="trend-diagram-wrapper" ref="bigEyeRoad" @touchstart="bigEyeRoadUsing = true" @touchend="bigEyeRoadUsing = false">
          <table class="trend-diagram bigEyeRoad">
            <tbody>
              <tr v-for="(row, rowIndex) in Math.max(6,...bigEyeRoadList.map(l=>l.length))" :key="rowIndex">
                <td width="4%" class="column" v-for="(col, colIndex) in 25" :key="colIndex">
                  <div v-if="bigEyeRoadList[colIndex]&&bigEyeRoadList[colIndex][rowIndex]!==undefined" :class="`hollow-ball num${bigEyeRoadList[colIndex][rowIndex]}`"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="diagram-header">
          <div class="title">小路</div>
        </div>
        <div class="trend-diagram-wrapper" ref="smallRoad" @touchstart="smallRoadUsing = true" @touchend="smallRoadUsing = false">
          <table class="trend-diagram smallRoad">
            <tbody>
              <tr v-for="(row, rowIndex) in Math.max(6,...smallRoadList.map(l=>l.length))" :key="rowIndex">
                <td width="4%" class="column" v-for="(col, colIndex) in 25" :key="colIndex">
                  <div v-if="smallRoadList[colIndex]&&smallRoadList[colIndex][rowIndex]!==undefined" :class="`solid-ball num${smallRoadList[colIndex][rowIndex]}`"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="diagram-header">
          <div class="title">曱甴路</div>
        </div>
        <div class="trend-diagram-wrapper" ref="beetleRoad" @touchstart="beetleRoadUsing = true" @touchend="beetleRoadUsing = false">
          <table class="trend-diagram beetleRoad">
            <tbody>
              <tr v-for="(row, rowIndex) in Math.max(6,...beetleRoadList.map(l=>l.length))" :key="rowIndex">
                <td width="4%" class="column" v-for="(col, colIndex) in 25" :key="colIndex">
                  <div v-if="beetleRoadList[colIndex]&&beetleRoadList[colIndex][rowIndex]!==undefined" :class="`slash num${beetleRoadList[colIndex][rowIndex]}`"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="diagram-header">
          <div class="title">珠盘路</div>
        </div>
        <div class="trend-diagram-wrapper" ref="jupanRoad" @touchstart="jupanRoadUsing = true" @touchend="jupanRoadUsing = false">
          <table class="trend-diagram jupanRoad">
            <tbody>
              <tr v-for="rowIndex in Array.from(Array(6).keys())" :key="rowIndex">
                <td width="4%" class="column" v-for="colIndex in Array.from(Array(25).keys())" :key="colIndex">
                  <div v-if="jupanRoadList[colIndex]&&jupanRoadList[colIndex][rowIndex]!==undefined" :class="['solid-ball', jupanRoadList[colIndex][rowIndex]]"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import gameTranslator from '../../utils/gameTranslator'
import { fetchStatistic } from '@/api'
import { settings, hasNotSubOption, hasMoreRoad, isSeriesSSC } from '../../utils/roadBeadSetting'
import _ from 'lodash'

const nameSort = (a, b) => {
  let order
  a = a.key
  b = b.key
  if (['dragon', 'tiger'].includes(a)) {
    order = ['dragon', 'tiger', 'equal']
  } else if (['bigger', 'smaller'].includes(a)) {
    order = ['bigger', 'smaller']
  } else if (['odd', 'even'].includes(a)) {
    order = ['odd', 'even']
  } else if (['gold', 'wood', 'water', 'fire', 'earth'].includes(a)) {
    order = ['gold', 'wood', 'water', 'fire', 'earth']
  } else if (['front_part_more', 'rear_part_more', 'equal'].includes(a)) {
    order = ['front_part_more', 'rear_part_more', 'equal']
  } else if (['odd_more', 'even_more', 'equal'].includes(a)) {
    order = ['odd_more', 'even_more', 'equal']
  }
  if (order) {
    return order.indexOf(a) - order.indexOf(b)
  } else {
    return -1
  }
}

export default {
  name: 'RoadBeads',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      hasNotSubOption: hasNotSubOption(this.game.code),
      hasMoreRoad: hasMoreRoad(this.game.code),
      isSeriesSSC: isSeriesSSC(this.game.code),
      resultStatistic: null,
      daRoadUsing: false,
      bigEyeRoadUsing: false,
      smallRoadUsing: false,
      beetleRoadUsing: false,
      jupanRoadUsing: false,
      mainOptions: null,
      cumulativeMap: {}, // 路珠統計
      subOptionMap: null,
      mainName: '',
      subName: '',
      daRoadMap: {},
      bigEyeRoadMap: {},
      smallRoadMap: {},
      beetleRoadMap: {},
      jupanRoadMap: {},
      tableSetting: {
        jspk10: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        bcr: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        mlaft: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        er75ft: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        jsssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        tjssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        xjssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        cqssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        csffc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        gd11x5: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
        cqlf: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        gdklsf: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
      }
    }
  },
  filters: {
    fullDigits (val) {
      return val ? val < 10 ? `0${val}` : val : 0
    },
    typeFilter (value) {
      switch (value) {
        case 'dragon':
          return '龙'
        case 'tiger':
          return '虎'
        case 'bigger':
        case 'tailbigger':
          return '大'
        case 'smaller':
        case 'tailsmaller':
          return '小'
        case 'odd':
        case 'sumodd':
          return '单'
        case 'sumeven':
        case 'even':
          return '双'
        case 'equal':
          return '和'
        case 'blue':
          return '蓝'
        case 'red':
          return '红'
        case 'green':
          return '绿'
        case 'outOfDefinition':
          return '无'
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
          return '前'
        case 'rear_part_more':
          return '后'
        case 'odd_more':
          return '单'
        case 'even_more':
          return '双'
        case 'leopard':
          return '豹子'
      }
      return value
    }
  },
  computed: {
    theme () {
      return this.$store.state.theme
    },
    subOptions () {
      let mainName = this.mainName
      if (!mainName) {
        return []
      }
      if (!this.subOptionMap) {
        return []
      }
      return this.subOptionMap[mainName]
    },
    cumulatives () {
      if (!this.cumulativeMap || !this.mainName) {
        return []
      }
      let results
      if (!this.subName) {
        results = this.cumulativeMap[this.mainName]
      } else {
        results = this.cumulativeMap[this.mainName][this.subName]
      }
      if (Array.isArray(results)) {
        return results.sort(nameSort)
      }
      return []
    },
    daRoadList () {
      if (!this.daRoadMap || !this.mainName) {
        return []
      }
      let results
      if (!this.subName) {
        results = this.daRoadMap[this.mainName]
      } else {
        results = this.daRoadMap[this.mainName][this.subName]
      }
      if (Array.isArray(results)) {
        return [...results].reverse()
      }
      return []
    },
    bigEyeRoadList () {
      if (!this.bigEyeRoadMap || !this.mainName) {
        return []
      }
      let results
      if (!this.subName) {
        results = this.bigEyeRoadMap[this.mainName]
      } else {
        results = this.bigEyeRoadMap[this.mainName][this.subName]
      }
      if (Array.isArray(results)) {
        return [...results].reverse()
      }
      return []
    },
    smallRoadList () {
      if (!this.smallRoadMap || !this.mainName) {
        return []
      }
      let results
      if (!this.subName) {
        results = this.smallRoadMap[this.mainName]
      } else {
        results = this.smallRoadMap[this.mainName][this.subName]
      }
      if (Array.isArray(results)) {
        return [...results].reverse()
      }
      return []
    },
    beetleRoadList () {
      if (!this.beetleRoadMap || !this.mainName) {
        return []
      }
      let results
      if (!this.subName) {
        results = this.beetleRoadMap[this.mainName]
      } else {
        results = this.beetleRoadMap[this.mainName][this.subName]
      }
      if (Array.isArray(results)) {
        return [...results].reverse()
      }
      return []
    },
    jupanRoadList () {
      if (!this.jupanRoadMap || !this.mainName) {
        return []
      }
      let results
      if (!this.subName) {
        results = this.jupanRoadMap[this.mainName]
      } else {
        results = this.jupanRoadMap[this.mainName][this.subName]
      }
      if (Array.isArray(results)) {
        return [...results].reverse()
      }
      return []
    }
  },
  watch: {
    'subOptions': function (subOptions) {
      if (subOptions.length) {
        this.subName = subOptions[0].value
      }
    },
    'daRoadList': function (list) {
      if (this.daRoadUsing) {
        return
      }
      const table = this.$refs.daRoad
      if (table) {
        let totalWidth = window.innerWidth
        let nowTd = table.querySelectorAll('.column')[list.length - 1]
        let currentPos = nowTd.offsetLeft + 24
        if (currentPos > totalWidth) {
          table.scrollLeft = currentPos - totalWidth
        }
      }
    },
    'bigEyeRoadList': function (list) {
      if (this.bigEyeRoadUsing) {
        return
      }
      const table = this.$refs.bigEyeRoad
      if (table) {
        let totalWidth = window.innerWidth
        let nowTd = table.querySelectorAll('.column')[list.length - 1]
        let currentPos = nowTd.offsetLeft + 24
        if (currentPos > totalWidth) {
          table.scrollLeft = currentPos - totalWidth
        }
      }
    },
    'smallRoadList': function (list) {
      if (this.smallRoadUsing) {
        return
      }
      const table = this.$refs.smallRoad
      if (table) {
        let totalWidth = window.innerWidth
        let nowTd = table.querySelectorAll('.column')[list.length - 1]
        let currentPos = nowTd.offsetLeft + 24
        if (currentPos > totalWidth) {
          table.scrollLeft = currentPos - totalWidth
        }
      }
    },
    'beetleRoadList': function (list) {
      if (this.beetleRoadUsing) {
        return
      }
      const table = this.$refs.beetleRoad
      if (table) {
        let totalWidth = window.innerWidth
        let nowTd = table.querySelectorAll('.column')[list.length - 1]
        let currentPos = nowTd.offsetLeft + 24
        if (currentPos > totalWidth) {
          table.scrollLeft = currentPos - totalWidth
        }
      }
    },
    'jupanRoadList': function (list) {
      if (this.jupanRoadUsing) {
        return
      }
      const table = this.$refs.jupanRoad
      if (table) {
        let totalWidth = window.innerWidth
        let nowTd = table.querySelectorAll('.column')[list.length - 1]
        let currentPos = nowTd.offsetLeft + 24
        if (currentPos > totalWidth) {
          table.scrollLeft = currentPos - totalWidth
        }
      }
    }
  },
  created () {
    this.fetchStatistic().then(() => {
      this.handleData(true)
    }).catch(() => {})
    this.pollStatistic()
  },
  methods: {
    fetchStatistic () {
      const code = this.game.code
      this.loading = true
      return fetchStatistic(code).then(result => {
        this.resultStatistic = {
          resultSingleStatistic: result.result_single_statistic,
          daRoadStatistic: result.result_category_statistic,
          bigEyeRoadStatistic: result.result_category_statistic_bigeyeroad,
          smallRoadStatistic: result.result_category_statistic_littleroad,
          beetleRoadStatistic: result.result_category_statistic_beetleroad,
          jupanRoadStatistic: result.result_category_statistic_jupanroad
        }
        this.loading = false
      })
    },
    pollStatistic () {
      this.interval = setInterval(() => {
        this.fetchStatistic().then(() => {
          this.handleData()
        }).catch(() => {})
      }, 60000)
    },
    chooseMainName (item) {
      const picker = this.$createPicker({
        data: [this.mainOptions],
        selectedIndex: [this.mainOptions.findIndex(o => o.value === this.mainName)],
        onSelect: (v) => {
          this.mainName = v[0]
        },
        onCancel: () => { },
        zIndex: 600
      })
      picker.show()
    },
    chooseSubName () {
      const picker = this.$createPicker({
        data: [this.subOptions],
        selectedIndex: [this.subOptions.findIndex(o => o.value === this.subName)],
        onSelect: (v) => {
          this.subName = v[0]
        },
        onCancel: () => { },
        zIndex: 600
      })
      picker.show()
    },
    handleData (isFirst) {
      const resultSingleStatistic = this.resultStatistic.resultSingleStatistic
      const daRoadStatistic = this.resultStatistic.daRoadStatistic
      const bigEyeRoadStatistic = this.resultStatistic.bigEyeRoadStatistic
      const smallRoadStatistic = this.resultStatistic.smallRoadStatistic
      const beetleRoadStatistic = this.resultStatistic.beetleRoadStatistic
      const jupanRoadStatistic = this.resultStatistic.jupanRoadStatistic
      let dragonTigerSpecial

      // if game in ssc series the dragon_tiger would become dragon_tiger_equal
      if (this.isSeriesSSC) {
        dragonTigerSpecial = '龙虎和'
      } else {
        dragonTigerSpecial = '龙虎'
      }

      let translator = gameTranslator[this.game.code]
      let keys = settings[this.game.code]

      const mainOptions = []
      const subOptionMap = {}
      const cumulativeMap = {}
      const daRoadMap = {}
      const bigEyeRoadMap = {}
      const smallRoadMap = {}
      const beetleRoadMap = {}
      const jupanRoadMap = {}

      _.each(keys, (key) => {
        let translated = translator(key)
        let title = translated[0]
        let type
        let resultSingle = resultSingleStatistic[key]
        let daRoadStatisticArrs = daRoadStatistic[key]
        let bigEyeRoadStatisticArrs = bigEyeRoadStatistic[key]
        let smallRoadStatisticArrs = smallRoadStatistic[key]
        let beetleRoadStatisticArrs = beetleRoadStatistic[key]
        let jupanRoadStatisticArrs = jupanRoadStatistic[key]
        if (key.includes('sum_number_odd_even')) {
          type = '合数单双'
        } else if (key.includes('tail_than_size')) {
          type = '尾数大小'
        } else if (key.includes('odd_even')) {
          type = '单双'
        } else if (key.includes('than_size')) {
          type = '大小'
        } else if (key.includes('dragon_tiger')) {
          type = dragonTigerSpecial
        } else if (key.includes('color_wavelength')) {
          type = '色波'
        }

        if (resultSingle['outOfDefinition']) {
          delete resultSingle['outOfDefinition']
        }

        if (this.hasNotSubOption) {
          let mainKey
          if (title === '总和') {
            mainKey = title + type
          } else {
            mainKey = title
          }
          if (isFirst) {
            mainOptions.push({ text: mainKey, value: mainKey })
          }
          let arr = []
          cumulativeMap[mainKey] = arr
          Object.keys(resultSingle).forEach(key => {
            arr.push({ key, num: resultSingle[key] })
          })

          daRoadMap[mainKey] = daRoadStatisticArrs
          bigEyeRoadMap[mainKey] = bigEyeRoadStatisticArrs
          smallRoadMap[mainKey] = smallRoadStatisticArrs
          beetleRoadMap[mainKey] = beetleRoadStatisticArrs
          jupanRoadMap[mainKey] = jupanRoadStatisticArrs
        } else {
          let mainKey = title
          let subKey = type
          let options
          let cumulativeObj
          let daRoadObj
          let bigEyeRoadObj
          let smallRoadObj
          let beetleRoadObj
          let jupanRoadObj
          if (subOptionMap[mainKey]) {
            options = subOptionMap[mainKey]
            cumulativeObj = cumulativeMap[mainKey]
            daRoadObj = daRoadMap[mainKey]
            bigEyeRoadObj = bigEyeRoadMap[mainKey]
            smallRoadObj = smallRoadMap[mainKey]
            beetleRoadObj = beetleRoadMap[mainKey]
            jupanRoadObj = jupanRoadMap[mainKey]
          } else {
            if (isFirst) {
              mainOptions.push({ text: mainKey, value: mainKey })
            }
            options = []
            cumulativeObj = {}
            daRoadObj = {}
            bigEyeRoadObj = {}
            smallRoadObj = {}
            beetleRoadObj = {}
            jupanRoadObj = {}
            subOptionMap[mainKey] = options
            cumulativeMap[mainKey] = cumulativeObj
            daRoadMap[mainKey] = daRoadObj
            bigEyeRoadMap[mainKey] = bigEyeRoadObj
            smallRoadMap[mainKey] = smallRoadObj
            beetleRoadMap[mainKey] = beetleRoadObj
            jupanRoadMap[mainKey] = jupanRoadObj
          }
          options.push({ text: type, value: type })
          let arr = []
          cumulativeObj[subKey] = arr
          Object.keys(resultSingle).forEach(key => {
            arr.push({ key, num: resultSingle[key] })
          })

          daRoadObj[subKey] = daRoadStatisticArrs
          bigEyeRoadObj[subKey] = bigEyeRoadStatisticArrs
          smallRoadObj[subKey] = smallRoadStatisticArrs
          beetleRoadObj[subKey] = beetleRoadStatisticArrs
          jupanRoadObj[subKey] = jupanRoadStatisticArrs
        }
      })
      if (isFirst) {
        this.mainOptions = mainOptions
        if (!this.hasNotSubOption) {
          this.subOptionMap = subOptionMap
        }
        this.mainName = this.mainOptions[0].value
      }
      this.cumulativeMap = cumulativeMap
      this.daRoadMap = daRoadMap
      this.bigEyeRoadMap = bigEyeRoadMap
      this.smallRoadMap = smallRoadMap
      this.beetleRoadMap = beetleRoadMap
      this.jupanRoadMap = jupanRoadMap
    }
  }
}
</script>

<style lang="less" scoped>

.ball () {
  box-sizing: border-box;
  border: 3px solid;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin: 3px auto;
}
.roadbead-container {
  height: 100%;
  .selector-area {
    z-index: 1;
    display: flex;
    box-sizing: border-box;
    height: 40px;
    width: 100%;
    background: #fff;
    border-bottom: 2px solid #eee;
    color: #666;
    font-size: 13px;
    overflow: hidden;
    .selector {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      width: 50%;
      &.full {
        width: 100%;
      }
      color: #424242;
      .desc {
        flex: 0 0 auto;
        height: 100%;
        width: 45px;
        line-height: 40px;
        font-size: 12px;
        font-weight: lighter;
        text-align: center;
        color: #999;
      }
      .text {
        flex: 1 0 auto;
        height: 100%;
        line-height: 40px;
        text-align: center;
      }
      .arrow {
        flex: 0 0 auto;
        box-sizing: border-box;
        width: 40px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        border-right: 1px solid #e9e9e9;
        &::after {
          display: inline-block;
          content: "";
          border-style: solid;
          border-width: 6px 6px 0 6px;
          border-color: #166fd8 rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)
            rgba(0, 0, 0, 0);
        }
      }
    }
  }
  .diagram-area {
    box-sizing: border-box;
    height: calc(~"100%" - 40px);
    overflow-y: auto;
    padding-bottom: 60px;

  }

  .diagram-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 10px 16px 5px 16px;
    font-size: 14px;
    .cumulative-panel {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #424242;
      margin-left: auto;
      .text {
        font-weight: lighter;
      }
      .count {
        margin-left: 10px;
      }
    }
  }

  .trend-diagram-wrapper {
    width: 100%;
    overflow-x: scroll;
    .trend-diagram {
      width: 600px;
      border-collapse: collapse;
      &.daRoad {
        min-height: 140px;
        background: #fcfcfc;
        .column {
          border: 1px solid #e6e6e6;
          box-sizing: border-box;
          padding-bottom: 16px;
          vertical-align: top;
          .font {
            width: 20px;
            height: 20px;
            line-height: 20px;
            text-align: center;
            border-radius: 50%;
            margin: 3px auto;
          }
        }
      }
      .solid-ball {
        .ball();
      }
      .hollow-ball {
        .ball();
        background-color: #fcfcfc;
      }
      .slash {
        height: 3px;
        width: 20px;
        border-radius: 1px;
        transform-origin: center;
        transform: translateY(14px) rotate(-45deg);
        margin: 0 auto;
      }

      &.bigEyeRoad,&.smallRoad,&.beetleRoad,&.jupanRoad {
        min-height: 140px;
        .column {
          border: 1px solid #e6e6e6;
          box-sizing: border-box;
          vertical-align: top;
          height: 31px;
        }
      }
    }
  }

  .dragon,
  .sumodd,
  .odd,
  .odd_more,
  .bigger,
  .tailbigger,
  .front_part_more,
  .num1 {
    color: @red;
    border-color: @red;
  }
  .tiger,
  .sumeven,
  .even,
  .even_more,
  .smaller,
  .tailsmaller,
  .rear_part_more,
  .num0 {
    color: @azul;
    border-color: @azul;
  }
  .equal {
    color: @green;
    border-color: @green;
  }
  .solid-ball {
    &.dragon,
    &.sumodd,
    &.odd,
    &.odd_more,
    &.bigger,
    &.tailbigger,
    &.front_part_more,
    &.num1 {
      background: @red;
    }
    &.tiger,
    &.sumeven,
    &.even,
    &.even_more,
    &.smaller,
    &.tailsmaller,
    &.rear_part_more,
    &.num0 {
      background: @azul;
    }
    &.equal {
      background: @green;
    }
  }
  .slash {
    &.num0 {
      background: @azul;
    }
    &.num1 {
      background: @red;
    }
  }
}
</style>
