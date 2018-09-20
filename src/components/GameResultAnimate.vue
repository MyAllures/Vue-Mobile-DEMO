<template>
  <div :class="['balls-number', 'wrapper-' + gameCode]">
    <div class="balls-frame">
      <div v-if="gameCode === 'jsk3'" class="jsk3-loading">
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
        <ul v-else :class="`${animate}-${chunkIndex%2?'odd':'even'}`">
          <li
            v-for="(num, index) in chunk"
            :key="index"
            :class="`result-${gameCode} resultnum-${num}`">
            <b> {{num}} </b>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
const GameOnlyChange = ['jspk10', 'bcr', 'mlaft', 'er75ft', 'hkl', 'luckl', 'jsk3', 'cs60cr']
const rand1to10 = ['jspk10', 'bcr', 'mlaft', 'er75ft']
const rand0to9 = ['jsssc', 'tjssc', 'xjssc', 'cqssc', 'csffc']
const rand1to11 = ['gd11x5']
const rand1to20 = ['cqlf', 'gdklsf', 'hkl', 'luckl']
const rand1to49 = ['bjkl8', 'pcdd', 'jnd28']
const randomGeneratorFactory = (gameCode) => {
  if (rand1to10.includes(gameCode)) {
    return () => Math.floor(Math.random() * 10 + 1)
  } else if (rand0to9.includes(gameCode)) {
    return () => Math.floor(Math.random() * 10)
  } else if (rand1to11.includes(gameCode)) {
    return () => Math.floor(Math.random() * 11 + 1)
  } else if (rand1to20.includes(gameCode)) {
    return () => Math.floor(Math.random() * 20 + 1)
  } else if (rand1to49.includes(gameCode)) {
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
    }
  },
  computed: {
    resultChunks () {
      const randomGenerator = randomGeneratorFactory(this.gameCode)
      return this.resultNums.map(num => {
        if (num.type === 'text') {
          return num
        } else {
          const arr = []
          for (let i = 0; i < 4; i++) {
            arr.push(randomGenerator())
          }
          arr.push(arr[0])
          return arr
        }
      })
    },
    animate () {
      return GameOnlyChange.includes(this.gameCode) ? 'step' : 'scroll'
    }
  },
  methods: {
    getResultClass (num) {
      if (num.type === 'text') {
        return ['text', 'view']
      }
      return [`result-${this.gameCode}`, 'view']
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../styles/resultsball.scss";
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
  .step-odd {
    width: 100%;
    animation: 1s changeStep step-start infinite normal;
  }
  .step-even {
    width: 100%;
    animation: 1s changeStep step-start infinite normal;
  }
}
.ball-sum {
  display: inline-block;
  font-size: 12px;
}
.wrapper-hkl .view{
  margin-bottom: 10px;
}
.wrapper-luckl .view{
  margin-bottom: 10px;
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
