<template>
  <div v-transfer-dom class="sidePopup">
    <popup :value="isShow" position="right" @on-hide="handleClose" class="popup">
      <div>
        <div class="head">
          <cell :title="$t('my.balance')">
            <div class="balance">{{user.balance | currency('￥')}}</div>
          </cell>
          <cell :title="$t('game.nopay')">
            <div>{{user.unsettled || 0 | currency('￥')}}</div>
          </cell>
            <x-button class="xbutton" type="primary" link="/fin/bet_record">{{$t('game.betrecord')}}</x-button>
            <x-button class="xbutton" type="primary" link="/my">{{$t('profile.profile')}}</x-button>
            <x-button class="xbutton" type="primary" link="/fin/recharge">{{$t('game.pay')}}</x-button>
        </div>
        <group class="popup-content">
            <cell-box :border-intent="false"
                      v-for="(listItem, index) in allLists"
                      :key="index">
              <span class="display-name text-center" @click="$router.push(listItem.route)">
                {{listItem.display_name}}
              </span>
            </cell-box>
        </group>
      </div>
    </popup>
  </div>
</template>

<script>
  import { TransferDom, Popup, Group, CellBox, Cell, XButton } from 'vux'
  import { mapGetters } from 'vuex'
  export default {
    props: {
      isShow: {
        type: Boolean
      }
    },
    data () {
      return {
        allLists: [
          {
            display_name: '路珠',
            route: '/stastics/roadbeads'
          },
          {
            display_name: '长龙排行榜',
            route: '/stastics/leaderboards'
          },
          {
            display_name: '历史开奖',
            route: '/'
          },
          {
            display_name: '游戏介绍',
            route: '/gameintro'
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
      XButton
    },
    computed: {
      ...mapGetters([
        'user'
      ])
    },
    methods: {
      handleClose () {
        this.$emit('handleClose')
      }
    }
  }
</script>

<style lang="less" scoped>
  @import "../styles/vars.less";
  .sidePopup {
    .popup {
      background-color: #fff;
    }
    .popup-content {
      margin-top: 50px;
      .display-name {
        display: inline-block;
        width: 100%;
      }
    }
  }
  .weui-cell {
    padding: 10px 20px;
    margin-top: 0;
  }
  .head {
    margin-top: 30px;
    padding: 0 10px;
    .weui-cell__ft {
      .balance {
        padding-left: 10px;
        color: @red;
      }
    }
    .xbutton {
      background: @azul;
      font-size: 14px;
    }
  }
</style>
