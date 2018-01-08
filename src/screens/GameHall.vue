<template>
  <div>
    <x-header
      class="gamehall-header"
      @on-click-more="showRightPopup = true"
      :right-options="{showMore: true}"
      :left-options="{showBack: true, preventGoBack: true, backText: 'vrvgr'}">
      {{$route.meta.title}}
      <div
        v-if="!$route.meta.showBack"
        class="show-more"
        slot="overwrite-left"
        @click="showLeftPopup = true"
        >
        IconHere
      </div>
      <div slot="overwrite-title" class="gamehall-header-title">{{currentGame.display_name}}</div>
    </x-header>
    <GameResult :gameid="$route.params.gameId" />
    <AsidePopupMenu :showLogo="true" :items="games" position="left" :isShow.sync="showLeftPopup" width="150px" :itemCenter="false" >
      <div class="popup-logo">
        <img :src="logo" alt="logo">
      </div>
    </AsidePopupMenu>
    <AsidePopupMenu :showLogo="false" :items="leftMenuItems" position="right" :isShow.sync="showRightPopup" width="150px" :itemCenter="true">
      <div class="user-account">
        <p class="info">
          <span class="text">余额</span>
          <span class="number">{{user.balance}}</span>
        </p>
        <p class="info">
          <span class="text">未結</span>
          <span class="number">{{user.unsettled || 0}}</span>
        </p>
        <x-button class="account-btn" type="primary" link="/">查看注單</x-button>
        <x-button class="account-btn" type="primary" link="/">我的帐户</x-button>
        <x-button class="account-btn" type="primary" link="/">立即充值</x-button>
      </div>
    </AsidePopupMenu>
  </div>
</template>

<script>
import Game from './games/Game'
import AsidePopupMenu from '../components/AsidePopupMenu'
import GameResult from '../components/GameResult'
import { fetchGames, gethomePage } from '../api'
import { XButton, XHeader } from 'vux'

export default {
  components: {
    AsidePopupMenu,
    Game,
    XButton,
    XHeader,
    GameResult
  },
  data () {
    return {
      showRightPopup: false,
      showLeftPopup: false,
      games: [],
      logo: '',
      leftMenuItems: [
        {
          display_name: '路珠',
          id: '/'
        },
        {
          display_name: '長龍排行榜',
          id: '/'
        },
        {
          display_name: '歷史開獎',
          id: '/'
        },
        {
          display_name: '遊戲介紹',
          id: '/'
        }
      ]
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
    currentGame () {
      return this.games.length ? this.games.find((item) => { return item.id + '' === this.$route.params.gameId }) : ''
    }
  },
  created () {
    fetchGames().then(games => {
      gethomePage().then(res => {
        this.logo = res.icon
        this.games = games
      })
    })
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';

.popup-logo {
  width: 100%;
  height: 70px;
  text-align: center;
  line-height: 70px;
  img {
    width: percentage(110 / 150);
    height: percentage(25 / 70);
  }
}

.user-account {
  padding: 35px 10px 60px 10px;
  font-size: 14px;
  .account-btn {
    height: 35px;
    font-size: 14px;
    background-color: @azul;
  }
  .weui-btn {
    margin-top: 10px;
  }
}

.info {
  display: inline-flex;
  width: 100%;
  justify-content: space-between;
  .text {
    font-weight: 300;
    color: #4a4a4a;
  }
  .number {
    color: #9b9b9b;
  }
}

.gamehall-header {
  background-image: linear-gradient(to bottom, #006bb3, #00397c);
}

.gamehall-header-title {
  font-size: 14px;
  line-height: 44px;
  color: white
}
</style>
