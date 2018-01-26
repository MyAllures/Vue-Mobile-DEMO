<template>
  <div class="gameplays">
    <grid :cols="1">
      <grid-item
        :class="['play', {active: option.active && !gameClosed}]"
        v-for="(option, index) in customOptions"
        :key="index"
        @on-item-click="toggleActive(option)">
        <div class="play-area">
          <span class="play-name">{{option.display_name}}
            <span class="play-odds">{{option.odds}}</span>
          </span>
          <span class="play-nums">
            <span :class="`hkl-${num}`" v-for="num in option.value" :key="num"></span>
          </span>
        </div>
      </grid-item>
    </grid>
  </div>
</template>
<script>
import _ from 'lodash'
import { Grid, GridItem } from 'vux'
import Combinatorics from 'js-combinatorics'
import { zodiacMap, tailMap } from '../../utils/hk6'
export default {
  name: 'hk6Exl',
  props: {
    plays: {
      type: Array
    },
    groupName: {
      type: String
    },
    gameClosed: {
      type: Boolean
    },
    playReset: {
      type: Boolean
    }
  },
  components: {
    Grid,
    GridItem
  },
  data () {
    return {
      customOptions: [],
      diffOddsOption: '',
      valid: false
    }
  },
  created () {
    this.initOptions()
  },
  computed: {
    activedOptions () {
      return _.filter(this.customOptions, option => {
        return option.active
      })
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
    },
    'groupName': function () {
      this.initOptions()
    }
  },
  methods: {
    initOptions () {
      const customOptions = []
      const diffOddsOption = this.plays[0]
      let count = 0
      let diffOptionTemp
      _.each(this.plays, play => {
        if (count >= 0 && diffOddsOption.odds !== play.odds) {
          count++
          if (count > 1) {
            diffOptionTemp = diffOddsOption
          } else {
            diffOptionTemp = play
          }
        }
        let option = {
          id: play.id,
          odds: play.odds,
          display_name: play.display_name,
          value: zodiacMap[play.display_name] || tailMap[play.display_name],
          active: false
        }
        customOptions.push(option)
      })
      if (diffOptionTemp) {
        this.diffOddsOption = diffOptionTemp
      }
      this.customOptions = customOptions
    },
    calculateCombinations () {
      let rules = this.plays[0].rules
      if (rules && this.activedOptions.length >= rules.min_opts) {
        const combinedOptions = Combinatorics.combination(this.activedOptions, rules.min_opts).toArray()
        let diffOddsOptionName = this.diffOddsOption.display_name
        let activePlays = {}
        _.each(combinedOptions, options => {
          let play = _.find(options, option => option.display_name === diffOddsOptionName)
          if (!play) {
            play = options[0]
          }
          let activePlayId = play.id
          let activePlay
          if (activePlays[activePlayId]) {
            activePlay = activePlays[activePlayId]
          } else {
            activePlay = {
              activePlayId: activePlayId,
              options: '',
              combinations: [],
              activedOptions: '',
              valid: true
            }
            activePlays[activePlayId] = activePlay
          }
          activePlay.combinations.push(_.map(options, option => option.display_name))
        })
        this.$emit('updateMultiCustomPlays', activePlays)
      }
    },
    toggleActive (option) {
      if (this.gameClosed) {
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
@import "../../styles/playgroup.less";
.odds {
  width: 100%;
  line-height: 40px;
  height: 40px;
  text-align: center;
  font-size: 14px;
}
</style>
