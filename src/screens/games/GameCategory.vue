<template>
  <div>
    <tab v-if="tabKeys.length>1">
      <tab-item v-for="(key, index) in tabKeys" :key="index" selected @on-item-click="switchTab(key)">{{key}}</tab-item>
    </tab>
    <div
        v-for="(group, index) in groups"
        :key="'group' + index">
        <div v-if="group.name" class="playgroup-title">{{group.name}}</div>
        <grid v-for="(groupPlays, index) in group.plays" :key="index">
          <grid-item
            :class="['play', {active: plays[play.id] ? plays[play.id].active && !gameClosed : false}]"
            v-for="play in groupPlays"
            :key="play.id + 'play'"
            @on-item-click="toggleActive(plays[play.id], $event)">
            <div class="play-area">
              <span :class="['play-name', play.code]">{{play.display_name}}</span>
              <span class="play-odds">{{play.odds}}</span>
            </div>
          </grid-item>
        </grid>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { placeBet } from '../../api'
import { Grid, GridItem, Tab, TabItem } from 'vux'

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
    TabItem
  },
  data () {
    return {
      loading: true,
      plays: {},
      raw: [],
      dialogVisible: false,
      totalAmount: 0,
      errors: '',
      groups: [],
      tabs: {},
      tabKeys: [],
      currentTab: ''
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
    'activePlays': function (activePlays) {
      this.$emit('updatePlays', activePlays)
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
        if (res && res.length) {
          this.initPlayAndGroups(res)
        } else {
          this.performLogin()
        }
      })
    } else {
      this.initPlayAndGroups(categories)
    }
  },
  methods: {
    placeOrder () {
      this.submitting = true
      this.errors = ''
      placeBet(this.playsForSubmit)
        .then(res => {
          this.submitting = false
          if (res && res[0].member) {
            this.submitted = true
            setTimeout(() => {
              this.submitted = false
              this.dialogVisible = false
              this.updateBetrecords()
              this.reset()
            }, 1000)
          } else {
            let messages = []
            res.msg.forEach(error => {
              messages.push(error)
            })
            this.errors = messages.join(', ')
          }
        },
        errRes => {
          this.submitting = false
          this.errors = errRes.join()
          setTimeout(() => {
            this.dialogVisible = false
          }, 3000)
        })
    },
    initPlayAndGroups (categories) {
      const categoryName = this.$route.params.categoryName
      const currentCategory = _.find(categories, item => (item.name) === categoryName)
      const tabs = {}
      const plays = {}

      currentCategory.tabs.forEach(tab => {
        const tabName = tab.name || 'no-alias'
        this.tabKeys.push(tabName)
        const groups = tab.groups

        let groupName
        groups.forEach(group => {
          if (group.name) {
            groupName = group.name
          }
          group.plays.forEach(groupPlays => {
            groupPlays.forEach(play => {
              plays[play.id] = play
              plays[play.id]['group'] = groupName
            })
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
    },
    reset () {
      _.each(this.plays, play => {
        if (play.active) {
          this.$set(play, 'active', false)
        }
      })
    }
  },
  beforeDestroy () {
    this.reset()
  }
}
</script>

<style lang="less" scoped>
@import "../../styles/vars.less";
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
