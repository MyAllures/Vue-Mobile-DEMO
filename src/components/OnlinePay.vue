<template>
  <div class="deposit-box">
    <tab :line-width="2" :animate="false">
      <tab-item v-for="(payee,idx) in onlinepayees" :key="idx" :selected="payee.display_name === currentPay.display_name" @click.native="toggleTab(payee)">{{payee.display_name}}</tab-item>
    </tab>
    <div v-if="description" class="text-danger m-l-md m-t m-r">
      {{description}}
    </div>


      <form :action="paymentUrl" method="post" target="_blank" ref="paymentform">
        <input type="hidden" name="payment_gateway" :value="currentPay.gateway_id" />
        <input type="hidden" name="payment_type" :value="currentPay.type_id" />
        <input type="hidden" name="payee" :value="currentPay.payee_id" />
        <input type="hidden" name="mobile" value="true" />
        <input type="hidden" name="token" :value="currentPay.token" />
        <input type="hidden" name="notify_page" :value="currentPay.notifyPage" />
        <group label-width="'80px'" :title="limitHint">
          <div v-if="inputErrors.length">
            <ul class="input-errors">
              <li class="text" v-for="(error, index) in inputErrors" :key="index">
                {{error}}
              </li>
            </ul>
          </div>
          <x-input  autocapitalize="off"
            :title="'存款金额'"
            :show-clear="true"
            required
            type="number"
            keyboard="number"
            name="amount"
            ref="amount"
            action-type="button"
            @on-change="validateErrors"
            @on-blur="validateErrors"
            :is-type="amountValidator"
            v-model="currentPay.amount"
            >
          </x-input>
        </group>
        <div class="m-a">
          <x-button type="primary" @click.native="submit">
            <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
            <span v-else>充值</span>
          </x-button>
        </div>
      </form>

  </div>
</template>
<script>
import {Tab, TabItem, Group, XInput, XButton, Spinner} from 'vux'
import { getOnlinepayees } from '../api'
import Vue from 'vue'
import urls from '../api/urls'
export default {
  data () {
    return {
      currentTab: {
        display_name: '',
        detail: [{name: ''}]
      },
      onlinepayees: [],
      currentPay: {
        'type_id': '',
        'payee_id': '',
        'gateway_id': '',
        'display_name': '',
        'amount': '',
        'token': '',
        'notifyPage': window.location.href.replace(this.$route.path, '/depositSuccess/')
      },
      payDetail: {},
      errorMsg: '',
      paymentUrl: urls.payment,
      payBoradUrl: urls.paymentBoard,
      transactionId: '',
      loading: '',
      success: false,
      defaultPayName: '',
      description: '',
      onlineLimit: {
        lower: '',
        upper: ''
      },
      inputErrors: []
    }
  },
  created () {
    this.getOnlinepayees()
  },
  computed: {
    currentPayNames () {
      let arr = []
      let currentTab = this.currentTab
      for (let i = 0; i < currentTab.detail.length; i++) {
        arr.push(currentTab.detail[i].name)
      }
      return arr
    },
    limit () {
      return this.$store.state.user.level.online_limit
    },
    limitHint () {
      let lower = this.onlineLimit.lower
      let upper = this.onlineLimit.upper
      let lowerHint = lower ? (`最低金额 ${lower}`) : ''
      let comma = (lower && upper ? ', ' : '')
      let upperHint = upper ? (`最高金额 ${upper}`) : ''
      return lowerHint + comma + upperHint
    }
  },
  components: {
    Tab,
    TabItem,
    Group,
    XInput,
    XButton,
    Spinner
  },
  methods: {
    toggleTab (payee) {
      this.payDetail = payee.detail[0]
      this.currentPay = Object.assign({}, this.currentPay, {
        'type_id': payee.detail[0].payment_type,
        'payee_id': payee.detail[0].payee_id,
        'gateway_id': payee.detail[0].gateway_id,
        'display_name': payee.display_name,
        'amount': ''
      })
      this.description = payee.description
      this.currentTab = payee
      this.defaultPayName = payee.detail[0].name
      this.onlineLimit = Object.assign({}, this.limit)
      this.onlineLimit.upper = payee.detail[0].online_limit
    },
    onChangeItem (name) {
      let detail = this.currentTab.detail.filter(function (obj, index, arr) {
        return obj.name === name
      })
      this.currentPay.gateway_id = detail[0].gateway_id
      this.currentPay.payee_id = detail[0].payee_id
    },
    validateErrors () {
      const inputErrors = []
      if (this.$refs.amount.firstError) {
        if (this.$refs.amount.firstError === '必填哦') {
          inputErrors.push('必须输入金额')
        } else {
          inputErrors.push(this.$refs.amount.firstError)
        }
      }
      this.inputErrors = inputErrors
    },
    amountValidator (value) {
      let amount = parseInt(value)
      let meetLower = !this.onlineLimit.lower || amount >= parseInt(this.onlineLimit.lower)
      let meetUpper = !this.onlineLimit.upper || amount <= parseInt(this.onlineLimit.upper)
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
      } else {
        return {
          valid: true
        }
      }
    },
    validateAll () {
      let amount = this.$refs.amount
      amount.validate()
      if (amount.firstError) {
        amount.forceShowError = true
      }
      this.validateErrors()
      return amount.valid
    },
    formatOnlinepayees (onlinepayees) {
      let arr = onlinepayees.filter(function (item, index, arr) {
        return item.detail.length
      })
      return arr
    },
    getOnlinepayees () {
      getOnlinepayees().then(response => {
        if (response) {
          this.onlinepayees = this.formatOnlinepayees(response)
          let _this = this
          setTimeout(() => {
            _this.toggleTab(this.onlinepayees[0])
          }, 100)
        }
      })
    },
    submit () {
      if (this.validateAll()) {
        let token = this.$cookie.get('access_token')
        if (!token) {
          let next = '/login?next=' + this.$route.fullPath
          this.$router.push(next)
          return
        }
        this.currentPay.token = token
        Vue.nextTick(() => {
          this.$refs.paymentform.submit()
          this.$refs.amount.reset()
          Vue.nextTick(() => {
            this.$refs.amount.firstError = ''
            this.inputErrors = []
          })
        })
      }
    }
  }
}
</script>
<style lang="less" scoped>
.deposit-box {
  width: 100%;
  padding: 0;
  .pay-way {
    width: 100%;
    height: 40px;
    padding: 0;
    color: #04BE02;
    line-height: 44px;
    text-align: center;
    border-bottom: 3px solid #04BE02;
  }
}

</style>
