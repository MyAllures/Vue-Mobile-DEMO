<template>
  <div>
    <group>
      <cell :title="$t('my.balance')" >
        <i class="icon-sum icon" slot="icon"></i>
        <span class="balance text-green">￥{{user.balance.toFixed(1)}}</span>
      </cell>
      <cell :title="$t('misc.bank')" :is-link="true">
        <i class="icon-bank icon" slot="icon"></i>
        <span>{{bankAccount}}</span>
      </cell>
    </group>
    <group>
      <cell 
        :title="$t('my.message')"
        :is-link="true">
        <i class="icon-msg icon" slot="icon"></i>
        <span>x 未读</span>
      </cell>
      <cell 
        :title="$t('misc.username')">
        <i class="icon-user icon" slot="icon"></i>
        <span>{{user.username}}</span>
      </cell>
    </group>
    <group>
      <cell 
        :title="$t('misc.phone')">
        <i class="icon-phone icon" slot="icon"></i>
        <span>{{user.phone || '未填写'}}</span>
      </cell>
      <cell 
        :title="$t('misc.email')"
        :is-link="true">
        <i class="icon-email icon" slot="icon"></i>
        <span>{{user.email || '未填写'}}</span>
      </cell>
      <cell 
        :title="$t('misc.qq')"
        :is-link="true">
        <i class="icon-QQ icon" slot="icon"></i>
        <span>{{user.qq || '未填写'}}</span>
      </cell>
      <cell 
        :title="$t('misc.wechat')"
        :is-link="true">
        <i class="icon-wechat icon" slot="icon"></i>
        <span>{{user.wechat || '未填写'}}</span>
      </cell>
    </group>

    <group>
      <cell 
        :title="$t('misc.reset_password')"
        :is-link="true">
        <i class="icon-password icon" slot="icon"></i>
      </cell>
      <cell 
        :title="$t('misc.reset_withdraw_password')"
        :is-link="true">
        <i class="icon-pass icon" slot="icon"></i>
      </cell>
    </group>
  </div>
</template>

<script>
import '../styles/fonts/icons.css'
import { mapGetters } from 'vuex'
import { Group, Cell } from 'vux'

export default {
  name: 'Home',
  data () {
    return {
    }
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
  components: {
    Group,
    Cell
  }
}
</script>

<style scoped >
.icon {
  width: 24px;
  margin-right: 10px;
  font-size: 20px;
  display: inline-block;
  vertical-align: middle;
}
</style>
