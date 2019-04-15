<template>
  <popup
    :value="visible"
    @on-hide="$emit('update:visible', false)"
    height="90%"
    v-transfer-dom
    :zIndex="200">
      <div :class="['info-content', type]">
        <component :is="showing" :game="game">
        </component>
        <div class="btn-wrapper vux-1px-t">
          <x-button class="button-close" type="primary" @click.native="$emit('update:visible', false)">返回游戏</x-button>
        </div>
      </div>
  </popup>
</template>

<script>
import { Popup, XButton, TransferDom } from 'vux'
const GameIntro = (resolve) => require(['@/screens/games/GameIntro'], resolve)
const RoadBeads = (resolve) => require(['@/screens/games/RoadBeads'], resolve)
const Leaderboards = (resolve) => require(['@/screens/games/Leaderboards'], resolve)
const LotterRecord = (resolve) => require(['@/screens/LotterRecord'], resolve)
const TrendDiagram = (resolve) => require(['@/screens/TrendDiagram'], resolve)
const ExpertPlan = (resolve) => require(['@/screens/ExpertPlan'], resolve)
const ChatManage = (resolve) => require(['@/screens/ChatManage'], resolve)

export default {
  name: 'GameInfo',
  props: {
    game: {
      type: Object
    },
    type: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Popup,
    XButton,
    TransferDom
  },
  computed: {
    showing () {
      let type = this.type
      switch (type) {
        case 'roadbeads':
          return RoadBeads
        case 'leaderboard':
          return Leaderboards
        case 'trend':
          return TrendDiagram
        case 'history':
          return LotterRecord
        case 'intro':
          return GameIntro
        case 'expertplan':
          return ExpertPlan
        case 'chatmanage':
          return ChatManage
      }
    }
  }
}
</script>

<style lang="less" scoped>
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

.info-content {
  box-sizing: border-box;
  background-color: #fff;
  height: 100%;
  overflow-y: auto;
  &.roadbeads {
    background-color: #f5f5f5;
  }
  &.trend {
    box-sizing: border-box;
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

.btn-wrapper {
  background: #fff;
  width: 100%;
  position: fixed;
  bottom: 0;
  padding: 10px 0;
  height: 40px;
  left: 0;
  z-index: 2;
  button {
    width: 90%;
    margin: auto;
  }
}
</style>
