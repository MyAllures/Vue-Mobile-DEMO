<template>
  <div>
    <div class="odds">赔率：{{activePlay.odds}}</div>
    <div v-for="(group, index) in showViewCustomOptionsGroup" :key="index">
      <div class="playgroup-title">{{group.name}}</div>
      <grid v-for="(chunkOptions, index) in group.options" :key="index">
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
  </div>
</template>
<script>
import _ from 'lodash'
import { Grid, GridItem } from 'vux'
import Combinatorics from 'js-combinatorics'
export default {
  name: 'gd11x5Seq',
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
    const customOptionsGroup = [[], [], []]
    const viewCustomOptionsGroup = [{ name: '第一球', options: [] }, { name: '第二球', options: [] }, { name: '第三球', options: [] }]

    this.setting.options.forEach(option => {
      customOptionsGroup.forEach(options => {
        options.push({
          num: option,
          active: false
        })
      })
    })

    customOptionsGroup.forEach((options, index) => {
      const viewCustomOptions = _.chunk(options, 3)
      if (viewCustomOptions[viewCustomOptions.length - 1].length === 1) {
        // 將最後一組與其前一組平分
        viewCustomOptions[viewCustomOptions.length - 1].unshift(viewCustomOptions[viewCustomOptions.length - 2].pop())
      }
      viewCustomOptionsGroup[index].options = viewCustomOptions
    })

    return {
      customOptionsGroup,
      viewCustomOptionsGroup,
      combinations: [],
      valid: false
    }
  },
  computed: {
    activedOptions () {
      return _.map(this.customOptionsGroup, group => {
        return _.filter(group, option => {
          return option.active
        })
      }).filter(group => group.length > 0)
    },
    activedNums () {
      return _.map(_.flatten(this.activedOptions), option => option.num)
    },
    activePlay () {
      return this.plays[0][0]
    },
    showViewCustomOptionsGroup () {
      return this.viewCustomOptionsGroup.slice(0, this.activePlay.rules.min_opts)
    }
  },
  watch: {
    'activedOptions': function () {
      this.calculateCombinations()
    },
    'playReset': function () {
      this.combinations.length = 0
      _.each(this.customOptionsGroup, options => {
        _.each(options, option => {
          this.$set(option, 'active', false)
          this.$set(option, 'disabled', false)
        })
      })
    },
    'activedNums': function (currentActivedNums) {
      _.each(this.customOptionsGroup, options => {
        _.each(options, option => {
          if (currentActivedNums.includes(option.num)) {
            if (!option.active) {
              this.$set(option, 'disabled', true)
            }
          } else {
            this.$set(option, 'disabled', false)
          }
        })
      })
    }
  },
  methods: {
    calculateCombinations () {
      let activedOptionNumbers = _.map(this.activedOptions, options => {
        return _.map(options, option => option.num)
      })

      if (activedOptionNumbers.length === this.showViewCustomOptionsGroup.length) {
        this.combinations = Combinatorics.cartesianProduct.apply(Combinatorics, activedOptionNumbers).toArray()
        this.valid = true
      } else {
        this.combinations = []
        this.valid = false
      }
      this.$emit('updateCustomPlays', {
        activePlayId: this.activePlay.id,
        options: null,
        combinations: this.combinations,
        activedOptions: null,
        valid: this.valid
      })
    },
    toggleActive (option) {
      if (this.gameClosed || option.disabled) {
        return false
      }
      if (!option.active) {
        option.active = true
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
.playgroup-title {
  height: 50px;
  line-height: 50px;
  text-align: center;
  font-size: 14px;
  color: #4a4a4a;
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
