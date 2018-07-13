<template>
  <section v-if="$route.params.date" class="calender-container" :style="{top: positionTop}" v-fix-scroll>
    <div class="calender">
      <div class="calender-top">
        <li @click="preMonth(myDate, false)">
          <div class="selector selector-left"></div>
        </li>
        <li class="calender-title">{{dateTop}}</li>
        <li @click="nextMonth(myDate, false)">
          <div class="selector selector-right"></div>
        </li>
      </div>
      <div class="calender-content">
        <div class="calender-contentitem" v-for="(tag, index) in textTop" :key="index">
          <div class="weekday-tag">
            {{tag}}
          </div>
        </div>
      </div>
      <div class="calender-content">
        <div class="calender-contentitem"
          v-for="(item, index) in list"
          :key="index"
          @click="clickDay(item, index)">
          <div :class="[
            'calender-dateitem',
            { 'calender-dayhide': item.otherMonth !== 'nowMonth' },
            { 'calender-today': item.isToday },
            { 'calender-chosenday': item.chosen },
            { 'calender-hasbet': item.hasBet }]">
            <p class="date-number">{{item.id}}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="calender-mask" @click="$emit('closeCalender')"></div>
  </section>
</template>

<script>
import timeUtil from '../utils/calender.js'
import { fetchDateBetRecords } from '../api'
import FixScroll from '../directive/fixscroll'

export default {
  data () {
    return {
      textTop: ['一', '二', '三', '四', '五', '六', '日'],
      myDate: new Date(),
      list: [],
      dateTop: '',
      hasBetArr: []
    }
  },
  props: {
    positionTop: {
      type: String,
      default: '45px'
    }
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
      this.$emit('closeCalender')
      let formattedDateForRoute = this.$moment(new Date(item.date)).format('YYYY-MM-DD')
      this.$router.replace({name: 'DetailBetRecord', params: {date: formattedDateForRoute}})
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

      let arr = timeUtil.getMonthList(this.myDate)

      for (let i = 0; i < arr.length; i++) {
        let k = arr[i]
        let flag = (k.otherMonth === 'nowMonth')
        const nowTime = k.date

        k.chosen = false
        if (this.hasBetArr.length) { k.hasBet = (this.hasBetArr.includes(k.date)) }
        k.chosen = (chooseDay && (chooseDay === nowTime) && flag)
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
  mounted () {
    this.getList(this.myDate)
    this.fetchDateBetRecord()
  },
  watch: {
    '$route': function (route) {
      let date = route.params.date
      if (date) {
        this.myDate = new Date(date)
        this.getList(this.myDate, timeUtil.dateFormat(this.myDate))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.calender-container {
  position: absolute;
  max-width: 100%;
}

.calender-mask {
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

.calender {
  position: fixed;
  background-color: #fff;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  padding-bottom: 10px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.24), 0 0 4px 0 rgba(0, 0, 0, 0.12);
  z-index: 501;
}

.calender-top {
  display: flex;
  .calender-title {
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

.calender-content {
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

.calender-contentitem {
  position: relative;
  width: 13.4%;
  height: 40px;
  text-align: center;
  color: #333;
  .weekday-tag, .calender-dateitem {
    display: flex;
    width: 45px;
    height: 45px;
    line-height: 45px;
    margin: auto;
    justify-content: center;
    align-items: center;
  }
  .calender-dayhide {
    color: #dde;
  }
  .calender-today {
    &::after {
      content: '今日';
      position: absolute;
      top: 15px;
      font-size: 12px;
      color: #bfbfbf;
    }

    &.calender-chosenday {
      line-height: 35px;
      align-items: flex-start;
    }
  }
  .calender-chosenday {
    background-color: #166fd8;
    border-radius: 50%;
    color: #fff;
  }
  .calender-hasbet {
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
      background-color: #166fd8;
    }
    &.calender-chosenday::after {
      background-color: #fff;
    }
  }
}
</style>
