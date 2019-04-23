<template>
  <div :class="['balls-number', 'wrapper-' + gameType]">
    <div class="balls-frame">
      <div v-if="gameType === 'jsk3'|| gameCode === 'msk3'|| gameCode === 'bjk3'|| gameCode ==='gxk3' || gameCode ==='shk3' || gameCode ==='hubk3'" class="jsk3-loading">
        <div class="camera">
          <div class="space space1">
              <div class="dice dice1"></div>
              <div class="dice dice2"></div>
              <div class="dice dice3"></div>
              <div class="dice dice4"></div>
              <div class="dice dice5"></div>
              <div class="dice dice6"></div>
          </div>
        </div>
        <div class="camera">
          <div class="space space2">
              <div class="dice dice1"></div>
              <div class="dice dice2"></div>
              <div class="dice dice3"></div>
              <div class="dice dice4"></div>
              <div class="dice dice5"></div>
              <div class="dice dice6"></div>
          </div>
        </div>
        <div class="camera">
          <div class="space space3">
              <div class="dice dice1"></div>
              <div class="dice dice2"></div>
              <div class="dice dice3"></div>
              <div class="dice dice4"></div>
              <div class="dice dice5"></div>
              <div class="dice dice6"></div>
          </div>
        </div>
      </div>
      <div
        v-else
        :class="getResultClass(chunk)"
        v-for="(chunk, chunkIndex) in resultChunks"
        :key="chunkIndex">
        <b v-if="chunk.type==='text'">{{chunk.data}}</b>
        <ul v-else
          :style="getAnimateStyle(chunkIndex)"
          :class="`ul ${getAnimateClass(chunkIndex)}`">
          <li
            v-for="(num, index) in chunk"
            :key="index"

            :class="`result result-${gameType} resultnum-${num}`">
            <span class="num">{{num}}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
import {HKL_GAMES} from '../config'
const GameOnlyChange = ['jspk10', 'bcr', 'mlaft', 'er75ft', 'jsk3', 'cs60cr']
const rand1to10 = ['jspk10', 'bcr', 'mlaft', 'er75ft']
const rand0to9 = ['jsssc', 'tjssc', 'xjssc', 'cqssc', 'ynssc', 'hjssc', 'csffc', 'pcdd', 'jnd28']
const rand1to11 = ['gd11x5', 'ah11x5', 'bj11x5', 'fh11x5', 'gs11x5']
const rand1to20 = ['cqlf', 'gdklsf', 'hkl']
const rand1to49 = ['bjkl8', 'auluck8']
const randomGeneratorFactory = (gameType) => {
  if (rand1to10.includes(gameType)) {
    return () => Math.floor(Math.random() * 10 + 1)
  } else if (rand0to9.includes(gameType)) {
    return () => Math.floor(Math.random() * 10)
  } else if (rand1to11.includes(gameType)) {
    return () => Math.floor(Math.random() * 11 + 1)
  } else if (rand1to20.includes(gameType)) {
    return () => Math.floor(Math.random() * 20 + 1)
  } else if (rand1to49.includes(gameType)) {
    return () => Math.floor(Math.random() * 80 + 1)
  } else {
    return () => Math.floor(Math.random() * 6 + 1)
  }
}
export default {
  name: 'GameResultAnimate',
  props: {
    gameCode: {
      type: String
    },
    resultNums: {
      type: Array
    },
    lastNums: {
      type: Array
    }
  },
  computed: {
    gameType () {
      if (HKL_GAMES.includes(this.gameCode)) {
        return 'hkl'
      }
      return this.gameCode
    },
    resultChunks () {
      const randomGenerator = randomGeneratorFactory(this.gameType)
      return this.resultNums.map((num, index) => {
        if (num.type === 'text') {
          return num
        } else {
          const arr = []
          for (let i = 0; i < 4; i++) {
            arr.push(randomGenerator())
          }
          arr.push(arr[0])
          arr[0] = this.lastNums[index]
          return arr
        }
      })
    }
  },
  methods: {
    getResultClass (num) {
      if (num.type === 'text') {
        return ['text', 'view']
      }
      return [`result-${this.gameType} result`, 'view']
    },
    getAnimateClass (chunkIndex) {
      return GameOnlyChange.includes(this.gameCode) ? `step-${chunkIndex % 2 ? 'odd' : 'even'}` : 'scroll-animating'
    },
    getAnimateStyle (chunkIndex) {
      let animationDuration = ''
      const GAMES_HAS_SUM = ['pcdd', 'jnd28', 'luckdd']
      const getDuration = (speed = 1.5) => (chunkIndex + 1) / speed
      if (GAMES_HAS_SUM.includes(this.gameCode)) {
        animationDuration = `${(getDuration())}s`
      } else {
        animationDuration = `${getDuration((Math.random() * 5) + 3)}s`
      }
      return GameOnlyChange.includes(this.gameCode) ? `` : {animationDuration}
    }
  }
}
</script>
<style lang="scss" scoped>
.balls-number {
  flex: 2.5;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  .balls-frame {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-width: 265px;
  }
}
.view {
  position: relative;
  margin-right: 3px;
  background: none;
  overflow: hidden;
  border-radius: 0;
  &::before {
    display: none;
  }
  &.text {
    font-size: 12px;
  }
  .scroll-odd {
    width: 100%;
    animation: 1s scrollUp linear infinite normal;
  }
  .scroll-even {
    width: 100%;
    animation: 1.5s scrollDown linear infinite normal;
  }
  .ul {
    position: absolute;
    top: 0;
    left: 0;
  }
  .scroll-animating {
    animation-name: scroll;
    animation-timing-function: linear;
    animation-delay: 0s;
    animation-iteration-count: 1;
    animation-direction: normal;
    will-change: transform;
  }
  .step-odd {
    width: 100%;
    animation: 1s changeStep step-start infinite normal;
  }
  .step-even {
    width: 100%;
    animation: 1s changeStep step-start infinite normal;
  }
  &.result-bjkl8,&.result-auluck8  {
    margin-bottom: 2px;
  }
}
.ball-sum {
  display: inline-block;
  font-size: 12px;
}
.wrapper-hkl .view{
  margin-bottom: 10px;
}

@keyframes scroll {
  0% {
    transform: translateY(-100%);
  }
  75% {
    transform: translateY(-30%);
  }
  95% {
    transform: translateY(2%);
  }
  100% {
    transform: translateY(0%);
  }
}

@keyframes scrollUp {
  0% {
      transform: translateY(0);
  }
  100% {
      transform: translateY(-80%);
  }
}
@keyframes scrollDown {
  0% {
      transform: translateY(-80%);
  }
  100% {
      transform: translateY(0);
  }
}
@keyframes changeStep {
  0% {
      transform: translateY(0);
  }
  25% {
      transform: translateY(-20%);
  }
  50% {
      transform: translateY(-40%);
  }
  75% {
      transform: translateY(-60%);
  }
  100% {
      transform: translateY(-80%);
  }
}
.jsk3-loading {
  display: flex;
  height: 27px;
}
.camera{
    width: 27px;
    height: 27px;
    perspective-origin:center center;
    perspective:500px;
    &:nth-child(2){
      margin: 0 15px;
    }
}
.space{
    position:relative;
    width: 27px;
    height: 27px;
    transform-style:preserve-3d;
    transform-origin: 13px center -13px;
}
.space1 {
  animation:roll .2s linear .1s infinite;
}
.space2 {
  animation:roll2 .2s linear .2s infinite;
}
.space3 {
  animation:roll3 .2s linear .3s infinite;
}
.dice {
  position:absolute;
  top: 0;
  left: 0;
  width: 27px;
  height: 27px;
  background-size: 27px 162px;
  background-image: url("../assets/ball_4.png");
  background-repeat:  no-repeat;
}
.dice1{
    background-position: 0 0;
}
.dice2{
    background-position: 0 (-27px * 1);
    transform-origin:left top;
    transform:translateX(26px) rotateY(90deg);
}
.dice3{
    background-position: 0 (-27px * 2);
    transform:translateZ(-26px) rotateY(180deg);
}
.dice4{
    background-position: 0 (-27px * 3);
    transform-origin:right top;
    transform:translateX(-26px) rotateY(-90deg);
}
.dice5{
    background-position: 0 (-27px * 4);
    transform-origin:center bottom;
    transform:translateY(-26px) rotateX(90deg);
}
.dice6{
    background-position: 0 (-27px * 5);
    transform-origin:center top;
    transform:translateY(26px) rotateX(-90deg);
}

@keyframes roll{
    0%{
        transform:rotateY(0) rotateZ(30deg);
    }
    100%{
        transform:rotateY(-359.9deg) rotateZ(30deg);
    }
}
@keyframes roll2{
    0%{
        transform:rotateY(0) rotateZ(45deg);
    }
    100%{
        transform:rotateY(-359.9deg) rotateZ(45deg);
    }
}
@keyframes roll3{
    0%{
        transform:rotateY(0) rotateZ(60deg);
    }
    100%{
        transform:rotateY(-359.9deg) rotateZ(60deg);
    }
}
</style>
