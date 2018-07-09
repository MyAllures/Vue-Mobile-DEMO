<template>
  <div>
  <div v-if="user && user.bank">
    <group label-width="'80px'" title="收款银行资料">
      <cell :title="$t('my.bank_name')" :value="user.bank.bank"></cell>
      <cell :title="$t('my.bank_account')" :value="user.bank.account"></cell>
      <cell :title="$t('my.receiver')" :value="user.real_name"></cell>
    </group>
    <group label-width="'80px'" :title="limitHint + ', 当前余额：￥' + user.balance">
      <div v-if="inputErrors.length">
        <ul slot="after-title" class="input-errors">
          <li class="text" v-for="(error, index) in inputErrors" :key="index">
            {{error}}
          </li>
        </ul>
      </div>
      <x-input autocapitalize="off"
               name="withdraw-amount"
               :title="$t('withdraw.amount')"
               :show-clear="true"
               keyboard="number"
               ref="amount"
               required
               @on-blur="validateErrors"
               @on-change="inputAmount"
               :is-type="amountValidator"
               :placeholder="$t('withdraw.amount_hint')"
               v-model="withdraw.amount">
      </x-input>
      <x-input autocapitalize="off"
               :title="$t('withdraw.password')"
               :show-clear="true"
               type="password"
               ref="password"
               autocomplete="new-password"
               required
               @on-blur="validateErrors"
               :placeholder="$t('withdraw.password_hint')"
               v-model="withdraw.withdraw_password">
      </x-input>
    </group>
    <div class="vux-group-tip text-muted">请核对收款人信息，如需更改收款人请联系客服</div>
    <div class="text-center text-danger m-t">{{errorMsg}}</div>
    <div class="m-a">
      <x-button type="primary" @click.native="submit">
        <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
        <span v-else>{{$t('withdraw.submit')}}</span>
      </x-button>
    </div>
  </div>

  <div v-else class="text-center m-t">
    <div class="vux-group-tip text-muted">申请取款需要先建立银行资讯</div>
    <div class="m-a">
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
  import { msgFormatter } from '../../utils'

  export default {
    data () {
      return {
        withdraw: {
          amount: undefined,
          withdraw_password: undefined
        },
        errorMsg: '',
        loading: false,
        message: '',
        show: false,
        inputErrors: []
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
      inputAmount (val) {
        let formatted = !val ? '' : val.replace(/^[0]|[^0-9]/g, '')
        this.$nextTick(() => {
          this.withdraw.amount = formatted
        })
      },
      validateErrors () {
        this.errorMsg = ''
        const inputErrors = []
        if (this.$refs.password.firstError) {
          inputErrors.push('请輸入密碼')
        }
        if (this.$refs.amount.firstError) {
          if (this.$refs.amount.firstError === '必填哦') {
            inputErrors.push('请输入金额')
          } else {
            inputErrors.push(this.$refs.amount.firstError)
          }
        }
        this.inputErrors = inputErrors
      },
      validateAll () {
        let amount = this.$refs.amount
        let password = this.$refs.password
        amount.validate()
        password.validate()
        if (amount.firstError) {
          amount.forceShowError = true
        }
        if (password.firstError) {
          password.forceShowError = true
        }
        this.validateErrors()
        return amount.valid && password.valid
      },
      amountValidator (value) {
        value = parseInt(value)
        let meetLower = !this.limit.lower || value >= this.limit.lower
        let meetUpper = !this.limit.upper || value <= this.limit.upper
        if (!meetLower) {
          return {
            valid: false,
            msg: '必须大于最小取款金额'
          }
        } else if (!meetUpper) {
          return {
            valid: false,
            msg: '必须小于最大取款金额'
          }
        } else if (value > this.user.balance) {
          return {
            valid: false,
            msg: '余额不足'
          }
        } else {
          return {
            valid: true
          }
        }
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
        if (this.validateAll()) {
          this.loading = true
          postWithdraw(this.withdraw)
            .then(response => {
              window.gtag('event', '取款', {'event_category': '取款'})
              this.loading = false
              this.message = '取款信息已提交'
              this.show = true
              this.$refs.amount.reset()
              this.$refs.password.reset()
              this.$nextTick(() => {
                this.$refs.amount.firstError = ''
                this.$refs.password.firstError = ''
                this.inputErrors = []
              })
              this.errorMsg = ''
              setTimeout(() => {
                this.$store.dispatch('fetchUser')
              }, 2000)
            }, (error) => {
              this.loading = false
              this.errorMsg = msgFormatter(error)
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
.vux-group-tip, .vux-group-tip p {
  color: #999;
  font-size: 14px;
  text-align: center;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 5px;
}
</style>
