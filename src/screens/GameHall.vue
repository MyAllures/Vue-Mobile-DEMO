<template>
  <div class="gamehall">
    <router-view v-show="!showChatRoom" />
    <chat-room v-if="showChatRoom"></chat-room>
    <game-menu :isShow="showGameMenu" @closeSideBar="closeGameMenu" />
  </div>
</template>
<script>
import { XHeader, Tab, TabItem } from 'vux'
import { mapGetters } from 'vuex'
import 'vue-awesome/icons/navicon'
import Icon from 'vue-awesome/components/Icon'
import GameMenu from '../components/GameMenu.vue'
import ChatRoom from '../components/ChatRoom'

export default {
  name: 'GameHall',
  props: {
    showChatRoom: {
      type: Boolean
    },
    showGameMenu: {
      type: Boolean
    }
  },
  components: {
    Icon,
    XHeader,
    GameMenu,
    Tab,
    TabItem,
    ChatRoom
  },
  data () {
    return {
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
    ])
  },
  watch: {
    '$route': 'changeRoute'
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (vm.allGames.length > 0) {
        let currentGameId = vm.$route.params.gameId
        if (!currentGameId) {
          currentGameId = localStorage.getItem('lastGame') || vm.allGames[0].id
          vm.$router.replace(`/game/${currentGameId}`)
        }
      } else {
        vm.$store.dispatch('fetchGames').then(res => {
          let currentGameId = vm.$route.params.gameId
          if (!currentGameId) {
            currentGameId = localStorage.getItem('lastGame') || res[0].id
            vm.$router.replace(`/game/${currentGameId}`)
          }
        }).catch(() => { })
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
    },
    closeGameMenu () {
      this.$emit('closeGameMenu')
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
</style>
