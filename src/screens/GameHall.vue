<template>
  <div class="gamehall">
    <router-view v-show="!showChatRoom" />
    <chat-room v-if="chatroomEnabled&&showChatRoom"></chat-room>
    <popup v-model="showGameIntro" height="90%">
      <div class="game-intro">
        <GameIntro :currentGame="currentGame"/>
        <x-button class="button-close" type="primary" @click.native="showGameIntro=false">返回游戏</x-button>
      </div>
    </popup>
  </div>
</template>
<script>
import { XHeader, Tab, TabItem, Popup, XButton } from 'vux'
import { mapGetters } from 'vuex'
import GameIntro from './games/GameIntro'
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
    GameIntro,
    XButton
  },
  data () {
    return {
      showGameIntro: false,
      sidebarShow: false,
      showRightMenu: false
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
      return this.$store.state.systemConfig.chatroomEnabled === 'true'
    }
  },
  watch: {
    '$route': 'changeRoute'
  },
  created () {
    this.$root.bus.$on('showGameIntro', () => {
      this.showGameIntro = true
    })
  },
  beforeDestroy () {
    this.$root.bus.$off('showGameIntro')
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
.tab-box {
  background-color: #006bb3;
  height: 32px;
  .vux-tab-item {
    line-height: 32px;
    background: #006bb3;
  }
  .tab-item {
    background: rgba(255, 255, 255, .3);
    line-height: 32px;
  }
}
.button-close {
  position: fixed;
  bottom: 5px;
  margin: 0 auto;
  width: 90%;
  left: 60%;
  margin-left: -55%;
}
</style>
