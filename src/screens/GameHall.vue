<template>
  <div style="height: 100%;" @click="setSidebar">
    <!-- 头部 -->

    <!-- 侧滑菜单 -->
    <transition name="fade">
      <div :class="['mean', sidebarShow ? 'active' : ''] ">
        <span @click.stop="showSide">
              <icon name="navicon"></icon>
        </span>
      </div>
    </transition>
    <transition name="fade">
      <div class="mask" v-show="sidebarShow">
        <div class="banner">
          <img :src="logo">
        </div>
        <ul v-if="allGames">
          <li v-for="(game, index) in allGames" v-if="index < 11">{{game.display_name}}</li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script>
  // 引入 侧滑菜单组件
  import {gethomePage, getGameCategory} from '../api'
  import 'vue-awesome/icons/navicon'
  import Icon from 'vue-awesome/components/Icon'

  export default {
    components: {
      // 注册组件
      Icon
    },
    data () {
      return {
        sidebarShow: false, // 默认值
        logo: '',
        allGames: []
      }
    },
    created () {
      gethomePage()
        .then(res => {
          this.logo = res.icon
        })
      getGameCategory().then(response => {
        this.allGames = response
      })
    },
    methods: {
      // 显示 侧滑菜单
      showSide () {
        this.sidebarShow = true
        this.$refs.mean.style.marginLeft = '42%'
      },
      // 接收 Sidebar组件的返回值 隐藏 侧滑菜单
      setSidebar () {
        this.sidebarShow = false
        this.$refs.mean.style.marginLeft = '0'
      }
    }
  }
</script>

<style lang="less" scoped>
  .mean{
    &.active {
      margin-left: 42%;
    }
  }
  .mask {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 42%;
    height: 100%;
    z-index: 40;
    background: #ffffff;
    opacity: 1;
    text-align: center;
    &.fade-enter-active, &.fade-leave-active {
      transition: all 0.5s;
    }
    &.fade-enter, &.fade-leave-active {
      opacity: 0;
    }
    .banner {
      height: 69px;
      line-height: 69px;
      border-bottom: 1px solid #f1f1f1;
      img {
        height: 32px;
      }
    }
    li {
      height: 49px;
      line-height: 49px;
      padding-left: 12%;
      border-bottom: 1px solid #f1f1f1;
      font-size: 18px;
      text-align: left;
      color: #4a4a4a;
      &.active {
        background-color: #006bb3;
      }
    }
  }
</style>
