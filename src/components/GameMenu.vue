<template>
  <div v-transfer-dom>
    <popup :value="isShow" position="left" @on-hide="handleClose" class="popup">
      <router-link class="home-link" to="/">
        <x-icon type="ios-arrow-left"></x-icon>
        <span class="text">返回首页</span>
      </router-link>
      <div class="popup-content">
        <ul class="popup-menu">
          <li
            :class="[
            'popup-menu-item',
            {'active': $route.path.split('/')[2] === game.id + ''}]"
            v-for="(game, index) in allGames"
            :key="index"
            @click="switchGame(game.id)">
              {{game.display_name || ''}}
            </li>
        </ul>
      </div>
    </popup>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { TransferDom, Popup, Group, CellBox, Cell } from 'vux'

export default {
  props: {
    isShow: {
      type: Boolean
    }
  },
  data () {
    return {
    }
  },
  directives: {
    TransferDom
  },
  components: {
    Popup,
    Group,
    CellBox,
    Cell
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    logoSrc () {
      return this.$store.state.systemConfig.homePageLogo
    }
  },
  watch: {
    'allGames': function () {
      let currentGameId = this.$route.params.gameId
      if (!currentGameId) {
        currentGameId = localStorage.getItem('lastGame') || this.allGames[0].id
        this.$router.push(`/game/${currentGameId}`)
      }
    }
  },
  methods: {
    handleClose () {
      this.$emit('closeSideBar')
    },
    switchGame (key) {
      localStorage.setItem('lastGame', key)
      this.$router.push(`/game/${key}`)
      this.handleClose()
    }
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';
.popup {
  background-color: #fff;
}
.home-link {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f1f1f1;
  height: 44px;
  line-height: 44px;
  width: 100%;
  color: @azul;
  font-size: 18px;
  .vux-x-icon {
    fill: @azul;
    margin-left: 10px;
  }
  .text {
    padding-left: 10px;
  }
}
.popup-content {
  width: 150px;
  height: calc(~"100%" - 44px);
  overflow-y: scroll;
  font-size: 18px;
  color: #4a4a4a;
  .popup-menu-item {
    box-sizing: border-box;
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    text-align: left;
    width: 100%;
    border-bottom: 1px solid #f1f1f1;
    &.active {
      color: #fff;
      background-image: linear-gradient(to bottom, #006bb3, #00397c);
    }
  }
}
</style>
