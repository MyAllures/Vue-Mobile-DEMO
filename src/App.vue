<template>
  <div :class="['container',{'no-tabbar':$route.meta.tabbarHidden}]">
    <x-header
      v-show="!$route.meta.headerHidden"
      :right-options="{showMore: !!user.username}"
      :class="pageName && pageName.indexOf('Home') !== -1 ? 'bg' : ''"
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
        v-if="!this.userLoading && showActions && !user.username"
        class="actions"
        slot="right">
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
        <a style="color: deepskyblue">试玩</a>
      </div>
    </x-header>
    <router-view></router-view>
    <tabbar v-show="!$route.meta.tabbarHidden" class="tabbar">
      <tabbar-item
        v-for="(menu, index) in menus"
        :link="menu.link"
        :selected="$route.name === menu.route"
        :key="'tabbar' + index">
        <i :class="menu.icon" slot="icon"></i>
        <span slot="label">{{menu.label}}</span>
      </tabbar-item>
    </tabbar>
    <loading v-model="isLoading"></loading>
  </div>
</template>

<script>
import { XHeader, Tabbar, TabbarItem, Group, Cell, Loading } from 'vux'
import { mapState, mapGetters } from 'vuex'
import Icon from 'vue-awesome/components/Icon.vue'
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
        route: 'My'
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
    showActions () {
      return !['Login'].includes(this.$route.name)
    },
    pageName: function () {
      return this.$route.name
    },
    logoSrc () {
      return this.$store.state.systemConfig.homePageLogo
    }
  },
  created () {
    this.$store.dispatch('fetchUser')
      .then(res => {
        this.userLoading = false
      })

    let refreshTokenInterval
    setIndicator(() => {
      refreshTokenInterval = window.setInterval(() => {
        if (this.replaceToken) {
          this.replaceToken().then(() => {
            this.getMessageCount()
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
    Icon
  }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import './styles/theme.less';
@import './styles/base.css';

.tabbar {
  position: fixed;
}
.logo {
  position: absolute;
  top: -8px;
}
.bg {
  background-color: inherit!important;
}
.container {
  height: 100%;
  padding-bottom: 55px;
  &.no-tabbar{
    padding-bottom: 0;
  }
  .vux-header .vux-header-right {
    .actions {
      position: relative;
      top: -5px;
      right: -5px;
      a{
        color: #666;
        padding: 4px 10px;
        border-radius: 2px;
      }
    }
  }
}
</style>
