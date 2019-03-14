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
    <template v-if="allGames&&allGames.length&&theme">
      <div>
        <div
          v-if="(showNotifiyMsg && currentGame.is_prompt)"
          class="notify-msg menu-center vux-header" :style="{'background-color': theme}"
        >开奖太久？立即体驗更快速的{{currentGame.group_tag.name}}<div class="close-btn" @click.stop="hideNotifyMsg(currentGame.display_name)"></div>
        </div>
        <game-menu-icon
          class="menu-center"
          :style="{top: (showNotifiyMsg && currentGame.is_prompt) ? '64px' : '39px'}"
          @click.native="handleGameMenu"
          type="more"
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
        this.$store.dispatch('setDataSectionStyle', {'padding-top': this.showNotifiyMsg && game.is_prompt ? '35px' : '10px'})
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
      this.$store.dispatch('setDataSectionStyle', {'padding-top': this.showNotifiyMsg && this.currentGame.is_prompt ? '35px' : '10px'})
    },
    handleGameMenu () {
      this.$root.bus.$emit('showGameMenu')
      this.isGameMenuVisible = !this.isGameMenuVisible
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
  line-height: 25px;
  color: white;
  text-align: center;
  top: 45.5px;
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
