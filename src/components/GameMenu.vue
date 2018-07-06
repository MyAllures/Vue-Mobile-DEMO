<template>
  <div v-transfer-dom>
    <popup :value="isShow"
      :show-mask="true"
      position="top"
      :height="'calc(100% - 165px)'"
      @on-show="lockBackScroll"
      @on-hide="handleClose"
      :popup-style="{zIndex: 502}"
      class="popup">
      <div class="popup-content">
        <grid :cols="3" :show-lr-borders="false">
          <grid-item
            class="grid-item text-center"
            v-for="(game, index) in allGames"
            :key="index"
            @click.native="switchGame(game.id)">
            <img class="icon" :src="game.icon" width="36" height="36"/>
            <p class="name">{{game.display_name || ''}}</p>
          </grid-item>
        </grid>
      </div>
    </popup>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { TransferDom, Popup, Grid, GridItem } from 'vux'
const body = document.getElementsByTagName('body')[0]

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
    Popup, Grid, GridItem
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
      this.enableBackScroll()
    },
    switchGame (key) {
      const gameId = key + ''
      if (this.$route.params.gameId === gameId) {
        this.handleClose()
        return
      }
      localStorage.setItem('lastGame', gameId)
      this.$router.push({path: `/game/${gameId}/`})
      this.handleClose()
    },
    lockBackScroll () {
      body.style['overflow-y'] = 'hidden'
    },
    enableBackScroll () {
      body.style['overflow-y'] = ''
    }
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';
.popup {
  background-color: #fff;
  top: 45px;
}

.popup-content {
  width: 100%;

  .grid-item.weui-grid {
    padding: 10px;
    overflow: hidden;
    color: #333;
    .icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
    .name {
      font-size: 14px;
      line-height: 20px;
      white-space: pre;
    }
  }
}
</style>
