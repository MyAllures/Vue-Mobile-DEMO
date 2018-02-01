<template>
  <view-box ref="viewBox" body-padding-top="46px" :body-padding-bottom="$route.meta.tabbarHidden?0:'55px'" >
    <x-header
      :class="isGameHall?'gamehall':''"
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
      :right-options="{showMore: !!user.username}"
      :left-options="{showBack: $route.meta.showBack || false}">
      {{$route.meta.title}}
      <div v-if="!isGameHall">
        {{systemConfig.siteName}}
      </div>
      <div
        v-if="isGameHall && !showChatRoom"
        slot="overwrite-left"
        @click="showGameMenu = true"
        class="left-trigger">
        <x-icon
          type="navicon"
          size="32"></x-icon>
        {{currentGame.display_name}}
      </div>
      <div
        v-else-if="isGameHall && showChatRoom"
        slot="overwrite-left"
        @click="showChatRoom = false"
        class="left-trigger">
        <x-icon
          type="ios-close-empty"
          size="32"></x-icon>
          退出聊天室
      </div>
      <div
        v-if="showLinks"
        class="actions"
        slot="right">
        <router-link class="link" to="/login">登录</router-link>
        <router-link class="link" to="/register">注册</router-link>
        <a class="link try" @click="tryDemo">试玩</a>
      </div>
      <span slot="right" class="username fr" v-else-if="!isGameHall">{{ user.account_type === 0 ? '游客' : user.username}}</span>
      <x-icon
        type="chatbubble-working"
        size="30"
        v-if="isGameHall &&!showChatRoom"
        @click.native="showChatRoom = true"
        slot="right"></x-icon>
    </x-header>
    <router-view :showChatRoom="showChatRoom" :showGameMenu="showGameMenu" @closeGameMenu="closeGameMenu"></router-view>
    <tabbar
      slot="bottom"
      v-show="!$route.meta.tabbarHidden"
      class="tabbar">
      <tabbar-item
        :badge="menu.unreadBadge && unread ? ('' + unread) : ''"
        v-for="(menu, index) in menus"
        :link="menu.link"
        :selected="`/${$route.path.split('/')[1]}` === menu.link || $route.path === menu.link"
        :key="'tabbar' + index">
        <i :class="menu.icon" slot="icon"></i>
        <span slot="label">{{menu.label}}</span>
      </tabbar-item>
    </tabbar>
    <loading v-model="isLoading"></loading>
    <right-menu
      v-model="showRightMenu"
      :show-links="showRightMenuLinks"
      @handleClose="closeRightMenu" />
  </view-box>
</template>

<script>
import './styles/fonts/icons.css'

import { XHeader, Tabbar, TabbarItem, Group, Cell, Loading, ViewBox, Actionsheet } from 'vux'
import { mapState, mapGetters } from 'vuex'
import { getToken } from './api'
import axios from 'axios'
import { setIndicator } from './utils'
import RightMenu from './components/RightMenu'

export default {
  name: 'app',
  data () {
    return {
      showRightMenu: false,
      showChatRoom: false,
      showGameMenu: false,
      menus: [{
        label: this.$t('home.name'),
        icon: 'icon-home',
        link: '/',
        route: 'Home'
      }, {
        label: this.$t('game.name'),
        icon: 'icon-list',
        link: '/game',
        route: 'Game'
      }, {
        label: this.$t('fin.name'),
        icon: 'icon-fin',
        link: '/fin/bet_record',
        route: 'Fin'
      }, {
        label: this.$t('my.name'),
        icon: 'icon-my',
        link: '/my',
        route: 'My',
        unreadBadge: true
      }],
      logo: '',
      userLoading: true,
      error: ''
    }
  },
  watch: {
    'user.logined' (newStatus, old) {
      if (!newStatus) {
        clearInterval(this.unreadInterval)
      } else {
        this.pollUnread()
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState({
      isLoading: state => state.isLoading
    }),
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
    }
  },
  methods: {
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
    tryDemo () {
      this.$store.dispatch('tryDemo').then(result => {
        this.$router.push({ name: 'Home' })
        this.$store.dispatch('fetchUser')
      }).catch(error => {
        this.error = error
      })
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
        } else {
          this.$store.dispatch('fetchUnread')
        }
      }, 11000)
    },
    closeGameMenu () {
      this.showGameMenu = false
    }
  },
  created () {
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
    RightMenu
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
    position: relative;
    top: -5px;
    right: -5px;
    .link {
      color: #fff;
      padding: 4px 5px;
      border-radius: 2px;
      &.try {
        background: #fff;
        color: #666;
      }
    }
  }
}
.vux-header /deep/ .vux-header-right a.vux-header-more {
  float: right;
}

.vux-header.gamehall /deep/ .vux-header-left {
  left: 8px;
  top: 7px;
  line-height: 100%;
}
.vux-header.gamehall /deep/ .vux-header-right{
  top: 7px;
  a {
    margin-left: 20px;
    float: right;
  }
  .vux-header-more {
    margin-top: 6px;
  }
}

.username {
  color: #fff;
  overflow: hidden;
  display: inline-block;
  white-space: nowrap;
  max-width: 100px;
  text-overflow: ellipsis;
}
.left-trigger {
  float: left;
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #fff;
}
</style>
