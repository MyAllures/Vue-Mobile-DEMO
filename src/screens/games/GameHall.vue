<template>
  <div class="gamehall">
    <top-bar>
      <template slot="left">
        <div
          class="left-ctrl back"
          @click="toHome">
          <span class="left-arrow"></span>
          首页
        </div>
      </template>
      <div class="main-title" @click="isGameMenuVisible = !isGameMenuVisible">
        {{ currentGame && currentGame.display_name }}
      </div>
      <template slot="right">
        <div class="right-ctrl">
          <div
            v-click-outside="onClickOutSideHelper"
            class="helper"
            slot="right">
            <div class="helper-trigger" @click="toggleHelper">
              <div class="icon"></div>
              助手
            </div>
            <ul class="helper-link-group" v-show="isHelperVisible" @click="isHelperVisible = false">
              <li v-if="hasExpertPlan" class="helper-link" @click="showGameInfo('expertplan')">
                专家计划
              </li>
              <li v-if="hasRoadBead" class="helper-link" @click="showGameInfo('roadbeads')">
                路珠
              </li>
              <li class="helper-link" @click="showGameInfo('leaderboard')">
                长龙排行榜
              </li>
              <li class="helper-link" @click="showGameInfo('history')">
                历史开奖
              </li>
              <li v-if="hasTrendDiagram" class="helper-link" @click="showGameInfo('trend')" >
                走势图表
              </li>
              <li class="helper-link" @click="showGameInfo('intro')">
                游戏介绍
              </li>
            </ul>
          </div>
          <div class="right-menu-btn" @click="isGameMenuVisible=false;$store.dispatch('showRightMenu')"></div>
        </div>
      </template>
    </top-bar>
    <game-menu v-model="isGameMenuVisible" v-if="games&&games.length&&theme"/>
    <div v-if="games&&games.length&&theme&&currentGame" class="notify-msg-wrapper topbar" :style="{'margin-top': showNotifiyMsg?'0':'-25px'}">
      <div v-if="!isGameMenuVisible && showNotifiyMsg"
        @click="isGameMenuVisible = !isGameMenuVisible"
        class="notify-msg menu-center topbar" :style="{'background-color': theme}"
      >开奖太久？立即体驗更快速的{{currentGame.group_tag.name}}<div class="close-btn" @click.stop="hideNotifyMsg(currentGame.display_name)"></div>
      </div>
    </div>
    <game-menu-icon
      class="menu-center"
      :style="{top: showNotifiyMsg ? '63px' : '39px'}"
      @click.native="isGameMenuVisible = !isGameMenuVisible"
      type="more"
    />
    <div :style="{height: showNotifiyMsg? `calc(100% - 37px)`:'calc(100% - 12px)'}">
      <router-view :key="$route.params.gameId"/>
    </div>
    <game-info v-if="currentGame" :game="currentGame" :type="contentType" :visible.sync="isGameInfoVisible"/>
  </div>
</template>
<script>
import { XHeader, Popup, XButton, TransferDom } from 'vux'
import { mapState } from 'vuex'
import GameInfo from './GameInfo'
import { find } from 'lodash'
import GameMenu from '@/components/GameMenu.vue'
import GameMenuIcon from '@/components/GameMenuIcon'
import '../../styles/resultsball.scss'
import '../../styles/playgroup.scss'
import TopBar from '@/components/TopBar'
import { hasExpertPlan } from '@/utils/expertPlanSetting'
import {hasTrendDiagram} from '@/utils/trendDiagramSetting'
import {hasRoadBead} from '@/utils/roadBeadSetting'
import vClickOutside from 'v-click-outside'
function to (scrollTop) {
  document.body.scrollTop = document.documentElement.scrollTop = scrollTop
}
function getScrollTop () {
  return document.body.scrollTop || document.documentElement.scrollTop
}
let scrollTop

export default {
  name: 'GameHall',
  components: {
    Popup,
    XHeader,
    GameInfo,
    XButton,
    TopBar,
    GameMenu,
    GameMenuIcon
  },
  directives: {
    TransferDom,
    clickOutside: vClickOutside.directive
  },
  data () {
    return {
      sidebarShow: false,
      showRightMenu: false,
      contentType: '',
      isGameInfoVisible: false,
      isGameMenuVisible: false,
      isHelperVisible: false,
      showNotifiyMsg: false
    }
  },
  computed: {
    recommMaps () {
      if (!this.games || !this.games.length) {
        return {}
      }
      let map = {}
      this.games.forEach(game => {
        if (game.prompt_game) {
          map[game.code] = game.prompt_game
        }
      })
      return map
    },
    hasExpertPlan () {
      if (!this.currentGame) {
        return false
      }
      return hasExpertPlan(this.currentGame.code)
    },
    hasTrendDiagram () {
      if (!this.currentGame) {
        return false
      }
      return hasTrendDiagram(this.currentGame.code)
    },
    hasRoadBead () {
      if (!this.currentGame) {
        return false
      }
      return hasRoadBead(this.currentGame.code)
    },
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    },
    ...mapState([
      'systemConfig', 'theme', 'games'
    ]),
    seoWebsite () {
      if (this.systemConfig.planSiteUrl && this.currentGame) {
        const code = this.currentGame.code
        const gamesHasPlan = ['bcr', 'cqssc', 'jsssc', 'ynssc', 'hjssc', 'jspk10', 'mlaft']
        if (gamesHasPlan.includes(code)) {
          return `${this.systemConfig.planSiteUrl}/game/${code}?utm_source=mobile_gamehall&utm_campaign=${location.host}`
        }
      }
      return ''
    },
    promotedGame () {
      if (!this.currentGame) {
        return null
      }
      let code = this.recommMaps[this.currentGame.code]
      return code ? find(this.games, game => {
        return game.code === code
      }) : null
    }
  },
  watch: {
    '$route': 'changeRoute',
    'isGameInfoVisible': function (visible) {
      if (visible) {
        // 在弹出层显示之前，记录当前的滚动位置
        scrollTop = getScrollTop()

        // 使body脱离文档流
        document.body.classList.add('dialog-open')

        // 把脱离文档流的body拉上去，否则页面会回到顶部
        document.body.style.top = -scrollTop + 'px'
      } else {
        this.contentType = ''

        // body又回到了文档流中
        document.body.classList.remove('dialog-open')

        to(scrollTop)
      }
    },
    'currentGame.code': {
      handler (code) {
        if (code) {
          const game = this.currentGame
          if (game.is_prompt) {
            const topPromoteDateFlag = window.localStorage.getItem(game.display_name)
            this.showNotifiyMsg = topPromoteDateFlag ? (+topPromoteDateFlag < +this.$moment().format('YYYYMMDD')) : true
          }
        }
      },
      immediate: true
    }
  },
  created () {
    if (!this.$route.params.gameId) {
      if (this.games.length > 0) {
        this.chooseGame()
      } else {
        const unwatch = this.$watch('games', function (games) {
          this.chooseGame()
          unwatch()
        })
      }
    }
    this.$root.bus.$on('showGameHistory', () => {
      this.showGameInfo('historyViaHall')
    })
  },
  methods: {
    toggleGameMenu (trigger) {
      this.isGameMenuVisible = !this.isGameMenuVisible
      if (this.isGameMenuVisible) {
        this.sendGaEvent({
          label: this.currentGame.display_name,
          category: trigger,
          action: '查看遊戲菜單'
        })
      }
    },
    changeRoute (to, from) {
      if (to.path === '/game') {
        this.chooseGame()
      }
    },
    chooseGame () {
      const gameId = this.$store.state.lastGameData.lastGame || this.games[0].id
      this.$router.replace('/game/' + gameId)
    },
    toHome () {
      if (this.$route.name !== 'Home') {
        this.sendGaEvent({
          label: '遊戲大廳',
          category: '返回首頁',
          action: '点击'
        })
        this.$router.push({name: 'Home'})
      }
    },
    toggleHelper () {
      this.isHelperVisible = !this.isHelperVisible
      this.isGameMenuVisible = false
    },
    onClickOutSideHelper () {
      this.isHelperVisible = false
    },
    showGameInfo (type) {
      this.sendHelperGa(type)
      this.isGameInfoVisible = !!type
      // show history from game hall
      type = type === 'historyViaHall' ? 'history' : type
      this.contentType = type
    },
    sendHelperGa (type) {
      let mapping = {
        plan: '人工计划',
        roadbeads: '路珠',
        leaderboard: '长龙排行榜',
        history: '历史开奖',
        historyViaHall: '历史开奖-游戏大厅',
        intro: '游戏介绍',
        trend: '走勢圖表'
      }
      this.sendGaEvent({
        label: mapping[type],
        category: '遊戲助手',
        action: '点击'
      })
    },
    hideNotifyMsg (gameName) {
      window.localStorage.setItem(gameName, this.$moment().format('YYYYMMDD'))
      this.showNotifiyMsg = false
    }
  }

}
</script>

<style lang="less" scoped>
.gamehall {
  height: 100%;
  background-color: #fff;
}

.button-close {
  position: fixed;
  bottom: 10px;
  margin: 0 auto;
  width: 90%;
  height: 40px;
  left: 60%;
  margin-left: -55%;
}

.game-intro {
  background-color: #fff;
  &.roadbeads {
    background-color: #f5f5f5;
  }
  height: 100%;
}
.helper {
  position: relative;
  height: 100%;
  width: 50px;
  color: #fff;
  font-size: 15px;
  .helper-trigger {
    height: 100%;
    width: 50px;
    display: flex;
    align-items: center;
    .icon {
      height: 16px;
      width: 16px;
      background: url('../../assets/helper.svg') no-repeat;
      background-size: contain;
    }
  }
  .helper-link-group {
    position: absolute;
    top: 40px;
    right: -18px;
    width: 140px;
    border-radius: 4px;
    background-color: #ffffff;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.24), 0 0 4px 0 rgba(0, 0, 0, 0.12);
    list-style: none;
    &::before {
      bottom: 100%;
      left: 50%;
      border: solid transparent;
      content: " ";
      height: 0;
      width: 0;
      position: absolute;
      pointer-events: none;
      border-color: rgba(0, 0, 0, 0);
      border-bottom-color: #fff;
      border-width: 6px 5px;
      margin-left: 14px;
    }
    .helper-link {
      box-sizing: border-box;
      width: 140px;
      height: 40px;
      line-height: 40px;
      border-bottom: 1px solid #eee;
      color: #333;
      text-align: center;
      a {
        display: inline-block;
        width: 100%;
        height: 100%;
        line-height: 40px;
        margin: 0;
        color: #333;
        text-align: center;
      }
      .badage {
        position: relative;
        &:after {
          position: absolute;
          top: 14px;
          content: '';
          display: inline-block;
          width: 24px;
          height: 12px;
          margin-left: 5px;
          background-image: url('../../assets/badge_new.svg');
          background-repeat: no-repeat;
          background-size: contain;
        }
      }
    }
  }
}
.right-menu-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 36px;
  padding-left: 10px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  &::after {
    display: inline-block;
    transform: rotate(90deg);
    content: "\2026";
  }
}

.menu-center {
  transition: top 1s;
  display: block;
  margin: 0 auto;
}

.notify-msg-wrapper {
    height: 25px;
    transition-duration: 0.7s;
    margin-top: 0;
  }

.notify-msg {
  position: relative;
  height: 25px;
  font-size: 13px;
  line-height: 25px;
  color: white;
  text-align: center;
  .close-btn {
    position: absolute;
    right: -1px;
    top: -1px;
    &::before,
    &::after {
      height: 15px;
    }
  }
}
</style>
