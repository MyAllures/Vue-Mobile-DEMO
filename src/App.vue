<template>
  <view-box
    ref="viewBox"
    body-padding-top="46px"
    :body-padding-bottom="$route.meta.tabbarHidden? 0 : '55px'"
    >
    <x-header
      :class="isGameHall ? 'gamehall' : ''"
      v-show="!$route.meta.headerHidden"
      @on-click-more="showRightMenu=true"
      :style="{
        width: '100%',
        position: 'fixed', // lay over the default
        left:'0',
        top:'0',
        'z-index':'100'
      }"
      slot="header"
      :right-options="{showMore: !!user.username&&isGameHall}"
      :left-options="{showBack: $route.meta.showBack || false}">
      <div v-if="!isGameHall&&$route.path !== '/'">
        {{$route.meta.title}}
      </div>
      <div
        v-if="!showChatRoom && !$route.meta.showBack"
        slot="overwrite-left"
        @click="showGameMenu = true"
        class="left-trigger">
          <x-icon
          type="navicon"
          size="32"></x-icon>
          <a class="vux-header-name">{{headerLeftTitle}}</a>
      </div>
      <div
        v-else-if="isGameHall && showChatRoom"
        slot="overwrite-left"
        @click="closeChatRoom"
        class="left-trigger">
        <x-icon
          type="ios-close-empty"
          size="32"></x-icon>
          {{roomInfo&&roomId&&roomInfo[roomId].name}}
      </div>
      <div
        v-if="showLinks"
        class="actions"
        slot="right">
        <router-link class="link" to="/login">登录</router-link>
        <router-link class="link" to="/register">注册</router-link>
        <div class="link" @click="tryDemo">
          <div class="try">试玩</div>
        </div>
      </div>
      <span v-else-if="!isGameHall&&!!user.username" slot="right" class="balance fr" @click="showRightMenu=true">{{ user.balance|currency('￥')}}</span>
      <div
        v-if="isShowChatroomIcon"
        class="chatbubble"
        slot="right"
        @click="showChatRoom = true">
        <x-icon
          type="chatbubble-working"
          size="30"></x-icon>
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
        :selected="selectedTab===menu.name"
        v-for="(menu, index) in menus"
        :link="menu.link"
        :key="'tabbar' + index">
        <i :class="menu.icon" slot="icon"></i>
        <span slot="label">{{menu.label}}</span>
      </tabbar-item>
    </tabbar>
    <loading v-model="isLoading"></loading>
    <right-menu
      v-model="showRightMenu"
      @closeRightMenu="closeRightMenu"
      :show-links="showRightMenuLinks" />
    <tryplay-popup />
    <game-menu :isShow="showGameMenu" @closeSideBar="closeGameMenu" />
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
  </view-box>
</template>

<script>
import './styles/fonts/icons.css'

import Vue from 'vue'
import { XHeader, Tabbar, TabbarItem, Group, Cell, Loading, ViewBox, Actionsheet, TransferDom } from 'vux'
import { mapState, mapGetters } from 'vuex'
import { getToken } from './api'
import axios from 'axios'
import { setIndicator } from './utils'
import RightMenu from './components/RightMenu'
import TryplayPopup from './components/TryplayPopup'
import freetrial from './mixins/freetrial.js'
import GameMenu from './components/GameMenu.vue'

export default {
  name: 'app',
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
        icon: 'icon-home',
        link: '/',
        route: 'Home',
        name: 'home'
      }, {
        label: this.$t('game.name'),
        icon: 'icon-list',
        link: '/game',
        route: 'Game',
        name: 'game'
      }, {
        label: this.$t('deposit.process'),
        icon: 'icon-bank',
        link: '/my/deposit',
        route: 'Deposit',
        name: 'deposit'
      }, {
        label: this.$t('fin.name'),
        icon: 'icon-fin',
        link: '/fin/bet_record',
        route: 'Fin',
        name: 'fin'
      }, {
        label: this.$t('my.name'),
        icon: 'icon-my',
        link: '/my',
        route: 'My',
        name: 'my',
        unreadBadge: true
      }],
      logo: '',
      userLoading: true,
      error: ''
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
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'isLoading', 'ws', 'roomInfo', 'roomId'
    ]),
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
      return this.currentGame.display_name || (this.$route.name === 'Home' ? this.systemConfig.siteName : '')
    },
    selectedTab () {
      const path = this.$route.path
      if (path === '/') {
        return 'home'
      }
      if (path === '/my/deposit') {
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
    closeMenus () {
      this.showRightMenu = false
      this.showGameMenu = false
    },
    closeRightMenu () {
      this.showRightMenu = false
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
      return new Promise((resolve, reject) => {
        let refreshToken = this.$cookie.get('refresh_token')
        if (!refreshToken) {
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
          resolve()
        })
      })
    },
    pollUnread () {
      this.unreadInterval = setInterval(() => {
        if (!this.$cookie.get('access_token')) {
          clearInterval(this.unreadInterval)
        } else if (this.user.account_type) {
          this.$store.dispatch('fetchUnread')
        }
      }, 11000)
    },
    closeGameMenu () {
      this.showGameMenu = false
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
      this.showGameMenu = true
    })

    this.$root.bus.$on('showFeatureGuide', () => {
      this.showFeatureGuide = true
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
    let refreshTokenInterval
    setIndicator(() => {
      refreshTokenInterval = window.setInterval(() => {
        if (this.replaceToken) {
          this.replaceToken().then(() => {
          }).catch(error => {
            Promise.resolve(error)
          })
        }
      }, 300000)
    }, () => {
      window.clearInterval(refreshTokenInterval)
    })
  },
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
    GameMenu
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
    margin: -6px 0 0 -5px;
    float: left;
    display: inline-block;
  }
}
</style>
