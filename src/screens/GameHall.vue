<template>
  <div style="height: 100%;">
    <div class="tab">
      <div class="banner">
        <img :src="logo">
      </div>
      <ul v-if="allGames">
        <li v-for="(game, index) in allGames" v-if="index <11">{{game.display_name}}</li>
      </ul>
    </div>

  </div>
</template>

<script>
  import { gethomePage, getGameCategory } from '../api'

export default {
    data () {
      return {
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
    }
}
</script>

<style lang="less" scoped>
  .tab {
    width: 42%;
    height: 100%;
    background-color: #ffffff;
    box-shadow: 2px 0 4px 0 rgba(0, 0, 0, 0.5);
    text-align: center;
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
