<template>
  <div>
    <group class="landing-info">
      <cell class="balance-info">
        <div slot="icon">
          <p class="username">
            <span v-if="user.account_type !== 0">{{user.username.substr(0, 20)}}{{user.username.length > 20 ? '...' : ''}}</span>
            <span v-else>{{$t('misc.register_now')}}</span>
          </p>
          <p class="balance-text">余额</p>
          <p class="balance">￥{{user.balance ? user.balance.toFixed(2) : '0.00'}}</p>
        </div>
        <div class="button" v-if="user.account_type !== 0" @click="$router.push('/my/deposit')">{{$t('game.deposit')}}</div>
      </cell>
      <cell
        v-if="user.account_type !== 0"
        @click.native="unread ? $router.push('/my/message') : ''"
        :title="'站内消息'"
        :is-link="!!unread">
        <img class="svg-icon" src="../assets/my/message.svg" slot="icon" alt="message">
        <span :class="{'unread-alert': unread}">{{ unread }}</span>
      </cell>
    </group>
    <group>
      <cell v-if="user.account_type !== 0"
        :title="$t('profile.basic_info')"
        @click.native="$router.push('/my/profile')"
        is-link>
        <img class="svg-icon" src="../assets/my/profile.svg" slot="icon" alt="profile">
      </cell>
    </group>
    <group>
      <cell
        v-if="user.account_type !== 0"
        is-link
        :title="$t('withdraw.apply')"
        @click.native="$router.push('/my/withdraw')">
        <img class="svg-icon" src="../assets/my/withdraw.svg" slot="icon" alt="withdraw">
      </cell>
      <cell
        v-if="user.account_type !== 0"
        @click.native="$router.push('/my/bankinfo')"
        :title="$t('misc.bank')"
        is-link>
        <img class="svg-icon" src="../assets/my/bank_card.svg" slot="icon" alt="bank-card">
        <span v-if="bankAccount">{{bankAccount}}</span>
        <span class="warn-tip" v-else>未填写</span>
      </cell>
    </group>




    <group v-if="user.account_type !== 0">
      <cell
        @click.native="$router.push('/my/password')"
        :title="$t('misc.reset_password')"
        is-link>
        <img class="svg-icon" src="../assets/my/reset_password.svg" slot="icon" alt="reset-pwd">
      </cell>
      <cell
        @click.native="$router.push('/my/wpassword')"
        :title="$t('misc.reset_withdraw_password')"
        is-link>
        <img class="svg-icon" src="../assets/my/reset_wpassword.svg" slot="icon" alt="reset-wpwd">
      </cell>
      <cell v-if="customerServiceUrl" @click.native="window.open(customerServiceUrl)" :title="'联系客服'" is-link>
        <img class="svg-icon" src="../assets/my/customer_service.svg" slot="icon" alt="service">
      </cell>
    </group>
    <group v-else>
      <cell
        is-link
        link="/register">
        <span class="register" slot="after-title">{{$t('misc.register_now')}}</span>
      </cell>
    </group>



    <group>
      <cell>
        <span class="logout" @click="logoutDialogShow = true" slot="after-title">{{$t('misc.logout')}}</span>
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
  name: 'Home',
  data () {
    return {
      logoutDialogShow: false
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
    }
  },
  methods: {
    logout () {
      this.$store.dispatch('logout')
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
@import '../styles/vars.less';
.warn-tip {
  color: @red;
}
.weui-cell /deep/ .weui-cell__hd {
  line-height: 1;
}
.vux-x-icon {
  margin-right: 10px;
}
.unread-alert {
  border-radius: 20px;
  font-size: 14px;
  padding: 4px 10px;
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
.logout {
  display: block;
  text-align: center;
  color: @red;
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

.username {
  color: #333;
  font-size: 22px;
  font-weight: 700;
  margin-top: 10px;
  margin-bottom: 15px;
}

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 36px;
  font-size: 14px;
  color: #fff;
  background-color: #166fd8;
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
</style>
