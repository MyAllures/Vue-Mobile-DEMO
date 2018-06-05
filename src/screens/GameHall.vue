<template>
  <div class="gamehall">
    <router-view v-show="!showChatRoom"/>
    <chat-room v-if="chatroomEnabled&&showChatRoom"></chat-room>
    <popup v-model="showGameInfo" height="90%" v-transfer-dom>
      <div class="game-intro">
        <GameInfo :currentGame="currentGame" :contentType="contentType" v-if="contentType"/>
        <x-button class="button-close" type="primary" @click.native="showGameInfo = false">返回游戏</x-button>
      </div>
    </popup>
  </div>
</template>
<script>
import { XHeader, Tab, TabItem, Popup, XButton, TransferDom } from 'vux'
import { mapGetters } from 'vuex'
import GameInfo from './games/GameInfo'
import 'vue-awesome/icons/navicon'
import Icon from 'vue-awesome/components/Icon'
import ChatRoom from '../components/ChatRoom'

export default {
  name: 'GameHall',
  props: {
    showChatRoom: {
      type: Boolean
    }
  },
  components: {
    Icon,
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
      return this.$store.getters.gameById(this.$route.params.gameId) || {}
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
      this.showGameInfo = true
      this.contentType = type
    })
  },
  beforeDestroy () {
    this.$root.bus.$off('showGameInfo')
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.allGames.length > 0) {
        let currentGameId = vm.$route.params.gameId
        if (!currentGameId) {
          currentGameId = localStorage.getItem('lastGame') || vm.allGames[0].id
          vm.$router.replace(`/game/${currentGameId}`)
        }
      }
    })
  },
  methods: {
    handleSideBarShow () {
      this.$store.dispatch('fetchUser').then(res => {
        this.showRightMenu = true
      })
    },
    changeRoute (to, from) {
      this.showChatRoom = false
      if (!this.$route.params.gameId) {
        this.$router.replace(`/game/${this.allGames[0].id}`)
      }
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
