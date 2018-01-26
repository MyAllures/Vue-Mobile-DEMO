<template>
  <div class="gameplays">
    <div class="playgroup-odds"> {{ activePlay ? `賠率：${activePlay.odds}` : $route.params.categoryName}}</div>
    <grid :cols="zodiacs ? 1 : 5"
      v-for="(options, index) in [customOptions]"
      :key="index">
      <grid-item
        :class="['play','text-center', {active: option.active && !gameClosed}]"
        v-for="(option, index) in options"
        :key="index"
        @on-item-click="toggleActive(option)">
       <flexbox class="play-area" v-if="zodiacs">
          <flexbox-item class="play-name">{{zodiacs[index]}}</flexbox-item>
          <flexbox-item v-if="option.value" class="play-name text-right"  :span="8">
            <span v-for="number in option.value"
              :key="number"
              :class="`hkl-${number}`">
            </span>
          </flexbox-item>
        </flexbox>
        <div v-else>
          <span :class="['play-name', `hkl-${option.num}`]"></span>
        </div>
      </grid-item>
    </grid>
    <toast v-model="illegal" type="text" width="10em">不允许超过{{maxOpts}}个选项</toast>
  </div>
</template>

<script>
import _ from 'lodash'
import { Grid, GridItem, Toast, Flexbox, FlexboxItem } from 'vux'

export default {
  name: 'shixaZdc',
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
  data () {
    const zodiacMap = {
      '鼠': [10, 22, 34, 46],
      '牛': [9, 21, 33, 45],
      '虎': [8, 20, 32, 44],
      '兔': [7, 19, 31, 43],
      '龙': [6, 18, 30, 42],
      '蛇': [5, 17, 29, 41],
      '马': [4, 16, 28, 40],
      '羊': [3, 15, 27, 39],
      '猴': [2, 14, 26, 38],
      '鸡': [1, 13, 25, 37, 49],
      '狗': [12, 24, 36, 48],
      '猪': [11, 23, 35, 47]
    }
    const rawOptions = []
    _.each(this.setting.options, option => {
      rawOptions.push({
        num: option,
        active: false
      })
    })

    return {
      zodiacMap,
      rawOptions,
      valid: false,
      illegal: false,
      zodiacs: this.plays[0].rules.choices ? this.plays[0].rules.choices : ''
    }
  },
  computed: {
    customOptions () {
      if (this.zodiacs) {
        _.each(this.rawOptions, (option) => {
          option.displayName = this.zodiacs[option.num]
          option.value = this.zodiacMap[option.displayName]
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
      if (this.activedOptions.length > (this.minOpts - 1)) {
        return this.plays[this.activedOptions.length - this.minOpts]
      }
    },
    maxOpts () {
      const maxOptionsPlay = this.plays[this.plays.length - 1].display_name
      return maxOptionsPlay.slice(0, 2)
    },
    minOpts () {
      const minOptionsPlay = this.plays[0].display_name
      return minOptionsPlay.slice(0, 1)
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
      if (!option.active) {
        if (this.activedOptions.length < this.maxOpts) {
          option.active = true
        } else {
          this.illegal = true
        }
      } else {
        option.active = false
      }
    }
  },
  components: {
    Grid, GridItem, Toast, Flexbox, FlexboxItem
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
