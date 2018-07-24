<template>
  <div>
    <div v-if="tabKeys.length >= 0&&tabKeys[0]!=='no-alias'" class="tab-selector">
      <tab :style="{width: tabKeys.length > 4 ? `${tabKeys.length * 75}px` : ''}"
          bar-active-color="#156fd8"
          :animate="false"
          active-color="#156fd8" >
        <tab-item v-for="(key, index) in  tabKeys"
          @on-item-click="switchTab(key)"
          :key="index"
          :style="{flex: tabKeys.length > 4?0:1}"
          :selected="key === currentTab">
          <span :class="{'ellipsis': tabKeys.length > 4}">{{key}}</span>
        </tab-item>
      </tab>
    </div>
    <div
      :class="['gameplays', !group.name ? 'no-title' : '']"
      v-if="!customPlayGroupsSetting"
      v-for="(group, index) in groups"
      :key="'group' + index">
      <div v-if="group.name" class="playgroup-title">{{group.name}}</div>
      <grid :key="index" :cols="group.col_num">
        <grid-item
          :class="['play', {active: plays[play.id] ? plays[play.id].active && !gameClosed : false}]"
          v-for="play in group.plays"
          :key="play.id + 'play'"
          @on-item-click="toggleActive(plays[play.id], $event)">
          <div class="play-area">
            <div class="dice-container" v-if="play.display_name.split(',').length && game && game.code === 'jsk3'">
              <div>
                <span :class="['play-name', `jsk3-${dice}` ]"
                  v-for="(dice, index) in play.display_name.split(',')"
                  :key="index">
                  {{dice}}
                </span>
              </div>
              <span class="play-odds">{{play.odds}}</span>
            </div>
            <template v-else-if="zodiacMap">
              <span class="play-name">
                <span :class="getPlayClass(play)">{{play.display_name}}</span>
                <span class="play-odds">{{play.odds}}</span>
              </span>
              <span class="play-nums">
                <span :class="[`hkl-${num}`, 'play-num']" v-for="num in zodiacMap[play.display_name]" :key="num"></span>
              </span>
            </template>
            <template v-else>
              <span :class="getPlayClass(play)">{{play.display_name}}</span>
              <span :class="['play-odds', {'right': play.display_name.split(',').length && game && game.code === 'jsk3'}]">{{play.odds}}</span>
            </template>
          </div>
        </grid-item>
      </grid>
    </div>

    <component v-else
      :is="customPlayGroupsSetting.component"
      :gameCode="game.code"
      :playReset="playReset"
      @updateCustomPlays="updateCustomPlays"
      @updateMultiCustomPlays="updateMultiCustomPlays"
      :setting="customPlayGroupsSetting"
      :plays="groups[0].plays"
      :groupName="groups[0].name"
      :gameClosed="gameClosed"
      :zodiacMap="zodiacMap"/>
  </div>
</template>

<script>
import _ from 'lodash'
import { Grid, GridItem, Tab, TabItem } from 'vux'
const WithCode = (resolve) => require(['../../components/playGroup/WithCode'], resolve)
const gd11x5Seq = (resolve) => require(['../../components/playGroup/gd11x5Seq'], resolve)
const hk6Exl = (resolve) => require(['../../components/playGroup/hk6Exl'], resolve)
const shxiaZdc = (resolve) => require(['../../components/playGroup/shxiaZdc'], resolve)
const fc3dIc = (resolve) => require(['../../components/playGroup/fc3dIc'], resolve)
const fc3dCa2df = (resolve) => require(['../../components/playGroup/fc3dCa2df'], resolve)

export default {
  name: 'GameCategory',
  props: {
    gameClosed: {
      type: Boolean,
      default: false
    },
    scheduleId: {
      type: Number
    },
    game: {
      type: Object
    },
    amount: {
      type: Number,
      default: 1
    },
    playReset: {
      type: Boolean,
      default: false
    },
    activeCategory: {
      type: String
    }
  },
  components: {
    Grid,
    GridItem,
    Tab,
    TabItem,
    WithCode,
    gd11x5Seq,
    hk6Exl,
    shxiaZdc,
    fc3dIc,
    fc3dCa2df
  },
  data () {
    return {
      loading: true,
      plays: {},
      raw: [],
      dialogVisible: false,
      errors: '',
      groups: [],
      tabs: {},
      tabKeys: [],
      currentTab: '',
      showCombinationDetails: false
    }
  },
  computed: {
    playsForSubmit () {
      return _.filter(this.activePlays, play => play.active).map(play => {
        return {
          game_schedule: this.scheduleId,
          bet_amount: parseFloat(play.bet_amount),
          play: play.id,
          bet_options: play.bet_options
        }
      })
    },
    activePlays () {
      return _.filter(this.plays, play => play.active)
    },
    customPlayGroupsSetting () {
      let currentPlayGroup = _.find(this.categories, item => item.id + '' === this.$route.params.categoryId)
      let playGroupCode = currentPlayGroup.code
      return _.find(this.$store.state.customPlayGroups, item => (item.id + '') === playGroupCode)
    },
    categories () {
      return this.$store.state.categories[this.$route.params.gameId] || []
    },
    zodiacMap () {
      if (!this.categories || this.categories.length === 0) {
        return null
      } else {
        for (let i = 0, len = this.categories.length; i < len; i++) {
          const category = this.categories[i]
          if (category.extra_info) {
            return category.extra_info.shaw
          }
        }
      }
      return null
    }
  },
  watch: {
    // update amount of active plays
    'amount': function (amount) {
      _.each(this.plays, play => {
        if (play.active) {
          play.amount = amount
        }
      })
    },
    'activePlays': {
      handler: function (activePlays) {
        this.$emit('updatePlays', activePlays)
      },
      deep: true
    },
    'playReset': function () {
      _.each(this.plays, play => {
        if (play.active) {
          this.$set(play, 'amount', '')
          this.$set(play, 'active', false)
        }
      })
    },
    'categories': function (categories) {
      this.initPlayAndGroups(categories)
    }
  },
  created () {
    if (this.categories.length > 0) {
      this.initPlayAndGroups(this.categories)
    }
  },
  methods: {
    getPlayClass (play) {
      if (this.game) {
        let plain = [ 'play-name', play.code ]
        let style = [...plain, `${this.game.code}-${play.display_name}`, {'plain': this.plays[play.id] ? this.plays[play.id].active && !this.gameClosed : false}]
        // plain is for lay over the default active style

        if (!(isNaN(play.display_name))) {
          if (play.group.indexOf('和') !== -1) {
            return plain
          }
          return style
        } else {
          return plain
        }
      }
    },
    updateCustomPlays (playOptions) {
      _.each(this.plays, play => {
        // if all of the options are valid, change the target play's status
        if (play.id === playOptions.activePlayId && playOptions.valid) {
          this.updateCustomPlay(play, playOptions, true)
        } else {
          this.resetCustomPlay(play)
        }
      })
    },
    updateMultiCustomPlays (activePlays) {
      const ids = Object.keys(activePlays)
      _.each(this.plays, play => {
        let playOptions = activePlays[play.id]
        if (ids.includes(play.id + '') && playOptions.valid) {
          this.updateCustomPlay(play, playOptions, false)
        } else {
          this.resetCustomPlay(play)
        }
      })
    },
    updateCustomPlay (play, playOptions) {
      this.$set(play, 'active', true)
      this.$set(play, 'amount', this.amount)
      this.$set(play, 'isCustom', true)
      this.$set(play, 'options', playOptions.options)
      this.$set(play, 'combinations', playOptions.combinations)
      this.$set(play, 'activedOptions', playOptions.activedOptions)
    },
    resetCustomPlay (play) {
      this.$set(play, 'active', false)
      this.$set(play, 'isCustom', false)
      this.$set(play, 'options', '')
      this.$set(play, 'combinations', [])
      this.$set(play, 'activedOptions', [])
    },
    initPlayAndGroups (categories) {
      const categoryId = this.$route.params.categoryId
      const currentCategory = _.find(categories, item => (item.id + '') === categoryId)
      if (!currentCategory) {
        return
      }

      const gaTrackingId = this.$store.state.systemConfig.gaTrackingId
      if (gaTrackingId) {
        window.gtag('config', gaTrackingId, {page_path: this.$route.path, page_title: `${this.game.display_name} - ${currentCategory.name}`})
      }

      const tabs = {}
      const plays = {}
      const tabKeys = []

      let groupName = currentCategory.name
      currentCategory.tabs.forEach(tab => {
        const tabName = tab.name || 'no-alias'
        tabKeys.push(tabName)

        const groups = tab.groups
        groups.forEach(group => {
          if (!group.plays) {
            return
          }
          if (group.name) {
            groupName = group.name
          }
          group.plays.forEach(play => {
            plays[play.id] = play
            plays[play.id]['group'] = groupName
          })
        })
        tabs[tabName] = groups
      })
      this.currentTab = tabKeys[0]
      this.tabKeys = tabKeys
      this.tabs = tabs
      this.groups = tabs[this.currentTab]
      this.plays = plays
    },
    toggleActive (play, event) {
      if (this.gameClosed) {
        return
      }
      this.$set(play, 'active', !play.active)
      if (play.active) {
        play.amount = parseFloat(this.amount)
      } else {
        play.amount = ''
      }
    },
    switchTab (key) {
      this.groups = this.tabs[key]
      this.currentTab = key
      this.reset()
    },
    reset () {
      this.$emit('resetPlays')
    }
  },
  beforeDestroy () {
    this.reset()
  }
}
</script>

<style lang="less" scoped>
@import "../../styles/vars.less";
@import "../../styles/playgroup.less";
.tab-selector {
  width: 100%;
  overflow: scroll;
  .ellipsis {
    white-space: nowrap;
    display: block;
    width: 75px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .vux-tab {
    overflow-x: auto;
  }
}

.dice-container {
  display: flex;
  width: 100%;
  justify-content: space-between;
}
</style>
