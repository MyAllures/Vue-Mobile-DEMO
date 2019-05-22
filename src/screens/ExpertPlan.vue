<template>
  <div class="expert-plan-container">

    <div class="expert-panel">
      <div
        class="selector"
        @click="chooseExpert">
        <div class="desc">专家</div>
        <div class="text">{{selectedExpert.expert_name}}</div>
        <div class="arrow"></div>
      </div>
      <div class="win-rate">胜率：{{~~(selectedExpert.win_rate*100)}}%</div>
    </div>

    <div class="selector-area">
      <div
        class="selector"
        @click="choosePos">
        <div class="desc">位置</div>
        <div class="text">{{currentPosText}}</div>
        <div class="arrow"></div>
      </div>
      <div
        class="selector"
        @click="chooseScheme">
        <div class="desc">类型</div>
        <div class="text">{{currentSchemeText}}</div>
        <div class="arrow"></div>
      </div>
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
                  v-if="bettrackPositions&&plan.result.status==='待开'&&!gameInfo.isClosed&&plan.issue_numbers[0] === gameInfo.schedule.issueNumber"
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
import { mapState } from 'vuex'
const schemeTypeOptions = [
  { value: 'FIVE_NUM_FOR_SINGLE', text: '單期5碼' },
  { value: 'SIX_NUM_FOR_SINGLE', text: '單期6碼' },
  { value: 'FIVE_NUM_FOR_TRIPLE', text: '3期5碼' },
  { value: 'SIX_NUM_FOR_DOUBLE', text: '2期6碼' }
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
      positionOptions: setting[this.game.code].map((pos, i) => { return {text: pos, value: i + 1} }),
      selectedPositionIdx: 1,
      selectedSchemeType: 'FIVE_NUM_FOR_SINGLE',
      loading: false,
      planList: [],
      expertList: [],
      selectedExpert: {}
    }
  },
  computed: {
    ...mapState('game', {
      gameInfo: state => state
    }),
    bettrackPositions () {
      return this.$store.state.bettrackPositions[this.$route.params.gameId]
    },
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
    },
    currentPosText () {
      return this.positionOptions.find(o => o.value === this.selectedPositionIdx).text
    },
    currentSchemeText () {
      return schemeTypeOptions.find(o => o.value === this.selectedSchemeType).text
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
    choosePos (index) {
      if (this.loading) {
        return
      }
      const picker = this.$createPicker({
        data: [this.positionOptions],
        selectedIndex: [this.positionOptions.findIndex(o => o.value === this.selectedPositionIdx)],
        onSelect: (v) => {
          this.selectedPositionIdx = v[0]
        },
        onCancel: () => { },
        zIndex: 600
      })
      picker.show()
    },
    chooseScheme (type) {
      if (this.loading) {
        return
      }
      const picker = this.$createPicker({
        data: [schemeTypeOptions],
        selectedIndex: [schemeTypeOptions.findIndex(o => o.value === this.selectedSchemeType)],
        onSelect: (v) => {
          this.selectedSchemeType = v[0]
        },
        onCancel: () => { },
        zIndex: 600
      })
      picker.show()
    },
    openBettrackDialog (data) {
      let period = ''
      switch (data.issue_numbers.length) {
        case 1:
          period = '单期'
          break
        case 2:
          period = '两期'
          break
        case 3:
          period = '三期'
          break
      }
      this.$store.dispatch('updateDialog', {
        name: 'bettrack',
        state: {
          visible: true,
          data: {
            bet_amount: 10,
            forDisplay: {
              play_code_pattern: this.currentSetting[this.selectedPositionIdx - 1],
              selectedSchedules: data.issue_numbers,
              type: period
            },
            game_schedule: this.gameInfo.schedule.id,
            play_code_pattern: this.bettrackPositions.positions[this.selectedPositionIdx - 1].play_code_pattern,
            track_numbers: data.prediction,
            type: this.selectedPositionIdx
          },
          isSuccess: false
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
    .win-rate {
      color: @red;
      font-size: 14px;
      padding-right: 10px;
    }
  }

  .selector-area {
    z-index: 1;
    display: flex;
    flex: 0 0 auto;
    box-sizing: border-box;
    height: 44px;
    width: 100%;
    background: #fff;
    border-bottom: 2px solid #eee;
    border-top: 2px solid #eee;
    color: #666;
    font-size: 13px;
    overflow: hidden;
    .selector {
      border-right: 1px solid #e9e9e9;
    }
  }
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
