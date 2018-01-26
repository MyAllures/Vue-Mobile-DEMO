<template>
  <div>
    <div v-if="tabKeys.length>1" class="tab-selector">
      <tab
          :style="{width: tabKeys.length > 5 ? `${tabKeys.length * 75}px` : ''}"
          bar-active-color="#156fd8"
          active-color="#156fd8" >
        <tab-item v-for="(key, index) in  tabKeys"
          @on-item-click="switchTab(key)"
          :key="index"
          :selected="key === currentTab">
          <span :class="{'ellipsis': tabKeys.length > 5}">{{key}}</span>
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
            <span :class="getPlayClass(play)">{{play.display_name}}</span>
            <span class="play-odds">{{play.odds}}</span>
          </div>
        </grid-item>
      </grid>
    </div>
    <component v-else
      :is="customPlayGroupsSetting.component"
      :playReset="playReset"
      @updateCustomPlays="updateCustomPlays"
      @updateMultiCustomPlays="updateMultiCustomPlays"
      :setting="customPlayGroupsSetting"
      :plays="groups[0].plays"
      :groupName="groups[0].name"
      :gameClosed="gameClosed" />
  </div>
</template>

<script>
import _ from 'lodash'
import { Grid, GridItem, Tab, TabItem } from 'vux'
const WithCode = (resolve) => require(['../../components/playGroup/WithCode'], resolve)
const gd11x5Seq = (resolve) => require(['../../components/playGroup/gd11x5Seq'], resolve)
const hk6Exl = (resolve) => require(['../../components/playGroup/hk6Exl'], resolve)
const shxiaZdc = (resolve) => require(['../../components/playGroup/shxiaZdc'], resolve)

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
    shxiaZdc
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
      let playGroupId = `${this.$route.params.gameId}-${this.$route.params.categoryName}`
      return _.find(this.$store.state.customPlayGroups, item => (item.id + '') === playGroupId)
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
    }
  },
  created () {
    const categories = this.$store.state.categories
    if (!categories.length) {
      this.$store.dispatch('fetchCategories', this.$route.params.gameId).then((res) => {
        this.initPlayAndGroups(res)
      }).catch(() => { })
    } else {
      this.initPlayAndGroups(categories)
    }
  },
  methods: {
    getPlayClass (play) {
      if (!(isNaN(play.display_name))) {
        return ['play-name', play.code, `${this.game.code}-${play.display_name}`]
      } else {
        return [ 'play-name', play.code ]
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
      const categoryName = this.$route.params.categoryName
      const currentCategory = _.find(categories, item => (item.name) === categoryName)
      const tabs = {}
      const plays = {}

      let groupName = this.$route.params.categoryName
      currentCategory.tabs.forEach(tab => {
        const tabName = tab.name || 'no-alias'
        this.tabKeys.push(tabName)

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

      this.currentTab = this.tabKeys[0]
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
}
</style>
