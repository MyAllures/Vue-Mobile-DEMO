<template>
  <div>
    <x-header 
      :left-options="{showBack: $route.meta.showBack || false}">
      {{$route.meta.title}}
    </x-header>
    <router-view></router-view>
    <tabbar v-show="!$route.meta.tabbarHidden">
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
import { mapState } from 'vuex'
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
      }]
    }
  },
  computed: {
    ...mapState({
      isLoading: state => state.isLoading
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
</style>