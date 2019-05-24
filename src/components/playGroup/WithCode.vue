<template>
  <div class="gameplays">
    <div class="playgroup-odds">赔率：<span class="red">{{activeOdds}}</span></div>
    <div class="playgroup-content" v-for="(options, index) in viewCustomOptions" :key="index">
      <div
        :class="['play-wrapper', {active: option.active && !gameClosed}]"
        :style="{width: `calc(${100/calcCol(options.length)}%)`}"
        v-for="(option, index) in options"
        :key="index"
        @click="toggleActive(option)">
        <div class="play-area">
          <div :class="`box-center play result-${gameCode} resultnum-${option.num}`">
            <span class="num">{{option.num}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from 'lodash'
import Combinatorics from 'js-combinatorics'
export default {
  name: 'WithCode',
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
    }
  },
  data () {
    const customOptions = []
    this.setting.options.forEach(option => {
      customOptions.push({
        num: option,
        active: false
      })
    })
    return {
      customOptions,
      combinations: [],
      valid: false
    }
  },
  computed: {
    activedOptions () {
      return _.filter(this.customOptions, option => {
        return option.active
      })
    },
    activePlay () {
      return this.plays[0]
    },
    activeOdds () {
      if (this.plays.length > 1) {
        let odds = []
        this.plays.forEach(play => { odds.push(play.odds) })
        return odds.join('/')
      } else {
        return this.plays[0].odds
      }
    },
    viewCustomOptions () {
      let length = this.customOptions.length
      if (length % 3 === 1) {
        return [this.customOptions.slice(0, length - 4), this.customOptions.slice(length - 4, length - 2), this.customOptions.slice(length - 2, length)]
      } else if (length % 3 === 2) {
        return [this.customOptions.slice(0, length - 2), this.customOptions.slice(length - 2, length)]
      } else {
        return [this.customOptions]
      }
    }
  },
  watch: {
    'activedOptions': function () {
      this.calculateCombinations()
    },
    'playReset': function () {
      this.customOptions.forEach(option => {
        option.active = false
      })
      this.combinations.length = 0
    }
  },
  methods: {
    calcCol (len) {
      return len === 2 ? 2 : 3
    },
    calculateCombinations () {
      let numbers = this.activedOptions.map(option => option.num)
      let rules = this.activePlay.rules
      if (rules && numbers.length >= rules.min_opts) {
        this.combinations = Combinatorics.combination(numbers, rules.min_opts).toArray()
        this.valid = true
      } else {
        this.combinations.length = 0
        this.valid = false
      }
      this.$emit('updateCustomPlays', {
        activePlayId: this.activePlay.id,
        options: this.activedOptions.join(','),
        combinations: this.combinations,
        activedOptions: this.activedOptions,
        valid: this.valid
      })
    },
    toggleActive (option) {
      if (this.gameClosed) {
        return false
      }
      let rules = this.activePlay.rules
      if (!option.active && rules) {
        if (this.activedOptions.length < rules.max_opts) {
          option.active = true
        }
      } else {
        option.active = false
      }
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
