<template>
  <div class="my-box">
    <group>
      <cell :title="$t('my.balance')" >
        <i class="icon-sum icon" slot="icon"></i>
        <span class="balance text-green" v-if="user.balance">￥{{user.balance.toFixed(1)}}</span>
        <span class="balance text-green" v-if="!user.balance">￥0.00</span>
      </cell>
      <cell
        :title="$t('withdraw.apply')"
        @click.native="$router.push('/person/Withdraw')">
        <i class="icon-withdraw icon" slot="icon"></i>
      </cell>
      <cell
        @click.native="$router.push('/person/Bankinfo')"
        :title="$t('misc.bank')"
        :is-link="true">
        <i class="icon-bank icon" slot="icon"></i>
        <span>{{bankAccount}}</span>
      </cell>
    </group>
    <group>
      <cell
        @click.native="$router.push('/person/Massage')"
        :title="$t('my.message')"
        :is-link="true">
        <i class="icon-msg icon" slot="icon"></i>
        <span>{{ unRead }} 条</span>
      </cell>
      <cell
        :title="$t('misc.username')">
        <i class="icon-user icon" slot="icon"></i>
        <span>{{user.username}}</span>
      </cell>
    </group>
    <group>
      <cell
        @click.native="$router.push('/person/Profile')"
        :title="$t('misc.phone')">
        <i class="icon-phone icon" slot="icon"></i>
        <span>{{user.phone || '未填写'}}</span>
      </cell>
      <cell
        @click.native="$router.push('/person/Profile')"
        :title="$t('misc.email')"
        :is-link="true">
        <i class="icon-email icon" slot="icon"></i>
        <span>{{user.email || '未填写'}}</span>
      </cell>
      <cell
        @click.native="$router.push('/person/Profile')"
        :title="$t('misc.qq')"
        :is-link="true">
        <i class="icon-QQ icon" slot="icon"></i>
        <span>{{user.qq || '未填写'}}</span>
      </cell>
      <cell
        @click.native="$router.push('/person/Profile')"
        :title="$t('misc.wechat')"
        :is-link="true">
        <i class="icon-wechat icon" slot="icon"></i>
        <span>{{user.wechat || '未填写'}}</span>
      </cell>
    </group>

    <group>
      <cell
        @click.native="$router.push('/person/Password')"
        :title="$t('misc.reset_password')"
        :is-link="true">
        <i class="icon-password icon" slot="icon"></i>
      </cell>
      <cell
        @click.native="$router.push('/person/Wpassword')"
        :title="$t('misc.reset_withdraw_password')"
        :is-link="true">
        <i class="icon-pass icon" slot="icon"></i>
      </cell>
    </group>

    <group>
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
import '../styles/fonts/icons.css'
import { mapGetters } from 'vuex'
import { Group, Cell, Confirm } from 'vux'
import { unRead } from '../api'

export default {
  name: 'Home',
  data () {
    return {
      logoutDialogShow: false,
      unRead: ''
    }
  },
  created () {
    this.getNumber()
  },
  computed: {
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
    },
    getNumber () {
      unRead().then((response) => {
        this.unRead = response.message_count
      })
    }
  },
  components: {
    Group,
    Cell,
    Confirm
  }
}
</script>

<style scoped >
.my-box {
  margin-bottom: 70px;
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
  color: #FE3824;
}
</style>
