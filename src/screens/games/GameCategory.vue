<template>
  <div>
    <div
        v-for="(playSection, index) in playSections"
        class="clearfix"
        :key="playSection.id + 'playSection' + index"
        v-if="playSections.length">
        <div
          v-for="(playgroup, playgroupIndex) in playSection.playgroups"
          :key="'playgroup' + playgroup.id">
          <div class="playgroup-title">{{playgroup.display_name}}</div>
          <grid
            v-for="(playChunk, playChunkIndex) in playgroup.plays"
            :key="playgroup.name + 'playChunk' + playChunkIndex">
            <grid-item
              :class="['play', {active: plays[play.id] ? plays[play.id].active && !gameClosed : false}]"
              v-for="play in playChunk"
              :key="play.id + 'play'">
              <div
                class="play-area"
                @click="toggleActive(plays[play.id], $event)">
                <span class="play-name">{{play.display_name}}</span>
                <span class="play-odds">{{play.odds}}</span>
              </div>
            </grid-item>
          </grid>
        </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { fetchPlaygroup, placeBet } from '../../api'
import { formatPlayGroup, filtAmount } from '../../utils'
import { Grid, GridItem } from 'vux'

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
    }
  },
  components: {
    Grid,
    GridItem
  },
  data () {
    return {
      playSections: [],
      loading: true,
      plays: {},
      amount: localStorage.getItem('amount') || '',
      // raw data in play group from API for generating playSections
      raw: [],
      dialogVisible: false,
      activePlays: [],
      totalAmount: 0,
      submitted: false,
      submitting: false,
      errors: '',
      playReset: false
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
    formatting () {
      let category = this.$store.getters.categoriesById(this.$route.params.categoryId)
      return category ? category.formatting : null
    },
    // just to trigger watcher below
    rawAndFormatting () {
      return this.raw && this.formatting && (this.raw.length + this.formatting.length)
    },
    formattedCombinations () {
      let formattedDetails = {}
      _.each(this.activePlays, (activePlay) => {
        _.each(Object.keys(this.plays[activePlay.id].combinations), (key) => {
          formattedDetails[key] = this.plays[activePlay.id].combinations[key]
        })
      })
      return formattedDetails
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
      // save it into localStorage
      localStorage.setItem('amount', amount)
    },
    // play object array for submit to API to place the order
    'playsForSubmit': function (plays) {
      this.totalAmount = _.reduce(plays, (sum, play) => {
        return sum + parseFloat(play.bet_amount)
      }, 0)
    },
    'rawAndFormatting': function () {
      if (this.raw.length && this.formatting.length) {
        this.playSections = formatPlayGroup(this.raw, this.formatting)
      }
    }
  },
  created () {
    this.initPlaygroups()
  },
  methods: {
    filtAmount,
    selectAlias (playSection, tabIndex) {
      let activePlaygroup = _.find(playSection.playgroups, playgroup => playgroup.active)
      // reset 'active' for plays in inactive playgroups
      _.each(_.filter(this.plays, play => play.active && play.alias === activePlaygroup.alias), play => {
        this.$set(play, 'active', false)
        this.$set(play, 'amount', '')
      })
      // switch 'active' between play groups
      _.map(playSection.playgroups, (playgroup, index) => {
        this.$set(playgroup, 'active', index === tabIndex)
      })
    },
    getAliases (section) {
      let aliases = _.map(section.playgroups, playgroup => playgroup.alias)
      return aliases[0] ? aliases : []
    },
    beforeClose () {
      if (this.submitting) {
        return
      }
      this.errors = ''
      this.submitted = false
    },
    placeOrder () {
      this.submitting = true
      this.errors = ''
      placeBet(this.playsForSubmit)
        .then(res => {
          this.submitting = false
          // TODO: update conditions
          this.$store.dispatch('fetchUser')
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
    initPlaygroups () {
      const categoryId = this.$route.params.categoryId
      fetchPlaygroup(categoryId).then(res => {
        let plays = {}
        res.forEach(item => {
          item.plays.forEach(play => {
            plays[play.id] = play
            plays[play.id]['group'] = item['display_name']
          })
        })
        this.raw = res
        this.plays = plays
        this.loading = false
      })
    },
    openDialog () {
      const validedPlays = _.flatMap(
        _.filter(this.plays, play => play.active && parseFloat(play.amount) > 0),
        play => {
          if (play.combinations && !play.selectedOptions) {
            return _.map(play.combinations, combination => {
              return {
                ...play,
                combinations: combination
              }
            })
          } else {
            return [play]
          }
        }
      )
      this.activePlays = _.values(validedPlays.map(play => {
        let betOptions
        let isCustom = play.isCustom
        let optionDisplayNames = []
        if (play.selectedOptions) {
          let options = []
          _.each(play.selectedOptions, option => {
            options.push(option.num)
            optionDisplayNames.push(option.displayName || option.num)
          })
          betOptions = { options: options }
        } else if (play.combinations) {
          isCustom = false
          betOptions = { options: play.combinations }
          optionDisplayNames = [...play.combinations]
        } else {
          betOptions = {}
        }
        if (optionDisplayNames.length > 0) {
          optionDisplayNames = optionDisplayNames.join(',')
        } else {
          optionDisplayNames = ''
        }
        return {
          game_schedule: 10,
          display_name: play.hideName ? play.group : `${play.group} - ${play.display_name}`,
          odds: play.odds,
          bet_amount: play.amount,
          id: play.id,
          bet_options: betOptions,
          active: true,
          isCustom: isCustom,
          combinations: play.combinations,
          optionDisplayNames: optionDisplayNames
        }
      }))
      this.dialogVisible = true
    },
    getWidthForGroup (playSection) {
      // 0.01 is margin-right for each group
      return ((1 - (playSection.groupCol - 1) * 0.01) / playSection.groupCol) * 100 + '%'
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
    reset () {
      _.each(this.plays, play => {
        if (play.active) {
          this.$set(play, 'amount', '')
          this.$set(play, 'active', false)
        }
      })

      this.$set(this, 'playReset', !this.playReset)
    }
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';
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
