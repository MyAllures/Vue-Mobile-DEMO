<template>
  <div v-transfer-dom v-touch:swipe.left="handleClose">
    <popup :value="isShow" position="left" @on-hide="handleClose" class="popup">
      <div :class="['popup-content', isGamePage ? 'shorter' : '']">
        <ul class="popup-menu">
          <li
            :class="['arrow-right',
            {'active': $route.path.split('/')[2] === game.id + ''}]"
            v-for="(game, index) in allGames"
            :key="index"
            @click="switchGame(game.id)">
              <img class="icon" :src="game.icon" width="36" height="36"/>
              {{game.display_name || ''}}
            </li>
        </ul>
      </div>
      <router-link class="home-link" to="/" v-if="isGamePage">
        <x-icon type="ios-arrow-left"></x-icon>
        <span>返回首页</span>
      </router-link >
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
    },
    isGamePage () {
      return this.$route.name === 'GameDetail'
    }
  },
  methods: {
    back () {
      this.$router.go(-1)
      this.$emit('closeSideBar')
    },
    handleClose () {
      this.$emit('closeSideBar')
    },
    switchGame (key) {
      localStorage.setItem('lastGame', key)
      this.$router.push({path: `/game/${key + ''}/`})
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
  background: @azul;
  align-items: center;
  border-bottom: 1px solid #f1f1f1;
  height: 44px;
  line-height: 44px;
  width: 100%;
  color: #fff;
  .vux-x-icon {
    fill: #fff;
    margin-left: 10px;
  }
}
.shorter {
  height: calc(~"100%" - 44px);
}
.icon {
  border-radius: 4px;
  margin-right: 10px;
}
.popup-content {
  width: 60vw;
  overflow-y: scroll;
  font-size: 18px;
  color: #4a4a4a;
  li {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 50px;
    line-height: 50px;
    padding-left: 10px;
    text-align: left;
    width: 100%;
    border-bottom: 1px solid #f1f1f1;
    &.active {
      color: #fff;
      background-image: linear-gradient(to bottom, #006bb3, #00397c);
    }
  }
  .arrow-right:after {
    right: 10px;
  }
}
</style>
