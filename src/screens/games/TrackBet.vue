<template>
  <div class="tracker-area">
    <div class="positions m-b-lg">
      <p class="title">追号位置</p>
      <div class="wrapper">
        <template v-if="playpositions && playpositions.data && playpositions.data.length">
          <div :class="['position',
            'option', 'm-r', 'm-t',
            { 'active': position.play_code_pattern === betTrackData.play_code_pattern }]"
            @click="betTrackData.play_code_pattern = position.play_code_pattern; betTrackData.forDisplay.play_code_pattern = position.display_name"
            v-for="(position, index) in playpositions.data"
            :key="index">
            {{position.display_name}}
          </div>
        </template>
      </div>
    </div>
    <div class="types m-b-lg">
      <p class="title">追号类型</p>
      <div :class="['type',
        'option', 'm-r', 'm-t',
        {active: betTrackData.type === type.value}]"
        @click="betTrackData.type = type.value; betTrackData.forDisplay.type = type.text"
        v-for="(type, index) in types" :key="index">
        {{type.text}}
      </div>
      <p class="preview m-t-sm">
        <span v-for="(s, i) in selectedSchedules" :key="i">
          {{s.issue_number + '期 '}}
        </span>
      </p>
    </div>
    <div class="numbers m-b-lg">
      <p class="title m-b">追号号码</p>
      <div class="wrapper">
        <div :class="['num-box', 'option',
          {active: betTrackData.track_numbers.includes(num)}]"
           v-for="(num, index) in trackOptions[game.code]" :key="index" @click="handleOptionClick(num)">
          <div class="number" :class="[`result-${game.code}`, `resultnum-${num}`, 'result']">
            <span class="num">{{num}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {indexOf, find, take, map} from 'lodash'
const trackOptions = {
  bcr: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  jspk10: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  cs60cr: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  er75ft: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  mlaft: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  xjssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  cqssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  jsssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  tjssc: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
}
export default {
  props: {
    game: {
      type: Object
    },
    schedules: {
      type: Array
    }
  },
  data () {
    let existingData = localStorage.getItem(`bettrack-${this.game.code}`)
    let initialData = {
      game_schedule: 0,
      type: 0,
      bet_amount: 0,
      track_numbers: [],
      play_code_pattern: '',
      forDisplay: {
        type: '',
        play_code_pattern: '',
        selectedSchedules: []
      }
    }
    let betTrackData
    let item = JSON.parse(existingData)
    if (item) {
      betTrackData = {...item}
    } else {
      betTrackData = initialData
    }
    return {
      types: [
        {
          text: '单期',
          value: 1
        },
        {
          text: '两期',
          value: 2
        },
        {
          text: '三期',
          value: 3
        }
      ],
      trackOptions,
      initialData,
      betTrackData
    }
  },
  methods: {
    handleOptionClick (num) {
      if (this.betTrackData.track_numbers.includes(num)) {
        let index = indexOf(this.betTrackData.track_numbers, num)
        this.betTrackData.track_numbers.splice(index, 1)
      } else {
        if (this.betTrackData.track_numbers.length === this.playpositions.max_opts) {
          return
        }
        this.betTrackData.track_numbers.push(num)
      }
    },
    init () {
      const initedData = {
        game_schedule: Number(this.validSchedules[0].id),
        type: this.types[0].value,
        bet_amount: 0,
        track_numbers: [],
        play_code_pattern: this.playpositions.data[0].play_code_pattern,
        forDisplay: {
          type: this.types[0].text,
          play_code_pattern: this.playpositions.data[0].display_name,
          selectedSchedules: []
        }
      }
      this.$set(this, 'betTrackData', initedData)
    }
  },
  computed: {
    playpositions () {
      const categories = this.$store.state.categories[this.$route.params.gameId]
      if (!categories || categories.length === 0) {
        return undefined
      }
      let currentCategory = find(categories, item => (item.id + '') === 'playpositions')
      return currentCategory ? currentCategory.playpositions : []
    },
    selectedSchedules () {
      let selectedSchedules = take(this.validSchedules, this.betTrackData.type)
      this.betTrackData.forDisplay.selectedSchedules = selectedSchedules
      return selectedSchedules
    },
    validSchedules () {
      return map(this.schedules, (s) => { return {issue_number: s.issue_number, id: s.id} })
    },
    betTrackDialog () {
      return this.$store.state.dialog.bettrack
    }
  },
  updated () {
    localStorage.setItem(`bettrack-${this.game.code}`, JSON.stringify(this.betTrackData) || this.initialData)
    this.$emit('updateBetTrackData', this.betTrackData)
  },
  watch: {
    'betTrackDialog.isSuccess': function (isSuccess) {
      if (isSuccess) {
        this.init()
      }
    },
    'validSchedules': {
      handler: function (schedules) {
        if (schedules.length) {
          this.betTrackData.game_schedule = Number(this.validSchedules[0].id)
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
@azul: #166fd8;

.tracker-area {
  font-size: 14px;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 15px;
}

.title {
  color: #666;
}

.option {
  display: inline-block;
  color: #333333;
  background-color: #fff;
  text-align: center;
  border: 1px solid #ddd;
}

.position {
  width: calc(~"20% - "12px);  // (100% - 20px - 40px ) / 5
  height: 10vw;
  line-height: 10vw;
  @media screen and (max-width: 359px) {
    width: calc(~"33% - "12px);
  }
}

.type {
  width: calc(~"30% -"4px);
  height: 36px;
  line-height: 36px;

}

.preview {
  color: #333333;
  font-weight: 500;
}

.num-box {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: calc(~"33% - "5px);
  height: 15vw;
  margin-right: 2px;
  margin-top: 2px;
  &:active {
    background-color: #eee;
    border: 1px solid #eee;
  }
  .number {
    transform: scale(1.5);
  }
}

.active {
  background-color: @azul;
  color: #fff;
  border: 1px solid @azul;
}
</style>
