<template>
  <div :class="['lottery-num', resultNums.length >= 20 ? 'multi-row' : 'single-row']">
    <div :class="[ option.class, option.type,
      { result: resultNums.length >= 20 }
      ]"
      :data-zodiac="option.zodiac"
      v-for="(option, index) in resultNums"
      :key="index">
      <span v-if="option.num" class="num">{{option.num}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LotteryRecordNum',
  props: {
    record: Object,
    gameType: String,
    activeType: String
  },
  computed: {
    resultNums () {
      let rawNums = this.record.result_str.split(',')
      let formattedNums = []
      if (this.gameType === 'bjkl8') { rawNums.pop() }
      let comparision = {
        oddEven: 'ball_odd_even_',
        thanSize: 'ball_than_size_',
        tailThanSize: 'ball_tail_than_size_',
        ballOfSumOddEven: 'ball_of_sum_number_odd_even_',
        ballOfSumThanSize: 'ball_of_sum_number_than_size_',
        zodiac: 'ball_chinese_zodiac_'
      }
      let resultCategory = this.record.result_category || {}
      rawNums.forEach((rawBall, i) => {
        if (rawBall[0] === '0' && rawBall !== '0') { rawBall = rawBall.slice(1) }

        let index = i + 1
        let data = resultCategory[comparision[this.activeType] + index]
        let obj = {}

        obj.type = this.activeType
        if (this.activeType === 'number') {
          obj.num = rawBall
          obj.class = `ball result-${this.gameType} resultnum-${rawBall}`
        } else if (this.activeType === 'zodiac') {
          obj.zodiac = data
          obj.class = 'zodiac'
        } else {
          obj.class = `${data || 'default'}`
        }

        formattedNums.push(obj)
      })
      return formattedNums
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.badge() {
  background: url('../assets/comparision.png') no-repeat;
  background-size: 500% 100%;
  display: inline-block;
  width: 26px;
  height: 26px;
  text-indent: -9999px;
  @media only screen and (max-width: 360px) {
    width: 22px;
    height: 22px;
  }
}

.zodiac {
  display: block;
}

.bigger, .smaller, .even, .odd, .equal {
  .badge();
}

.bigger {
  background-position: -4px center;
  @media only screen and (max-width: 360px) {
    background-position: -3px center;
  }
}

.smaller {
  background-position: -26px center;
  @media only screen and (max-width: 360px) {
    background-position: -23px center;
  }
}

.even {
  background-position: -50px center;
  @media only screen and (max-width: 360px) {
    background-position: -43px center;
  }
}

.odd {
  background-position: -75px center;
  @media only screen and (max-width: 360px) {
    background-position: -63px center;
  }
}

.equal {
  background-position: -99px center;
  @media only screen and (max-width: 360px) {
    background-position: -84px center;
  }
}

.zodiac {
  &::after {
    content: attr(data-zodiac);
    display: inline-block;
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  .num {
    display: none;
  }
}

.ball {
  margin-left: 1px;
}
.lottery-num {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  &.single-row {
    .ball {
      margin-right: 5px;
      @media screen and (max-width: 320px) {
        margin-right: 1px;
      }
    }
  }
  &.multi-row {
    height: 50px;
    width: 250px;
    margin: 0 auto;
    margin-top: 5px;
    margin-bottom: 5px;
    @media screen and (max-width: 320px) {
      width: 200px;
    }
  }
}
</style>


