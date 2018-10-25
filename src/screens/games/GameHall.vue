<template>
  <div class="gamehall">
    <router-view v-show="!showChatRoom" :key="$route.params.gameId"/>
    <chat-room v-if="chatroomEnabled&&showChatRoom"></chat-room>
    <popup v-model="showGameInfo" @on-hide="handlePopupClose" height="90%" v-transfer-dom>
      <div class="game-intro">
        <GameInfo :currentGame="currentGame" :contentType="contentType" v-if="contentType&&currentGame"/>
        <x-button class="button-close" type="primary" @click.native="handlePopupClose">返回游戏</x-button>
      </div>
    </popup>
  </div>
</template>
<script>
import { XHeader, Tab, TabItem, Popup, XButton, TransferDom } from 'vux'
import { mapGetters } from 'vuex'
import GameInfo from './GameInfo'
import ChatRoom from '../../components/ChatRoom'
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
    XButton
  },
  directives: {
    TransferDom
  },
  data () {
    return {
      showGameInfo: false,
      sidebarShow: false,
      showRightMenu: false,
      contentType: ''
    }
  },
  computed: {
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    },
    ...mapGetters([
      'allGames'
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
      const gameId = localStorage.getItem('lastGame') || this.allGames[0].id
      this.$router.replace('/game/' + gameId)
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
  height: 100%;
}
</style>
