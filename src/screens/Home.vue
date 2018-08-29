<template>
  <div class="container">
    <swiper
      class="banner-slider"
      :aspect-ratio=".5"
      dots-position="center"
      dots-class="banner"
      auto
      loop>
      <swiper-item v-for="(banner,index) in banners" :key="index">
        <div class="swiper-image" :style="{'background-image': `url('${banner.img}')`}"></div>
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
      <tab :style="{width: tags.length > 3 ? `${tags.length * 100 / 3.5}vw` : ''}"
          bar-active-color="#156fd8"
          :animate="false"
          active-color="#156fd8"
          :line-width="2">
        <tab-item
          v-for="(tag,index) in tags"
          :key="index"
          :style="{flex: tags.length > 3?0:1}"
          @on-item-click="switchTab"
          :selected="tag === currentTag">
          <span :class="{'ellipsis': tags.length > 3}">{{tag}}</span>
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
      <div v-if="currentTag==='热门游戏'" class="game-item" @click="$root.bus.$emit('showGameMenu')">
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
      v-model="showDialog"
      :hide-on-blur="true">
      <swiper
        height="250px"
        dots-position="center">
        <swiper-item
          :key="'swiper-anmt' + index"
          v-for="(a, index) in announcements">
          <p class="m-t swiper-announcement">{{a}}</p>
        </swiper-item>
      </swiper>
    </x-dialog>
    <tryplay-popup />
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
  TabItem
} from 'vux'
import { mapState } from 'vuex'
import { fetchBanner, fetchAnnouncements } from '../api'
import TryplayPopup from '../components/TryplayPopup'
import Marquee from '../components/Marquee'
import freetrial from '../mixins/freetrial.js'
export default {
  name: 'Home',
  data () {
    return {
      banners: [],
      announcements: [],
      showDialog: false,
      game_count: 15,
      showpromoPopup: false,
      today: this.$moment(),
      currentTag: ''
    }
  },
  components: {
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
    TabItem
  },
  mixins: [freetrial],
  computed: {
    ...mapState([
      'user', 'systemConfig', 'tagTable', 'promotions'
    ]),
    allGames () {
      const games = this.$store.state.games
      if (games.length === 0) {
        return Array.from(Array(this.game_count), x => {
          return {
            icon: '',
            display_name: ''
          }
        })
      }
      return games
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
    }
  },
  created () {
    fetchBanner()
      .then(res => {
        const banners = res.map((banner, index) => {
          return {
            url: 'javascript:',
            img: index === 0 ? banner.image : ''
          }
        })
        this.banners = banners
        setTimeout(() => {
          res.forEach((banner, index) => {
            this.banners[index].img = banner.image
          })
        }, 1000)
      }).catch(() => {})
    fetchAnnouncements().then(
      result => {
        const datas = []
        result.forEach((item) => {
          if (item.platform !== 1) {
            datas.push(item)
          }
        })

        if (datas.length > 0) {
          datas.sort((a, b) => {
            return a.rank - b.rank
          })
        }
        this.announcements = datas.map(data => data.announcement)
      }
    )
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
      localStorage.setItem('lastGame', game.id)
      this.$router.push(`/game/${game.id}`)
    },
    switchTab (i) {
      this.currentTag = this.tags[i]
    }
  }
}
</script>

<style scoped lang="less">
@import '../styles/vars.less';
.icon-placeholder {
  opacity: 0;
}
.container /deep/ .vux-swiper {
  min-height: 45w;
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

.swiper-announcement {
  padding: 10px;
  display: inline-block;
  height: 180px;
  overflow-y: scroll;
  overflow-x: hidden;
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
.more {
  float: right;
  line-height: 36px;
  padding: 0 10px 0 0;
  text-align: right;
  margin-right: 10px;
  position: relative;
  color: #666;
  &:visited, &:active {
    color: #666;
  }
  .arrow-right:after {
    margin-left: 5px;
    border-color: #666;
  }
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
      border-bottom: 1px solid #D9D9D9;
      color: #D9D9D9;
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
  background: #fff;
  margin-bottom: 20px;
  .game-item {
    position: relative;
    box-sizing: border-box;
    width: calc(~"100%" / 3);
    padding-bottom: 10px;
    color: #333;
    text-align: center;
    font-size: 16px;
    .game-label {
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      width: 100%;
      height: 30px;
      .game-label-text {
        display: inline-block;
        height: 20px;
        line-height: 20px;
        padding: 2px 5px;
        border-radius: 10px;
        background-color: #d0e2f7;
        color: #113f7c;
        font-size: 13px;
      }
    }
    .game-icon {
      box-sizing: border-box;
      display: block;
      width: 100%;
      min-height: 10vh;
      padding: 5px 20% 8px 20%;
    }
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
    background: #fff;
    font-size: 16px;
    color: #333;
    &::before {
      content: " ";
      position: absolute;
      right: 0;
      top: 0;
      width: 1px;
      bottom: 0;
      border-right: 1px solid #D9D9D9;
      color: #D9D9D9;
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
  .pc-link-btn {
    color: #166fd8;
  }
}
</style>
