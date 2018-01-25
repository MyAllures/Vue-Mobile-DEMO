<template>
  <view-box ref="viewBox" body-padding-top="46px" body-padding-bottom="55px">
    <x-header
      v-show="!$route.meta.headerHidden"
      @on-click-more="showActions=true"
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
      <div
        v-if="!$route.meta.showBack"
        class="logo"
        slot="overwrite-left"
        >
        <img :src="logoSrc" v-if="logoSrc" height="32" />
      </div>
      <div
        v-if="showLinks"
        class="actions"
        slot="right">
        <router-link class="link" to="/login">登录</router-link>
        <router-link class="link" to="/register">注册</router-link>
        <a class="link bold" @click="tryDemo">试玩</a>
      </div>
    </x-header>
    <router-view></router-view>
    <tabbar
      slot="bottom"
      v-show="!$route.meta.tabbarHidden"
      class="tabbar">
      <tabbar-item
        :badge="menu.unreadBadge && unread !== 0 ? ('' + unread) : ''"
        v-for="(menu, index) in menus"
        :link="menu.link"
        :selected="`/${$route.path.split('/')[1]}` === menu.link"
        :key="'tabbar' + index">
        <i :class="menu.icon" slot="icon"></i>
        <span slot="label">{{menu.label}}</span>
      </tabbar-item>
    </tabbar>
    <loading v-model="isLoading"></loading>
    <actionsheet
      show-cancel
      v-model="showActions"
      :menus="actionMenus"
      @on-click-menu="triggerAction"></actionsheet>
  </view-box>
</template>

<script>
import './styles/fonts/icons.css'

import { XHeader, Tabbar, TabbarItem, Group, Cell, Loading, ViewBox, Actionsheet } from 'vux'
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
      showActions: false,
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
      userLoading: true,
      error: ''
    }
  },
  computed: {
    actionMenus () {
      return this.user.account_type === 0 ? [{
        label: '立即注册',
        link: '/register'
      }, {
        label: '退出登录',
        action: 'logout'
      }] : [{
        label: '立即充值',
        link: '/fin/recharge'
      }, {
        label: '查看注单',
        link: '/fin/bet_record'
      }, {
        label: '申请取款',
        link: '/my/withdraw'
      }, {
        label: '联系客服',
        link: this.$store.state.systemConfig.global_preferences.customer_service_url
      }]
    },
    ...mapGetters([
      'user'
    ]),
    ...mapState({
      isLoading: state => state.isLoading
    }),
    unread () {
      return this.$store.state.unread
    },
    showLinks () {
      return !['Login', 'Register', 'Promotions', 'PromotionDetail'].includes(this.$route.name) && !this.user.logined
    },
    pageName: function () {
      return this.$route.name
    },
    logoSrc () {
      return this.$store.state.systemConfig.homePageLogo
    }
  },
  methods: {
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
      }, 10000)
    }
  },
  created () {
    if (this.$cookie.get('access_token')) {
      this.$store.dispatch('fetchUser').then(() => {
        this.pollUnread()
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
    ViewBox,
    Actionsheet
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

.vux-header .vux-header-right {
  .actions {
    position: relative;
    top: -5px;
    right: -5px;
    .link {
      color: #fff;
      padding: 4px 10px;
      border-radius: 2px;
      &.bold {
        font-weight: 700;
      }
    }
  }
}
</style>
