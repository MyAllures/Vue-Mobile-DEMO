<template>
  <div class="clear-viewbox-default-bottom">
    <div class="intro-container">
      <component :is="currentGame.code"></component>
    </div>
    <div class="intro-selector text-center" @click="selectGame()">
      <span :class="['option', {'selected': currentGame.id}]">{{currentGame.display_name}}</span>
      <span class="arrow"></span>
    </div>
    <x-address style="display: none"
      title="请选择"
      v-model="currentGameId"
      :list="games"
      :show.sync="showGameMenu">
    </x-address>
  </div>
</template>

<script>
import cqlf from './rules/cqlf'
import gd11x5 from './rules/gd11x5'
import jsk3 from './rules/jsk3'
import mlaft from './rules/mlaft'
import gdklsf from './rules/gdklsf'
import bcr from './rules/bcr'
import jsssc from './rules/jsssc'
import jspk10 from './rules/jspk10'
import cqssc from './rules/cqssc'
import pcdd from './rules/pcdd'
import hkl from './rules/hkl'
import xjssc from './rules/xjssc'
import tjssc from './rules/tjssc'
import bjkl8 from './rules/bjkl8'
import er75ft from './rules/er75ft'
import auluck8 from './rules/auluck8'
import jnd28 from './rules/jnd28'
import fc3d from './rules/fc3d'
import { XAddress } from 'vux'
import { mapGetters } from 'vuex'
import _ from 'lodash'

export default {
  name: 'GameIntro',
  data () {
    return {
      currentGameId: [],
      games: [],
      showGameMenu: false
    }
  },
  methods: {
    selectGame () {
      this.showGameMenu = true
    }
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    currentGame () {
      let code = _.find(this.allGames, game => (game.id + '') === this.currentGameId[0])
      return code || { display_name: '请选择' }
    }
  },
  watch: {
    'allGames': function (allGames) {
      const played = localStorage.getItem('lastGame')
      this.currentGameId = played ? [played] : [allGames[0].id + '']
      _.each(this.allGames, (game) => {
        this.games.push(
          {
            name: game.display_name,
            value: game.id + ''
          }
        )
      })
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('fetchGames')
    })
  },
  components: {
    XAddress,
    cqlf,
    gd11x5,
    jsk3,
    mlaft,
    gdklsf,
    bcr,
    jsssc,
    jspk10,
    cqssc,
    pcdd,
    hkl,
    xjssc,
    tjssc,
    bjkl8,
    er75ft,
    auluck8,
    jnd28,
    fc3d
  }
}
</script>

<style lang="less">
@import '../../styles/vars.less';
.intro-selector {
  position: fixed;
  top: 45px;
  width: 100%;
  height: 45px;
  line-height: 45px;
  background-color: #fff;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.5);
  .option {
    font-size: 14px;
  }
  .arrow {
    display: inline-block;
    height: 6px;
    width: 6px;
    border-width: 2px 2px 0 0;
    border-color: #C8C8CD;
    border-style: solid;
    transform: rotate(135deg);
    margin-left: 3px;
    margin-bottom: 2px;
  }
}

.intro-container {
  background-color: #fff;
  margin-top: 90px;
  padding: 10px;
}

.rule-details {
  font-size: 14px;
  line-height: 2.0;
  color: #4a4a4a;
  letter-spacing: 1.6px;
  .warn {
    color: @red;
  }
  h3 {
    font-size: 14px;
    font-weight: normal;
  }
  li {
    margin-left: 20px;
    list-style: initial;
  }
  a {
    text-decoration: underline;
  }
}
</style>
