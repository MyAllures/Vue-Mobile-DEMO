<template>
  <div class="intro-container" v-if="currentGame.id">
    <div class="title vux-1px-b" :class="contentType === 'history' ? 'left' : 'text-center'" >
      <span>{{currentGame.display_name}}</span>
      <span v-if="contentType === 'history'" class="date-picker">
        <datetime class="date-picker-input" v-model="date" @on-change="change"></datetime>
        <icon class="caret-down arrow" name="caret-down"></icon>
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
import cqlf from './rules/cqlf'
import gd11x5 from './rules/gd11x5'
import jsk3 from './rules/jsk3'
import mlaft from './rules/mlaft'
import gdklsf from './rules/gdklsf'
import bcr from './rules/bcr'
import jsssc from './rules/jsssc'
import jspk10 from './rules/jspk10'
import cqssc from './rules/cqssc'
import pcdd from './rules/pcdd'
import luckdd from './rules/luckdd'
import hkl from './rules/hkl'
import luckl from './rules/luckl'
import xjssc from './rules/xjssc'
import tjssc from './rules/tjssc'
import csffc from './rules/csffc'
import bjkl8 from './rules/bjkl8'
import er75ft from './rules/er75ft'
import auluck8 from './rules/auluck8'
import jnd28 from './rules/jnd28'
import fc3d from './rules/fc3d'
import GameStatistic from './GameStatistic'
import LotterRecord from '../LotterRecord'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/caret-down'
import { Datetime, dateFormat } from 'vux'

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
    GameStatistic,
    LotterRecord,
    Icon,
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
  .arrow {
    position: absolute;
    width: 20px;
    right: 0;
    top: 12px;
    color: #aaa;
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
