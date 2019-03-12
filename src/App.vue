<template>
  <ViewArea>
    <top-bar v-if="$route.name!=='GameDetail' && $route.name!=='Home' && $route.name !== 'DetailBetRecord'">
      <template slot="left" v-if="pageSetting.leftCtrl">
        <div
          v-if="pageSetting.leftCtrl === 'back'"
          class="left-ctrl back"
          @click="backOption.cb">
          <span class="left-arrow"></span>
          {{backOption.text}}
        </div>
      </template>
      <div class="main-title">{{ pageSetting.title }}</div>
      <template slot="right">
        <div v-if="pageSetting.rightCtrl === 'info'" class="right-ctrl">
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
        <div v-else-if="pageSetting.rightCtrl === 'custom'"
          class="right-ctrl custom-ctrl"
          @click="() => $refs.page[pageSetting.rightCtrlFunc]()">
          {{ pageSetting.rightCtrlText }}
        </div>
      </template>
    </top-bar>
    <keep-alive :include="$store.state.keepAlivePage">
      <router-view ref="page"></router-view>
    </keep-alive>

    <tabbar v-show="!tabbarHidden" class="tabbar">
      <tabbar-item
        :badge="menu.unreadBadge && unread ? ('' + unread) : ''"
        :selected="selectedTab === menu.name"
        v-for="(menu, index) in firseLevelPages"
        :link="menu.link"
        :key="'tabbar' + index"
        @click.native="handleRouteChange(menu)">
        <img :src="menu.iconImg" slot="icon" :alt="menu.name">
        <div v-if="menu.iconImgActive"
          slot="icon-active"
          v-html="menu.iconImgActive(theme)">
        </div>
        <span slot="label">{{menu.label}}</span>
      </tabbar-item>
    </tabbar>

    <loading v-model="isLoading"></loading>
    <right-menu
      :value="$store.state.isRightMenuVisible"
      @closeRightMenu="$store.dispatch('hideRightMenu')"/>
    <tryplay-popup />
    <div v-transfer-dom>
      <div class="feature-guide" v-if="showFeatureGuide" @click="showFeatureGuide=false">
        <div class="content">
          <div class="arrow">
            <div class="curve"></div>
            <div class="point"></div>
          </div>
          <div class="txt">在这里添加银行卡，即可领注册彩金</div>
        </div>
      </div>
    </div>
    <bet-dialog />
    <balance-hint-dialog />
    <bet-track-dialog/>
    <div v-if="isInfirstLevelPage">
      <transition name="fade">
        <div v-show="notificationVisible">
          <Notification :notification="notifications[0]" @getCurrentNotificationDetail="getCurrentNotificationDetail"/>
        </div>
      </transition>
      <transition name="fade">
        <div v-if="currentNotificationDetail">
          <DetailNotification :notification="currentNotificationDetail" @closeDetailNotification="closeDetailNotification"/>
        </div>
      </transition>
    </div>
  </ViewArea>
</template>

<script>
import Vue from 'vue'
import { Tabbar, TabbarItem, Loading, TransferDom } from 'vux'
import { mapState, mapGetters } from 'vuex'
import { getToken } from './api'
import axios from 'axios'
import ViewArea from './components/ViewArea'
import RightMenu from './components/RightMenu'
import TryplayPopup from './components/TryplayPopup'
import freetrial from './mixins/freetrial.js'
import BetDialog from './components/BetDialog'
import BalanceHintDialog from './components/BalanceHintDialog'
import BetTrackDialog from './components/BetTrackDialog'
import Notification from './components/Notification'
import TopBar from '@/components/TopBar'
import DetailNotification from './components/DetailNotification'
import GhostSocketObj from './wsObj/eider.js'
import { Indicator } from './utils'
import vClickOutside from 'v-click-outside'

export default {
  name: 'app',
  components: {
    Tabbar,
    TabbarItem,
    Loading,
    RightMenu,
    TryplayPopup,
    BetDialog,
    BalanceHintDialog,
    BetTrackDialog,
    Notification,
    DetailNotification,
    TopBar,
    ViewArea
  },
  directives: {
    TransferDom,
    clickOutside: vClickOutside.directive
  },
  data () {
    const firseLevelPages = [{
      label: this.$t('home.name'),
      iconImg: require('./assets/footer/home_normal.svg'),
      iconImgActive: theme => `
      <svg width="27px" height="27px" viewBox="0 0 27 27" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>icon_footer_home_pressed</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g id="icon_footer_home_pressed" stroke="${theme}" stroke-width="1" fill="${theme}" fill-rule="evenodd">
            <path d="M3.44205,9.57770819 C3.16695,9.76305046 3,10.0837925 3,10.4289508 L3,22.9922708 C3,23.5494074 3.4284,24 3.95445,24 L9.35401775,24 C9.88111775,24 10.3482069,23.5494074 10.3482069,22.9922708 C10.3482069,18.4748267 10.3482069,16.2161047 10.3482069,16.2161047 C10.3482069,16.2161047 11.061103,15.2072657 11.588203,15.2072657 L15.407053,15.2072657 C15.934153,15.2072657 16.6638433,15.6589681 16.6638433,16.2161047 L16.6121825,22.9922708 C16.6121825,23.5494074 17.1741813,24 17.7012813,24 L23.04555,24 C23.57265,24 24,23.5494074 24,22.9922708 L24,10.4289508 C24,10.0837925 23.8341,9.76305046 23.55795,9.57770819 L14.01345,3.15731896 C13.70055,2.94756035 13.3005,2.94756035 12.9876,3.15731896 L3.44205,9.57770819 Z" id="Fill-1" fill="${theme}"></path>
        </g>
      </svg>
      `,
      link: '/',
      route: 'Home',
      name: 'home'
    }, {
      label: this.$t('game.name'),
      iconImg: require('./assets/footer/game_normal.svg'),
      iconImgActive: theme => `
      <svg width="27px" height="27px" viewBox="0 0 27 27" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <title>icon_footer_game_pressed</title>
          <desc>Created with Sketch.</desc>
          <defs></defs>
          <g id="icon_footer_game_pressed" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="Group" transform="translate(3.000000, 3.000000)" fill="${theme}">
                  <path d="M10.5,0 C16.2988636,0 21,4.70113636 21,10.5 C21,16.2988636 16.2988636,21 10.5,21 C4.70113636,21 0,16.2988636 0,10.5 C0,4.70113636 4.70113636,0 10.5,0 Z M5.75203473,6.06562914 C5.2359341,6.92267276 5.1182085,7.88536451 5.39675568,8.95370441 C5.73416566,10.2451991 6.51199552,11.0278578 7.73024526,11.3038366 C6.54142692,12.1964556 6.1577676,13.4480627 6.57821617,15.0575798 C6.86517232,16.1550268 7.48323173,16.9409197 8.43449662,17.4163363 C9.38576152,17.891753 10.4158605,17.9758403 11.5268959,17.6707543 C12.635829,17.3656683 13.4914418,16.7673549 14.0926833,15.8725798 C14.6928736,14.9778047 14.8484396,13.9752254 14.5583301,12.8648418 C14.1305237,11.2262175 13.8057233,10.6358333 12.348869,10.5 C13.2368677,9.22855642 13.1870241,7.93476026 12.8464608,6.62925106 C12.5668625,5.56091116 11.7749605,5.12557628 10.9098876,4.64800355 C10.0458658,4.17150886 9.09880537,4.07556309 8.06975749,4.35801017 C7.0407096,4.64045725 6.26813535,5.20966357 5.75203473,6.06562914 Z" id="Combined-Shape"></path>
                  <path d="M7.47638259,8.96933182 C7.64583525,9.54144879 7.97519392,9.96295163 8.46684527,10.2316732 C8.9573033,10.5014784 9.48356118,10.5675752 10.0444256,10.4310473 C10.6064833,10.2945194 11.0241483,10.0095445 11.3010005,9.57612254 C11.5766594,9.1427006 11.6231992,8.6193436 11.4418133,8.004968 C11.2604274,7.39059239 10.9310687,6.92899803 10.4525439,6.61910134 C9.97401921,6.30812109 9.44179468,6.22468737 8.85825703,6.36771661 C8.27352605,6.50857874 7.8487011,6.81089055 7.5813955,7.27248492 C7.31289659,7.73407928 7.27829006,8.29969492 7.47638259,8.96933182" id="Path"></path>
                  <path d="M8.48176223,14.055662 C8.67649784,14.7170601 9.02171097,15.188193 9.51740161,15.471074 C10.0130923,15.7529484 10.5596797,15.8214036 11.1582704,15.675433 C11.7568611,15.5294623 12.1717808,15.2163804 12.4041358,14.7351806 C12.6375972,14.2549874 12.6619392,13.703319 12.4793745,13.0811819 C12.3189389,12.5365604 11.9980678,12.1218023 11.516761,11.8359012 C11.0354542,11.55 10.5021442,11.4785247 9.91793736,11.6214753 C9.39126605,11.7493255 8.98077223,12.0543538 8.68756236,12.5355537 C8.39435249,13.0177602 8.32464599,13.5241274 8.48176223,14.055662" id="Path"></path>
              </g>
          </g>
      </svg>
      `,
      link: '/game',
      route: 'Game',
      name: 'game'
    }, {
      label: this.$t('deposit.process'),
      iconImg: require('./assets/footer/top_up_normal.svg'),
      iconImgActive: theme => `
      <svg width="27px" height="27px" viewBox="0 0 27 27" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>icon_footer_top up_pressed</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g id="icon_footer_top-up_pressed" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <path d="M22.95,7 L4.05,7 C3.4704,7 3,7.384 3,7.85714286 L3,10 L24,10 L24,7.85714286 C24,7.384 23.5296,7 22.95,7" id="Fill-1" fill="${theme}"></path>
            <path d="M5.80769231,14 L11.1923077,14 C11.6381538,14 12,14.448 12,15 C12,15.552 11.6381538,16 11.1923077,16 L5.80769231,16 C5.36184615,16 5,15.552 5,15 C5,14.448 5.36184615,14 5.80769231,14 Z M3,12.5294118 L3,19.9411765 C3,20.5256471 3.4704,21 4.05,21 L22.95,21 C23.5296,21 24,20.5256471 24,19.9411765 L24,12.5294118 L24,12 L3,12 L3,12.5294118 Z" id="Fill-3" fill="${theme}"></path>
        </g>
      </svg>
      `,
      link: '/my/deposit',
      route: 'Deposit',
      name: 'deposit'
    }, {
      label: this.$t('fin.name'),
      iconImg: require('./assets/footer/finance_normal.svg'),
      iconImgActive: theme => `
      <svg width="27px" height="27px" viewBox="0 0 27 27" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>icon_footer_finance_pressde</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g id="icon_footer_finance_pressde" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <path d="M20.2105263,10 L11.7894737,10 C11.3536842,10 11,9.552 11,9 C11,8.448 11.3536842,8 11.7894737,8 L20.2105263,8 C20.6463158,8 21,8.448 21,9 C21,9.552 20.6463158,10 20.2105263,10 M20.2105263,15 L11.7894737,15 C11.3536842,15 11,14.552 11,14 C11,13.448 11.3536842,13 11.7894737,13 L20.2105263,13 C20.6463158,13 21,13.448 21,14 C21,14.552 20.6463158,15 20.2105263,15 M20.2105263,20 L11.7894737,20 C11.3536842,20 11,19.552 11,19 C11,18.448 11.3536842,18 11.7894737,18 L20.2105263,18 C20.6463158,18 21,18.448 21,19 C21,19.552 20.6463158,20 20.2105263,20 M8.02173913,10 L6.97826087,10 C6.43826087,10 6,9.552 6,9 C6,8.448 6.43826087,8 6.97826087,8 L8.02173913,8 C8.56173913,8 9,8.448 9,9 C9,9.552 8.56173913,10 8.02173913,10 M8.02173913,15 L6.97826087,15 C6.43826087,15 6,14.552 6,14 C6,13.448 6.43826087,13 6.97826087,13 L8.02173913,13 C8.56173913,13 9,13.448 9,14 C9,14.552 8.56173913,15 8.02173913,15 M8.02173913,20 L6.97826087,20 C6.43826087,20 6,19.552 6,19 C6,18.448 6.43826087,18 6.97826087,18 L8.02173913,18 C8.56173913,18 9,18.448 9,19 C9,19.552 8.56173913,20 8.02173913,20 M5.33333333,4 C4.05,4 3,5 3,6.22222222 L3,21.7777778 C3,23 4.05,24 5.33333333,24 L21.6666667,24 C22.95,24 24,23 24,21.7777778 L24,6.22222222 C24,5 22.95,4 21.6666667,4 L5.33333333,4 Z" id="Fill-1" fill="${theme}"></path>
        </g>
      </svg>
      `,
      link: '/fin/bet_record',
      route: 'Fin',
      name: 'fin'
    }, {
      label: this.$t('my.name'),
      iconImg: require('./assets/footer/me_normal.svg'),
      iconImgActive: theme => `
      <svg width="27px" height="27px" viewBox="0 0 27 27" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>icon_footer_me_pressed</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g id="icon_footer_me_pressed" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <path d="M19.8054468,9.3 C19.8054468,5.8203 16.7342222,3 13.2361111,3 C9.73905556,3 7.18470118,5.8203 7.18470118,9.3 C7.18470118,11.71395 8.26972222,13.80975 10.2742222,14.86605 C6.6695,15.86565 4,19.16055 4,23.055 C4,23.57685 4.42538889,24 4.95,24 L22.05,24 C22.5746111,24 23,23.57685 23,23.055 C23,19.0314 20.1510556,15.64515 16.3637222,14.77365 C18.2763889,13.69005 19.8054468,11.64675 19.8054468,9.3 Z" id="Fill-1" fill="${theme}"></path>
        </g>
      </svg>
      `,
      link: '/my',
      route: 'My',
      name: 'my',
      unreadBadge: true
    }]
    return {
      isRightMenuVisible: false,
      showFeatureGuide: false,
      firseLevelPages,
      logo: '',
      userLoading: true,
      error: '',
      showCalender: false,
      headerZindex: 200,
      refreshTokenInterval: null,
      currentNotificationDetail: null,
      refreshTokenTimer: null,
      noBackRoute: !window.history.state,
      indicator: null,
      tabbarHidden: true,
      isHelperVisible: false
    }
  },
  mixins: [freetrial],
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'theme', 'isLoading', 'ws', 'roomInfo', 'roomId', 'systemConfig', 'notificationVisible', 'notifications'
    ]),
    ...mapState('page', {
      pageSetting: state => state.meta
    }),
    isInfirstLevelPage () {
      return !!(this.firseLevelPages.find((page) => this.$route.path.indexOf(page.link)))
    },
    unread () {
      return this.user.unread
    },
    selectedTab () {
      const path = this.$route.path
      if (path === '/') {
        return 'home'
      }
      if (this.$route.matched[0].path === '/my/deposit') {
        return 'deposit'
      }
      return path.split('/')[1]
    },
    backOption () {
      if (this.pageSetting.backPage) {
        return {
          text: '返回',
          cb: () => { this.$router.push(this.pageSetting.backPage) }
        }
      } else if (this.noBackRoute) {
        return {
          text: '首页',
          cb: () => { this.$router.push({path: '/'}) }
        }
      } else {
        return {
          text: '返回',
          cb: () => { this.$router.go(-1) }
        }
      }
    }
  },
  watch: {
    'user.logined' (newStatus, old) {
      let token = this.$cookie.get('access_token')
      if (!newStatus) {
        if (this.ws.eider) {
          this.ws.eider.closeConnect()
        }
      } else {
        this.$store.dispatch('setWs', { ws: new GhostSocketObj(token), type: 'eider' })
      }
    },
    '$route' (to, from) {
      this.tabbarHidden = to.meta.tabbarHidden
      this.noBackRoute = !window.history.state

      if (window.self === window.top) { // 非內嵌iframe時才設成auto
        if (to.name === 'Home') {
          document.documentElement.style.height = 'auto'
          document.body.style.height = 'auto'
        } else {
          document.documentElement.style.height = '100%'
          document.body.style.height = '100%'
        }
      }
    }
  },
  methods: {
    closeDetailNotification () {
      this.currentNotificationDetail = null
    },
    getCurrentNotificationDetail (current) {
      this.currentNotificationDetail = current
    },
    handleRouteChange ({link, label}) {
      if (this.$route.path !== link) {
        this.sendGaEvent({
          label: '底部菜单',
          category: label,
          action: '点击'
        })
      }
    },
    replaceToken () {
      let refreshToken = this.$cookie.get('refresh_token')
      if (!refreshToken || !this.user.account_type) {
        return
      }
      getToken(refreshToken).then(res => {
        let expires = new Date(res.expires_in)
        localStorage.setItem('token_expire', res.expires_in)
        this.$cookie.set('access_token', res.access_token, {
          expires: expires
        })
        this.$cookie.set('refresh_token', res.refresh_token, {
          expires: expires
        })
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      }).catch(() => {})
      this.refreshTokenTimer = setTimeout(() => {
        this.replaceToken()
      }, 20 * 60 * 1000)
    }
  },
  created () {
    this.$root.bus = new Vue()
    this.$root.bus.$on('showFeatureGuide', () => {
      this.showFeatureGuide = true
    })

    this.indicator = new Indicator(() => {
      const expireTime = localStorage.getItem('token_expire')
      if (!expireTime) {
        return
      }
      const expireFromNow = this.$moment(expireTime).diff(this.$moment(), 'ms')
      clearTimeout(this.refreshTokenTimer)
      if (expireFromNow < 300000) { // 五分鐘內過期則直接刷新
        this.replaceToken()
      } else {
        this.refreshTokenTimer = setTimeout(() => {
          this.replaceToken()
        }, expireFromNow - 300000)
      }
    }, () => {

    })
  },
  beforeDestroy () {
    window.clearTimeout(this.refreshTokenTimer)
  }
}
</script>
<style lang="less">
@import '~vux/src/styles/reset.less';
@import './styles/base.less';
@import './styles/theme_config.less';
</style>
<style lang="less" scoped>

.feature-guide {
  position: fixed;
  background: radial-gradient(
    circle at bottom right,
    rgba(0, 0, 0, 0) 11%,
    rgba(0, 0, 0, 0.7) 11%
  );
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1001;
  .txt {
    text-align: center;
    font-size: 18px;
    color: #fff;
  }
  .content {
    width: 100%;
    height: 350px;
    bottom: 0;
    position: absolute;
  }
  .arrow {
    transform: rotate(-30deg);
    position: absolute;
    bottom: 0;
    right: 25%;
    margin: 0 auto;
    width: 100px;
  }

  .arrow .curve {
    border: 6px solid #fff;
    border-radius: 10px;
    border-color: transparent transparent transparent #fff;
    height: 360px;
    width: 220px;
    border-radius: 230px 0 0 150px;
  }

  .arrow .point {
    position: absolute;
    left: 40px;
    top: 315px;
  }

  .arrow .point:before, .arrow .point:after {
    border: 3px solid #fff;
    border-radius: 10px;
    height: 20px;
    content: "";
    position: absolute;
  }

  .arrow .point:before {
    top: -4px;
    left: -11px;
    transform:rotate(-74deg);
  }

  .arrow .point:after {
    top: -11px;
    left: 3px;
    transform:rotate(12deg);
  }
}

.tabbar {
  position: fixed;
  z-index: 98;
  background-color: #fff;
}
.logo {
  position: absolute;
  top: -8px;
}

.custom-ctrl {
  height: 100%;
  box-sizing: border-box;
  padding-right: 10px;
  color: #fff;
}
</style>
