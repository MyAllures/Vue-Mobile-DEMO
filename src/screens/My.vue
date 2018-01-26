<template>
  <div>
    <group>
      <cell :title="$t('my.balance')" >
        <i class="icon-sum icon" slot="icon"></i>
        <span class="balance text-green" v-if="user.balance">￥{{user.balance.toFixed(2)}}</span>
        <span class="balance text-green" v-if="!user.balance">￥0.00</span>
      </cell>
      <cell
        v-if="user.account_type !== 0"
        is-link
        :title="$t('game.deposit')"
        @click.native="$router.push('/my/deposit')">
        <x-icon type="ios-loop-strong" size="25" slot="icon"></x-icon>
      </cell>
      <cell
        v-if="user.account_type !== 0"
        is-link
        :title="$t('withdraw.apply')"
        @click.native="$router.push('/my/withdraw')">
        <x-icon type="social-yen" size="25" slot="icon"></x-icon>
      </cell>
      <cell
        v-if="user.account_type !== 0"
        @click.native="$router.push('/my/bankinfo')"
        :title="$t('misc.bank')"
        is-link>
        <i class="icon-bank icon" slot="icon"></i>
        <span>{{bankAccount}}</span>
      </cell>
    </group>
    <group>
      <cell
        v-if="user.account_type !== 0"
        @click.native="$router.push('/my/message')"
        :title="$t('my.message')"
        is-link>
        <i class="icon-msg icon" slot="icon"></i>
        <span :class="{'unread-alert': unread}">{{ unread }} 条</span>
      </cell>
      <cell
        v-if="user.account_type !== 0"
        :title="$t('misc.username')">
        <i class="icon-user icon" slot="icon"></i>
        <span v-if="user.username">{{user.username.substr(0, 20)}}{{user.username.length > 20 ? '...' : ''}}</span>
      </cell>
    </group>
    <group v-if="user.account_type !== 0">
      <cell
        @click.native="$router.push('/my/profile')"
        :title="$t('misc.phone')">
        <i class="icon-phone icon" slot="icon"></i>
        <span>{{user.phone || '未填写'}}</span>
      </cell>
      <cell
        @click.native="$router.push('/my/profile')"
        :title="$t('misc.email')"
        is-link>
        <i class="icon-email icon" slot="icon"></i>
        <span>{{user.email || '未填写'}}</span>
      </cell>
      <cell
        @click.native="$router.push('/my/profile')"
        :title="$t('misc.qq')"
        is-link>
        <i class="icon-QQ icon" slot="icon"></i>
        <span>{{user.qq || '未填写'}}</span>
      </cell>
      <cell
        @click.native="$router.push('/my/profile')"
        :title="$t('misc.wechat')"
        is-link>
        <i class="icon-wechat icon" slot="icon"></i>
        <span>{{user.wechat || '未填写'}}</span>
      </cell>
    </group>

    <group v-if="user.account_type !== 0">
      <cell
        @click.native="$router.push('/my/password')"
        :title="$t('misc.reset_password')"
        is-link>
        <i class="icon-password icon" slot="icon"></i>
      </cell>
      <cell
        @click.native="$router.push('/my/wpassword')"
        :title="$t('misc.reset_withdraw_password')"
        is-link>
        <i class="icon-pass icon" slot="icon"></i>
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
import { mapGetters } from 'vuex'
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
      return this.$store.state.unread
    },
    ...mapGetters([
      'user'
    ]),
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
  background: @red;
  color: #fff;
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
</style>
