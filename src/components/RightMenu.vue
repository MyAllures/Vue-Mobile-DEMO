<template>
  <popup :value="value"
    position="right"
    @on-hide="closeRightMenu"
    class="popup"
    :popup-style="{zIndex: 504}"
    v-transfer-dom
    width="180px">
    <group class="head">
      <cell title="账号" :border-intent="false" :link="'/my'">
        <div class="username">{{user.account_type === 0 ? '游客' : user.username}}</div>
      </cell>
      <cell :title="$t('my.balance')" :border-intent="false">
        <div class="balance">{{user.balance | currency('￥')}}</div>
      </cell>
      <cell
        :class="{'weui-cell_access': !!user.unsettled}"
        :title="$t('game.nopay')"
        :border-intent="false"
        @click.native="!!user.unsettled&&$router.push({path:'/unsettle'})">
        <div :class="{'has_unsettle': !!user.unsettled}">{{user.unsettled || 0 | currency('￥')}}</div>
      </cell>
    </group>
    <div class="buttons" v-if="$store.state.user.account_type !== 0">
      <x-button type="primary" @click.native="redirect('/fin/bet_record')">{{$t('game.betrecord')}}</x-button>
      <x-button type="primary" @click.native="newPage(systemConfig.customerServiceUrl)">{{$t('misc.need_help')}}</x-button>
      <x-button type="primary" @click.native="redirect('/my/deposit')">{{$t('game.deposit')}}</x-button>
    </div>
    <div class="buttons" v-else>
      <x-button class="xbutton" type="primary" @click.native="redirect('/fin/bet_record')" link="/fin/bet_record">{{$t('game.betrecord')}}</x-button>
      <x-button class="xbutton" type="primary" @click.native="redirect('/register')" link="/register">{{$t('misc.register_now')}}</x-button>
      <x-button type="primary" @click.native="newPage(systemConfig.customerServiceUrl)">{{$t('misc.need_help')}}</x-button>
    </div>
    <group class="links" >
      <cell-box
        v-if="showLinks"
        @click.native="showGameInfo(link)"
        :border-intent="false"
        v-for="(link, index) in links"
        :key="index">
        <span class="link text-center" >
          {{link.display_name}}
        </span>
      </cell-box>
      <cell-box
        :border-intent="false"
        @click.native="logoutDialogShow = true">
        <span class="link text-center red" >
          {{$t('misc.logout')}}
        </span>
      </cell-box>
    </group>
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
  import { TransferDom, Popup, Group, CellBox, Cell, XButton, Confirm } from 'vux'
  import { mapGetters } from 'vuex'
  export default {
    props: {
      value: {
        type: Boolean
      },
      showLinks: {
        type: Boolean,
        default: true
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
      TransferDom
    },
    components: {
      Popup,
      Group,
      CellBox,
      Cell,
      XButton,
      Confirm
    },
    computed: {
      ...mapGetters([
        'user'
      ]),
      systemConfig () {
        return this.$store.state.systemConfig
      }
    },
    methods: {
      logout () {
        this.closeRightMenu()
        this.$store.dispatch('logout')
      },
      showGameInfo (link) {
        this.closeRightMenu()
        this.$root.bus.$emit('showGameInfo', link.type)
      },
      redirect (link) {
        if (link[0] !== '/') {
          window.location = link
        } else {
          this.$router.push(link)
          this.closeRightMenu()
        }
      },
      newPage (url) {
        window.open(url)
      },
      closeRightMenu () {
        this.$emit('closeRightMenu')
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../styles/vars.less";
.popup {
  background-color: #fff;
}
.head /deep/ .weui-cells{
  margin-top: -1px;
  font-size: 15px;
}
.weui-cell {
  padding: 10px 20px;
  margin-top: 0;
}
@media screen and (max-width: 320px) {
  .weui-cell {
    padding: 8px 20px;
    margin-top: 0;
  }
}
.username {
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.balance {
  padding-left: 10px;
  color: @red;
}
.has_unsettle {
  color: #166FD8;
}
.buttons {
  margin: 10px 10px 0;
  /deep/ .weui-btn {
    font-size: 15px;
  }
  @media screen and (max-width: 320px) {
    /deep/ .weui-btn + .weui-btn{
      margin-top: 8px;
    }
  }
}
.links {
  position: absolute;
  width: 100%;
  bottom: 0;
  .link {
    display: block;
    width: 100%;
  }
}
</style>
