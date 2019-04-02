<template>
  <div class="expert-plan-container">
    <div class="expert-panel">
      <div class="expert-selector" @click="chooseExpert">
        {{selectedExpert.expert_name}}
        <i class="solid-triangle point-down"></i>
      </div>
      <div class="win-rate">胜率：{{~~(selectedExpert.win_rate*100)}}%</div>
    </div>

    <div class="tab">
      <div
        :class="['tab-item', {active: selectedPositionIdx===index+1}]"
        v-for="(pos, index) in currentSetting"
        :key="index"
        @click="choosePosIdx(index+1)">{{pos}}</div>
    </div>
    <div class="tab">
      <div
        v-for="sceme in schemeTypeList"
        :key="sceme.type"
        :class="['tab-item', {active: selectedSchemeType===sceme.type}]"
        @click="chooseScheme(sceme.type)">{{sceme.label}}</div>
    </div>
    <div class="plan-section">
      <div class="table-wrapper">
        <table v-if="planList&&planList.length>0" class="table">
          <thead class="thead">
            <tr v-if="planList[0].issue_number_short.length<2">
              <th class="first-col" width="16%" >期</th>
              <th width="16%">期号</th>
              <th width="34%">预测</th>
              <th width="12%">结果</th>
              <th width="22%"></th>
            </tr>
            <tr v-else>
              <th class="first-col" width="32%">期号</th>
              <th width="34%">预测</th>
              <th width="12%">结果</th>
              <th width="22%"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="row" v-for="plan in planList" :key="plan.id">
              <template v-if="plan.issue_number_short.length < 2">
                <td class="first-col">{{plan.plan_number}}</td>
              </template>
              <td :class="plan.issue_number_short.length >= 2?'first-col':''">
                <template v-for="(num,index) in plan.issue_number_short">{{num}}<template v-if="index !== plan.issue_number_short.length-1">-</template></template>
              </td>
              <td class="prediction-result">
                <template v-for="(num, numIdx) in plan.prediction">
                  <span :key="numIdx" :class="{'red': plan.result.win_bet && plan.result.win_bet === num}">{{num}}</span>
                  <template v-if="numIdx!==plan.prediction.length-1">,</template>
                </template>
              </td>
              <td>
                  <span v-if="plan.result.win_bet" :class="['box', 'result', 'expert-result-'+game.code, 'resultnum-'+plan.result.win_bet]">{{plan.result.win_bet}}</span>
                  <span v-else-if="plan.result.status == '挂'" class="box miss">{{plan.result.status}}</span>
                  <span v-else class="box">{{plan.result.status}}</span>
              </td>
              <td class="btn">
                <x-button
                  mini
                  v-if="plan.result.status==='待开'"
                  type="primary"
                  @click.native="openBettrackDialog(plan)">追投
                </x-button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-block">暂无数据</div>
      </div>
    </div>
  </div>
</template>
<script>
import { setting } from '@/utils/expertPlanSetting'
import { fetchExpertPlan } from '@/api'
import '@/styles/expertplan_resultsball.scss'
import {XButton} from 'vux'
const schemeTypeList = [
  { type: 'FIVE_NUM_FOR_SINGLE', label: '單期5碼' },
  { type: 'SIX_NUM_FOR_SINGLE', label: '單期6碼' },
  { type: 'FIVE_NUM_FOR_TRIPLE', label: '3期5碼' },
  { type: 'SIX_NUM_FOR_DOUBLE', label: '2期6碼' }
]
export default {
  name: 'ExpertPlan',
  props: {
    game: {
      type: Object,
      required: true
    }
  },
  components: {
    XButton
  },
  data () {
    return {
      schemeTypeList,
      currentSetting: setting[this.game.code],
      selectedPositionIdx: 1,
      selectedSchemeType: 'FIVE_NUM_FOR_SINGLE',
      loading: false,
      planList: [],
      expertList: [],
      selectedExpert: {}
    }
  },
  computed: {
    conditions () {
      const conditions = {
        game: this.game.code,
        scheme_type: this.selectedSchemeType,
        position: this.selectedPositionIdx
      }
      return conditions
    },
    expertOptions () {
      return this.expertList.map(expert => {
        return {
          text: expert.expert__name,
          value: expert.expert__id
        }
      })
    }
  },
  watch: {
    'conditions': {
      handler: function (conditions) {
        this.loading = true
        this.fetchExpertPlan(conditions)
      },
      immediate: true
    }
  },
  methods: {
    fetchExpertPlan (conditions) {
      this.loading = true
      fetchExpertPlan(conditions).then(res => {
        this.expertList = res.all_expert
        this.planList = res.cur_plans
        this.selectedExpert = res.cur_expert
      }).catch(() => {

      }).finally(() => {
        this.loading = false
      })
    },
    chooseExpert () {
      const picker = this.$createPicker({
        data: [this.expertOptions],
        selectedIndex: [this.expertOptions.findIndex(o => o.value === this.selectedExpert.expert_id)],
        onSelect: (v) => {
          let selectedExpert = this.expertList.find(expert => expert.expert__id === v[0])
          this.selectedExpert = {
            expert_id: selectedExpert.expert__id,
            expert_name: selectedExpert.expert__name,
            win_rate: selectedExpert.rate
          }
          this.fetchExpertPlan({ ...this.conditions, expert: selectedExpert.expert__id })
        },
        onCancel: () => { },
        zIndex: 600
      })
      picker.show()
    },
    choosePosIdx (index) {
      if (this.loading) {
        return
      }
      this.selectedPositionIdx = index
    },
    chooseScheme (type) {
      if (this.loading) {
        return
      }
      this.selectedSchemeType = type
    },
    openBettrackDialog (data) {
      this.$store.dispatch('updateDialog', {
        name: 'expert_bettrack',
        state: {
          visible: true,
          data: {
            game: data.game,
            issue_numbers: data.issue_numbers,
            position: this.selectedPositionIdx,
            bet_numbers: data.prediction
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.expert-plan-container {
  display: flex;
  height: 100%;
  flex-direction: column;
  color: #333;
  .expert-panel {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
    padding: 0 10px;
    .expert-selector {
      display: flex;
      align-items: center;
      font-size: 18px;
      .solid-triangle {
        border-top: 5px solid #666;
        margin-left: 5px;
      }
    }
    .win-rate {
      color: @red;
      font-size: 14px;
    }
  }
  .tab {
    flex: 0 0 auto;
    display: flex;
    height: 50px;
    background: #fff;
    .tab-item {
      box-sizing: border-box;
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding-bottom: 3px;
      border-bottom: 2px solid;
      border-color: #f5f5f5;
      color: #999999;
      &.active {
        color: @azul;
        border-color: @azul;
      }
    }
  }
  .plan-section {
    flex: 1 1 auto;
    box-sizing: border-box;
    box-shadow: 0 5px 10px -5px rgba(0,0,0,.12) inset;
    overflow-y: auto;
    background: #eeeeee;
    .table-wrapper {
      position: relative;
      box-sizing: border-box;
      padding-bottom: 60px;
    }
    .table {
      .miss {
        color: #999;
      }
    }
    .table {
      width: 100%;
      text-align: left;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 14px;
      margin-top: 10px;
      td {
        vertical-align: middle;
      }
      th {
        box-sizing: border-box;
        height: 30px;
        line-height: 30px;
        color: #666666;
        background: #eeeeee;
      }
      .row {
        height: 40px;
        background-color: #ffffff;
        border-bottom: 2px solid #eee;
        .btn {
          text-align: center;
        }
      }
      .data {
        border: none;
        font-size: 14px;
      }
      .box {
        display: inline-block;
        width: 30px;
        text-align: center;
      }
      .first-col {
        padding-left: 15px;
      }
      .prediction-result {
        span {
          font-size: 16px;
          @media screen and (max-width: 320px) {
            font-size: 14px;
          }
        }
      }
    }

    .empty-block {
      width: 100%;
      padding-top: 20px;
      font-size: 13px;
      text-align: center;
      color: #666;
    }
  }
}


</style>
