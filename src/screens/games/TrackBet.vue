<template>
  <div class="tracker-area vux-1px-l">
    <div class="positions m-b-lg">
      <p class="title">追号位置</p>
      <div class="wrapper position-wrapper">
        <div :class="['position',
          'option', 'm-t',
          { 'active': position.play_code_pattern === betTrackData.play_code_pattern }]"
          @click="betTrackData.play_code_pattern = position.play_code_pattern; betTrackData.forDisplay.play_code_pattern = position.display_name"
          v-for="(position, index) in playpositions.data"
          :key="index">
          {{position.display_name}}
        </div>
      </div>
    </div>
    <div class="types m-b-lg">
      <p class="title">追号期数</p>
      <div class="wrapper">
        <div :class="['type',
          'option', 'm-t',
          {active: betTrackData.type === type.value}]"
          @click="betTrackData.type = type.value; betTrackData.forDisplay.type = type.text"
          v-for="(type, index) in types" :key="index">
          {{type.text}}
        </div>
      </div>
      <div class="preview m-t-sm">
        <transition name="slide-fade">
          <p v-show="!scheduleChanging && selectedSchedules.length">
            <span class="schedule-text" v-for="(s, i) in selectedSchedules" :key="i">{{s}}</span>{{betTrackData.forDisplay.type}}
          </p>
        </transition>
      </div>
    </div>
    <div class="numbers m-b-lg">
      <p class="title m-b">追号号码</p>
      <div class="wrapper">
        <div :class="['num-box', 'option', 'm-t',
          {active: betTrackData.track_numbers.includes(num)}]"
           v-for="(num, index) in trackOptions[game.code].tracks" :key="index" @click="handleOptionClick(num)">
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
import {loadLastTrack, saveLastTrack} from '../../utils'

const trackOptions = {
  bcr: {
    tracks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    positionNum: 10
  },
  jspk10: {
    tracks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    positionNum: 10
  },
  cs60cr: {
    tracks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    positionNum: 10
  },
  er75ft: {
    tracks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    positionNum: 10
  },
  mlaft: {
    tracks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    positionNum: 10
  },
  xjssc: {
    tracks: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    positionNum: 5
  },
  cqssc: {
    tracks: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    positionNum: 5
  },
  jsssc: {
    tracks: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    positionNum: 5
  },
  tjssc: {
    tracks: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    positionNum: 5
  }
}

export default {
  props: {
    game: {
      type: Object
    },
    schedules: {
      type: Array
    },
    playReset: {
      type: Boolean,
      default: false
    }
  },
  data () {
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
      betTrackData: {
        type: 1,
        track_numbers: [],
        play_code_pattern: '',
        forDisplay: {
          type: '单期'
        }
      },
      scheduleChanging: false
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
        type: this.types[0].value,
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
      let placeholder = Array.from(new Array(this.trackOptions[this.game.code].positionNum)).map(() => { return {} })

      const categories = this.$store.state.categories[this.$route.params.gameId]
      if (!categories || categories.length === 0) {
        return {data: placeholder}
      }
      let currentCategory = find(categories, item => (item.id + '') === 'playpositions')
      return currentCategory ? currentCategory.playpositions : {data: placeholder}
    },
    selectedSchedules () {
      return take(map(this.schedules, s => s.issue_number), this.betTrackData.type)
    },
    betTrackDialog () {
      return this.$store.state.dialog.bettrack
    }
  },
  updated () {
    saveLastTrack(this.game.id, this.betTrackData)
    this.$emit('updateBetTrackData', this.betTrackData)
  },
  watch: {
    'betTrackDialog.isSuccess': function (isSuccess) {
      if (isSuccess) {
        this.init()
      }
    },
    'selectedSchedules': function (selectedSchedules) {
      this.betTrackData.forDisplay.selectedSchedules = selectedSchedules
    },
    'schedules': {
      handler: function (newSchedules, oldSchedules) {
        if (oldSchedules && newSchedules && oldSchedules[0] && newSchedules[0] && (oldSchedules[0].id !== newSchedules[0].id)) {
          this.scheduleChanging = true
        }
      },
      deep: true
    },
    'playReset': function () {
      this.init()
    },
    'scheduleChanging': function () {
      if (this.scheduleChanging) {
        setTimeout(() => { this.scheduleChanging = !this.scheduleChanging }, 1000)
      }
    },
    'playpositions': {
      handler: function (playpositions) {
        if (playpositions && playpositions.max_opts) {
          const existingData = loadLastTrack(this.game.id)
          if (existingData) {
            this.betTrackData = existingData
          }

          if (!this.betTrackData.play_code_pattern) {
            this.betTrackData.play_code_pattern = playpositions.data[0].play_code_pattern
            this.betTrackData.forDisplay.play_code_pattern = playpositions.data[0].display_name
          }
          if (!this.betTrackData.type) {
            this.betTrackData.type = this.types[0].value
            this.betTrackData.forDisplay.type = this.types[0].text
          }
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="less" scoped>
.tracker-area {
  font-size: 14px;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 15px;
}

.wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.position-wrapper {
  justify-content: flex-start;
}

.title {
  width: 100%;
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
  width: calc(~"(100% - 50px) / 5");
  height: 10vw;
  line-height: 10vw;
  @media screen and (min-width: 360px) {
    &:not(:nth-child(5n)) {
    margin-right: 10px;
    }
    &:nth-child(5n) {
      margin-right: 0px;
    }
  }
  @media screen and (max-width: 359px) {
    width: calc(~"(100% - 26px) / 3");
    &:nth-child(3n - 1) {
      margin-right: 10px;
      margin-left: 10px;
    }
  }

  &:empty {
    background-color: #f0f0f0;
  }
}

.schedule-text {
  &:not(:last-child) {
    &:after {
      content: ', '
    }
  }
}

.type {
  width: calc(~"(100% - 26px) / 3");
  height: 36px;
  line-height: 36px;
}

.preview {
  height: 25px;
  overflow-y: visible;
  color: #333333;
  font-weight: 500;
}

.num-box {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: calc(~"(100% - 26px) / 3");
  height: 15vw;
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
