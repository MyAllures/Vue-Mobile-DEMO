<template>
  <div class="clear-viewbox-default-top clear-viewbox-default-bottom gamehall">
    <!-- 头部 -->
    <x-header class="gamehall-header" :right-options="{showMore: true}" @on-click-more="showRightMenu = true">
      <x-icon
        slot="overwrite-left"
        type="navicon"
        size="35"
        style="fill:#fff;position:relative;top:-8px;left:-3px;"
        @click="sidebarShow = true"></x-icon>
      <span>{{currentGame.display_name}}</span>
    </x-header>
    <router-view :key="$route.name + ($route.params.gameId || '')"/>
    <game-menu :isShow="sidebarShow" @closeSideBar="sidebarShow = false" />
    <right-menu v-model="showRightMenu" @handleClose="showRightMenu = false" />
  </div>
</template>

<script>
import { XHeader } from 'vux'
import 'vue-awesome/icons/navicon'
import Icon from 'vue-awesome/components/Icon'
import GameMenu from '../components/GameMenu.vue'
import RightMenu from '../components/RightMenu'

export default {
  name: 'GameHall',
  components: {
    Icon,
    XHeader,
    GameMenu,
    RightMenu
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
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('fetchGames').then(res => {

      }).catch(() => { })
    })
  }

}
</script>

<style lang="less" scoped>
.gamehall {
  height: 100%;
}
</style>
