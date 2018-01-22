<template>
  <view-box ref="viewBox" body-padding-top="46px" body-padding-bottom="55px">
    <x-header
      v-show="!$route.meta.headerHidden"
      :style="{
        width: '100%',
        position: 'fixed', // lay over the default
        left:'0',
        top:'0',
        'z-index':'100',
        backgroundColor: getHeaderBgColor
        }"
      slot="header"
      :right-options="{showMore: !!user.username}"
      :left-options="{showBack: $route.meta.showBack || false}">
      {{$route.meta.title}}
      <div
        v-if="!$route.meta.showBack"
        class="logo"
        slot="overwrite-left"
        >
        <img :src="logoSrc" v-if="logoSrc" height="32" />
      </div>
      <div
        v-if="showActions"
        class="actions"
        slot="right">
        <router-link class="link" to="/login">登录</router-link>
        <router-link class="link" to="/register">注册</router-link>
        <a class="link blue">试玩</a>
      </div>
    </x-header>
    <div class="content">
      <router-view></router-view>
    </div>
    <tabbar slot="bottom"
      v-show="!$route.meta.tabbarHidden"
      class="tabbar">
      <tabbar-item
        :badge="menu.unreadBadge && unread !== 0 ? ('' + unread) : ''"
        v-for="(menu, index) in menus"
        :link="menu.link"
        :selected="$route.path.indexOf(menu.route) === 0"
        :key="'tabbar' + index">
        <i :class="menu.icon" slot="icon"></i>
        <span slot="label">{{menu.label}}</span>
      </tabbar-item>
    </tabbar>
    <loading v-model="isLoading"></loading>
  </view-box>
</template>

<script>
import './styles/fonts/icons.css'

import { XHeader, Tabbar, TabbarItem, Group, Cell, Loading, ViewBox } from 'vux'
import { mapState, mapGetters } from 'vuex'
import { getToken } from './api'
import Icon from 'vue-awesome/components/Icon.vue'
import axios from 'axios'
import 'vue-awesome/icons'
import { setIndicator } from './utils'

export default {
  name: 'app',
  data () {
    return {
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
        link: '/fin',
        route: 'Fin'
      }, {
        label: this.$t('my.name'),
        icon: 'icon-my',
        link: '/my',
        route: 'My',
        unreadBadge: true
      }],
      logo: '',
      userLoading: true
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
      return this.$store.state.unread
    },
    showActions () {
      return this.$route.name !== 'Login' && !this.user.logined
    },
    pageName: function () {
      return this.$route.name
    },
    logoSrc () {
      return this.$store.state.systemConfig.homePageLogo
    },
    isStatisticPage () {
      return this.$route.path.split('/')[1] === 'stastics'
    },
    getHeaderBgColor () {
      return this.$route.name === 'Home' ? '#fff' : this.isStatisticPage ? '#0069b1' : ''
    }
  },
  methods: {
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
    }
  },
  created () {
    if (this.$cookie.get('access_token')) {
      this.$store.dispatch('fetchUser').then(() => {
        this.unreadInterval = setInterval(() => {
          this.$store.dispatch('fetchUnread')
        }, 10000)
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
    Icon,
    ViewBox
  }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import './styles/theme.less';
@import './styles/base.css';
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

.vux-header .vux-header-right {
  .actions {
    position: relative;
    top: -5px;
    right: -5px;
    .link {
      color: #9b9b9b;
      padding: 4px 10px;
      border-radius: 2px;
      &.blue {
        color: @azul
      }
    }
  }
}
</style>
