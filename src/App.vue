<template>
  <view-box ref="viewBox"
    body-padding-top="46px"
    :body-padding-bottom="$route.meta.tabbarHidden? 0 : '55px'">
    <x-header :class="{'gamehall': isGameHall}"
      v-show="!$route.meta.headerHidden"
      @on-click-more="showRightMenu = true; closeGameMenu(); closeCalender()"
      :right-options="{showMore: !!user.username && isGameHall}"
      :style="{
        width: '100%',
        position: 'fixed', // lay over the default
        left:'0',
        top:'0',
        'z-index': headerZindex
      }"
      slot="header"
      :left-options="{showBack: $route.meta.showBack || false}">

      <div @click="titleCondition.onClick">
        {{titleCondition.text}}
        <i v-if="titleCondition.showDropdown"
          :class="['solid-triangle', (showGameMenu || showCalender) ? 'point-top' : 'point-down' ]"></i>
      </div>

      <div v-if="!showChatRoom && !$route.meta.showBack"
        slot="overwrite-left"
        @click="$route.name === 'Home' ? '' : $router.push({name: 'Home'})">
        <a class="vux-header-back">{{headerLeftTitle}}</a>
        <div v-if="$route.name !== 'Home'" class="left-arrow"></div>
      </div>

      <div v-else-if="isGameHall && showChatRoom"
        slot="overwrite-left"
        @click="closeChatRoom"
        class="left-trigger">
        <x-icon
          type="ios-close-empty"
          size="24"></x-icon>
        {{roomInfo && roomId && roomInfo[roomId].name}}
      </div>

      <div v-if="showLinks && !showGameMenu"
        class="actions"
        slot="right">
        <router-link class="link" to="/login">登录</router-link>
        <router-link class="link" to="/register">注册</router-link>
        <div class="link" @click="tryDemo"><div class="try">试玩</div></div>
      </div>

      <span v-else-if="!isGameHall && !!user.username"
        slot="right"
        class="balance fr"
        @click="showRightMenu = true; closeGameMenu(); closeCalender()">
        {{ user.balance|currency('￥')}}
      </span>
      <div v-if="isShowChatroomIcon"
        class="chatbubble"
        slot="right"
        @click="showChatRoom = true; closeGameMenu()">
        <x-icon type="chatbubble-working" size="30"></x-icon>
      </div>

    </x-header>
    <keep-alive :include="$store.state.keepAlivePage">
      <router-view :showChatRoom="showChatRoom" @closeChatRoom="showChatRoom = false"></router-view>
    </keep-alive>
    <tabbar
      slot="bottom"
      v-show="!$route.meta.tabbarHidden"
      class="tabbar">
      <tabbar-item
        :badge="menu.unreadBadge && unread ? ('' + unread) : ''"
        :selected="selectedTab === menu.name"
        v-for="(menu, index) in menus"
        :link="menu.link"
        :key="'tabbar' + index">
        <img :src="menu.iconImg" slot="icon" :alt="menu.name">
        <img :src="menu.iconImgActive" slot="icon-active" :alt="menu.name">
        <span slot="label">{{menu.label}}</span>
      </tabbar-item>
    </tabbar>
    <loading v-model="isLoading"></loading>
    <right-menu
      v-model="showRightMenu"
      @closeRightMenu="closeRightMenu"
      :show-links="showRightMenuLinks" />
    <tryplay-popup />
    <game-menu :isShow="showGameMenu" @closeSideBar="closeGameMenu()" />
    <div v-transfer-dom>
      <div class="feature-guide" v-if="showFeatureGuide" @click="showFeatureGuide=false">
        <div class="content">
          <div class="arrow">
            <div class="curve"></div>
            <div class="point"></div>
          </div>
          <div class="txt">在这里添加银行卡，即可领注册彩金</div>
        </div>
      </div>
    </div>
    <bet-dialog />
    <transition name="fade">
      <div v-show="showCalender">
        <Calender ref="calendar" @closeCalender="closeCalender"/>
      </div>
    </transition>
  </view-box>
</template>

<script>
import Vue from 'vue'
import { XHeader, Tabbar, TabbarItem, Group, Cell, Loading, ViewBox, Actionsheet, TransferDom } from 'vux'
import { mapState, mapGetters } from 'vuex'
import { getToken } from './api'
import axios from 'axios'
import RightMenu from './components/RightMenu'
import TryplayPopup from './components/TryplayPopup'
import freetrial from './mixins/freetrial.js'
import GameMenu from './components/GameMenu.vue'
import BetDialog from './components/BetDialog'
import Calender from './components/Calender'

export default {
  name: 'app',
  components: {
    XHeader,
    Tabbar,
    TabbarItem,
    Group,
    Cell,
    Loading,
    ViewBox,
    Actionsheet,
    RightMenu,
    TryplayPopup,
    GameMenu,
    BetDialog,
    Calender
  },
  directives: {
    TransferDom
  },
  data () {
    return {
      showRightMenu: false,
      showChatRoom: false,
      showGameMenu: false,
      showFeatureGuide: false,
      menus: [{
        label: this.$t('home.name'),
        iconImg: require('./assets/footer/home_normal.svg'),
        iconImgActive: require('./assets/footer/home_pressed.svg'),
        link: '/',
        route: 'Home',
        name: 'home'
      }, {
        label: this.$t('game.name'),
        iconImg: require('./assets/footer/game_normal.svg'),
        iconImgActive: require('./assets/footer/game_pressed.svg'),
        link: '/game',
        route: 'Game',
        name: 'game'
      }, {
        label: this.$t('deposit.process'),
        iconImg: require('./assets/footer/top_up_normal.svg'),
        iconImgActive: require('./assets/footer/top_up_pressed.svg'),
        link: '/my/deposit',
        route: 'Deposit',
        name: 'deposit'
      }, {
        label: this.$t('fin.name'),
        iconImg: require('./assets/footer/finance_normal.svg'),
        iconImgActive: require('./assets/footer/finance_pressed.svg'),
        link: '/fin/bet_record',
        route: 'Fin',
        name: 'fin'
      }, {
        label: this.$t('my.name'),
        iconImg: require('./assets/footer/me_normal.svg'),
        iconImgActive: require('./assets/footer/me_pressed.svg'),
        link: '/my',
        route: 'My',
        name: 'my',
        unreadBadge: true
      }],
      logo: '',
      userLoading: true,
      error: '',
      showGameInfo: false,
      showCalender: false,
      headerZindex: 100,
      refreshTokenInterval: null
    }
  },
  mixins: [freetrial],
  watch: {
    'user.logined' (newStatus, old) {
      if (!newStatus) {
        clearInterval(this.unreadInterval)
      } else {
        this.pollUnread()
      }
    },
    '$route' (to, from) {
      if (window.self === window.top) { // 非內嵌iframe時才設成auto
        if (to.name === 'Home') {
          document.documentElement.style.height = 'auto'
          document.body.style.height = 'auto'
        } else {
          document.documentElement.style.height = '100%'
          document.body.style.height = '100%'
        }
      }
      this.closeChatRoom()
    },
    'ws' (ws) {
      if (!ws) {
        this.showChatRoom = false
      }
    },
    'titleCondition': function (val) { // when header changing
      if (!val.showDropdown) { // init
        this.showCalender = false
        this.showGameMenu = false
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'isLoading', 'ws', 'roomInfo', 'roomId'
    ]),
    titleCondition () {
      let route = this.$route
      let title = {
        text: '',
        showDropdown: false,
        onClick: ''
      }
      const customTitle = this.$store.state.customTitle

      if (route.name === 'DetailBetRecord') {
        title.text = route.params.date
        title.showDropdown = true
        title.onClick = () => { this.showCalender = !this.showCalender }
      } else if (!this.isGameHall && (route.path !== '/')) {
        if (route.meta.title === 'custom') {
          title.text = customTitle
        } else {
          title.text = route.meta.title
        }
      } else if (this.isGameHall && !this.showChatRoom) {
        title.text = this.currentGame.display_name
        title.showDropdown = true
        title.onClick = () => {
          if (this.showGameMenu) {
            this.closeGameMenu()
          } else {
            this.headerZindex = 503
            this.showGameMenu = true
          }
        }
      } else if ((route.name === 'Home') && this.showGameMenu) {
        title.text = '游戏选单'
        title.showDropdown = true
        title.onClick = () => {
          if (this.showGameMenu) {
            this.closeGameMenu()
          } else {
            this.headerZindex = 503
            this.showGameMenu = true
          }
        }
      }

      return title
    },
    unread () {
      return this.$store.state.user.unread
    },
    isGameHall () {
      return this.$route.matched[0] && this.$route.matched[0].path === '/game'
    },
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId) || {}
    },
    showRightMenuLinks () {
      return ['RoadBeads', 'Leaderboards', 'GameIntro', 'Game', 'GameDetail'].includes(this.$route.name)
    },
    showLinks () {
      return !['Login', 'Register', 'Promotions', 'PromotionDetail'].includes(this.$route.name) && !this.user.logined
    },
    pageName: function () {
      return this.$route.name
    },
    systemConfig () {
      return this.$store.state.systemConfig
    },
    headerLeftTitle () {
      let name = this.$route.name
      if (name === 'Home') {
        return this.showGameMenu ? '' : this.systemConfig.siteName
      } else {
        if (name === 'GameDetail' || name === 'Game') {
          return '首页'
        }
      }
    },
    selectedTab () {
      const path = this.$route.path
      if (path === '/') {
        return 'home'
      }
      if (this.$route.matched[0].path === '/my/deposit') {
        return 'deposit'
      }
      return path.split('/')[1]
    },
    isShowChatroomIcon () {
      if (!this.systemConfig.chatroomEnabled || !this.isGameHall || this.showChatRoom) {
        return false
      }
      if (!this.$route.params.gameId || !this.roomInfo) {
        return false
      }
      if (!this.roomInfo[this.$route.params.gameId].status && !this.roomInfo[100000].status) {
        return false
      }
      return true
    }
  },
  methods: {
    closeCalender () {
      this.showCalender = false
    },
    closeMenus () {
      this.showRightMenu = false
      this.closeGameMenu()
    },
    closeRightMenu () {
      this.showRightMenu = false
    },
    closeGameMenu () {
      this.showGameMenu = false
      setTimeout(() => {
        this.headerZindex = 100
      }, 320)
    },
    triggerAction (key, item) {
      if (item) {
        if (item.action) {
          return this.$store.dispatch(item.action)
        }
        this.$router.push(item.link)
      }
    },
    replaceToken () {
      let refreshToken = this.$cookie.get('refresh_token')
      if (!refreshToken || !this.$store.state.user.account_type) {
        return
      }
      getToken(refreshToken).then(res => {
        let expires = new Date(res.expires_in)
        this.$cookie.set('access_token', res.access_token, {
          expires: expires
        })
        this.$cookie.set('refresh_token', res.refresh_token, {
          expires: expires
        })
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      })
    },
    pollUnread () {
      this.unreadInterval = setInterval(() => {
        if (!this.$cookie.get('access_token')) {
          clearInterval(this.unreadInterval)
        } else if (this.user.account_type) {
          this.$store.dispatch('fetchUnread').catch(() => {})
        }
      }, 11000)
    },
    closeChatRoom () {
      this.showChatRoom = false
      if (this.ws && this.ws.roomId) {
        this.ws.leaveRoom()
      }
    }
  },
  created () {
    this.$root.bus = new Vue()
    this.$root.bus.$on('showGameMenu', () => {
      this.headerZindex = 503
      this.showGameMenu = true
    })

    this.$root.bus.$on('showFeatureGuide', () => {
      this.showFeatureGuide = true
    })

    this.$root.bus.$on('showGameInfo', (type) => {
      this.showGameInfo = !!type
    })

    this.$router.afterEach((to) => {
      this.closeMenus()
    })

    this.$store.dispatch('fetchGames')
    if (this.$cookie.get('access_token')) {
      this.$store.dispatch('fetchUser').then(() => {
      }, errRes => {
        this.performLogin()
      }).catch(() => {
        this.performLogin()
      })
    }
    this.refreshTokenInterval = window.setInterval(() => {
      this.replaceToken()
    }, 20 * 60 * 1000)
  },
  beforeDestroy () {
    window.clearInterval(this.refreshTokenInterval)
  }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import './styles/theme.less';
@import './styles/base.less';
</style>
<style lang="less" scoped>
@import './styles/vars.less';

.feature-guide {
  position: fixed;
  background: radial-gradient(
    circle at bottom right,
    rgba(0, 0, 0, 0) 11%,
    rgba(0, 0, 0, 0.7) 11%
  );
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1001;
  .txt {
    text-align: center;
    font-size: 18px;
    color: #fff;
  }
  .content {
    width: 100%;
    height: 350px;
    bottom: 0;
    position: absolute;
  }
  .arrow {
    transform: rotate(-30deg);
    position: absolute;
    bottom: 0;
    right: 25%;
    margin: 0 auto;
    width: 100px;
  }

  .arrow .curve {
    border: 6px solid #fff;
    border-radius: 10px;
    border-color: transparent transparent transparent #fff;
    height: 360px;
    width: 220px;
    border-radius: 230px 0 0 150px;
  }

  .arrow .point {
    position: absolute;
    left: 40px;
    top: 315px;
  }

  .arrow .point:before, .arrow .point:after {
    border: 3px solid #fff;
    border-radius: 10px;
    height: 20px;
    content: "";
    position: absolute;
  }

  .arrow .point:before {
    top: -4px;
    left: -11px;
    transform:rotate(-74deg);
  }

  .arrow .point:after {
    top: -11px;
    left: 3px;
    transform:rotate(12deg);
  }
}

.tabbar {
  position: fixed;
  z-index: 98;
  background-color: #fff;
}
.logo {
  position: absolute;
  top: -8px;
}

.vux-x-icon {
  fill: #fff;
}
.vux-header-right {
   .actions {
    height: 46px;
    position: relative;
    box-sizing: border-box;
    padding-right: 5px;
    .link {
      margin-top: 2px;
      box-sizing: border-box;
      padding: 5px 5px;
      height: 42px;
      line-height: 32px;
      color: #fff;
      float: left;
      margin-left: 5px;
      .try {
        box-sizing: border-box;
        padding: 0 10px;
        height: 100%;
        background: #fff;
        color: #666;
      }
    }
  }
}

.vux-header /deep/ .vux-header-right{
  top: 0;
  right: 0;
  height: 46px;
  line-height: 46px;
  svg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%)
  }
  .chatbubble {
    position: relative;
    height: 100%;
    width: 46px;
    float: right;
  }
  a.vux-header-more{
    box-sizing: border-box;
    padding-left: 10px;
    text-align: center;
    height: 46px;
    line-height: 46px;
    width: 36px;
    float: right;
    margin: 0;
  }
}

.balance {
  position: relative;
  color: #fff;
  overflow: hidden;
  display: inline-block;
  white-space: nowrap;
  max-width: 120px;
  text-overflow: ellipsis;
  box-sizing: border-box;
  padding-right: 20px;
  &::after {
    position: absolute;
    right: -2px;
    display: inline-block;
    font-weight: bold;
    transform: rotate(90deg);
    content: '\2026';
    font-size: 16px;
    margin-left: 5px;
  }
}
.left-trigger {
  font-size: 16px;
  color: #fff;
  .vux-x-icon {
    margin: -2px 0 0 -5px;
    float: left;
    display: inline-block;
  }
}

.solid-triangle {
  display: inline-block;
  width: 0;
  height: 0;
  vertical-align: middle;
  &.point-top {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #fff;
  }
  &.point-down {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #fff;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

</style>
