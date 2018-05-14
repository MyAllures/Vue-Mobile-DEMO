<template>
  <div class="gameplays">
    <div class="playgroup-odds">赔率：<span class="red">{{activePlay.odds}}</span></div>
    <div v-for="(group, index) in showViewCustomOptionsGroup" :key="index">
      <div class="playgroup-title">{{group.name}}</div>
      <grid :cols="2"
        v-for="(chunkOptions, index) in group.options"
        :key="index">
        <grid-item
          :class="['play', {active: option.active && !gameClosed}]"
          v-for="(option, index) in chunkOptions"
          :key="index"
          @on-item-click="toggleActive(option)">
          <div class="text-center">
            <span :class="['play-name', `${gameCode}-${option.num}`, {'plain': option.active && !gameClosed}]">{{option.num}}</span>
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
  name: 'fc3dCa2df',
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
    const customOptionsGroup = [[], [], []]
    const viewCustomOptionsGroup = [{ name: '佰', options: [] }, { name: '拾', options: [] }, { name: '个', options: [] }]

    this.setting.options.forEach(option => {
      customOptionsGroup.forEach(options => {
        options.push({
          num: option,
          active: false
        })
      })
    })

    customOptionsGroup.forEach((options, index) => {
      const viewCustomOptions = _.chunk(options, 4)
      if (viewCustomOptions[viewCustomOptions.length - 1].length === 1) {
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
      return this.plays[0]
    },
    showViewCustomOptionsGroup () {
      let showing
      let names = this.activePlay.display_name.slice(0, 2)
      if (this.activePlay.rules.min_opts === 2) {
        showing = this.viewCustomOptionsGroup.filter(g => names.indexOf(g.name) !== -1)
      } else {
        showing = this.viewCustomOptionsGroup
      }
      return showing
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
@import "../../styles/base.less";
@import "../../styles/playgroup.less";
</style>
