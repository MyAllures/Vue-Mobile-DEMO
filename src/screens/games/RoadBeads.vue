<template>
  <div>
    <div :class="['statistics', 'm-b', {'full-width': statistics.length === 0}]">
      <ul class="consolidation-grid">
        <li class="item" v-for="num in currentTableSetting" :key="num">
          <div class="number text-center">{{num | fullDigits}}</div>
          <div class="result text-center" v-if="currentTab">{{currentTab[num] | fullDigits}}</div>
        </li>
      </ul>
      <group title="累计次数">
        <cell :title="item.key | typeFilter" v-for="(item, index) in cumulative" :key="index">
          <div>
            <span class="cumulative-number">{{item.value | fullDigits}}</span>
          </div>
        </cell>
      </group>
      <group>
        <cell v-for="(datas, groupIndex) in currentHistory" :key="groupIndex" class="item-cell">
          <span v-for="(data, index) in datas" :key="index">{{data | typeFilter}} </span>
        </cell>
      </group>
    </div>
    <div :class="['historydata-selector', {'full-width': statistics.length === 0}]" >
      <tab v-if="currentHistoryTag.length"
          :style="{width: currentHistoryTag.length > 5 ? `${currentHistoryTag.length * 75}px` : ''}"
          bar-active-color="#156fd8"
          active-color="#156fd8" >
        <tab-item v-for="(item, index) in  currentHistoryTag"
          @on-item-click="changeActiveHistoryTag(item)"
          :key="index"
          :selected="item.key === activeHistoryTag">
          <span :class="{'ellipsis': currentHistoryTag.length > 5}">{{item.key}}</span>
        </tab-item>
      </tab>
    </div>
    <div class="aside" v-if="statistics.length > 0">
      <ul :cols="1">
        <li class="category" v-for="(item, index) in statistics" :key="index" @click="changeActiveName(item)">
          <span :class="['text', {'active' : item.label === activeName}]">{{item.label}}</span>
        </li>
      </ul>
    </div>
    <x-address style="display: none"
      title="请选择"
      v-model="activeHistoryTagForXAddress"
      :list="currentHistoryTagForXAddress"
      @on-hide="handleSelectorHide"
      :show.sync="showHistorySelector">
    </x-address>
  </div>
</template>

<script>
import { Group, Cell, Flexbox, FlexboxItem, Tab, TabItem, XTable, Sticky, XAddress, GridItem, Grid } from 'vux'
import gameTranslator from '../../utils/gameTranslator'
import _ from 'lodash'

export default {
  name: 'RoadBeads',
  props: {
    gameCode: {
      type: String
    },
    resultStatistic: {
      type: Object
    }
  },
  data () {
    return {
      statistics: [],
      statisticsMap: {},
      activeName: '',
      historyTag: [],
      historyMap: {},
      activeHistoryTag: '',
      tableSetting: {
        jspk10: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        bcr: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        mlaft: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        er75ft: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        jsssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        tjssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        xjssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        cqssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        gd11x5: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
        cqlf: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
        gdklsf: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
      },
      panelSetting: {
        '单双': ['odd', 'even'],
        '大小': ['bigger', 'smaller'],
        '龙虎': ['dragon', 'tiger'],
        '龙虎和': ['dragon', 'tiger', 'equal'],
        '总和大小': ['bigger', 'smaller'],
        '总和单双': ['odd', 'even'],
        '尾数大小': ['bigger', 'smaller'],
        '总和尾数大小': ['bigger', 'smaller'],
        '合数单双': ['odd', 'even'],
        '总和色波': ['red', 'blue', 'green'],
        '五行': ['gold', 'wood', 'water', 'fire', 'earth'],
        '前后和': ['front_part_more', 'rear_part_more'],
        '单双和': ['odd_more', 'even_more']
      },
      currentHistoryTag: [],
      currentHistory: [],
      cumulative: '',
      showHistorySelector: false,
      activeHistoryTagForXAddress: [this.activeHistoryTagIndex + '']
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
          return '大'
        case 'smaller':
          return '小'
        case 'odd':
          return '单'
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
  methods: {
    changeActiveName (item) {
      this.activeName = item.key
      this.createHistoryTag()
      this.createHistoryData()
      this.createCumulative()
    },
    changeActiveHistoryTag (item) {
      this.activeHistoryTag = item.key
      this.createHistoryData()
      this.createCumulative()
    },
    handleSelectorHide (checked) {
      if (checked) {
        this.activeHistoryTag = this.currentHistoryTag[this.activeHistoryTagForXAddress[0]].key
        this.createHistoryData()
        this.createCumulative()
      }
    },
    createHistoryTag () {
      this.currentHistoryTag = _.filter(this.historyTag, (tag) => {
        return this.historyMap[tag.key] || this.historyMap[this.activeName][tag.key]
      }).sort((item) => {
        if (item.key.includes('总和')) {
          return 1
        } else {
          return -1
        }
      })

      if (!this.historyMap[this.activeHistoryTag]) {
        // for games have no aside bar
        if (!this.activeName) {
          this.activeHistoryTag = this.currentHistoryTag[0].key
          return
        }
        // normal games
        this.activeHistoryTag = !this.historyMap[this.activeName][this.activeHistoryTag] ? this.currentHistoryTag[0].key : this.activeHistoryTag
      }
    },
    createHistoryData () {
      let arr
      if (this.historyMap[this.activeHistoryTag]) {
        arr = this.historyMap[this.activeHistoryTag]
      } else {
        arr = this.historyMap[this.activeName][this.activeHistoryTag]
      }
      if (!arr) {
        this.currentHistory = []
        return []
      } else {
        this.currentHistory = arr
      }
    },
    createCumulative () {
      let keys = this.panelSetting[this.activeHistoryTag]
      let values
      if (this.statisticsMap[this.activeHistoryTag]) {
        values = this.statisticsMap[this.activeHistoryTag]
      } else {
        values = this.statisticsMap[this.activeName]
      }

      let cumulative = []
      _.each(keys, (key, index) => {
        cumulative.push({
          key: keys[index],
          value: values[keys[index]]
        })
      })
      this.cumulative = cumulative
    }
  },
  computed: {
    currentTab () {
      return this.statisticsMap[this.activeName]
    },
    currentTableSetting () {
      if (!this.gameCode) {
        return []
      } else if (this.activeName === '冠、亚军和') {
        return ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
      } else {
        return this.tableSetting[this.gameCode]
      }
    },
    currentHistoryTagForXAddress () {
      let formatted = []
      _.each(this.currentHistoryTag, (item, index) => {
        formatted.push({
          name: item.key,
          value: index + ''
        })
      })
      return formatted
    },
    activeHistoryTagIndex () {
      return this.activeHistoryTag ? _.findIndex(this.currentHistoryTag, o => o.key === this.activeHistoryTag) + '' : '0'
    }

  },
  watch: {
    'activeHistoryTag': function () {
      this.activeHistoryTagForXAddress[0] = this.activeHistoryTagIndex
    },
    'resultStatistic': {
      handler: function (resultStatistic) {
        const resultSingleStatistic = resultStatistic.resultSingleStatistic
        const historyStatistic = resultStatistic.historyStatistic
        let dragonTigerSpecial

        // if game in ssc series the dragon_tiger would become dragon_tiger_equal
        if (this.gameCode.includes('ssc')) {
          dragonTigerSpecial = '龙虎和'
        } else {
          dragonTigerSpecial = '龙虎'
        }

        let translator
        if (this.gameCode === 'auluck8') {
          translator = gameTranslator['auluck8Statistic']
        } else {
          translator = gameTranslator[this.gameCode]
        }
        let keys = Object.keys(resultSingleStatistic)
        const statisticsMap = {}
        const statistic = []
        _.each(keys, (key) => {
          if (key.includes('weird_chinese_dice_rules')) {
            return
          }
          let translated = translator(key)
          let title = translated[0]
          if (!title) {
            return
          }

          let type
          let resultSingle = resultSingleStatistic[key]
          if (key.includes('odd_even')) {
            type = '单双'
          } else if (key.includes('than_size')) {
            type = '大小'
          } else if (key.includes('dragon_tiger')) {
            type = dragonTigerSpecial
          } else if (key.includes('color_wavelength')) {
            type = '色波'
          }
          if (title === '总和') {
            statisticsMap[title + type] = resultSingle
          } else if (title === '五行') {
            statisticsMap[title] = resultSingle
          } else if (title === '前后和') {
            statisticsMap[title] = resultSingle
          } else if (title === '单双和') {
            statisticsMap[title] = resultSingle
          } else {
            let obj
            if (statisticsMap[title]) {
              obj = statisticsMap[title]
            } else {
              obj = { key: title, label: title }
              statistic.push(obj)
              statisticsMap[title] = obj
            }
            let types = Object.keys(resultSingle)

            if (types.length === 0) {
              return
            }
            _.each(types, (type) => {
              let num = resultSingle[type]
              if (translated[1]) {
                type = translated[1] + type
              }

              obj[type] = num
            })
          }
        })
        this.statistics = statistic
        this.statisticsMap = statisticsMap

        keys = Object.keys(historyStatistic)
        const historyMap = {}
        const historyTag = []
        const tagSet = new Set()
        _.each(keys, (key) => {
          if (key.includes('weird_chinese_dice_rules')) {
            return
          }
          let type
          let translated = translator(key)
          let title = translated[0]

          if (!title) {
            return
          }

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
          let historyStatisticArrs = historyStatistic[key]

          if (title === '总和') {
            type = title + type
            historyMap[type] = historyStatisticArrs
          } else if (title === '五行') {
            type = title
            historyMap[title] = historyStatisticArrs
          } else if (title === '前后和') {
            type = title
            historyMap[title] = historyStatisticArrs
          } else if (title === '单双和') {
            type = title
            historyMap[title] = historyStatisticArrs
          } else {
            let obj
            if (historyMap[title]) {
              obj = historyMap[title]
            } else {
              obj = { key: title, label: title }
              historyMap[title] = obj
            }
            obj[type] = historyStatisticArrs
          }
          if (type && !tagSet.has(type)) {
            historyTag.push({ key: type, label: type })
            tagSet.add(type)
          }
        })

        if (statistic.length > 0 && !this.activeName) {
          // for initial
          this.activeName = statistic[0].key
        } else {
          this.activeName = _.findIndex(statistic, o => o.key === this.activeName) === -1 ? statistic.length ? statistic[0].key : '' : this.activeName
        }

        this.historyTag = historyTag
        this.historyMap = historyMap

        this.createHistoryTag()
        this.createHistoryData()
        this.createCumulative()
      }
    },
    deep: true
  },
  components: {
    Group, Cell, Flexbox, FlexboxItem, Tab, TabItem, XTable, Sticky, XAddress, Grid, GridItem
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';
@headHeight: 45px;

.larger480(@rules) {
    @media (min-width: 481px) { @rules(); }
}

.historydata-selector {
  position: fixed;
  right: 0;
  margin-top: @headHeight;
  width: calc(~"100% - @{asideWidth}");
  overflow: scroll;
  &.full-width {
    width: 100%;
  }
  .ellipsis {
    white-space: nowrap;
    display: block;
    width: 75px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

@asideWidth: 100px;

.aside {
  position: fixed;
  display: flex;
  align-items: center;
  bottom: 0;
  width: @asideWidth;
  height: calc(~"100% - @{headHeight}*2"); // for fixed header & game-selector
  overflow-y: auto;
  background-color: #f9f9f9;
  box-sizing: border-box;
  border-width: 0 4px 0 0;
  border-style: solid;
  border-image: linear-gradient(to right, rgba(0, 0, 0, 0.2), transparent) 1 100%;
  .text {
    margin-left: 5px;
    color: #9b9b9b;
    &.active {
      color: black;
      font-weight: bold;
    }
  }
  ul {
    width: 100%;
    border-bottom: 1px solid #d8d8d8;
  }
  .category {
    height: 40px;
    line-height: 40px;
    text-align: center;
    width: 100%;
    border-top: 1px solid #d8d8d8;
  }
  .weui-grid {
    padding: 10px;
  }
}
.cumulative-number {
  color: #888888
}
.statistics {
  position: absolute;
  height: calc(~"100% - @{headHeight}*2");
  overflow-y: auto;
  right: 0;
  padding-top: @headHeight * 2;
  width: calc(~"100% - @{asideWidth}");
  &.full-width {
    width: 100%;
  }
}

.consolidation-grid {
  background-color: #fff;
  .item {
    display: inline-block;
    box-sizing: border-box;
    border-right: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    height: 50px;
    width: 100% / 3;
    .larger480({
       width: 100% / 5;
    });
  }
  .number, .result {
    color: #666;
    display: inline-block;
    line-height: 50px;
  }
  .result {
    font-size: 14px;
    width: (11/ 18) * 100%; // from design
    color: #999;
  }
  .number {
    font-size: 18px;
    font-weight: 600;
    margin-left: 5px;
  }
}
.item-cell {
  padding: 5px 10px;
  font-size: 14px;
}
</style>



