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
          <template>
            <div
              v-click-outside="onClickOutSideHelper"
              v-if="!this.showChatRoom"
              class="helper"
              slot="right">
              <div class="helper-trigger" @click="toggleHelper">
                <div class="icon"></div>
                助手
              </div>
              <ul class="helper-link-group" v-show="isHelperVisible" @click="isHelperVisible = false">
                <li v-if="seoWebsite" class="helper-link" @click="sendHelperGa('plan')">
                  <a target="_blank" class="badage" :href="seoWebsite">
                    人工计划
                  </a>
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
                <li v-if="isShowChatroomIcon" class="helper-link" @click="openChatRoom">
                  聊天室
                </li>
              </ul>
            </div>
            <div class="right-menu-btn" @click="isGameMenuVisible=false;$store.dispatch('showRightMenu')"></div>
          </template>
        </div>
      </template>
    </top-bar>
    <router-view v-show="!showChatRoom" :key="$route.params.gameId"/>
    <chat-room v-if="chatroomEnabled&&showChatRoom"></chat-room>
    <game-info v-if="currentGame" :game="currentGame" :type="contentType" :visible.sync="isGameInfoVisible"/>
    <template v-if="allGames&&allGames.length&&theme">
      <game-menu v-model="isGameMenuVisible" v-if="allGames.length"/>
      <div v-if="currentGame">
        <div v-if="!isGameMenuVisible && currentGame.is_prompt"
          @click="isGameMenuVisible = !isGameMenuVisible"
          class="notify-msg menu-center topbar" :class="{hide: !showNotifiyMsg}" :style="{'background-color': theme}"
        >开奖太久？立即体驗更快速的{{currentGame.group_tag.name}}<div class="close-btn" @click.stop="hideNotifyMsg(currentGame.display_name)"></div>
        </div>
        <game-menu-icon
          class="menu-center"
          :style="{top: (showNotifiyMsg && currentGame.is_prompt) ? '63px' : '39px'}"
          @click.native="isGameMenuVisible = !isGameMenuVisible"
          type="more"
        />
      </div>
    </template>
  </div>
</template>
<script>
import { XHeader, Popup, XButton, TransferDom } from 'vux'
import { mapState, mapGetters } from 'vuex'
import GameInfo from './GameInfo'
import ChatRoom from '../../components/ChatRoom'
import GameMenu from '@/components/GameMenu.vue'
import GameMenuIcon from '@/components/GameMenuIcon'
import '../../styles/resultsball.scss'
import '../../styles/playgroup.scss'
import TopBar from '@/components/TopBar'
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
  props: {
    showChatRoom: {
      type: Boolean
    }
  },
  components: {
    Popup,
    XHeader,
    ChatRoom,
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
      showNotifiyMsg: true
    }
  },
  computed: {
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
    ...mapGetters([
      'allGames'
    ]),
    ...mapState([
      'roomInfo', 'roomId', 'systemConfig', 'theme'
    ]),
    chatroomEnabled () {
      return this.systemConfig.chatroomEnabled
    },
    isShowChatroomIcon () {
      if (!this.systemConfig.chatroomEnabled || !this.isGameHall || this.showChatRoom) {
        return false
      }
      if (!this.$route.params.gameId || !this.roomInfo) {
        return false
      }
      if (!this.roomInfo[this.$route.params.gameId].status && !this.roomInfo[100000].status) {
        return false
      }
      return true
    },
    roomName () {
      if (this.roomInfo && this.roomId) {
        return this.roomInfo[this.roomId].name
      }
      return ''
    },
    seoWebsite () {
      if (this.systemConfig.planSiteUrl && this.currentGame) {
        const code = this.currentGame.code
        const gamesHasPlan = ['bcr', 'cqssc', 'jsssc', 'jspk10', 'mlaft', 'cs60cr']
        if (gamesHasPlan.includes(code)) {
          return `${this.systemConfig.planSiteUrl}/game/${code}?utm_source=mobile_gamehall&utm_campaign=${location.host}`
        }
      }
      return ''
    }
  },
  watch: {
    '$route': 'changeRoute',
    'roomName': function (name) {
      if (name) {
        this.sendGaEvent({
          label: name,
          category: '聊天室',
          action: '点击'
        })
      }
    },
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
    'currentGame': {
      handler (game) {
        if (game) {
          const checkDate = window.localStorage.getItem(game.display_name)
          if (checkDate) {
            if (+checkDate < +this.$moment().format('YYYYMMDD')) {
              this.showNotifiyMsg = true
            } else {
              this.showNotifiyMsg = false
            }
          } else {
            this.showNotifiyMsg = true
          }
          this.$store.dispatch('setDataSectionStyle', {'padding-top': this.showNotifiyMsg && game.is_prompt ? '35px' : '13px'})
        }
      },
      immediate: true
    }
  },
  created () {
    if (!this.$route.params.gameId) {
      if (this.allGames.length > 0) {
        this.chooseGame()
      } else {
        const unwatch = this.$watch('allGames', function (allGames) {
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
    changeRoute (to, from) {
      this.showChatRoom = false
      if (to.path === '/game') {
        this.chooseGame()
      }
    },
    chooseGame () {
      const gameId = this.$store.state.lastGameData.lastGame || this.allGames[0].id
      this.$router.replace('/game/' + gameId)
    },
    closeChatRoom () {
      this.showChatRoom = false
      if (this.ws.raven && this.ws.raven.roomId) {
        this.ws.raven.leaveRoom()
      }
    },
    openChatRoom () {
      this.sendHelperGa('chatroom')
      this.showChatRoom = true
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
        chatroom: '聊天室',
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
      this.$store.dispatch('setDataSectionStyle', {'padding-top': '13px'})
      this.showNotifiyMsg = false
    }
  }

}
</script>

<style lang="less" scoped>
.gamehall {
  height: 100%;
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
  position: fixed;
  left: 0;
  right: 0;
  z-index: 100;
}

.notify-msg {
  height: 25px;
  font-size: 13px;
  line-height: 22px;
  color: white;
  text-align: center;
  top: 45.5px;
  transition: top 1s;
  &.hide {
    top: 20px;
  }
}

.close-btn {
  position: absolute;
  right: -1px;
  top: -1px;
  &::before, &::after {
    height: 15px;
  }
}
</style>
