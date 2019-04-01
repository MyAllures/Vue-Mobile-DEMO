<template>
  <div class="game-intro-container">
    <div class="title">{{game.display_name}}</div>
    <div class="content">
      <component :is="game.code" :gameName="game.display_name"></component>
    </div>
  </div>
</template>

<script>
const cqlf = (resolve) => require(['@/screens/games/rules/cqlf'], resolve)
const cs10fc = (resolve) => require(['@/screens/games/rules/cs10fc'], resolve)
const cs5fc = (resolve) => require(['@/screens/games/rules/cs5fc'], resolve)
const cs600cr = (resolve) => require(['@/screens/games/rules/cs600cr'], resolve)
const cs600hkl = (resolve) => require(['@/screens/games/rules/cs600hkl'], resolve)
const cs75hkl = (resolve) => require(['@/screens/games/rules/cs75hkl'], resolve)
const csjndhkl = (resolve) => require(['@/screens/games/rules/csjndhkl'], resolve)
const gd11x5 = (resolve) => require(['@/screens/games/rules/gd11x5'], resolve)
const jsk3 = (resolve) => require(['@/screens/games/rules/jsk3'], resolve)
const msk3 = (resolve) => require(['@/screens/games/rules/msk3'], resolve)
const bjk3 = (resolve) => require(['@/screens/games/rules/bjk3'], resolve)
const mlaft = (resolve) => require(['@/screens/games/rules/mlaft'], resolve)
const gdklsf = (resolve) => require(['@/screens/games/rules/gdklsf'], resolve)
const bcr = (resolve) => require(['@/screens/games/rules/bcr'], resolve)
const jsssc = (resolve) => require(['@/screens/games/rules/jsssc'], resolve)
const jspk10 = (resolve) => require(['@/screens/games/rules/jspk10'], resolve)
const cqssc = (resolve) => require(['@/screens/games/rules/cqssc'], resolve)
const ynssc = (resolve) => require(['@/screens/games/rules/ynssc'], resolve)
const hjssc = (resolve) => require(['@/screens/games/rules/hjssc'], resolve)
const pcdd = (resolve) => require(['@/screens/games/rules/pcdd'], resolve)
const luckdd = (resolve) => require(['@/screens/games/rules/luckdd'], resolve)
const hkl = (resolve) => require(['@/screens/games/rules/hkl'], resolve)
const luckl = (resolve) => require(['@/screens/games/rules/luckl'], resolve)
const cshkl = (resolve) => require(['@/screens/games/rules/cshkl'], resolve)
const xjssc = (resolve) => require(['@/screens/games/rules/xjssc'], resolve)
const tjssc = (resolve) => require(['@/screens/games/rules/tjssc'], resolve)
const csffc = (resolve) => require(['@/screens/games/rules/csffc'], resolve)
const bjkl8 = (resolve) => require(['@/screens/games/rules/bjkl8'], resolve)
const er75ft = (resolve) => require(['@/screens/games/rules/er75ft'], resolve)
const auluck8 = (resolve) => require(['@/screens/games/rules/auluck8'], resolve)
const jnd28 = (resolve) => require(['@/screens/games/rules/jnd28'], resolve)
const fc3d = (resolve) => require(['@/screens/games/rules/fc3d'], resolve)
const cs60cr = (resolve) => require(['@/screens/games/rules/cs60cr'], resolve)

export default {
  name: 'GameIntro',
  components: {
    cs10fc,
    cs5fc,
    cs600cr,
    cs600hkl,
    cqlf,
    gd11x5,
    jsk3,
    msk3,
    bjk3,
    mlaft,
    gdklsf,
    bcr,
    jsssc,
    jspk10,
    cqssc,
    ynssc,
    hjssc,
    pcdd,
    luckdd,
    hkl,
    luckl,
    cshkl,
    cs75hkl,
    csjndhkl,
    xjssc,
    tjssc,
    csffc,
    bjkl8,
    er75ft,
    auluck8,
    jnd28,
    fc3d,
    cs60cr
  },
  props: {
    game: {
      type: Object
    }
  }
}
</script>

<style lang="less" scoped>
.game-intro-container {
  height: 100%;
}
.title {
  font-size: 16px;
  line-height: 40px;
  height: 40px;
  background-color: #f5f5f5;
  top: 0;
  text-align: center;
  z-index: 2;
}
.content {
  height: calc(~"100%" - 40px);
  overflow-y: auto;
  .rule-details {
    box-sizing: border-box;
    padding: 10px 10px 60px 10px;
    font-size: 14px;
    height: 100%;
    overflow: auto;
    line-height: 2.0;
    color: #4a4a4a;
    letter-spacing: 1.6px;
    /deep/ .warn {
      color: @red;
    }
    /deep/ h3 {
      font-size: 14px;
      font-weight: normal;
    }
    /deep/ li {
      margin-left: 20px;
      list-style: initial;
      word-wrap: break-word;
    }
    /deep/ a {
      text-decoration: underline;
    }
  }
}

</style>
