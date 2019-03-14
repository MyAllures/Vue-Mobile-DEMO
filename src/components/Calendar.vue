<template>
  <transition name="fade">
    <div v-show="visible">
      <section v-if="date" class="calendar-container" :style="{top: positionTop}" v-fix-scroll>
        <div class="calendar">
          <div class="calendar-top">
            <li @click="preMonth(myDate, false)">
              <div class="selector selector-left"></div>
            </li>
            <li class="calendar-title">{{dateTop}}</li>
            <li @click="nextMonth(myDate, false)">
              <div class="selector selector-right"></div>
            </li>
          </div>
          <div class="calendar-content">
            <div class="calendar-contentitem" v-for="(tag, index) in textTop" :key="index">
              <div class="weekday-tag">
                {{tag}}
              </div>
            </div>
          </div>
          <div class="calendar-content">
            <div class="calendar-contentitem"
              v-for="(item, index) in list"
              :key="index"
              @click="clickDay(item, index)">
              <div :class="[
                'calendar-dateitem',
                { 'calendar-dayhide': item.otherMonth !== 'nowMonth' },
                { 'calendar-chosenday': item.chosen },
                { 'calendar-hasbet': item.hasBet }]">
                <p class="date-number">{{item.id}}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="calendar-mask" @click="$emit('closeCalendar')"></div>
      </section>
    </div>
  </transition>
</template>

<script>
import timeUtil from '../utils/calendar.js'
import { fetchDateBetRecords } from '../api'
import FixScroll from '../directive/fixscroll'

export default {
  data () {
    return {
      textTop: ['一', '二', '三', '四', '五', '六', '日'],
      myDate: new Date(),
      list: [],
      dateTop: '',
      hasBetArr: [],
      chosenDays: []
    }
  },
  props: {
    positionTop: {
      type: String,
      default: '45px'
    },
    visible: {
      type: Boolean,
      default: false
    },
    date: String
  },
  directives: {
    FixScroll
  },
  methods: {
    clickDay (item, index) {
      if (item.otherMonth === 'nowMonth') {
        this.getList(this.myDate, item.date)
      } else {
        (item.otherMonth === 'preMonth') ? this.preMonth(item.date) : this.nextMonth(item.date)
      }
      this.$emit('closeCalendar')
      this.$emit('selectDate', this.$moment(new Date(item.date)).format('YYYY-MM-DD'))
    },
    preMonth (date, isChosedDay = true) {
      date = timeUtil.dateFormat(date)
      this.myDate = timeUtil.getOtherMonth(this.myDate, 'preMonth')

      if (isChosedDay) {
        this.getList(this.myDate, date, isChosedDay)
      } else {
        this.getList(this.myDate)
      }
    },
    nextMonth (date, isChosedDay = true) {
      date = timeUtil.dateFormat(date)
      this.myDate = timeUtil.getOtherMonth(this.myDate, 'nextMonth')

      if (isChosedDay) {
        this.getList(this.myDate, date, isChosedDay)
      } else {
        this.getList(this.myDate)
      }
    },
    getList (date, chooseDay, isChosedDay = true) {
      this.dateTop = `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`

      if (isChosedDay && chooseDay) { this.chosenDays.push(chooseDay) }
      let arr = timeUtil.getMonthList(this.myDate)

      for (let i = 0; i < arr.length; i++) {
        let k = arr[i]
        let flag = (k.otherMonth === 'nowMonth')
        let chosenIndex = this.chosenDays.length ? this.chosenDays.length - 1 : 0
        k.chosen = false
        if (this.hasBetArr.length) { k.hasBet = (this.hasBetArr.includes(k.date)) }
        k.chosen = (chooseDay && (chooseDay === k.date) && flag)
        if (chosenIndex && (k.date === this.chosenDays[chosenIndex])) {
          k.chosen = true
        }
      }

      this.list = arr
    },
    fetchDateBetRecord () {
      // 紀錄前30 天
      fetchDateBetRecords({ status: 'win,lose,tie,ongoing,cancelled,no_draw', offset: 0, limit: 30 }).then(data => {
        let betrecords = data.results
        let hasBetArr = []

        betrecords.forEach((r) => {
          hasBetArr.push(timeUtil.dateFormat(new Date(r.time)))
        })

        this.hasBetArr = hasBetArr
        this.getList(this.myDate, timeUtil.dateFormat(this.myDate))
      }).catch(() => {})
    }
  },
  watch: {
    'date': {
      handler: function (date) {
        if (date) {
          this.myDate = new Date(date)
          this.getList(this.myDate, timeUtil.dateFormat(this.myDate))
          this.fetchDateBetRecord()
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.calendar-container {
  position: absolute;
  max-width: 100%;
}

.calendar-mask {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 100%;
  height: 100%;
  z-index: 99;
}

.calendar {
  position: fixed;
  background-color: #fff;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding-bottom: 10px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.24), 0 0 4px 0 rgba(0, 0, 0, 0.12);
  z-index: 501;
}

.calendar-top {
  display: flex;
  .calendar-title {
    flex: 2.5;
  }
  li {
    display: flex;
    color: #333;
    font-size: 18px;
    flex: 1;
    justify-content: center;
    align-items: center;
    height: 40px;
  }
}

.calendar-content {
  display: flex;
  flex-wrap: wrap;
  padding: 0 3% 0 3%;
  width: 100%;
}

// month arrow selector
.selector {
  width: 12px;
  height: 12px;
  border-top: 2px solid #666;

  &-left {
    border-left: 2px solid #666;
    transform: rotate(-45deg);
  }

  &-right {
    border-right: 2px solid #666;
    transform: rotate(45deg);
  }

  &:active {
    border-color: #333;
  }
}

.calendar-contentitem {
  position: relative;
  width: 13.4%;
  height: 40px;
  text-align: center;
  color: #333;
  .weekday-tag, .calendar-dateitem {
    display: flex;
    width: 45px;
    height: 45px;
    line-height: 45px;
    margin: auto;
    justify-content: center;
    align-items: center;
  }
  .calendar-dayhide {
    color: #dde;
  }
  .calendar-chosenday {
    border-radius: 50%;
    color: #fff;
  }
}

.calendar-hasbet {
  flex-direction: column;
  .date-number {
    line-height: 25px;
  }
  &::after {
    content: '';
    position: static;
    display: inline-block;
    top: 32px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
  }
  &.calendar-chosenday::after {
    background-color: #fff;
  }
}
</style>
