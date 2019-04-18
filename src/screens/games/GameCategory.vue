<template>
  <div>
    <div v-if="tabKeys.length >= 0&&tabKeys[0]!=='no-alias'" class="tab-selector">
      <tab :style="{width: tabKeys.length > 4 ? `${tabKeys.length * 75}px` : ''}"
          bar-active-color="theme"
          :animate="false"
          active-color="theme" >
        <tab-item v-for="(key, index) in  tabKeys"
          @on-item-click="switchTab(key)"
          :key="index"
          :style="{flex: tabKeys.length > 4?0:1}"
          :selected="key === currentTab">
          <span :class="{'ellipsis': tabKeys.length > 4}">{{key}}</span>
        </tab-item>
      </tab>
    </div>
    <div v-if="shawOptions.length" class="shaw-options">
      <div class="wrapper vux-1px-b">
        <check-icon
          :key="option.name"
          v-on:click.native="toggleShaw(option, $event)"
          v-for="option in shawOptions"
          :value.sync="option.selected"
          >{{ option.name }}</check-icon>
      </div>
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
            <template v-if="play.display_name.indexOf(',')!== -1 && game && (game.code === 'jsk3' || game.code === 'msk3'|| game.code === 'bjk3'|| game.code ==='gxk3'|| game.code ==='shk3' || game.code ==='hubk3')">
              <div class="dice-container">
                <span :class="`play result-${game.code} resultnum-${dice}`"
                  v-for="(dice, index) in play.display_name.split(',')"
                  :key="index">
                </span>
              </div>
              <span class="play-odds">{{play.odds}}</span>
            </template>
            <template v-else-if="zodiacMap">
              <span class="play-name">
                <span :class="getPlayClass(play)">{{play.display_name}}</span>
                <span class="play-odds">{{play.odds}}</span>
              </span>
              <span class="play-nums">
                <span :class="`play-num result-${game.code} resultnum-${num}`" v-for="num in zodiacMap&&zodiacMap[play.display_name]" :key="num"></span>
              </span>
            </template>
            <template v-else>
              <span :class="[getPlayClass(play), {'small': group.col_num>2}]">
                <span class="num">{{play.display_name}}</span>
              </span>
              <span :class="['play-odds', {'right': play.display_name.split(',').length && game && (game.code === 'jsk3' || game.code === 'msk3'|| game.code === 'bjk3'|| game.code ==='gxk3'|| game.code ==='shk3' || game.code ==='hubk3')}]">{{play.odds}}</span>
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
import { customPlayGroups } from '../../config'
const WithCode = (resolve) => require(['../../components/playGroup/WithCode'], resolve)
const gd11x5Seq = (resolve) => require(['../../components/playGroup/gd11x5Seq'], resolve)
const hk6Exl = (resolve) => require(['../../components/playGroup/hk6Exl'], resolve)
const shxiaZdc = (resolve) => require(['../../components/playGroup/shxiaZdc'], resolve)
const fc3dIc = (resolve) => require(['../../components/playGroup/fc3dIc'], resolve)
const fc3dCa2df = (resolve) => require(['../../components/playGroup/fc3dCa2df'], resolve)
const isNum = /^\d+$/

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
    activePlays () {
      return _.filter(this.plays, play => play.active)
    },
    customPlayGroupsSetting () {
      let currentPlayGroup = _.find(this.categories, item => item.id + '' === this.$route.params.categoryId)
      let playGroupCode = currentPlayGroup.code
      return _.find(customPlayGroups, item => item.code.includes(playGroupCode))
    },
    categories () {
      return this.$store.state.categories[this.$route.params.gameId] || []
    },
    theme () {
      return this.$store.state.theme
    },
    currentCategory () {
      const categories = this.$store.state.categories[this.$route.params.gameId]
      if (!categories || categories.length === 0) {
        return undefined
      }
      const categoryId = this.$route.params.categoryId
      return _.find(categories, item => (item.id + '') === categoryId)
    },
    zodiacMap () {
      if (this.currentCategory.extra_info) {
        return this.currentCategory.extra_info.shaw
      }
      return null
    }
  },
  watch: {
    'activePlays': {
      handler: function (activePlays) {
        this.$emit('updatePlays', activePlays)
      },
      deep: true
    },
    'playReset': function () {
      _.each(this.plays, play => {
        if (play.active) {
          this.$set(play, 'active', false)
        }
      })
    },
    'currentCategory': function (currentCategory) {
      this.initPlayAndGroups(currentCategory)
    }
  },
  created () {
    if (this.game && this.currentCategory) {
      this.sendGaConfig(this.game.display_name, this.currentCategory.name)
    } else {
      const unwatch = this.$watch(vm => [vm.game, vm.currentCategory], result => {
        if (result[0] && result[1]) {
          this.sendGaConfig(result[0].display_name, result[1].name)
          unwatch()
        }
      })
    }

    if (this.currentCategory) {
      this.initPlayAndGroups(this.currentCategory)
    }
  },
  methods: {
    sendGaConfig (gameName, categoryName) {
      const gaTrackingId = this.$store.state.systemConfig.gaTrackingId
      if (gaTrackingId) {
        window.gtag('config', gaTrackingId, {page_path: this.$route.path, page_title: `${gameName} - ${categoryName}`})
      }
    },
    getPlayClass (play) {
      let num = play.display_name
      if (num[0] === '0' && num !== '0') {
        num = num.slice(1)
      }
      if (this.game) {
        if (num.match(isNum)) {
          if (play.group.indexOf('和') !== -1) {
            return 'play-name'
          }
          if (this.game.code === 'fc3d') {
            if (play.display_name.length > 1) {
              return `play result-${this.game.code} text-sm`
            }
          }
          return `play result-${this.game.code} resultnum-${num}`
        } else {
          if (num.length > 2) {
            return 'play-name small'
          }
          return 'play-name'
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
    initPlayAndGroups (currentCategory) {
      if (!currentCategory) {
        return
      }
      const tabs = {}
      const plays = {}
      const tabKeys = []

      let groupName = currentCategory.name
      if (currentCategory.id === 'playpositions') {
        return
      }

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
  .play {
    display: inline-block;
    margin-right: 5px;
  }
}
</style>
