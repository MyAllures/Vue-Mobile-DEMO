<template>
  <div class="gamehall">
    <router-view v-show="!showChatRoom" :key="$route.params.gameId"/>
    <chat-room v-if="chatroomEnabled&&showChatRoom"></chat-room>
    <popup v-model="showGameInfo" @on-hide="handlePopupClose" height="90%" v-transfer-dom>
      <div :class="['game-intro', contentType]">
        <GameInfo :currentGame="currentGame" :contentType="contentType" v-if="contentType&&currentGame"/>
        <x-button class="button-close" type="primary" @click.native="handlePopupClose">返回游戏</x-button>
      </div>
    </popup>
    <template v-if="allGames&&allGames.length">
      <game-menu v-model="isGameMenuVisible" />
      <div>
        <div 
          v-if="!isGameMenuVisible && (showNotifiyMsg && currentGame.is_prompt)"
          @click="isGameMenuVisible = !isGameMenuVisible"
          class="notify-msg menu-center" :style="{'background-color': theme}"
        >开奖太久？立即体驗更快速的{{currentGame.group_tag.name}}<div class="close-box" @click.stop="hideNotifyMsg(currentGame.display_name)">Ｘ</div>
        </div>
        <game-menu-icon 
          class="menu-center" 
          :style="{top: (showNotifiyMsg && currentGame.is_prompt) ? '63px' : '39px'}"
          @click.native="isGameMenuVisible = !isGameMenuVisible"
          type="more" :theme="theme"
        />
      </div>
    </template> 
  </div>
</template>
<script>
import { XHeader, Tab, TabItem, Popup, XButton, TransferDom } from 'vux'
import { mapGetters, mapState } from 'vuex'
import GameInfo from './GameInfo'
import ChatRoom from '../../components/ChatRoom'
import GameMenu from '@/components/GameMenu.vue'
import GameMenuIcon from '@/components/GameMenuIcon'
import '../../styles/resultsball.scss'
import '../../styles/playgroup.scss'

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
    Tab,
    TabItem,
    ChatRoom,
    GameInfo,
    XButton,
    GameMenu,
    GameMenuIcon
  },
  directives: {
    TransferDom
  },
  data () {
    return {
      showGameInfo: false,
      sidebarShow: false,
      showRightMenu: false,
      contentType: '',
      isGameMenuVisible: false,
      showNotifiyMsg: true
    }
  },
  computed: {
    currentGame () {
      const game = this.$store.getters.gameById(this.$route.params.gameId)
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
      }
      return game
    },
    ...mapGetters([
      'allGames'
    ]),
    ...mapState([
      'theme'
    ]),
    chatroomEnabled () {
      return this.$store.state.systemConfig.chatroomEnabled
    }
  },
  watch: {
    '$route': 'changeRoute'
  },
  created () {
    this.$root.bus.$on('showGameInfo', (type) => {
      this.showGameInfo = !!type
      this.contentType = type
    })
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
  },
  beforeDestroy () {
    this.$root.bus.$off('showGameInfo')
  },
  methods: {
    handlePopupClose () {
      this.showGameInfo = false
      this.contentType = ''
      this.$root.bus.$emit('showGameInfo', '')
    },
    handleSideBarShow () {
      this.$store.dispatch('fetchUser').then(res => {
        this.showRightMenu = true
      })
    },
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
    hideNotifyMsg (gameName) {
      window.localStorage.setItem(gameName, this.$moment().format('YYYYMMDD'))
      this.showNotifiyMsg = false
    }
  }

}
</script>

<style lang="less" scoped>
.vux-x-icon {
  fill: #fff;
}

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

.menu-center {
  display: block;
  margin: 0 auto;
  position: fixed;
  left: 0;
  right: 0;
  z-index: 98;
  top: 39px;
}

.notify-msg {
  height: 25px;
  font-size: 13px;
  color: white;
  text-align: center;
  top: 45px;
}
.close-box {
  position: absolute;
  right: 13px;
  top: -1px;
  font-size: 14px;
}
</style>
