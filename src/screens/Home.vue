<template>
  <div class="container">
    <top-bar>
      <template v-if="!isGameMenuVisible">
        <div
          v-if="!systemConfig.mobileLogo"
          class="main-title left">{{ systemConfig.siteName }}</div>
        <div
          v-else
          class="main-title left logo"
          :style="{'background-image': `url('${systemConfig.mobileLogo}')`}"></div>
      </template>
      <div v-else class="main-title" @click="isGameMenuVisible = !isGameMenuVisible">
        游戏选单
      </div>
      <template slot="right" v-if="!isGameMenuVisible">
        <div class="right-ctrl">
          <template v-if="!user.logined">
            <a class="link" @click="trial">试玩</a>
            <div class="divide"></div>
            <router-link class="link" to="/register">注册</router-link>
            <router-link tag="div" class="link" to="/login"><div class="login">登录</div></router-link>
          </template>
          <template v-else>
            <div class="balance fr"
              @click="$store.dispatch('showRightMenu')">
              <span>{{ user.balance|currency('￥')}}</span>
            </div>
            <UnreadPoint></UnreadPoint>
          </template>
        </div>
      </template>
    </top-bar>

    <swiper
      class="banner-slider"
      :aspect-ratio=".4"
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

    <flexbox class="activity-area" :gutter="4" v-if="showActivityArea">
      <flexbox-item class="activity-register" v-if="!user.account_type && systemConfig.regPresentAmount > 0">
        <router-link to="/register">
          <flexbox class="activity" :gutter="2">
            <flexbox-item class="activity-icon">
              <img src="../assets/red-envelope-v2/act-index-1.svg" />
            </flexbox-item>
            <flexbox-item class="activity-info">
              <div class="activity-title">立即注册送彩金</div>
              <div class="activity-desc">注册立领 ¥{{ systemConfig.regPresentAmount }}</div>
            </flexbox-item>
          </flexbox>
        </router-link>
      </flexbox-item>
      <flexbox-item v-if="actBoost.enabled">
        <router-link to="/act/boost">
          <flexbox class="activity" :gutter="2">
            <flexbox-item class="activity-icon">
              <img src="../assets/red-envelope-v2/act-index-2.svg" />
            </flexbox-item>
            <flexbox-item class="activity-info">
              <div class="activity-title">返利红包大放送</div>
              <div class="activity-desc">天天拆紅包</div>
            </flexbox-item>
          </flexbox>
        </router-link>
      </flexbox-item>
      <flexbox-item v-if="actReferral.enabled">
        <router-link to="/act/referral">
          <flexbox class="activity" :gutter="2">
            <flexbox-item class="activity-icon">
              <img src="../assets/red-envelope-v2/act-index-3.svg" />
            </flexbox-item>
            <flexbox-item class="activity-info">
              <div class="activity-title">推荐好友领红包</div>
              <div class="activity-desc">好友多紅包多</div>
            </flexbox-item>
          </flexbox>
        </router-link>
      </flexbox-item>
    </flexbox>

    <div v-if="tags.length >= 0&&tags[0]!=='no-alias'" class="tab-selector">
      <tab
          :bar-active-color="theme"
          :animate="false"
          :active-color="theme"
          :line-width="2">
        <tab-item
          v-for="(tag,index) in tags"
          :key="index"
          @on-item-click="switchTab"
          :style="{flex: tags.length > 4 ? 0 : 1}"
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
        <img class="game-icon" v-lazy="game.icon" width="56" height="56"/>
        <div>{{ game.display_name }}</div>
        <div class="game-label" v-if="game.label" >
          <span class="game-label-text">{{game.label}}</span>
        </div>
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

    <win-history></win-history>

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
    <game-menu v-if="games&&games.length" v-model="isGameMenuVisible" />
    <app-prompt v-if="systemConfig.appDownloadUrl"></app-prompt>
    <activity-envelope-dialog :visible.sync="isEnvelopeVisible" @on-close="isEnvelopeVisible = false"/>
    <div
      v-if="systemConfig.envelopeActivityId"
      class="envelope-btn"
      @click="showEnvelope">
    </div>
  </div>
</template>

<script>
import {
  Swiper,
  SwiperItem,
  Card,
  GroupTitle,
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
import Marquee from '../components/Marquee'
import GameMenu from '@/components/GameMenu'
import TopBar from '@/components/TopBar'
import UnreadPoint from '@/components/UnreadPoint'
import WinHistory from '@/components/WinHistory'
import AppPrompt from '@/components/AppPrompt'
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
    UnreadPoint,
    TopBar,
    Swiper,
    SwiperItem,
    XDialog,
    Flexbox,
    FlexboxItem,
    Masker,
    Alert,
    Card,
    GroupTitle,
    Grid,
    GridItem,
    InlineLoading,
    Group,
    Cell,
    XButton,
    Marquee,
    Tab,
    TabItem,
    GameMenu,
    ActivityEnvelopeDialog,
    WinHistory,
    AppPrompt
  },
  computed: {
    ...mapState([
      'user', 'systemConfig', 'tagTable', 'promotions', 'theme', 'banners', 'announce', 'games'
    ]),
    ...mapState('actv2', {
      actBoost: state => state.boost.detail,
      actReferral: state => state.referral.detail
    }),
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
      if (this.promotions.length > 0) {
        actions.push({
          type: 'button',
          className: 'promotion',
          click: this.openPromotions,
          text: '优惠活动'
        })
      }

      if (config.serviceAction) {
        actions.push({
          type: 'button',
          className: 'service',
          click: config.serviceAction,
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
          click: this.trial,
          text: '立即试玩'
        })
      }
      return actions
    },
    showActivityArea () {
      return (!this.user.account_type && this.systemConfig.regPresentAmount > 0) || this.actBoost.enabled || this.actReferral.enabled
    }
  },
  watch: {
    tags: {
      immediate: true,
      handler (tags) {
        if (tags && tags.length > 0) {
          this.switchTab(0)
        }
      }
    },
    isEnvelopeVisible (isEnvelopeVisible) {
      this.fixBody(isEnvelopeVisible)
    },
    showDialog (showDialog) {
      this.fixBody(showDialog)
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
    trial () {
      this.$store.dispatch('trial')
    },
    openPromotions () {
      this.$router.push({ name: 'Promotions' })
    },
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
      this.isEnvelopeVisible = true
      this.sendGaEvent({
        label: '首页',
        category: '紅包',
        action: '查看红包活动'
      })
    },
    fixBody (fix) {
      if (fix) {
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
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.2)
  );
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
  + .tab-selector {
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
    &::before,
    &::after {
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
  &:after {
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

.activity-area {
  background: #FFF;
  padding: 6px 5px;
  box-sizing: border-box;

  > .vux-flexbox-item {
    height: 60px;
    background: #f4f9ff;
    padding: 6px;
    overflow: hidden;
    box-sizing: border-box;

    > a {
      display: block;
      height: 100%;
    }
  }
  .activity-register {
    .activity-icon,
    ~ .vux-flexbox-item .activity-icon {
      flex: 0 0 28px;
      height: 28px;
    }
    .activity,
    ~ .vux-flexbox-item .activity {
      max-width: 130px;
    }
    ~ .vux-flexbox-item .activity-title {
      padding-right: 8px;
    }
  }
  .activity {
    height: 100%;
    max-width: 134px;
    margin: 0 auto;
  }
  .activity-icon {
    flex: 0 0 32px;
    height: 32px;

    img {
      max-width: 100%;
    }
  }
  .activity-info {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .activity-title {
    font-size: 13px;
    font-weight: bold;
    line-height: 1.2;
    padding-right: 7px;
    color: #314762;
  }
  .activity-desc {
    font-size: 12px;
    color: #86a0c3;
    margin-top: 3px;
    line-height: 1;
    white-space: nowrap;
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
    padding: 0 12px;
    white-space: nowrap;
    display: block;
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
    display: flex;
    align-items: center;
    flex-direction: column;
    position: relative;
    box-sizing: border-box;
    width: calc(~"100%" / 4);
    padding: 8px 0;
    color: @grayscale6;
    text-align: center;
    font-size: 14px;
  }
  .game-label {
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    width: 100%;
    margin-bottom: 2px;
  }
  .game-label-text {
    display: inline-block;
    padding: 0 5px;
    border-radius: 10px;
    font-size: 11px;
  }
  .game-icon {
    width: 56px;
    box-sizing: border-box;
    display: block;
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
      background-image: url("../assets/service.png");
    }
    .trail {
      background-image: url("../assets/trail.svg");
    }
    .download {
      background-image: url("../assets/download_app.svg");
    }
    .promotion {
      background-image: url("../assets/promotion.png");
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
  color: #999;
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
  top: 55vh;
  width: 40px;
  height: 60px;
  background: url("../assets/envelope_btn.svg") no-repeat;
  background-size: contain;
  animation-duration: 6s;
  animation-timing-function: ease;
  animation-delay: 0s;
  animation-iteration-count: infinite;
  animation-direction: normal;
  animation-name: shaking;
  transform-origin: top center;
  transform: rotate(15deg);
}
@keyframes shaking {
  //start shaking
  0% {
    transform: translateX(0%) rotate(20deg);
  }
  2% {
    transform: translateX(-5%) rotate(10deg);
  }
  4% {
    transform: translateX(0%) rotate(20deg);
  }
  6% {
    transform: translateX(-5%) rotate(10deg);
  }
  8% {
    transform: translateX(0%) rotate(20deg);
  }
  10% {
    transform: translateX(-5%) rotate(10deg);
  }

  // start staying
  99% {
    transform: translateX(-5%) rotate(10deg);
  }

  100% {
    transform: translateX(0%) rotate(15deg);
  }
}
</style>