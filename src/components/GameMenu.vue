<template>
  <popup :value="value"
    :show-mask="false"
    position="top"
    :height="height"
    @on-show="lockBackScroll"
    @on-hide="handleClose"
    class="popup"
    :style="{zIndex: 99}">
    <div class="popup-content">
      <div class="tab-selector">
        <tab
          :style="{width: gameGroups.length > 3 ? `${gameGroups.length * 60}px` : ''}"
          :bar-active-color="theme"
          :animate="false"
          default-color="#666"
          :active-color="theme"
          :line-width="2"
        >
          <tab-item v-for="(tag,index) in gameGroups" :key="index"
            @on-item-click="switchTab"
            :style="{flex: gameGroups.length > 3?0:1}"
            :selected="tag.groupName === activeGroupName"
          >
            <span :class="['group-name', {'ellipsis': gameGroups.length > 3}]">{{tag.groupName}}</span>
          </tab-item>
        </tab>
      </div>
      <div class="main-background">
        <div class="category recommendatory-bgc" v-if="recommendatoryGames && recommendatoryGames.length">
          <div class="category-title">相同玩法开奖更快</div>
          <div class="classic-game">
            <div class="images-container">
              <div class="grid-item text-center" :style="{width: `${imageContainerWidth}px`}"
                @click="switchGame(gamePlay[gameCode])"
                v-for="(gameCode,index) in recommendatoryGames" :key="index"
                v-if="gamePlay[gameCode]"
              >
                <img class="icon" v-lazy="gamePlay[gameCode].icon" width="56" height="56"/>
                <p class="name">{{gamePlay[gameCode].name}}</p>
                <div class="game-label">
                  <span class="game-label-text">{{gamePlay[gameCode].period}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="category" v-if="classicGames && classicGames.length">
          <div class="category-title">经典游戏</div>
          <div class="recommendatory-game">
            <div class="images-container">
              <div class="grid-item text-center" :style="{width: `${imageContainerWidth}px`}"
                @click="switchGame(gamePlay[gameCode])"
                v-for="(gameCode,index) in classicGames" :key="index"
                v-if="gamePlay[gameCode]"
              >
                <img class="icon" v-lazy="gamePlay[gameCode].icon" width="56" height="56"/>
                <p class="name">{{gamePlay[gameCode].name}}</p>
                <div class="game-label">
                  <span class="game-label-text">{{gamePlay[gameCode].period}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    <div :class="['mask', {active: value}]" v-transfer-dom @click="handleClose"></div>
    <game-menu-icon
      @click.native.prevent="handleClose"
      class="menu-center"
      type="less"
    />
  </popup>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { TransferDom, Popup, Grid, GridItem, Tab, TabItem } from 'vux'
import FixScroll from '../directive/fixscroll'
import { findIndex } from 'lodash'
import GameMenuIcon from '@/components/GameMenuIcon'
const body = document.getElementsByTagName('body')[0]
function setGameGroups (gameTypes) {
  return gameTypes.reduce((merged, g, index) => ({
    ...merged,
    gamePlay: {
      ...merged.gamePlay,
      [g.code]: {
        id: g.id,
        index,
        categories: g.categories,
        playpositions: g.playpositions,
        isPrompt: g.is_prompt,
        icon: g.icon,
        name: g.display_name,
        gameGroup: g.group_tag && g.group_tag.name,
        period: g.period_descroption
      }
    },
    gameGroups: {
      ...merged.gameGroups,
      [g.group_tag.name]: {
        recommendatory: g.group_tag.recommendatory,
        classic: g.group_tag.classic,
        rank: g.group_tag.rank
      }
    }
  }), {})
}
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
    Popup, Grid, GridItem, Tab, TabItem, GameMenuIcon
  },
  data () {
    const obj = setGameGroups(this.$store.state.games).gameGroups
    const gameGroups = Object.keys(obj).map(key => ({ ...obj[key], groupName: key })).sort((f, l) => f.rank - l.rank)
    return {
      height: 'auto',
      imageContainerWidth: (window.innerWidth - 20) / 4,
      currentGameObj: {},
      activeGroupName: '',
      gameGroups
    }
  },
  computed: {
    ...mapGetters([
      'allGames', 'gameById'
    ]),
    ...mapState([
      'theme'
    ]),
    logoSrc () {
      return this.$store.state.systemConfig.homePageLogo
    },
    isGamePage () {
      return this.$route.name === 'GameDetail'
    },
    gamePlay () {
      return setGameGroups(this.allGames).gamePlay
    },
    classicGames () {
      return this.currentGameObj.classic
    },
    recommendatoryGames () {
      return this.currentGameObj.recommendatory
    }
  },
  watch: {
    value (val) {
      if (val && !this.$route.params.gameId) {
        this.switchTab(0)
      }
    },
    currentGameObj: {
      deep: true,
      handler: function ({groupName = ''}) {
        this.activeGroupName = groupName
      }
    },
    '$route.params.gameId': function (gameId) {
      gameId && this.initTab()
    }
  },
  created () {
    if (this.$route.params.gameId) {
      this.initTab()
    }
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
          label: game.name,
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
    },
    switchTab (i) {
      this.currentGameObj = []
      setTimeout(() => {
        this.currentGameObj = this.gameGroups[i]
      }, 10)
    },
    initTab () {
      const game = this.$store.getters.gameById(this.$route.params.gameId)
      if (game) {
        const groupName = game.group_tag.name
        this.switchTab(findIndex(this.gameGroups, {groupName}) || 0)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.popup {
  top: 45px;
}

.tab-selector {
  -webkit-overflow-scrolling: touch;
  background: #fff;
  width: 100%;
  overflow-x: auto;
  .ellipsis {
    white-space: nowrap;
    display: block;
    width: 60px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.vux-popup-dialog {
  background-color: rgba(255, 255, 255, 0);;
}

.popup-content {
  width: 100%;

  .grid-item {
    .name {
      font-size: 14px;
      color: #333;
    }
  }

  .grid-item.weui-grid {
    padding: 0 0 5px 0;
    overflow: hidden;
    color: #333;
    .icon {
      width: auto;
      height: 10vh;
      border-radius: 50%;
    }
  }
}

.main-background {
  background-color: white;
}

.category {
  padding: 10px;
  height: calc((100%) / 2);
  .category-title {
    margin-bottom: 10px;
    color: #333;
    font-size: 12px;
    font-weight: 500;
  }
}

.recommendatory-bgc {
  background-color: rgba(245, 166, 35, 0.1);
}

.images-container {
  display: inline-flex;
}

.classic-game {
  width: 100%;
  display: flex;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
  .game-label-text {
    display: inline-block;
    height: 20px;
    line-height: 20px;
    padding: 0px 5px;
    border-radius: 10px;
    font-size: 11px;
  }
}

.recommendatory-game {
  width: 100%;
  display: flex;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  -ms-overflow-style: -ms-autohiding-scrollbar;
  .game-label-text {
    display: inline-block;
    height: 20px;
    line-height: 20px;
    padding: 0px 5px;
    color: #999;
    font-size: 11px;
    background-color: initial;
  }
}

.game-label {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  height: 22px;
  padding-bottom: 3px;
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
    z-index: 98;
  }
}

.menu-center {
  display: block;
  margin: 0 auto;
  left: 0;
  right: 0;
  top: -6px;
  position: relative;
}
</style>