<template>
  <div>
    <template v-if="user.account_type">
      <group v-show="$route.path==='/my/deposit'">
        <template v-for="(payeeGroup,payeeGroupIndex) in payees">
          <div v-if="payeeGroup.detail.length>1" :class="['sub-group', payeeGroup.folded?'folded': '']" :key="payeeGroupIndex">
            <cell
              class="title"
              :title="payeeGroup.display_name"
              is-link
              :inline-desc="payeeGroup.client_description"
              :arrow-direction="payeeGroup.folded?'down':'up'"
              @click.native="toggleGroup(payeeGroup)">
              <div slot="icon" class="payee-icon" :style="{'background-image': `url(${payeeGroup.icon})`}"></div>
            </cell>
            <cell
              v-for="(payee, index) in payeeGroup.detail"
              :class="['option', payee.selected?'selected':'']"
              :title="`${payeeGroup.display_name}${index+1}`"
              :key="index"
              @click.native="selectPayee(payee)">
              <span :class="payee.selected?'weui-icon-checked':''"></span>
            </cell>
          </div>
          <cell
            v-else
            :class="[payeeGroup.detail[0].selected?'selected':'']"
            :title="payeeGroup.display_name"
            :inline-desc="payeeGroup.client_description"
            :key="payeeGroupIndex"
            @click.native="selectPayee(payeeGroup.detail[0])">
            <div slot="icon" class="payee-icon" :style="{'background-image': `url(${payeeGroup.icon})`}"></div>
            <span :class="payeeGroup.detail[0].selected?'weui-icon-checked':''"></span>
          </cell>
        </template>
      </group>
      <form v-show="$route.path==='/my/deposit'" @submit="submit" :action="paymentUrl" method="post" :target="isAllowNewPaymentWindow === 'true' ?'_blank':'_self'" ref="paymentform">
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
            :type="selectedPayee && selectedPayee.remit_type ? '' : 'number'"
            :keyboard="selectedPayee && selectedPayee.remit_type ? '' : 'number'"
            name="amount"
            ref="amount"
            action-type="button"
            @on-blur="handleAmountBlur"
            :is-type="amountValidator"
            v-model.number="currentPay.amount">
          </x-input>
        </group>
        <div class="m-a">
          <x-button type="primary">
            <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
            <span v-else>充值</span>
          </x-button>
        </div>
      </form>
      <router-view :payee="selectedPayee" ></router-view>
    </template>
    <div v-else>
      <div class="text-center text-danger hint-text">请先注册</div>
      <div class="m-a text-center">
        <x-button type="primary" @click.native="$router.push('/register')">
          立即注册
        </x-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ButtonTab, ButtonTabItem, XButton, Radio, Cell, Group, XInput } from 'vux'
import Remit from '../../components/Remit.vue'
import OnlinePay from '../../components/OnlinePay.vue'
import { getOnlinepayees, getRemitPayees } from '../../api'
import { mapState } from 'vuex'
import urls from '../../api/urls'
export default {
  name: 'Deposit',
  data () {
    return {
      view: OnlinePay,
      remitComponent: Remit,
      onlinePayComponent: OnlinePay,
      payees: [],
      loading: false,
      selectedPayee: null,
      paymentUrl: urls.payment,
      currentPay: {
        'type_id': '',
        'payee_id': '',
        'gateway_id': '',
        'amount': '',
        'token': '',
        'notifyPage': window.location.href.replace(this.$route.path, '/depositSuccess/')
      },
      inputErrors: []
    }
  },
  components: {
    ButtonTab,
    ButtonTabItem,
    Remit,
    OnlinePay,
    XButton,
    Radio,
    Cell,
    Group,
    XInput
  },
  computed: {
    ...mapState([
      'user'
    ]),
    isAllowNewPaymentWindow () {
      return this.$store.state.systemConfig.isAllowNewPaymentWindow
    },
    onlineLimit () {
      if (!this.selectedPayee) {
        return null
      } else if (this.selectedPayee.online_limit) {
        return this.selectedPayee.online_limit
      } else {
        return this.$store.state.user.level.remit_limit
      }
    },
    limitHint () {
      if (!this.selectedPayee) {
        return ''
      }
      let lower = this.onlineLimit.lower
      let upper = this.onlineLimit.upper
      let lowerHint = lower ? '最低金额 ' + lower : ''
      let comma = lower && upper ? ', ' : ''
      let upperHint = upper ? '最高金额 ' + upper : ''
      return lowerHint + comma + upperHint
    }
  },
  watch: {
    'selectedPayee': function (payee) {
      this.currentPay = Object.assign({}, this.currentPay,
        {
          'type_id': payee.payment_type,
          'payee_id': payee.payee_id,
          'gateway_id': payee.gateway_id,
          'token': this.$cookie.get('access_token')
        })
    }
  },
  created () {
    Promise.all([getOnlinepayees(), getRemitPayees()].map(r => r.catch(e => e)))
      .then(resArr => {
        const onlinePayees = []
        const bankRemit = []
        const alipayRemit = []
        const wexinRemit = []
        resArr.forEach(responses => {
          if (responses && !responses.toString().startsWith('Error')) {
            responses.forEach((res, index) => {
              switch (res.remit_type) {
                case 1:
                  res.display_name = res.bank.name
                  res.selected = false
                  bankRemit.push(res)
                  break
                case 2:
                  res.display_name = '微信'
                  res.selected = false
                  wexinRemit.push(res)
                  break
                case 3:
                  res.display_name = '支付宝'
                  res.selected = false
                  alipayRemit.push()
                  break
                default:
                  if (res.detail && res.detail.length > 0) {
                    res.detail.forEach(item => { item.selected = false })
                    if (res.detail.length > 1) {
                      res.folded = true
                    }
                    onlinePayees.push(res)
                  }
              }
            })
          }
        })
        let payees = []
        if (onlinePayees.length > 0) {
          payees = [...onlinePayees]
        }
        if (bankRemit.length > 0) {
          payees.push({display_name: '银行转帐', detail: bankRemit, folded: true, icon: require('../../assets/transfer.png'), client_description: '线下入款，您的首选'})
        }
        if (wexinRemit.length > 0) {
          payees.push({display_name: '微信转帐', detail: wexinRemit, folded: true, icon: require('../../assets/wechat.png'), client_description: '微信在线支付'})
        }
        if (alipayRemit.length > 0) {
          payees.push({display_name: '支付宝转帐', detail: alipayRemit, folded: true, icon: require('../../assets/alipay.png'), client_description: '支付宝在线支付'})
        }
        if (payees.length !== 0) {
          // payees[0].detail[0].selected = true
          if (payees[0].detail.length > 1) {
            // payees[0].folded = false
          }
          this.selectedPayee = payees[0].detail[0]
          this.payees = payees
        }
      })
  },
  methods: {
    handleAmountBlur () {
      if (this.selectedPayee && this.selectedPayee.remit_type && !isNaN(this.currentPay.amount)) {
        this.currentPay.amount = !(this.currentPay.amount + '') ? '0' : (this.currentPay.amount + '').replace(/^[0]|[^0-9\\.]/g, '')

        this.$nextTick(() => {
          this.currentPay.amount = Math.floor(parseFloat(this.currentPay.amount) * 100) / 100 || 0
        })
      }

      this.$nextTick(() => { this.validateErrors() })
    },
    toggleGroup (group) {
      group.folded = !group.folded
    },
    selectPayee (payee) {
      this.$refs.amount.$el.scrollIntoView()
      this.selectedPayee.selected = false
      payee.selected = true
      this.selectedPayee = payee
      if (this.currentPay.amount) {
        this.$nextTick(() => {
          this.$refs.amount.firstError = ''
          this.inputErrors = []
          this.validateAll()
        })
      }
    },
    switchView (component) {
      this.view = component
    },
    formatPayees (payees) {
      let arr = payees.filter(function (item, index, arr) {
        return item.detail.length
      })
      return arr
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
    submit (e) {
      if (this.validateAll()) {
        if (this.selectedPayee.remit_type) {
          e.preventDefault()
          this.$store.dispatch('setRemit', {
            account: this.selectedPayee.account,
            remit_type: this.selectedPayee.remit_type,
            qr_code: this.selectedPayee.qr_code,
            display_name: this.selectedPayee.display_name,
            payee_name: this.selectedPayee.payee_name,
            address: this.selectedPayee.address,
            amount: this.currentPay.amount
          })
          this.$store.dispatch('addKeepAlive', 'Deposit')
          this.$router.push({path: '/my/remit'})
          return
        }
        let token = this.$cookie.get('access_token')
        if (!token) {
          let next = '/login?next=' + this.$route.fullPath
          this.$router.push(next)
          return
        }
        this.$nextTick(() => {
          this.$refs.amount.reset()
          this.$nextTick(() => {
            this.$refs.amount.firstError = ''
            this.inputErrors = []
          })
        })
      } else {
        e.preventDefault()
      }
    }
  }
}
</script>
<style lang="less" scoped>
.vux-button-group{
		padding: 15px 40px;
		border-bottom: 1px solid #ccc;
  }
  .hint-text {
    margin-top: 50px;
  }
  .weui-icon-checked::before{
    display: block;
    content: "\EA08";
    color: #f90;
    font-size: 16px;
  }

  .weui-cell.title{
    padding: 3px 15px;
  }
  .weui-cell.selected {
    /deep/ .vux-label {
      color: #f90;
    }
  }
  .sub-group {
    width: 100%;
    position: relative;
    &::before{
      content: " ";
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      height: 1px;
      border-top: 1px solid #D9D9D9;
      color: #D9D9D9;
      transform-origin: 0 0;
      transform: scaleY(0.5);
      left: 15px;
    }
    &.folded{
      .option {
        display: none;
      }
    }
  }
  .payee-icon {
    margin-right: 5px;
    width: 36px;
    height: 36px;
    background-repeat: no-repeat;
    background-size: contain;
  }
</style>
