<template>
  <div class="container">
    <x-header 
      :right-options="{showMore: !!user.username}"
      :left-options="{showBack: $route.meta.showBack || false}">
      {{$route.meta.title}}
      <div
        v-if="!$route.meta.showBack"
        class="logo"
        slot="overwrite-left"
        >
        <img :src="logo" v-if="logo" height="32" />
      </div>
      <div 
        v-if="!this.userLoading && showActions && !user.username"
        class="actions"
        slot="right">
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
        <a>试玩</a>
      </div>
    </x-header>
    <router-view></router-view>
    <tabbar v-show="!$route.meta.tabbarHidden" class="tabbar">
      <tabbar-item 
        v-for="(menu, index) in menus"
        :link="menu.link" 
        :selected="$route.name === menu.route"
        :key="'tabbar' + index">
        <icon :name="menu.icon" slot="icon" scale="1.3"></icon>
        <span slot="label">{{menu.label}}</span>
      </tabbar-item>
    </tabbar>
    <loading v-model="isLoading"></loading>
  </div>
</template>

<script>
import { XHeader, Tabbar, TabbarItem, Group, Cell, Loading } from 'vux'
import { mapState, mapGetters } from 'vuex'
import { gethomePage } from './api'
import Icon from 'vue-awesome/components/Icon.vue'
import 'vue-awesome/icons'

export default {
  name: 'app',
  data () {
    return {
      menus: [{
        label: this.$t('home.name'),
        icon: 'home',
        link: '/',
        route: 'Home'
      }, {
        label: this.$t('game.name'),
        icon: 'th',
        link: '/game',
        route: 'Game'
      }, {
        label: this.$t('fin.name'),
        icon: 'th-list',
        link: '/fin',
        route: 'Fin'
      }, {
        label: this.$t('my.name'),
        icon: 'user-o',
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
    }
  },
  created () {
    gethomePage()
      .then(res => {
        this.logo = res.icon
      })
    this.$store.dispatch('fetchUser')
      .then(res => {
        this.userLoading = false
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
@import './styles/base.css';

.tabbar {
  position: fixed;
}
.logo {
  position: absolute;
  top: -8px;
}
.container {
  .vux-header .vux-header-right {
    .actions {
      position: relative;  
      top: -5px;
      right: -5px;
      a{
        background: #fff;
        color: #666;
        padding: 4px 10px;
        border-radius: 2px;
      } 
    }
  }
}
</style>