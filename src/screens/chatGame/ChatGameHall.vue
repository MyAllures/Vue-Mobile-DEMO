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
  </div>
</template>

<script>
import { XHeader, Popup, XButton, TransferDom } from 'vux'
import TopBar from '@/components/TopBar'
import GameMenu from '@/components/GameMenu.vue'
import GameMenuIcon from '@/components/GameMenuIcon'
import '../../styles/resultsball.scss'
import '../../styles/playgroup.scss'
// import {hasTrendDiagram} from '@/utils/trendDiagramSetting'
// import {hasRoadBead} from '@/utils/roadBeadSetting'
import GameInfo from '@/screens/games/GameInfo'
import { mapState } from 'vuex'
import {EagleWebSocket} from '@/wsObj/eagle'
import {eagle} from '@/api'

function to (scrollTop) {
  document.body.scrollTop = document.documentElement.scrollTop = scrollTop
}
function getScrollTop () {
  return document.body.scrollTop || document.documentElement.scrollTop
}
let scrollTop

export default {
  name: 'ChatGameHall',
  componentName: 'ChatGameHall',
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
      showNotifiyMsg: false,
      ws: null
    }
  },
  computed: {
    ...mapState([
      'games', 'theme'
    ]),
    ...mapState('eagle', {
      emojiMap: state => state.emojiMap
    }),
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId)
    }
  },
  watch: {
    'currentGame': {
      handler (game, oldGame) {
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
          if (this.ws === null) {
            this.ws = new EagleWebSocket(this.$cookie.get('access_token'), game.rooms[0].id)
          } else if (game.code !== oldGame.code) {
            this.ws.joinRoom(game.rooms[0].id)
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
  created () {
    console.log(this.user)
    if (!this.$route.params.gameId) {
      if (this.games.length > 0) {
        this.chooseGame()
      } else {
        const unwatch = this.$watch('games', function (games) {
          this.chooseGame()
          unwatch()
        })
      }
    }
    if (this.emojiMap === null) {
      eagle.fetchStickers().then(res => {
        this.$store.dispatch('eagle/initSticker', res)
        const emojiMap = {}
        res.forEach((series, index) => {
          emojiMap[series.id] = {...series, order: index}
        })
        this.$store.dispatch('eagle/initEmoji', emojiMap)
      }).catch(() => {

      })
    }
    this.$on('gameHall.showGameInfo', (type) => {
      this.isGameInfoVisible = !!type
      this.contentType = type
    })
  },
  methods: {
    toHome () {
      if (this.$route.name !== 'Home') {
        this.sendGaEvent({
          label: '遊戲大廳',
          category: '返回首頁',
          action: '点击'
        })
        this.$router.push({ name: 'Home' })
      }
    },
    hideNotifyMsg (gameName) {
      window.localStorage.setItem(gameName, this.$moment().format('YYYYMMDD'))
      this.showNotifiyMsg = false
    },
    chooseGame () {
      const gameId = this.$store.state.lastGameData.lastGame || this.allGames[0].id
      this.$router.replace('/game/' + gameId)
    }
  },
  beforeDestroy () {
    this.ws.leaveRoom()
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
    transition-duration: 0.7s;
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
}
</style>
