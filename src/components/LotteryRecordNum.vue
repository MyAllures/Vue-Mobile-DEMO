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
      let resultCategory = this.record.result_category || {}
      rawNums.forEach((rawBall, i) => {
        if (rawBall[0] === '0' && rawBall !== '0') { rawBall = rawBall.slice(1) }

        let index = i + 1
        let comparision = {
          oddEven: resultCategory[`ball_odd_even_${index}`],
          thanSize: resultCategory[`ball_than_size_${index}`],
          tailThanSize: resultCategory[`ball_tail_than_size_${index}`],
          ballOfSumOddEven: resultCategory[`ball_of_sum_number_odd_even_${index}`],
          ballOfSumThanSize: resultCategory[`ball_of_sum_number_than_size_${index}`],
          zodiac: resultCategory[`ball_chinese_zodiac_${index}`]
        }

        let obj = {}
        obj.type = this.activeType
        if (this.activeType === 'number') {
          obj.num = rawBall
          obj.class = `ball result-${this.gameType} resultnum-${rawBall}`
        } else {
          obj.class = `${comparision[this.activeType] || 'default'}`
        }
        if (this.activeType === 'zodiac') {
          obj.zodiac = comparision[this.activeType]
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
  width: 35px;
  height: 35px;
  text-indent: -9999px;
}

.zodiac {
  display: block;
}

.bigger, .smaller, .even, .odd, .equal {
  .badge();
}

.bigger {
  background-position: -4px center;
}
.smaller {
  background-position: -36px center;
}
.even {
  background-position: -67px center;
}
.odd {
  background-position: -101px center;
}
.equal {
  background-position: -135px center;
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


