<template>
  <div>
    <GameResult :gameid="$route.params.gameId"/>
    <Countdown
        :schedule="schedule"
        v-if="schedule.id"
        :currentGame="currentGame"
        :gameClosed="gameClosed"
        :closeCountDown="closeCountDown"
        :resultCountDown="resultCountDown"/>
    <div class="bet-area">
      <div class="aside">
        <ul>
          <li
            :class="['category-menu-item',activeCategory===category.id?'active':'']"
            v-for="(category, index) in categories"
            :key="'category' + category.id"
            @click="switchCategory(category)">{{category.display_name}}</li>
        </ul>
      </div>
      <div class="main">
        <router-view
        :key="$route.name + ($route.params.categoryId || '')"
        :game="currentGame"
        :scheduleId="schedule ? schedule.id : null"
        :gameClosed="gameClosed" />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { fetchSchedule } from '../../api'
import Countdown from '../../components/Countdown'
import GameResult from '../../components/GameResult'
export default {
  name: 'Game',
  components: {
    Countdown,
    GameResult
  },
  data () {
    return {
      gameId: this.$route.params.gameId,
      schedule: {
        id: null
      },
      timer: '',
      closeCountDown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      resultCountDown: {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      },
      categories: []
    }
  },
  computed: {
    gameClosed () {
      const c = this.closeCountDown
      return c.days + c.hours + c.minutes + c.seconds === 0
    },
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    },
    activeCategory () {
      return parseInt(this.$route.params.categoryId)
    }
  },
  created () {
    this.updateSchedule()
    this.categories = this.$store.getters.categoriesByGameId(this.gameId)
    if (!this.categories.length) {
      this.$store.dispatch('fetchCategories', this.gameId)
        .then((res) => {
          if (res) {
            this.categories = res
            this.$router.push(`/game/${this.gameId}/${this.categories[0].id}`)
          } else {
            this.performLogin()
          }
        })
    } else {
      this.$router.push(`/game/${this.gameId}/${this.categories[0].id}`)
    }
  },
  methods: {
    updateSchedule () {
      clearInterval(this.timer)
      fetchSchedule(this.gameId)
        .then(res => {
          this.schedule = _.find(res, schedule => {
            return schedule.id !== this.schedule.id &&
              this.$moment().isBefore(schedule.schedule_result) &&
              (schedule.status === 'open' || schedule.status === 'created')
          })
          this.startTimer()
        })
    },
    switchCategory (category) {
      if (!category) {
        return
      }
      this.$router.push({
        path: `/game/${this.$route.params.gameId}/${category.id}`,
        params: { formatting: category.formatting }
      })
    },
    startTimer () {
      if (!this.schedule) {
        return
      }
      this.timer = setInterval(() => {
        const closeTime = this.$moment(this.schedule.schedule_close)
        const resultTime = this.$moment(this.schedule.schedule_result)
        if (this.$moment().isAfter(resultTime)) {
          clearInterval(this.timer)
          return
        }
        this.closeCountDown = this.diffTime(closeTime)
        this.resultCountDown = this.diffTime(resultTime, true)
      }, 1000)
    },
    diffTime (target, flag) {
      const duration = this.$moment.duration(target.diff())
      let days = duration.days()
      let hours = duration.hours()
      let minutes = duration.minutes()
      let seconds = duration.seconds()
      if (flag && (days + hours + minutes + seconds === 0)) {
        this.updateSchedule()
      }
      days = days < 0 ? 0 : days
      hours = hours < 0 ? 0 : hours
      minutes = minutes < 0 ? 0 : minutes
      seconds = seconds < 0 ? 0 : seconds
      return {
        days,
        hours,
        minutes,
        seconds
      }
    }
  }
}
</script>

<style lang="less" scoped>
.bet-area {
  display: flex;
  height: calc(~"100vh" - 125px);
  .aside {
    overflow-y: auto;
    height: 100%;
    width: 81px;
    display: flex;
    align-items: center;
    background-color: #f9f9f9;
    color: #9b9b9b;
    ul {
      width: 100%;
      background-color: #f9f9f9;
      li {
        box-sizing: border-box;
        padding-left: 5px;
        height: 40px;
        width: 100%;
        line-height: 40px;
        border-top: 1px solid rgba(0, 0, 0, 0.14);
        &:last-child {
          border-bottom: 1px solid rgba(0, 0, 0, 0.14);
        }
        &.active {
          color: #000;
        }
      }
    }
  }
  .main {
    height: 100%;
    width: calc(~"100%" - 81px);
    overflow-y: auto;
    background-color: #fff;
  }
}
</style>
