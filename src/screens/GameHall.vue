<template>
  <div class="gamehall">
    <router-view v-show="!showChatRoom" />
    <chat-room v-if="chatroomEnabled&&showChatRoom"></chat-room>
  </div>
</template>
<script>
import { XHeader, Tab, TabItem } from 'vux'
import { mapGetters } from 'vuex'
import 'vue-awesome/icons/navicon'
import Icon from 'vue-awesome/components/Icon'
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
    ]),
    chatroomEnabled () {
      return this.$store.state.systemConfig.chatroomEnabled === 'true'
    }
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
</style>
