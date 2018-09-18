<template>
  <div class="intro-container" v-if="currentGame.id">
    <div class="title vux-1px-b" :class="contentType === 'history' ? 'left' : 'text-center'" >
      <span>{{currentGame.display_name}}</span>
      <span v-if="contentType === 'history'" class="date-picker">
        <datetime class="date-picker-input" v-model="date" @on-change="change"></datetime>
        <i class="solid-triangle point-down"></i>
      </span>
    </div>
    <component :is="showing"
      :gameCode="currentGame.code"
      :contentType="contentType"
      :currentGame="currentGame"
      :date="date"
      v-if="currentGame">
    </component>
  </div>
</template>

<script>
import { Datetime, dateFormat } from 'vux'

const cqlf = (resolve) => require(['@/screens/games/rules/cqlf'], resolve)
const gd11x5 = (resolve) => require(['@/screens/games/rules/gd11x5'], resolve)
const jsk3 = (resolve) => require(['@/screens/games/rules/jsk3'], resolve)
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

export default {
  name: 'GameIntro',
  props: {
    currentGame: {
      type: Object,
      default: function () {
        return {
          id: ''
        }
      }
    },
    contentType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      date: dateFormat(new Date(), 'YYYY-MM-DD')
    }
  },
  methods: {
    change (date) {
      this.date = date
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
        case 'history':
          return LotterRecord
        case 'intro':
          return this.currentGame.code
      }
    }
  },
  components: {
    cqlf,
    gd11x5,
    jsk3,
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
    Datetime,
    dateFormat
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';
@import '~vux/src/styles/1px.less';
.title {
  font-size: 16px;
  line-height: 40px;
  position: sticky;
  background-color: #f5f5f5;
  top: 0;
  z-index: 2;
  &.left {
    text-align: left;
    padding-left: 10px;
  }
}

.intro-container {
  background-color: #fff;
  height: calc(~"100% - "60px);
  padding: 0 0 60px;
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
  position: absolute;
  right: 0;
  width: 135px;
  height: 40px;
  &-input {
    padding: 0 5px 0 0;
  }
  .solid-triangle {
    position: absolute;
    border-top: 5px solid #999;
    top: 18px;
    right: 5px;
  }
}

.date-picker /deep/ .vux-cell-value {
  font-size: 14px;
}

.date-picker /deep/ .weui-cell {
  height: 40px;
  line-height: 40px;
}

.date-picker /deep/ .weui-cell_access .weui-cell__ft:after {
  transform: matrix(0, 0, 0, 0, 0, 0);
}

</style>
