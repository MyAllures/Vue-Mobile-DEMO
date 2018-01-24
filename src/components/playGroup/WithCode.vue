<template>
  <div>
    <div class="odds">赔率：{{activePlay.odds}}</div>
    <grid v-for="(chunkOptions, index) in viewCustomOptions" :key="index">
      <grid-item
        :class="['play', {active: option.active && !gameClosed}]"
        v-for="(option, index) in chunkOptions"
        :key="index"
        @on-item-click="toggleActive(option)">
        <div class="play-area">
          <span class="play-name">{{option.num}}</span>
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
    const viewCustomOptions = _.chunk(customOptions, 3)
    if (viewCustomOptions[viewCustomOptions.length - 1].length === 1) {
      // 將最後一組與其前一組平分
      viewCustomOptions[viewCustomOptions.length - 1].unshift(viewCustomOptions[viewCustomOptions.length - 2].pop())
    }
    return {
      customOptions,
      viewCustomOptions,
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
      return this.plays[0][0]
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
@import "../../styles/vars.less";
.odds {
  width: 100%;
  line-height: 40px;
  height: 40px;
  text-align: center;
  font-size: 14px;
}
.play {
  &.active {
    background: @azul;
    .play-name {
      color: #fff;
    }
    .play-odds {
      color: #fff;
    }
  }
}
.play-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.play-name {
  font-size: 18px;
  color: #000;
}
.play-odds {
  font-size: 14px;
  color: #4a4a4a;
}
</style>
