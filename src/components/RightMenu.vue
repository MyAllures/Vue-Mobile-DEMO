<template>
  <popup :value="value" position="right" @on-hide="handleClose" class="popup" v-transfer-dom>
    <group class="head">
      <cell :title="$t('my.balance')" :border-intent="false">
        <div class="balance">{{user.balance | currency('￥')}}</div>
      </cell>
      <cell :title="$t('game.nopay')" :border-intent="false">
        <div>{{user.unsettled || 0 | currency('￥')}}</div>
      </cell>
    </group>
    <div class="buttons" v-if="$store.state.user.account_type !== 0">
      <x-button type="primary" @click.native="redirect('/fin/bet_record')">{{$t('game.betrecord')}}</x-button>
      <x-button type="primary" @click.native="redirect('/my')">{{$t('profile.profile')}}</x-button>
      <x-button type="primary" @click.native="redirect('/my/deposit')">{{$t('game.deposit')}}</x-button>
      <x-button type="primary" @click.native="redirect(systemConfig.customerServiceUrl)">{{$t('misc.need_help')}}</x-button>
    </div>
    <div class="buttons" v-else>
      <x-button class="xbutton" type="primary" @click.native="redirect('/fin/bet_record')" link="/fin/bet_record">{{$t('game.betrecord')}}</x-button>
      <x-button class="xbutton" type="primary" @click.native="redirect('/register')" link="/register">{{$t('misc.register_now')}}</x-button>
    </div>
    <group class="links" >
      <cell-box 
        v-if="showLinks"
        @click.native="redirect(link.route)"
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
    <confirm
      v-model="logoutDialogShow"
      :confirm-text="$t('misc.logout')"
      :cancel-text="$t('misc.cancel')"
      @on-confirm="logout">
      <p class="confirm-text">{{$t('misc.confirm_logout')}}</p>
    </confirm>
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
        links: [{
          display_name: '路珠',
          route: '/stastics/roadbeads'
        }, {
          display_name: '长龙排行榜',
          route: '/stastics/leaderboards'
        }, {
          display_name: '历史开奖',
          route: '/'
        }, {
          display_name: '游戏介绍',
          route: '/gameintro'
        }]
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
        this.handleClose()
        this.$store.dispatch('logout')
      },
      redirect (link) {
        this.$router.push(link)
        this.handleClose()
      },
      handleClose () {
        this.$emit('handleClose')
      }
    }
  }
</script>

<style lang="less" scoped>
@import "../styles/vars.less";
.popup {
  background-color: #fff;
}
.weui-cell {
  padding: 10px 20px;
  margin-top: 0;
}
.balance {
  padding-left: 10px;
  color: @red;
}
.buttons {
  margin: 20px 10px 0;
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
