<template>
  <div class="gameplays">
    <div class="playgroup-odds" v-if="!activePlay"> {{ groupName }}</div>
    <div class="playgroup-odds" v-else> 賠率：<span class="red">{{activePlay.odds}}</span></div>
    <div
      class="playgroup-content"
      v-for="(options, index) in [customOptions]"
      :key="index">
      <div
        :class="['play-wrapper','text-center', {active: option.active && !gameClosed}]"
        :style="{width: `calc(${100/(zodiacs ? 1 : 5)}%)`}"
        v-for="(option, index) in options"
        :key="index"
        @click="toggleActive(option)">
       <div class="play-area" v-if="zodiacs">
          <span class="play-name">{{option.displayName}}
            <span class="play-odds">{{option.odds}}</span>
          </span>
          <span class="play-nums">
            <span :class="`play-num result-${gameCode} resultnum-${num}`" v-for="num in zodiacMap&&zodiacMap[option.displayName]" :key="num"></span>
          </span>
        </div>
        <div class="play-area" v-else>
          <div :class="`result-${gameCode} resultnum-${option.num}`">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'shixaZdc',
  props: {
    gameCode: {
      type: String
    },
    plays: {
      type: Array
    },
    gameClosed: {
      type: Boolean
    },
    playReset: {
      type: Boolean
    },
    setting: {
      type: Object
    },
    groupName: {
      type: String
    },
    zodiacMap: {
      type: Object
    }
  },
  data () {
    const rawOptions = []
    _.each(this.setting.options, option => {
      rawOptions.push({
        num: option,
        active: false
      })
    })
    const playMap = {}
    this.plays.forEach(play => {
      playMap[play.rules.max_opts] = play
    })

    return {
      rawOptions,
      valid: false,
      zodiacs: this.plays[0].rules.choices ? this.plays[0].rules.choices : '',
      playMap
    }
  },
  computed: {
    customOptions () {
      if (this.zodiacs) {
        _.each(this.rawOptions, (option) => {
          option.displayName = this.zodiacs[option.num]
        })
      }
      return this.rawOptions
    },
    activedOptions () {
      return _.filter(this.customOptions, option => {
        return option.active
      })
    },
    activePlay () {
      const activePlay = this.playMap[this.activedOptions.length]
      if (activePlay) {
        return activePlay
      }
    }
  },
  watch: {
    'activedOptions': function () {
      this.updateForSubmit()
    },
    'playReset': function () {
      _.each(this.customOptions, option => {
        option.active = false
      })
    }
  },
  methods: {
    updateForSubmit () {
      let numbers = this.activedOptions.map(option => option.num)
      let rules = this.activePlay ? this.activePlay.rules : ''
      this.valid = rules && numbers.length >= rules.min_opts

      this.$emit('updateCustomPlays', {
        activePlayId: this.activePlay ? this.activePlay.id : '',
        options: _.map(this.activedOptions, (option) => option.displayName ? option.displayName : option.num),
        combinations: ['1'],
        activedOptions: _.map(this.activedOptions, (option) => { return { num: option.displayName ? option.displayName : option.num } }),
        valid: this.valid
      })
    },
    toggleActive (option) {
      if (this.gameClosed) {
        return false
      }
      option.active = !option.active
    }
  }
}
</script>

<style lang="less" scoped>

.odds {
  width: 100%;
  line-height: 40px;
  height: 40px;
  text-align: center;
  font-size: 14px;
}
</style>
