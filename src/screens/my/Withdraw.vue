<template>
  <div>
  <div v-if="user && user.bank">
    <group label-width="'80px'" title="收款银行资料">
      <cell :title="$t('my.bank_name')" :value="user.bank.bank"></cell>
      <cell :title="$t('my.bank_account')" :value="user.bank.account"></cell>
      <cell :title="$t('my.receiver')" :value="user.real_name"></cell>
    </group>
    <group label-width="'80px'" :title="limitHint + ', 当前余额：￥' + user.balance">
      <x-input autocapitalize="off"
               name="withdraw-amount"
               :title="$t('withdraw.amount')"
               :show-clear=true
               required
               type="number"
               keyboard="number"
               ref="amount"
               @on-change="validate"
               :placeholder="$t('withdraw.amount_hint')"
               v-model="withdraw.amount">
      </x-input>
    </group>
    <group label-width="'80px'">
      <x-input autocapitalize="off"
               :title="$t('withdraw.password')"
               :show-clear=true
               required
               type="password"
               ref="password"
               @on-change="validate"
               :placeholder="$t('withdraw.password_hint')"
               v-model="withdraw.withdraw_password">
      </x-input>
    </group>

    <div class="vux-group-tip text-muted">请核对收款人信息，如需更改收款人请联系客服</div>
    <div class="vux-group-tip text-danger">{{errorMsg}}</div>
    <div class="m-a-md">
      <x-button type="primary" :disabled="!valid" @click.native="submit">
        <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
        <span v-else>{{$t('withdraw.submit')}}</span>
      </x-button>
    </div>
  </div>

  <div v-else class="text-center m-t-80">
    <div class="vux-group-tip text-muted">申请取款需要先建立银行资讯</div>
    <div class="m-a-md">
      <x-button type="primary" @click.native="createBank">
        <span>创建银行资讯</span>
      </x-button>
    </div>
  </div>
    <alert :hide-on-blur="true" v-model="show">
      {{message}}
    </alert>
  </div>
</template>

<script>
  import {Group, Cell, XButton, XInput, Spinner, Alert} from 'vux'
  import { postWithdraw } from '../../api'

  export default {
    data () {
      return {
        withdraw: {
          amount: '',
          withdraw_password: ''
        },
        errorMsg: '',
        loading: false,
        valid: false,
        message: '',
        show: false
      }
    },
    computed: {
      user () {
        return this.$store.state.user
      },
      limit () {
        let user = this.$store.state.user
        return user.level.withdraw_limit
      },
      limitHint () {
        let lower = this.limit.lower
        let upper = this.limit.upper
        let lowerHint = lower ? (this.$t('message.min') + '：￥' + lower) : ''
        let comma = (lower && upper ? ', ' : '')
        let upperHint = upper ? (this.$t('message.max') + ' ' + upper) : ''
        return lowerHint + comma + upperHint
      }
    },
    mounted () {
      this.$root.loading = false
    },
    methods: {
      validate () {
        let amount = parseInt(this.withdraw.amount)
        let meetLower = !this.limit.lower || amount >= this.limit.lower
        let meetUpper = !this.limit.upper || amount <= this.limit.upper
        this.valid = this.$refs.amount.valid && meetLower && meetUpper && (this.withdraw.amount <= this.user.balance)
      },
      createBank () {
        this.$router.push({
          name: 'bankinfo',
          query: {
            next: 'withdraw'
          }
        })
      },
      submit () {
        this.loading = true
        if (this.valid) {
          postWithdraw(this.withdraw)
            .then(response => {
              this.loading = false
              this.message = '取款信息已提交'
              this.show = true
              this.withdraw.amount = ' '
              this.withdraw.withdraw_password = ''
              this.errorMsg = ''
              setTimeout(() => {
                this.$store.dispatch('fetchUser')
              }, 2000)
            }, (response) => {
              this.loading = false
              this.errorMsg = response[0]
            })
        }
      }
    },
    components: {
      Group,
      Cell,
      XButton,
      XInput,
      Spinner,
      Alert
    }
  }
</script>

<style lang="less" scoped>
  .m-t-80{
    margin-top: 80px;
  }
  .vux-group-tip, .vux-group-tip p {
    font-size: 14px;
    text-align: center;
    padding-top: .3em;
    padding-left: 10px;
    padding-right: 5px;
  }
  .text-danger {
    color: #ff0000;
  }
</style>
