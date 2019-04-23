<template>
  <div class="myinfo-container">
    <div class="text-center m-t-lg visitor" v-if="!user.account_type">
      <img class="img" src="../assets/icon_balance.png" alt="$$$">
      <p class="balance">余额</p>
      <p class="amount">￥{{user.balance ? user.balance.toFixed(2) : '0.00'}}</p>
    </div>

    <div v-else>
      <group class="landing-info">
        <cell class="balance-info">
          <div slot="icon">
            <div class="user-section">
              <div class="avatar" :style="{'background-image': `url('${user.avatar?user.avatar:defaultAvatar}')`}"></div>
              <span>{{user.username.substr(0, 20)}}{{user.username.length > 20 ? '...' : ''}}</span>
            </div>
            <p class="balance-text">余额</p>
            <p class="balance">￥{{user.balance ? user.balance.toFixed(2) : '0.00'}}</p>
          </div>
          <div class="button" @click="sendGaEvent({label: '我的帳號',category: '充值',action: '充值'});$router.push('/fin/deposit')">{{$t('game.deposit')}}</div>
        </cell>
        <cell @click.native="sendGaEvent({label: '我的帳號',category: '站內消息',action: '檢視'});$router.push('/my/message')"
          :title="'站内消息'"
          is-link>
          <img class="svg-icon" src="../assets/my/message.svg" slot="icon" alt="message">
          <span v-if="unread" :class="{'unread-alert': unread}">{{ unread }}</span>
        </cell>
      </group>
      <group>
        <cell
          :title="$t('profile.basic_info')"
          @click.native="sendGaEvent({label: '我的帳號',category: '基本資料',action: '檢視'});$router.push('/my/profile')"
          is-link>
          <img class="svg-icon" src="../assets/my/profile.svg" slot="icon" alt="profile">
          <span v-if="isPrimaryInfoEmpty" class="warn-tip">未填写</span>
        </cell>
        <cell
          @click.native="$router.push('/my/bankinfo')"
          :title="$t('misc.bank')"
          is-link>
          <img class="svg-icon" src="../assets/my/bank_card.svg" slot="icon" alt="bank-card">
          <span v-if="bankAccount">{{bankAccount}}</span>
          <span class="warn-tip" v-else>未填写</span>
        </cell>
      </group>
      <group>
        <cell @click.native="$router.push('/my/password')"
          :title="$t('misc.reset_password')"
          is-link>
          <img class="svg-icon" src="../assets/my/reset_password.svg" slot="icon" alt="reset-pwd">
        </cell>
        <cell @click.native="$router.push('/my/wpassword')"
          :title="$t('misc.reset_withdraw_password')"
          is-link>
          <img class="svg-icon" src="../assets/my/reset_wpassword.svg" slot="icon" alt="reset-wpwd">
        </cell>
        <cell v-if="customerServiceUrl" @click.native="sendGaEvent({label: '我的帳號',category: '聯繫客服',action: '點擊'});window.open(customerServiceUrl)" :title="'联系客服'" is-link>
          <img class="svg-icon" src="../assets/my/customer_service.svg" slot="icon" alt="service">
        </cell>
      </group>
    </div>

    <group class="set-bottom second" v-if="!user.account_type">
      <cell @click.native="$router.push({path: '/register'})">
        <span class="register" slot="after-title">{{$t('misc.register_now')}}</span>
      </cell>
    </group>
    <group class="logout-cell text-center" :class="{'set-bottom': !user.account_type}">
      <cell @click.native="logoutDialogShow = true">
        <span class="logout" slot="after-title">{{$t('misc.logout')}}</span>
      </cell>
    </group>
    <confirm
      v-model="logoutDialogShow"
      :confirm-text="$t('misc.logout')"
      :cancel-text="$t('misc.cancel')"
      @on-confirm="logout">
      <p class="confirm-text">{{$t('misc.confirm_logout')}}</p>
    </confirm>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { Group, Cell, Confirm } from 'vux'

export default {
  name: 'My',
  data () {
    const defaultAvatar = require('../assets/avatar.png')
    return {
      logoutDialogShow: false,
      defaultAvatar
    }
  },
  computed: {
    unread () {
      return this.$store.state.user.unread
    },
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'systemConfig'
    ]),
    customerServiceUrl () {
      return this.systemConfig.customer_service_url
    },
    bankAccount () {
      let bank = this.user.bank
      if (bank) {
        let bankName = this.user.bank.bank
        let bankNo = this.user.bank.account.slice(-4)
        return `${bankName} ****${bankNo}`
      }
      return ''
    },
    isPrimaryInfoEmpty () {
      const user = this.user
      return !user.phone && !user.email && !user.qq && (!user.wechat && user.wechat !== 0)
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('logout').then(() => {
        this.sendGaEvent({
          label: '我的登出',
          category: '登出',
          action: '点击'
        })
        this.$router.push('/')
      }).catch(() => {})
    }
  },
  components: {
    Group,
    Cell,
    Confirm
  }
}
</script>

<style scoped lang="less">
.myinfo-container {
  height: 100%;
  overflow-y: auto;
}
.visitor {
  .img {
    width: 60px;
    height: 60px;
  }
  .balance {
    font-size: 16px;
    color: #666;
  }
  .amount {
    font-weight: 500;
    color: #333;
    font-size: 24px;
  }
}
.warn-tip {
  color: @red;
}

.unread-alert {
  border-radius: 20px;
  font-size: 14px;
  padding: 1px 7px;
  background: #d0021b;
  color: #fff;
  font-weight: 500;
}

.icon {
  width: 24px;
  margin-right: 10px;
  font-size: 20px;
  display: inline-block;
  vertical-align: middle;
}

.register {
  display: block;
  text-align: center;
  color: @azul;
}

.balance {
  color: #333;
  font-size: 16px;
  &-text {
    color: #999;
    font-size: 12px;
    margin-bottom: 5px;
  }
}

.user-section {
  display: flex;
  align-items: center;
  color: #333;
  font-size: 22px;
  font-weight: 700;
  margin-top: 10px;
  margin-bottom: 15px;
  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    margin-right: 10px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
  }
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 36px;
  font-size: 14px;
  color: #fff;
  background-color: @azul;
  border-radius: 4px;
}

.weui-cell.balance-info {
  align-items: flex-end;
  margin-bottom: 5px;
}

.landing-info /deep/ .weui-cells {
  margin-top: 0;
}

.svg-icon {
  position: relative;
  top: 2px;
  right: 5px;
}

.logout-cell {
  width: 100%;
  color: @red;
}
</style>
