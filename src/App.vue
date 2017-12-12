<template>
  <div>
    <router-view></router-view>
    <tabbar>
      <tabbar-item link="/">
        <icon name="home" slot="icon" scale="1.3"></icon>
        <span slot="label">{{$t('home.name')}}</span>
      </tabbar-item>
      <tabbar-item link="/game">
        <icon name="th" slot="icon" scale="1.3"></icon>
        <span slot="label">{{$t('game.name')}}</span>
      </tabbar-item>
      <tabbar-item link="/fin">
        <icon name="th-list" slot="icon" scale="1.3"></icon>
        <span slot="label">{{$t('fin.name')}}</span>
      </tabbar-item>
      <tabbar-item link="/my">
        <icon name="user-o" slot="icon" scale="1.3"></icon>
        <span slot="label">{{$t('my.name')}}</span>
      </tabbar-item>
    </tabbar>
    <loading v-model="isLoading"></loading>
  </div>
</template>

<script>
import { Tabbar, TabbarItem, Group, Cell, Loading } from 'vux'
import { mapState } from 'vuex'
import Icon from 'vue-awesome/components/Icon.vue'
import 'vue-awesome/icons'

export default {
  name: 'app',
  computed: {
    ...mapState({
      isLoading: state => state.isLoading
    })
  },
  components: {
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