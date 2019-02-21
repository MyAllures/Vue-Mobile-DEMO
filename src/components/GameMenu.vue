<template>
  <popup :value="value"
    v-fix-scroll
    :show-mask="false"
    position="top"
    :height="height"
    @on-show="lockBackScroll"
    @on-hide="handleClose"
    class="popup"
    :style="{zIndex: 101}">
    <div class="popup-content">
      <grid :cols="3" :show-lr-borders="false">
        <grid-item
          class="grid-item text-center"
          v-for="(game, index) in allGames"
          :key="index"
          @click.native="switchGame(game)">
          <div class="game-label">
            <span v-if="game.label" class="game-label-text">{{game.label}}</span>
          </div>
          <img class="icon" v-lazy="game.icon" width="36" height="36"/>
          <p class="name">{{game.display_name || ''}}</p>
        </grid-item>
      </grid>
    </div>
    <div :class="['mask', {active: value}]" v-transfer-dom @click="handleClose"></div>
  </popup>
</template>

<script>
import { mapGetters } from 'vuex'
import { TransferDom, Popup, Grid, GridItem } from 'vux'
import FixScroll from '../directive/fixscroll'
const body = document.getElementsByTagName('body')[0]

export default {
  props: {
    value: {
      type: Boolean
    }
  },
  directives: {
    TransferDom,
    FixScroll
  },
  components: {
    Popup, Grid, GridItem
  },
  data () {
    return {
      height: '80%'
    }
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
  mounted () {
    // const height = document.body.clientHeight
    // if (height > 650) {
    //   this.height = '533px'
    // } else if (height > 550) {
    //   this.height = '436px'
    // }
  },
  methods: {
    handleClose () {
      this.$emit('input', false)
      this.enableBackScroll()
    },
    switchGame (game) {
      const gameId = game.id + ''
      if (this.$route.params.gameId !== gameId) {
        this.sendGaEvent({
          label: game.display_name,
          category: '游戏选单',
          action: '选单'
        })
        this.$store.dispatch('saveLastGame', gameId)
        this.$router.push({path: `/game/${gameId}/`})
      }
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
.popup {
  background-color: #fff;
  top: 45px;
}

.popup-content {
  width: 100%;

  .grid-item.weui-grid {
    padding: 0 0 5px 0;
    overflow: hidden;
    color: #333;
    .icon {
      width: auto;
      height: 10vh;
      border-radius: 50%;
    }
    .name {
      font-size: 14px;
      line-height: 14px;
      white-space: pre;
    }
  }
}

.game-label {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  height: 30px;
  padding-bottom: 3px;
}

.game-label-text {
  display: inline-block;
  height: 20px;
  line-height: 20px;
  padding: 2px 5px;
  border-radius: 10px;
  background-color: #d0e2f7;
  color: #113f7c;
  font-size: 13px;
}

.weui-grids.vux-grid-no-lr-borders {
  margin-right: 0;
}
.mask {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  z-index: -1;
  transition: opacity 400ms;
  -webkit-tap-highlight-color:rgba(0,0,0,0);
  &.active {
    opacity: 1;
    z-index: 100;
  }
}
</style>
