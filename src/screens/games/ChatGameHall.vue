<template>
  <div class="chat-gamehall-container">
    <top-bar>
      <template slot="left">
        <div
          class="left-ctrl back"
          @click="toHome">
          <span class="left-arrow"></span>
          首页
        </div>
      </template>
      <div class="main-title" @click="isGameMenuVisible = !isGameMenuVisible">
        {{ currentGame && currentGame.display_name }}
      </div>
      <template slot="right">
        <div class="right-ctrl">
          <div class="right-menu-btn" @click="isGameMenuVisible=false;$store.dispatch('showRightMenu')"></div>
        </div>
      </template>
    </top-bar>
    <template v-if="games&&games.length&&theme">
      <game-menu v-model="isGameMenuVisible" v-if="games.length"/>
      <template v-if="currentGame">
        <div class="notify-msg-wrapper topbar" :style="{'margin-top': showNotifiyMsg?'0':'-25px'}">
          <div v-if="!isGameMenuVisible && showNotifiyMsg"
            @click="isGameMenuVisible = !isGameMenuVisible"
            class="notify-msg menu-center topbar" :style="{'background-color': theme}"
          >开奖太久？立即体驗更快速的{{currentGame.group_tag.name}}<div class="close-btn" @click.stop="hideNotifyMsg(currentGame.display_name)"></div>
          </div>
        </div>
      </template>
    </template>
    <game-menu-icon
      class="menu-center"
      :style="{top: showNotifiyMsg ? '63px' : '39px'}"
      @click.native="isGameMenuVisible = !isGameMenuVisible"
      type="more"
    />
    <div :style="{height: showNotifiyMsg? `calc(100% - 43px)`:'calc(100% - 18px)'}">
      <router-view :key="$route.params.gameId"/>
    </div>
    <game-info v-if="currentGame" :game="currentGame" :type="contentType" :visible.sync="isGameInfoVisible"/>
    <div :class="['helper-btn-group', {visible: isHelperVisible}]">
      <div class="helper-btn leaderboard" @click="showGameInfo('leaderboard')">长龙</div>
      <div class="helper-btn roadbead" @click="showGameInfo('roadbeads')">路珠</div>
      <div class="helper-btn expert">
        <p>专家</p>
        <p>计划</p>
      </div>
    </div>
    <div :class="['helper-btn fold', {visible: isHelperVisible}]" @click="isHelperVisible = !isHelperVisible">
      <template v-if="!isHelperVisible">
        展开
      </template>
      <div v-else class="close-btn"></div>
    </div>
  </div>
</template>

<script>
import { XHeader, Popup, XButton, TransferDom } from 'vux'
import TopBar from '@/components/TopBar'
import GameMenu from '@/components/GameMenu.vue'
import GameMenuIcon from '@/components/GameMenuIcon'
import '../../styles/resultsball.scss'
import '../../styles/playgroup.scss'
import GameInfo from './GameInfo'
import { mapState } from 'vuex'

function to (scrollTop) {
  document.body.scrollTop = document.documentElement.scrollTop = scrollTop
}
function getScrollTop () {
  return document.body.scrollTop || document.documentElement.scrollTop
}
let scrollTop

export default {
  name: 'ChatGameHall',
  components: {
    Popup,
    XHeader,
    GameInfo,
    XButton,
    TopBar,
    GameMenu,
    GameMenuIcon
  },
  directives: {
    TransferDom
  },
  data () {
    return {
      showRightMenu: false,
      contentType: '',
      isGameInfoVisible: false,
      isGameMenuVisible: false,
      isHelperVisible: false,
      showNotifiyMsg: false
    }
  },
  computed: {
    ...mapState([
      'games', 'theme'
    ]),
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    }
  },
  watch: {
    'currentGame': {
      handler (game) {
        if (game) {
          if (game.is_prompt) {
            const checkDate = window.localStorage.getItem(game.display_name)
            if (checkDate) {
              if (+checkDate < +this.$moment().format('YYYYMMDD')) {
                this.showNotifiyMsg = true
              }
            } else {
              this.showNotifiyMsg = true
            }
          }
        }
      },
      immediate: true
    },
    'isGameInfoVisible': function (visible) {
      if (visible) {
        // 在弹出层显示之前，记录当前的滚动位置
        scrollTop = getScrollTop()

        // 使body脱离文档流
        document.body.classList.add('dialog-open')

        // 把脱离文档流的body拉上去，否则页面会回到顶部
        document.body.style.top = -scrollTop + 'px'
      } else {
        this.contentType = ''

        // body又回到了文档流中
        document.body.classList.remove('dialog-open')

        to(scrollTop)
      }
    }
  },
  methods: {
    toHome () {
      if (this.$route.name !== 'Home') {
        this.sendGaEvent({
          label: '遊戲大廳',
          category: '返回首頁',
          action: '点击'
        })
        this.$router.push({name: 'Home'})
      }
    },
    showGameInfo (type) {
      this.isGameInfoVisible = !!type
      this.contentType = type
    },
    hideNotifyMsg (gameName) {
      window.localStorage.setItem(gameName, this.$moment().format('YYYYMMDD'))
      this.showNotifiyMsg = false
    }
  }
}
</script>

<style lang="less" scoped>
.chat-gamehall-container {
  height: 100%;
  background: #fff;
  .right-menu-btn {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 36px;
    padding-left: 10px;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    &::after {
      display: inline-block;
      transform: rotate(90deg);
      content: "\2026";
    }
  }

  .menu-center {
    display: block;
    margin: 0 auto;
  }

  .notify-msg-wrapper {
    height: 25px;
    transition-duration: .7s;
    margin-top: 0;
  }

  .notify-msg {
    position: relative;
    height: 25px;
    font-size: 13px;
    line-height: 25px;
    color: white;
    text-align: center;
  }

  .close-btn {
    position: absolute;
    right: -1px;
    top: -1px;
    &::before, &::after {
      height: 15px;
    }
  }
  .helper-btn {
    box-sizing: border-box;
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: #fff;
    font-size: 12px;
    transition-duration: .2s;
    .close-btn {
      top: 8px;
      left: 6px;
    }
    &.fold {
      bottom: 62px;
      right: 10px;
      background-color: #bfbfbf;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    }
    &.leaderboard {
      border: 2px solid #3bb99c;
      background: #60d1b8;
    }
    &.roadbead {
      border: 2px solid #a442b8;
      background: #c252d9;
    }
    &.expert {
      border: 2px solid #b43a49;
      background: #d54052;
    }
  }
  .helper-btn-group {
    visibility: visible;
    position: absolute;
    bottom: 62px;
    right: 10px;
    &.visible {
      visibility: visible;
      .helper-btn {
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
      }
      .leaderboard {
        border: 2px solid #3bb99c;
        background: #60d1b8;
        bottom: 150px
      }
      .roadbead {
        border: 2px solid #a442b8;
        background: #c252d9;
        bottom: 100px
      }
      .expert {
        border: 2px solid #b43a49;
        background: #d54052;
        bottom: 50px
      }
    }
  }
}
</style>
