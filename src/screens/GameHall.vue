<template>
  <div class="clear-viewbox-default-top clear-viewbox-default-bottom gamehall">
    <x-header
      class="gamehall-header"
      :right-options="{showMore: true}"
      @on-click-more="showRightMenu = true">
      <span
        v-if="!showChatRoom"
        slot="overwrite-left"
        @click="sidebarShow = true"
        class="left-trigger">
        <x-icon
          type="navicon"
          size="32"></x-icon>
        {{currentGame.display_name}}
      </span>
      <span
        v-else
        slot="overwrite-left"
        @click="showChatRoom = false"
        class="left-trigger">
        <x-icon
          type="ios-close-empty"
          size="32"></x-icon>
          退出聊天室
      </span>
      <x-icon
        type="chatbubble-working"
        size="30"
        v-show="!showChatRoom"
        @click.native="showChatRoom = true"
        slot="right"></x-icon>
    </x-header>
    <router-view v-show="!showChatRoom" />
    <chat-room v-if="showChatRoom"></chat-room>
    <game-menu :isShow="sidebarShow" @closeSideBar="sidebarShow = false" />
    <right-menu v-model="showRightMenu" @handleClose="showRightMenu = false" />
  </div>
</template>

<script>
import { XHeader, Tab, TabItem } from 'vux'
import { mapGetters } from 'vuex'
import 'vue-awesome/icons/navicon'
import Icon from 'vue-awesome/components/Icon'
import GameMenu from '../components/GameMenu.vue'
import RightMenu from '../components/RightMenu'
import ChatRoom from '../components/ChatRoom'

export default {
  name: 'GameHall',
  components: {
    Icon,
    XHeader,
    GameMenu,
    RightMenu,
    Tab,
    TabItem,
    ChatRoom
  },
  data () {
    return {
      sidebarShow: false,
      showRightMenu: false,
      showChatRoom: false
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
      vm.$store.dispatch('fetchGames').then(res => {
        let currentGameId = vm.$route.params.gameId
        if (!currentGameId) {
          currentGameId = localStorage.getItem('lastGame') || res[0].id
          vm.$router.replace(`/game/${currentGameId}`)
        }
      }).catch(() => { })
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
.vux-header {
  /deep/ .vux-header-left {
    left: 8px;
    top: 7px;
    line-height: 100%;
  }
  /deep/ .vux-header-right{
    top: 7px;
    a {
      margin-left: 20px;
      float: right;
    }
    .vux-header-more {
      margin-top: 6px;
    }
  }
}
.left-trigger {
  font-size: 15px;
  color: #fff;
  display: flex;
  align-items: center;
}
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
