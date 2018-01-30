<template>
  <div class="gameplays">
    <div class="playgroup-odds">赔率：<span class="red">{{activePlay.odds}}</span></div>
    <grid :cols="options.length === 2 ? 2 : 3" v-for="(options, index) in viewCustomOptions" :key="index">
      <grid-item
        :class="['play', {active: option.active && !gameClosed}]"
        v-for="(option, index) in options"
        :key="index"
        @on-item-click="toggleActive(option)">
        <div class="text-center">
          <span :class="['play-name', `${gameCode}-${option.num}`, {'plain': option.active && !gameClosed}]">{{option.num}}</span>
        </div>
      </grid-item>
    </grid>
  </div>
</template>
<script>
import _ from 'lodash'
import { Grid, GridItem } from 'vux'
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
  components: {
    Grid,
    GridItem
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
@import "../../styles/base.less";
@import "../../styles/vars.less";
@import "../../styles/playgroup.less";
.odds {
  width: 100%;
  line-height: 40px;
  height: 40px;
  text-align: center;
  font-size: 14px;
}
</style>
