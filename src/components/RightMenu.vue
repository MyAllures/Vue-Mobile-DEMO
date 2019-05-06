<template>
  <popup :value="value"
    v-fix-scroll
    position="right"
    @on-hide="closeRightMenu"
    class="popup"
    :popup-style="{zIndex: 504}"
    v-transfer-dom
    width="220px">
    <div class="userinfo">
      <div class="username field-layout" @click="toMy">
        <div class="text">{{user.account_type === 0 ? '游客' : user.username}}</div>
        <div class="arrow-right"></div>
      </div>
      <div class="balance field-layout">
        <div class="field-content">
          <div class="title">{{$t('my.balance')}}</div>
          <div class="content">{{user.balance | currency('￥')}}</div>
        </div>
      </div>
      <div :class="['field-layout', {unsettled: user.unsettled}]" @click="toUnsettle">
        <div class="field-content">
          <div class="title">{{$t('game.nopay')}}</div>
          <div class="content">{{user.unsettled || 0 | currency('￥')}}</div>
        </div>
        <div v-if="user.unsettled" class="arrow-right"></div>
      </div>
    </div>
    <div class="action-area">
      <div class="item" @click="handleRouteChange('/fin/record/bet_record', $t('game.betrecord'))">{{$t('game.betrecord')}}</div>
      <div class="item" v-if="systemConfig.serviceAction" @click="handleServiceBtnClick">
        <span>{{$t('misc.need_help')}}<UnreadPoint :inRightMenu="true"></UnreadPoint></span>
      </div>
      <div class="item" @click="handleRouteChange('/fin/deposit', $t('game.deposit'))">{{$t('game.deposit')}}</div>
    </div>
    <div class="logout" @click="logoutDialogShow = true">{{$t('misc.logout')}}</div>
    <div v-transfer-dom>
      <confirm
        v-model="logoutDialogShow"
        :confirm-text="$t('misc.logout')"
        :cancel-text="$t('misc.cancel')"
        @on-confirm="logout">
        <p class="confirm-text">{{$t('misc.confirm_logout')}}</p>
      </confirm>
    </div>
  </popup>
</template>

<script>
  import { TransferDom, Popup, Confirm } from 'vux'
  import { mapGetters } from 'vuex'
  import FixScroll from '../directive/fixscroll'
  import UnreadPoint from '@/components/UnreadPoint.vue'

  export default {
    props: {
      value: {
        type: Boolean
      }
    },
    data () {
      return {
        logoutDialogShow: false,
        links: [
          {
            display_name: '路珠',
            type: 'roadbeads'
          },
          {
            display_name: '长龙排行榜',
            type: 'leaderboard'
          },
          {
            display_name: '历史开奖',
            type: 'history',
            route: '/results'
          },
          {
            display_name: '游戏介绍',
            type: 'intro'
          }
        ]
      }
    },
    directives: {
      TransferDom,
      FixScroll
    },
    components: {
      Popup,
      Confirm,
      UnreadPoint
    },
    computed: {
      ...mapGetters([
        'user'
      ]),
      systemConfig () {
        return this.$store.state.systemConfig
      },
      currentGame () {
        return this.$store.getters.gameById(this.$route.params.gameId)
      },
      seoWebsite () {
        if (this.systemConfig.planSiteUrl && this.currentGame) {
          const code = this.currentGame.code
          const gamesHasPlan = ['bcr', 'cqssc', 'jsssc', 'ynssc', 'hjssc', 'jspk10', 'mlaft']
          if (gamesHasPlan.includes(code)) {
            return `${this.systemConfig.planSiteUrl}/game/${code}?utm_source=mobile_gamehall&utm_campaign=${location.host}`
          }
        }
        return ''
      }
    },
    methods: {
      handleServiceBtnClick () {
        this.sendGaEvent({label: '右側菜單', category: this.$t('misc.need_help'), action: '点击'})
        this.closeRightMenu()
        this.systemConfig.serviceAction()
      },
      toMy () {
        if (this.$route.path !== '/my') {
          this.closeRightMenu()
          this.$router.push({path: '/my'})
          this.sendGaEvent({
            label: '右側菜單',
            category: '我的',
            action: '点击'
          })
        }
      },
      toUnsettle () {
        if (!!this.user.unsettled && this.$route.path !== '/unsettle') {
          this.sendGaEvent({
            label: '右側菜單',
            category: '未结明细',
            action: '点击'
          })
          this.closeRightMenu()
          this.$router.push({path: '/unsettle'})
        }
      },
      handleRouteChange (link, name) {
        if (link[0] !== '/') {
          this.sendGaEvent({
            label: '右側菜單',
            category: name,
            action: '点击'
          })
          window.open(link)
        } else if (this.$route.path !== link) {
          this.sendGaEvent({
            label: '右側菜單',
            category: name,
            action: '点击'
          })
          this.$router.push(link)
          this.closeRightMenu()
        }
      },
      logout () {
        this.closeRightMenu()
        this.$store.dispatch('logout').then(() => {
          this.sendGaEvent({
            label: '右側菜單',
            category: '登出',
            action: '点击'
          })
          this.$router.push('/')
        }).catch(() => {})
      },
      closeRightMenu () {
        this.$emit('closeRightMenu')
      }
    }
  }
</script>

<style lang="less" scoped>
.popup {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  .userinfo {
    border-bottom: 1px solid #eee;
    .field-layout {
      display: flex;
      justify-content: space-between;
      height: 40px;
      line-height: 40px;
      padding: 0 20px;
      .arrow-right {
        position: relative;
        display: inline-block;
        width: 16px;
      }
      .field-content {
        display: flex;
        font-size: 16px;
        .title {
          width: 70px;
          color: #333;
        }
        .content {
          color: #999;
        }
      }
    }
    .username {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 46px;
      color: #fff;
      background-color: @azul;
      .text {
        color: #fff;
      }
      .arrow-right {
        height: 40px;
        &::after{
          border-color: #fff;
        }
      }
    }
    .balance {
      .field-content {
        .content {
          color: @red;
        }
      }
    }
    .unsettled {
      .field-content {
        .content {
          color: @azul;
        }
      }
      .arrow-right {
        &::after{
          border-color: @azul;
        }
      }
    }
  }
  .action-area {
    flex: 1 1 auto;
    background: #f5f5f5;
    .item {
      height: 44px;
      line-height: 44px;
      border-bottom: 1px solid #eee;
      background: #fff;
      text-align: center;
      color: #333;
    }
  }
  .logout {
    height: 53px;
    line-height: 53px;
    background: #666666;
    text-align: center;
    font-size: 18px;
    color: #fff;
  }
}
</style>
