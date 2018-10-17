<template>
  <div class="gameplays">
    <div class="playgroup-title" v-if="!activePlay">{{groupName}}</div>
    <div class="playgroup-odds" v-else>赔率：<span class="red">{{activePlay.odds}}</span></div>
    <grid :cols="2">
      <grid-item
        :class="['play', {active: option.active && !gameClosed}]"
        v-for="(option, index) in customOptions"
        :key="index"
        @on-item-click="toggleActive(option)">
        <div :class="`box-center play result-${gameCode} resultnum-${option.num}`">
          <span class="num">{{option.num}}</span>
        </div>
      </grid-item>
    </grid>
  </div>
</template>
<script>
import _ from 'lodash'
import { Grid, GridItem } from 'vux'
export default {
  name: 'fc3dIc',
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
    const playMap = {}
    this.plays.forEach(play => {
      playMap[play.rules.max_opts] = play
    })
    return {
      customOptions,
      valid: false,
      playMap
    }
  },
  computed: {
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
      this.customOptions.forEach(option => {
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
        activedOptions: this.activedOptions.map(option => {
          return {
            num: option.num
          }
        }),
        combinations: '',
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
