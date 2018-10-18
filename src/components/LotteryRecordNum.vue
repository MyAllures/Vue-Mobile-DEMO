<template>
  <div :class="['lottery-num', resultNums.length>=20?'multi-row':'single-row']">
    <div
      :class="[option.class, {result: resultNums.length>=20}]"
      v-for="(option, index) in resultNums"
      :key="index">
      <span class="num">{{option.num}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LotteryRecordNum',
  props: {
    results: Array,
    gameType: String
  },
  computed: {
    resultNums () {
      let rawNums = this.results.split(',')
      let formattedNums = []
      if (this.gameType === 'bjkl8') {
        rawNums.pop()
      }
      rawNums.forEach((rawBall) => {
        if (rawBall[0] === '0' && rawBall !== '0') {
          rawBall = rawBall.slice(1)
        }
        formattedNums.push({num: rawBall, class: `ball result-${this.gameType} resultnum-${rawBall}`})
      })
      return formattedNums
    }
  }
}
</script>

<style lang="less" scoped>
.ball {
  margin-left: 1px;
}
.lottery-num {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
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
    @media screen and (max-width: 320px) {
      width: 200px;
    }
  }
}
</style>


