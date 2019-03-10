<template>
  <div :class="['intro-container', contentType]">
    <div class="title vux-1px-b" :class="contentType === 'history' ? 'left' : 'text-center'" >
      <span v-if="contentType!=='roadbeads' && contentType!=='trend'">{{currentGame.display_name}}</span>
      <template v-if="contentType === 'history'">
        <div v-if="currentGame.code === 'hkl' || currentGame.code === 'fc3d'" class="date-picker">
          <date-selector class="date-picker-input" :z-index="600" v-model="date" :max-date="new Date()" :column-count="2"></date-selector>
          <i class="solid-triangle point-down"></i>
        </div>
        <div v-else class="date-picker">
          <date-selector class="date-picker-input" :z-index="600" :max-date="new Date()" v-model="date"></date-selector>
          <i class="solid-triangle point-down"></i>
        </div>
      </template>
    </div>
    <component :is="showing"
      :gameCode="currentGame.code"
      :gameName="currentGame.display_name"
      :contentType="contentType"
      :currentGame="currentGame"
      :date="date">
    </component>
  </div>
</template>

<script>
import DateSelector from '@/components/DateSelector'
const cqlf = (resolve) => require(['@/screens/games/rules/cqlf'], resolve)
const cs10fc = (resolve) => require(['@/screens/games/rules/cs10fc'], resolve)
const cs5fc = (resolve) => require(['@/screens/games/rules/cs5fc'], resolve)
const cs600cr = (resolve) => require(['@/screens/games/rules/cs600cr'], resolve)
const cs600hkl = (resolve) => require(['@/screens/games/rules/cs600hkl'], resolve)
const csjndhkl = (resolve) => require(['@/screens/games/rules/csjndhkl'], resolve)
const gd11x5 = (resolve) => require(['@/screens/games/rules/gd11x5'], resolve)
const jsk3 = (resolve) => require(['@/screens/games/rules/jsk3'], resolve)
const msk3 = (resolve) => require(['@/screens/games/rules/msk3'], resolve)
const bjk3 = (resolve) => require(['@/screens/games/rules/bjk3'], resolve)
const mlaft = (resolve) => require(['@/screens/games/rules/mlaft'], resolve)
const gdklsf = (resolve) => require(['@/screens/games/rules/gdklsf'], resolve)
const bcr = (resolve) => require(['@/screens/games/rules/bcr'], resolve)
const jsssc = (resolve) => require(['@/screens/games/rules/jsssc'], resolve)
const jspk10 = (resolve) => require(['@/screens/games/rules/jspk10'], resolve)
const cqssc = (resolve) => require(['@/screens/games/rules/cqssc'], resolve)
const pcdd = (resolve) => require(['@/screens/games/rules/pcdd'], resolve)
const luckdd = (resolve) => require(['@/screens/games/rules/luckdd'], resolve)
const hkl = (resolve) => require(['@/screens/games/rules/hkl'], resolve)
const luckl = (resolve) => require(['@/screens/games/rules/luckl'], resolve)
const cshkl = (resolve) => require(['@/screens/games/rules/cshkl'], resolve)
const xjssc = (resolve) => require(['@/screens/games/rules/xjssc'], resolve)
const tjssc = (resolve) => require(['@/screens/games/rules/tjssc'], resolve)
const csffc = (resolve) => require(['@/screens/games/rules/csffc'], resolve)
const bjkl8 = (resolve) => require(['@/screens/games/rules/bjkl8'], resolve)
const er75ft = (resolve) => require(['@/screens/games/rules/er75ft'], resolve)
const auluck8 = (resolve) => require(['@/screens/games/rules/auluck8'], resolve)
const jnd28 = (resolve) => require(['@/screens/games/rules/jnd28'], resolve)
const fc3d = (resolve) => require(['@/screens/games/rules/fc3d'], resolve)
const cs60cr = (resolve) => require(['@/screens/games/rules/cs60cr'], resolve)
const GameStatistic = (resolve) => require(['@/screens/games/GameStatistic'], resolve)
const LotterRecord = (resolve) => require(['@/screens/LotterRecord'], resolve)
const TrendDiagram = (resolve) => require(['@/screens/TrendDiagram'], resolve)

export default {
  name: 'GameIntro',
  components: {
    cs10fc,
    cs5fc,
    cs600cr,
    cs600hkl,
    cqlf,
    gd11x5,
    jsk3,
    msk3,
    bjk3,
    mlaft,
    gdklsf,
    bcr,
    jsssc,
    jspk10,
    cqssc,
    pcdd,
    luckdd,
    hkl,
    luckl,
    cshkl,
    csjndhkl,
    xjssc,
    tjssc,
    csffc,
    bjkl8,
    er75ft,
    auluck8,
    jnd28,
    fc3d,
    cs60cr,
    GameStatistic,
    LotterRecord,
    DateSelector
  },
  props: {
    currentGame: {
      type: Object
    },
    contentType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      date: this.currentGame.code === 'hkl' || this.currentGame.code === 'fc3d' ? this.$moment().format('YYYY-MM') : this.$moment().format('YYYY-MM-DD')
    }
  },
  computed: {
    showing () {
      let type = this.contentType
      switch (type) {
        case 'roadbeads':
          return GameStatistic
        case 'leaderboard':
          return GameStatistic
        case 'trend':
          return TrendDiagram
        case 'history':
          return LotterRecord
        case 'intro':
          return this.currentGame.code
      }
    }
  }
}
</script>

<style lang="less" scoped>
@import '~vux/src/styles/1px.less';
.title {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  position: sticky;
  line-height: 40px;
  background-color: #f5f5f5;
  top: 0;
  z-index: 2;
  &.left {
    justify-content: flex-start;
    padding-left: 10px;
  }
}

.intro-container {
  background-color: #fff;
  // height: calc(~"100% - "60px);
  padding: 0 0 60px;
  &.roadbeads {
    background-color: #f5f5f5;
  }
  &.trend {
    box-sizing: border-box;
    height: 100%;
  }
}

.rule-details {
  padding: 10px;
  font-size: 14px;
  height: calc(~"100% - "60px);
  overflow: auto;
  line-height: 2.0;
  color: #4a4a4a;
  letter-spacing: 1.6px;
  /deep/ .warn {
    color: @red;
  }
  /deep/ h3 {
    font-size: 14px;
    font-weight: normal;
  }
  /deep/ li {
    margin-left: 20px;
    list-style: initial;
    word-wrap: break-word;
  }
  /deep/ a {
    text-decoration: underline;
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
</style>
