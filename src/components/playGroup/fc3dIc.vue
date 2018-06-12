<template>
  <div class="gameplays">
    <div class="playgroup-title" v-if="!activePlay.odds">{{groupName}}</div>
    <div class="playgroup-odds" v-else>赔率：<span class="red">{{activePlay.odds}}</span></div>
    <grid :cols="2">
      <grid-item
        :class="['play', {active: option.active && !gameClosed}]"
        v-for="(option, index) in customOptions"
        :key="index"
        @on-item-click="toggleActive(option)">
        <div class="text-center">
          <span :class="['play-name', `${gameCode}-${option.num}` , {'plain': option.active && !gameClosed}]">{{option.num}}</span>
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
    return {
      customOptions,
      combinations: [],
      valid: false,
      activePlay: {
        id: '',
        display_name: '',
        odds: ''
      }
    }
  },
  computed: {
    activedOptions () {
      return _.filter(this.customOptions, option => {
        return option.active
      })
    },
    maxOptionCount () {
      return (this.plays.length - 1) * 2
    }
  },
  watch: {
    'activedOptions': function () {
      if (this.activedOptions.length < this.maxOptionCount / 2) {
        this.updateForSubmit()
        this.activePlay.odds = ''
        this.activePlay.id = ''
        this.activePlay.display_name = ''
        return
      }

      this.activedOptions.sort((a, b) => { return a.num - b.num })
      _.forEach(this.plays, (play) => {
        if (play.rules.max_opts === this.activedOptions.length) {
          this.activePlay.odds = play.odds
          this.activePlay.id = play.id
          this.activePlay.display_name = play.display_name
          this.updateForSubmit()
        }
      })
    },
    'playReset': function () {
      this.customOptions.forEach(option => {
        option.active = false
      })
      this.combinations.length = 0
    }
  },
  methods: {
    updateForSubmit () {
      this.valid = this.activedOptions.length >= this.maxOptionCount / 2
      this.$emit('updateCustomPlays', {
        activePlayId: this.activePlay.id,
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
      if (!option.active) {
        if (this.activedOptions.length < this.maxOptionCount) {
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
@import "../../styles/playgroup.less";
.odds {
  width: 100%;
  line-height: 40px;
  height: 40px;
  text-align: center;
  font-size: 14px;
}
</style>
