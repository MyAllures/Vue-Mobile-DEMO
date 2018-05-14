<template>
  <div class="intro-container" v-if="currentGame.id">
    <div class="title vux-1px-b ">{{currentGame.display_name}} 游戏介绍</div>
    <component :is="currentGame.code" v-if="currentGame"></component>
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
import luckdd from './rules/luckdd'
import hkl from './rules/hkl'
import luckl from './rules/luckl'
import xjssc from './rules/xjssc'
import tjssc from './rules/tjssc'
import csffc from './rules/csffc'
import bjkl8 from './rules/bjkl8'
import er75ft from './rules/er75ft'
import auluck8 from './rules/auluck8'
import jnd28 from './rules/jnd28'
import fc3d from './rules/fc3d'
import { XAddress, XTable } from 'vux'
import { mapGetters } from 'vuex'
import { fetchPlaySetting } from '../../api'
import _ from 'lodash'

export default {
  name: 'GameIntro',
  props: {
    currentGame: {
      type: Object,
      default: function () {
        return {
          id: ''
        }
      }
    }
  },
  data () {
    return {
      currentGameId: [],
      games: [],
      showGameMenu: false,
      playSet: ''
    }
  },
  methods: {
    selectGame () {
      this.showGameMenu = true
    },
    fetchPlaySetting (id) {
      fetchPlaySetting(id).then(res => {
        this.playSet = res
      })
    }
  },
  computed: {
    ...mapGetters([
      'allGames'
    ])
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
    },
    'currentGameId': function (id) {
      this.fetchPlaySetting(id[0])
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('fetchGames')
    })
  },
  components: {
    XAddress,
    XTable,
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
    luckdd,
    hkl,
    luckl,
    xjssc,
    tjssc,
    csffc,
    bjkl8,
    er75ft,
    auluck8,
    jnd28,
    fc3d
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';
@import '~vux/src/styles/1px.less';
.title {
  font-size: 16px;
  line-height: 40px;
  text-align: center;
  position: sticky;
  background-color: #f5f5f5;
  top: 0;
}

.playsetting-table{
  font-size: 14px;
  color: #4a4a4a;
}

.gameplay-field {
  width: 200px;
}

.intro-container {
  background-color: #fff;
  padding: 0 0 60px;
}

.rule-details {
  padding: 10px;
  font-size: 14px;
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
</style>
