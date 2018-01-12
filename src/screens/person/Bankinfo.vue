<template>
  <div>
    <group label-width="'100px'" :title="$t('profile.bankinfo_hint')" v-if="!user.bank">
      <selector
        :title="$t('profile.select_bank')"
        :options="banks"
        v-model="member.bank.bank"
        @on-change="validate"
        placeholder="请选择">
      </selector>
      <x-input
        autocapitalize="off"
        :title="$t('profile.bank_province')"
        required
        type="text"
        ref="province"
        @on-change="validate"
        v-model="member.bank.province" >
      </x-input>

      <x-input
        autocapitalize="off"
        :title="$t('profile.bank_city')"
        required
        type="text"
        ref="city"
        @on-change="validate"
        v-model="member.bank.city">
      </x-input>

      <x-input
      autocapitalize="off"
        :title="$t('profile.bank_account')"
        required
        type="number"
        keyboard="number"
        ref="account"
        @on-change="validate"
        v-model="member.bank.account">
      </x-input>
    </group>
      <group v-else label-width="'100px'">
        <cell :title="$t('profile.bank_name')" :value="user.bank.bank"></cell>
        <cell :title="$t('profile.bank_province')" :value="user.bank.province"></cell>
        <cell :title="$t('profile.bank_city')" :value="user.bank.city"></cell>
        <cell :title="$t('profile.bank_account')" :value="user.bank.account"></cell>
      </group>
      <div class="text-danger text-center" v-show="errorMsg">{{errorMsg}}</div>
      <div class="m-a-md" v-if="!user.bank">
        <x-button type="primary" :disabled="!valid" @click.native="submit">
          <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
          <span v-else>{{$t('profile.submit')}}</span>
        </x-button>
      </div>
      <div v-else class="text-center m-a-md">
        <span class="text-muted">{{$t('profile.bankinfo_update_tip')}}</span>
      </div>
  </div>
</template>
<script>
import { Cell, Group, XInput, XButton, Datetime, Selector, Spinner } from 'vux'
import { fetchBank, addUserBank } from '../../api'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'bankinfo',
  data () {
    return {
      banks: [],
      loading: false,
      errorMsg: '',
      member: {
        bank: {
          bank: '',
          city: '',
          province: '',
          account: ''
        }
      },
      valid: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  created () {
    this.fetchBank()
    this.checkBankValue()
  },
  methods: {
    validate () {
      let valid = true
      for (let x in this.$refs) {
        valid = this.$refs[x].valid && valid
      }
      this.valid = valid && !!this.member.bank.bank
    },
    ...mapActions([
      'fetchUser'
    ]),
    fetchBank (index) {
      fetchBank().then(response => {
        this.banks = response
      })
    },
    submit () {
      if (!window.confirm(this.$t('profile.bankinfo_confirm'))) {
        return
      }
      this.loading = true
      if (this.valid) {
        addUserBank(this.user, this.member).then((response) => {
          this.loading = false
          this.fetchUser({})
          this.$root.showToast = true
          this.$root.toastText = this.$t('profile.bank_sucess')
          setTimeout(() => {
            this.$router.push({name: 'My'})
          }, 2000)
        }, (response) => {
          this.errorMsg = response
          this.loading = false
        })
      }
    },
    checkBankValue () {
      if (this.user.bank) {
        this.member.bank.bank = this.user.bank.bank.toString()
        this.member.bank.city = this.user.bank.city
        this.member.bank.province = this.user.bank.province
        this.member.bank.account = this.user.bank.account
      }
    }
  },
  components: {
    Group,
    Cell,
    XInput,
    XButton,
    Datetime,
    Selector,
    Spinner
  }
}
</script>
<style lang='less'>
.text-muted {
  display: block;
  width: 100%;
  height: 100;
  text-align: center;
}
</style>
