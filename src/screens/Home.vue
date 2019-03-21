<template>
  <div class="container">
    <top-bar>
      <div v-if="!isGameMenuVisible" class="main-title left">{{ systemConfig.siteName }}</div>
      <div v-else class="main-title" @click="isGameMenuVisible = !isGameMenuVisible">
        游戏选单
      </div>
      <template slot="right" v-if="!isGameMenuVisible">
        <div class="right-ctrl">
          <template v-if="!user.logined">
            <a class="link" @click="tryDemo">试玩</a>
            <div class="divide"></div>
            <router-link class="link" to="/register">注册</router-link>
            <router-link tag="div" class="link" to="/login"><div class="login">登录</div></router-link>
          </template>
          <template v-else>
            <div
              class="balance fr"
              @click="$store.dispatch('showRightMenu')">
              {{ user.balance|currency('￥')}}
            </div>
          </template>
        </div>
      </template>
    </top-bar>
    <swiper
      class="banner-slider"
      :aspect-ratio=".5"
      dots-position="center"
      dots-class="banner">
      <swiper-item v-for="(banner,index) in banners" :key="index">
        <div class="swiper-image" :style="{'background-image': banner.img?`url('${banner.img}')`:''}"></div>
        <div class="swiper-desc-mask"></div>
      </swiper-item>
    </swiper>
    <div class="announcement" v-if="announcements.length" @click="showDialog = true">
      <div class="speaker">
        <img src="../assets/icon_bullhorn.svg" alt="bullhorn">
      </div>
      <div class="marquee">
        <marquee :messages="announcements" height="32px"></marquee>
      </div>
    </div>
    <router-link
      tag="div"
      to="/register"
      class="register-money"
      v-if="!user.account_type&&parseInt(systemConfig.regPresentAmount)">
      <div class="icon"></div>
      <div class="text">现在注册立领{{systemConfig.regPresentAmount|currency('￥', 0)}}红包</div>
      <x-button type="primary" mini>立即注册</x-button>
    </router-link>
    <div v-if="tags.length >= 0&&tags[0]!=='no-alias'" class="tab-selector">
      <tab :style="{width: tags.length > 4 ? `${tags.length * 100 / 3.5}vw` : ''}"
          :bar-active-color="theme"
          :animate="false"
          :active-color="theme"
          :line-width="2">
        <tab-item
          v-for="(tag,index) in tags"
          :key="index"
          :style="{flex: tags.length > 4?0:1}"
          @on-item-click="switchTab"
          :selected="tag === currentTag">
          <span :class="{'ellipsis': tags.length > 4}">{{tag}}</span>
        </tab-item>
      </tab>
    </div>
    <div class="game-group">
      <div
        class="game-item"
        v-for="game in currentGames"
        :key="game.id"
        @click="chooseGame(game)">
        <div class="game-label">
          <span v-if="game.label" class="game-label-text">{{game.label}}</span>
        </div>
        <img class="game-icon" v-lazy="game.icon" />
        <div>{{ game.display_name }}</div>
      </div>
      <div v-if="currentTag==='热门游戏'" class="game-item" @click="isGameMenuVisible = true">
        <div class="game-label"></div>
        <img class="game-icon" v-lazy="require('../assets/all_games.png')" />
        <div>所有游戏</div>
      </div>
    </div>
    <div v-if="actions&&actions.length" :class="['btn-panel',{single: actions.length===1}]">
      <template v-for="(action, index) in actions">
        <a
          v-if="action.type==='link'"
          target="_blank"
          :href="action.url"
          class="btn"
          :key="index">
          <div :class="['icon', action.className]"></div>
          {{action.text}}
        </a>
        <a
          v-else
          class="btn"
          @click="action.click"
          :key="index">
          <div :class="['icon', action.className]"></div>
          {{action.text}}
        </a>
      </template>
    </div>
    <div v-if="promotions.length > 0" class="activity">
      <div class="activity-title">
        优惠活动
      </div>
      <div
        class="activity-item"
        v-for="(promotion, index) in promotions.slice(0,5)"
        :key="index"
        @click="handleClick(promotion)">
        <div class="activity-item-title">{{promotion.name}}</div>
        <div class="activity-item-img" v-lazy:background-image="promotion.image_mobile" :key="promotion.image_mobile"></div>
      </div>
      <div
        class="activity-more"
        v-if="promotions.length > 5"
        @click="$router.push({name: 'Promotions'})">更多活动</div>
    </div>
    <div class="pc-link" @click="openPClink">
        前往
        <a class="pc-link-btn" href="javascript:;">电脑版</a>
    </div>
    <x-dialog
      v-transfer-dom
      v-model="showDialog"
      :dialog-style="{
        width: '90vw',
        'max-width': '90vw',
      }">
      <div class="announcement-dialog">
        <div class="close-btn" @click="showDialog = false"></div>
        <div class="announcement-dialog-title">网站公告</div>
        <swiper
          height="300px"
          dots-position="center">
          <swiper-item
            :key="'swiper-anmt' + index"
            v-for="(a, index) in announcements">
            <p v-html="a" class="m-t swiper-announcement"></p>
          </swiper-item>
        </swiper>
      </div>
    </x-dialog>
    <tryplay-popup />
    <game-menu v-if="games&&games.length" v-model="isGameMenuVisible" />
    <activity-envelope-dialog :visible.sync="isEnvelopeVisible" @on-close="isEnvelopeVisible = false"/>
    <div v-if="systemConfig.envelopeActivityId" class="envelope-btn" @click="showEnvelope"></div>
  </div>
</template>

<script>
import {
  Swiper,
  SwiperItem,
  Card,
  Grid,
  GridItem,
  XDialog,
  Flexbox,
  FlexboxItem,
  InlineLoading,
  Masker,
  Alert,
  Group,
  Cell,
  XButton,
  Tab,
  TabItem,
  TransferDom
} from 'vux'
import { mapState } from 'vuex'
import TryplayPopup from '../components/TryplayPopup'
import Marquee from '../components/Marquee'
import freetrial from '../mixins/freetrial.js'
import GameMenu from '@/components/GameMenu.vue'
import TopBar from '@/components/TopBar'
import ActivityEnvelopeDialog from '@/components/ActivityEnvelopeDialog'
function to (scrollTop) {
  document.body.scrollTop = document.documentElement.scrollTop = scrollTop
}
function getScrollTop () {
  return document.body.scrollTop || document.documentElement.scrollTop
}
let scrollTop
export default {
  name: 'Home',
  data () {
    return {
      showDialog: false,
      game_count: 15,
      showpromoPopup: false,
      today: this.$moment(),
      currentTag: '',
      isGameMenuVisible: false,
      isEnvelopeVisible: false
    }
  },
  directives: {
    TransferDom
  },
  components: {
    TopBar,
    Swiper,
    SwiperItem,
    XDialog,
    Flexbox,
    FlexboxItem,
    Masker,
    Alert,
    Card,
    Grid,
    GridItem,
    InlineLoading,
    TryplayPopup,
    Group,
    Cell,
    XButton,
    Marquee,
    Tab,
    TabItem,
    GameMenu,
    ActivityEnvelopeDialog
  },
  mixins: [freetrial],
  computed: {
    ...mapState([
      'user', 'systemConfig', 'tagTable', 'promotions', 'theme', 'banners', 'announce', 'games'
    ]),
    announcements () {
      return this.announce.homepage
    },
    tags () {
      if (this.tagTable) {
        return Object.keys(this.tagTable)
      } else {
        return []
      }
    },
    currentGames () {
      if (!this.tagTable || !this.currentTag) {
        return []
      }
      return this.tagTable[this.currentTag]
    },
    actions () {
      if (this.systemConfig.process !== 'fulfilled') {
        return []
      }
      const actions = []
      const config = this.systemConfig
      if (config.customerServiceUrl) {
        actions.push({
          type: 'link',
          className: 'service',
          url: config.customerServiceUrl,
          text: '联系客服'
        })
      }
      if (config.appDownloadUrl) {
        actions.push({
          type: 'link',
          className: 'download',
          url: config.appDownloadUrl,
          text: 'App 下载'
        })
      } else if (this.user.logined === false) {
        actions.push({
          type: 'button',
          className: 'trail',
          click: this.tryDemo,
          text: '立即试玩'
        })
      }
      return actions
    }
  },
  watch: {
    'tags': {
      immediate: true,
      handler (tags) {
        if (tags && tags.length > 0) {
          this.switchTab(0)
        }
      }
    },
    'isEnvelopeVisible': function (isEnvelopeVisible) {
      if (isEnvelopeVisible) {
        // 在弹出层显示之前，记录当前的滚动位置
        scrollTop = getScrollTop()

        // 使body脱离文档流
        document.body.classList.add('dialog-open')

        // 把脱离文档流的body拉上去，否则页面会回到顶部
        document.body.style.top = -scrollTop + 'px'
      } else {
        // body又回到了文档流中
        document.body.classList.remove('dialog-open')

        to(scrollTop)
      }
    },
    'showDialog': function (showDialog) {
      if (showDialog) {
        // 在弹出层显示之前，记录当前的滚动位置
        scrollTop = getScrollTop()

        // 使body脱离文档流
        document.body.classList.add('dialog-open')

        // 把脱离文档流的body拉上去，否则页面会回到顶部
        document.body.style.top = -scrollTop + 'px'
      } else {
        // body又回到了文档流中
        document.body.classList.remove('dialog-open')

        to(scrollTop)
      }
    }
  },
  created () {
    const unwatch = this.$watch('announcements', function (announcements) {
      if (announcements.length > 0) {
        this.showDialog = true
      }
      unwatch()
    })
  },
  methods: {
    openPClink () {
      this.$cookie.set('desktop', 1)
      window.location.reload()
    },
    handleClick (promotion) {
      this.$router.push(`/promotions/${promotion.id}`)
    },
    chooseGame (game) {
      if (!game.id) {
        return
      }
      this.sendGaEvent({
        label: game.display_name,
        category: '首页游戏选择',
        action: '点击'
      })
      this.$store.dispatch('saveLastGame', game.id)
      this.$router.push(`/game/${game.id}`)
    },
    switchTab (i) {
      this.currentTag = this.tags[i]
    },
    showEnvelope () {
      if (this.user.logined === true) {
        this.isEnvelopeVisible = true
        this.sendGaEvent({
          label: '首页',
          category: '紅包',
          action: '查看红包活动'
        })
      } else {
        this.$vux.toast.show({
          text: '需先登入',
          type: 'warn'
        })
      }
    }
  }
}
</script>

<style scoped lang="less">
.icon-placeholder {
  opacity: 0;
}
.container /deep/ .vux-swiper {
  min-height: 55w;
}
.swiper-image {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}
.swiper-desc-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 40px;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.2));
}

.announcement {
  display: flex;
  height: 32px;
  width: 100%;
  overflow: hidden;
  background: #fff;
  .speaker {
    flex: 0 0 auto;
    display: flex;
    height: 32px;
    width: 32px;
    justify-content: center;
    align-items: center;
    color: #666;
    .fa-icon {
      margin: 7px 0;
    }
  }
  .marquee {
    flex: 1 1 auto;
    height: 32px;
    color: #666;
    font-size: 14px;
  }
  +.tab-selector{
    margin-top: 20px;
  }
}

.announcement-dialog {
  .announcement-dialog-title {
    height: 46px;
    line-height: 46px;
    font-size: 18px;
  }
  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    &::before,&::after{
      background-color: #999;
    }
  }
}
.swiper-announcement {
  padding: 10px;
  display: inline-block;
  height: 180px;
  overflow-y: scroll;
  overflow-x: hidden;
  word-break: break-all;
  width: calc(100%-10px);
  overflow-x: hidden;
  line-height: 1.5;
  /deep/ strong {
    font-weight: 800;
  }
}
.weui-grids {
  &:after{
    border: none;
  }
  background: #fff;
  .weui-grid {
    padding: 10px;
  }
  /deep/ .weui-grid {
    height: 28vw;
  }
  /deep/ .weui-grid__icon {
    width: 60%;
    height: auto;
    text-align: center;
  }

  /deep/ .weui-grid__label {
    color: #666;
    line-height: 1;
    font-size: 15px;
  }
}
.register-money {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 52px;
  width: 100%;
  margin: 12px 0;
  background: #fff;
  .icon {
    width: 40px;
    height: 40px;
    background: url('../assets/present.png') no-repeat;
    background-size: contain;
    margin-right: 4px;
  }
  .text {
    color: #333;
    font-size: 16px;
    margin-right: 14px;
  }
  .weui-btn {
    padding: 0px 12px;
    margin: 0;
  }
}
.game-title {
  display: flex;
  justify-content: space-between;
}
.title {
  display: inline-block;
  font-weight: normal;
  font-size: 16px;
  color: #666;
  line-height: 36px;
  padding: 0 0 0 10px;
}
.activity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  background: #fff;
  .activity-title {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    font-size: 16px;
    color: #666;
    &::after {
      content: " ";
      position: absolute;
      right: 0;
      left: 0;
      height: 1px;
      width: 100%;
      bottom: 0;
      border-bottom: 1px solid @grayscale3;
      color: @grayscale3;
      transform-origin: 100% 0;
      transform: scaleY(0.5);
    }
  }
  .activity-more {
    position: relative;
    box-sizing: border-box;
    width: 50%;
    height: 40px;
    line-height: 40px;
    padding-right: 24px;
    font-size: 14px;
    text-align: right;
    color: #333;
    &::after {
      content: '';
      display: inline-block;
      height: 6px;
      width: 6px;
      border-width: 2px 2px 0 0;
      border-color: #999;
      border-style: solid;
      transform: matrix(0.71, 0.71, -0.71, 0.71, 0, -1);
    }
  }
  .activity-item {
    box-sizing: border-box;
    width: 100%;
    padding: 0 20px 16px 20px;
    .activity-item-title {
      height: 36px;
      line-height: 36px;
      width: 100%;
      font-size: 16px;
      color: #333;
      text-align: center;
    }
    .activity-item-img {
      width: calc(~"100vw" - 40px);
      height: calc(~"25vw" - 10px);
      text-align: center;
      background-size: contain;
      background-position: center center;
      background-repeat: no-repeat;
    }
  }
}

.game-loading {
  text-align: center;
  background: #fff;
  padding: 100px 0;
}

.tab-selector {
  width: 100%;
  overflow: scroll;
  .ellipsis {
    white-space: nowrap;
    display: block;
    width: 100/3.5vw;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .vux-tab {
    overflow-x: auto;
  }
}

.game-group {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  background: @white;
  margin-bottom: 20px;
  .game-item {
    position: relative;
    box-sizing: border-box;
    width: calc(~"100%" / 3);
    padding-bottom: 10px;
    color: @grayscale6;
    text-align: center;
    font-size: 16px;
  }
  .game-label {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: 100%;
    height: 30px;
  }
  .game-label-text {
    display: inline-block;
    height: 20px;
    line-height: 20px;
    padding: 2px 5px;
    border-radius: 10px;
    background-color: lighten(@azul, 30%);
    color: darken(@azul, 30%);
    font-size: 13px;
  }
  .game-icon {
    box-sizing: border-box;
    display: block;
    width: 100%;
    min-height: 10vh;
    padding: 5px 20% 8px 20%;
  }
}

.btn-panel {
  display: flex;
  width: 100%;
  height: 48px;
  margin-bottom: 20px;
  .btn {
    box-sizing: border-box;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50%;
    height: 100%;
    background: @white;
    font-size: 16px;
    color: @grayscale6;
    &::before {
      content: " ";
      position: absolute;
      right: 0;
      top: 0;
      width: 1px;
      bottom: 0;
      border-right: 1px solid @grayscale3;
      color: @grayscale3;
      transform-origin: 100% 0;
      transform: scaleX(0.5);
    }
    .service {
      background-image: url('../assets/service.png')
    }
    .trail {
      background-image: url('../assets/trail.svg')
    }
    .download {
      background-image: url('../assets/download_app.svg')
    }
    .icon {
      width: 24px;
      height: 24px;
      background-repeat: no-repeat;
      background-size: contain;
      margin-right: 8px;
    }
  }
  &.single {
    .btn {
      width: 100%;
    }
  }
}

.pc-link {
  height: 62px;
  line-height: 62px;
  width: 100px;
  margin: 0 auto;
  text-align: center;
}

.pc-link-btn {
  color: @azul;
}
.envelope-btn {
  position: fixed;
  right: 20px;
  top: 70vh;
  width: 40px;
  height: 70px;
  transform-origin: center center;
  transform: rotate(15deg);
  background: url('../assets/envelope_btn.svg') no-repeat;
  background-size: contain;
}
</style>
