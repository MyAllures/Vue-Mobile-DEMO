<template>
  <div class="expert-plan-container">
    <div class="tab">
      <div
        :class="['tab-item', {active: selectedPositionIdx===index}]"
        v-for="(pos, index) in currentSetting"
        :key="index"
        @click="choosePosIdx(index)">{{pos}}</div>
    </div>
    <div class="tab">
      <div
        v-for="sceme in schemeTypeList"
        :key="sceme.type"
        :class="['tab-item', {active: selectedSchemeType===sceme.type}]"
        @click="chooseScheme(sceme.type)">{{sceme.label}}</div>
    </div>
  </div>
</template>
<script>
import {setting} from '@/utils/expertPlanSetting'
const schemeTypeList = [
  {type: 'FIVE_NUM_FOR_SINGLE', label: '單期5碼'},
  {type: 'SIX_NUM_FOR_SINGLE', label: '單期6碼'},
  {type: 'FIVE_NUM_FOR_TRIPLE', label: '3期5碼'},
  {type: 'SIX_NUM_FOR_DOUBLE', label: '2期6碼'}
]
export default {
  name: 'ExpertPlan',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      schemeTypeList,
      currentSetting: setting[this.game.code],
      selectedSchemeType: 'FIVE_NUM_FOR_SINGLE'
    }
  },
  methods: {
    choosePosIdx (index) {
      this.selectedPosIdx = index
    },
    chooseScheme (type) {
      this.selectedSchemeType = type
    }
  }
}
</script>

<style lang="less" scoped>
.expert-plan-container {
  display: flex;
  height: 100%;
  flex-direction: column;
  .tab {
    flex: 0;
    display: flex;
    height: 50px;
    background: #f5f5f5;
    .tab-item {
      box-sizing: border-box;
      flex: 1;
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
}
</style>
