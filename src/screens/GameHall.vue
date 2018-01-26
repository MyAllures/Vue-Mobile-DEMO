<template>
  <div class="clear-viewbox-default-top clear-viewbox-default-bottom gamehall">
    <!-- 头部 -->
    <x-header class="gamehall-header" :right-options="{showMore: true}" @on-click-more="handleSideBarShow">
      <x-icon
        slot="overwrite-left"
        type="navicon"
        size="35"
        style="fill:#fff;position:relative;top:-8px;left:-3px;"
        @click="sidebarShow = true"></x-icon>
      <span>{{currentGame.display_name}}</span>
    </x-header>
    <tab :line-width="0" class="tab-box" active-color="#fff"  defaultColor="#999">
      <tab-item active-class="tab-item" :selected="!showChatRoom" @on-item-click="onItemClick">投注区</tab-item>
      <tab-item active-class="tab-item" :selected="showChatRoom" @on-item-click="onItemClick(true)">聊天室</tab-item>
    </tab>
    <router-view v-if="!showChatRoom" :key="$route.name + ($route.params.gameId || '')"/>
    <chat-room v-else="showChatRoom"></chat-room>
    <game-menu :isShow="sidebarShow" @closeSideBar="sidebarShow = false" />
    <right-menu v-model="showRightMenu" @handleClose="showRightMenu = false" />
  </div>
</template>

<script>
import { XHeader, Tab, TabItem } from 'vux'
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
      sidebarShow: false, // 默认值
      showRightMenu: false,
      showChatRoom: false
    }
  },
  computed: {
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId) || {}
    }
  },
  watch: {
    '$route': 'changeRoute'
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('fetchGames').then(res => {

      }).catch(() => { })
    })
  },
  methods: {
    changeRoute () {
      this.showChatRoom = false
    },
    onItemClick (bFlag) {
      if (bFlag) {
        this.showChatRoom = true
      } else {
        this.showChatRoom = false
      }
    },
    handleSideBarShow () {
      console.log('ggg')
      this.$store.dispatch('fetchUser').then(res => {
        console.log('fff')
        this.showRightMenu = true
      })
    }
  }

}
</script>

<style lang="less" scoped>
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
