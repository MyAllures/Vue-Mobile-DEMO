<template>
  <div>
    <div v-if="user.account_type">
      <group v-if="payees.length" title="请选择支付方式" v-show="$route.path==='/my/deposit'" class="payment-types">
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
              class="option"
              v-for="(payee, index) in payeeGroup.detail"
              :title="`${payeeGroup.display_name}${index+1}`"
              :key="index"
              @click.native="selectPayee(payee)">
            </cell>
          </div>
          <cell
            v-else
            :title="payeeGroup.display_name"
            :inline-desc="payeeGroup.client_description"
            :key="payeeGroupIndex"
            @click.native="selectPayee(payeeGroup.detail[0]); toggleGroup(payeeGroup);">
            <div slot="icon" class="payee-icon" :style="{'background-image': `url(${payeeGroup.icon})`}"></div>
          </cell>
        </template>
      </group>
      <group v-else title="请选择支付方式" v-show="$route.path==='/my/deposit'" class="skeletons">
        <div class="row" v-for="i in 3" :key="i">
          <div class="icon">
            <rowSkeleton color="#ddd" height="100%" style="border-radius: 50%"></rowSkeleton>
          </div>
          <div class="bar">
            <rowSkeleton color="#eee" height="18px" :seperatePoints="[skeletonBar[i - 1], 100]" highlight="#fff"></rowSkeleton>
          </div>
        </div>
      </group>

      <router-view v-if="selectedPayee" :payee="selectedPayee"></router-view>
    </div>
    <div v-else class="unregistered-box">
      <div class="unregistered-img"></div>
      <div class="unregistered-text">需先注册才能充值</div>
      <div class="unregistered-button">
        <x-button type="primary" @click.native="$router.push('/register')">
          立即注册
        </x-button>
      </div>
    </div>
    <div v-transfer-dom>
      <x-dialog
        :show.sync="showDialog"
        :hide-on-blur="true"
        @on-hide="selectedPayee = null"
        :dialog-style="dialogStyle">
        <div class="dialog-title">{{selectedGroup&&selectedGroup.display_name}}充值</div>
        <div class="close-btn" @click="showDialog = false"></div>
        <form
          v-show="$route.path==='/my/deposit'"
          @submit="submit"
          :action="paymentUrl"
          method="post"
          :target="isAllowNewPaymentWindow === 'true' ?'_blank':'_self'"
          ref="paymentform">
          <input type="hidden" name="payment_gateway" :value="currentPay.gateway_id" />
          <input type="hidden" name="payment_type" :value="currentPay.type_id" />
          <input type="hidden" name="payee" :value="currentPay.payee_id" />
          <input type="hidden" name="mobile" value="true" />
          <input type="hidden" name="token" :value="currentPay.token" />
          <input type="hidden" name="notify_page" :value="currentPay.notifyPage" />
          <div :class="['amount-box', {warn: warnMessage}]">
            <label class="amount-field">
              <span class="amount-field-text">存款金额</span>
              <input class="amount-field-input" type="text" name="amount" v-model="currentPay.amount" @input="inputAmountEvt">
              <span class="amount-icon">¥</span>
            </label>
            <div class="hint">{{warnMessage||limitHint}}</div>
            <flexbox :gutter="0" wrap="wrap" class="amount-btns">
              <flexbox-item :span="1/4" v-for="amount in rechargeAmount" :key="amount">
                <x-button class="btn" mini action-type="button" @click.native="addAmount(amount)">¥{{amount}}</x-button>
              </flexbox-item>
            </flexbox>
          </div>
          <x-button type="primary" :disabled="!currentPay.amount||!!warnMessage">
            <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
            <span v-else>充值</span>
          </x-button>
        </form>
      </x-dialog>
    </div>
  </div>
</template>

<script>
import { ButtonTab, ButtonTabItem, XButton, Radio, Cell, Group, XInput, GroupTitle, TransferDom, XDialog, Flexbox, FlexboxItem } from 'vux'
import { getOnlinepayees, getRemitPayees } from '../../api'
import { validateDepositAmount } from '../../utils'
import { mapState } from 'vuex'
import urls from '../../api/urls'
import rowSkeleton from '../../components/skeletonPattern/rowSkeleton'

export default {
  name: 'Deposit',
  data () {
    const dialogStyle = {
      'box-sizing': 'border-box',
      'padding': '12px 20px',
      'text-align': 'left',
      'width': '90vw',
      'max-width': '90vw'
    }
    return {
      payees: [],
      loading: false,
      selectedPayee: null,
      selectedGroup: null,
      paymentUrl: urls.payment,
      currentPay: {
        'type_id': '',
        'payee_id': '',
        'gateway_id': '',
        'amount': '',
        'token': '',
        'notifyPage': window.location.href.replace(this.$route.path, '/depositSuccess/')
      },
      inputErrors: [],
      warnMessage: '',
      showDialog: false,
      dialogStyle,
      skeletonBar: [35, 30, 40, 20, 25],
      rechargeAmount: [100, 200, 300, 500, 1000, 5000, 10000, 20000]
    }
  },
  components: {
    ButtonTab,
    ButtonTabItem,
    XButton,
    Radio,
    Cell,
    Group,
    XInput,
    GroupTitle,
    XDialog,
    rowSkeleton,
    Flexbox,
    FlexboxItem
  },
  directives: {
    TransferDom
  },
  computed: {
    ...mapState([
      'user'
    ]),
    isAllowNewPaymentWindow () {
      return this.$store.state.systemConfig.isAllowNewPaymentWindow
    },
    onlineLimit () {
      if (!this.selectedPayee || !this.user.account_type) {
        return null
      } else if (this.selectedPayee.online_limit) {
        return this.selectedPayee.online_limit
      } else {
        return this.$store.state.user.level.remit_limit
      }
    },
    limitHint () {
      if (!this.selectedPayee || !this.user.account_type) {
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
  created () {
    if (this.$route.path !== '/my/deposit') {
      this.$router.replace({path: '/my/deposit'})
    }
    Promise.all([getOnlinepayees(), getRemitPayees()].map(r => r.catch(e => e)))
      .then(resArr => {
        const onlinePayees = []
        const bankRemit = []
        const alipayRemit = []
        const wexinRemit = []
        resArr.forEach(responses => {
          if (responses && !responses.toString().startsWith('Error')) {
            responses.forEach((res, index) => {
              if (!res.remit_type) {
                res.remit_type = { // make consistent
                  id: undefined
                }
              }
              switch (res.remit_type.id) {
                case 1:
                  res.display_name = res.bank.name
                  bankRemit.push(res)
                  break
                case 2:
                  res.display_name = '微信'
                  wexinRemit.push(res)
                  break
                case 3:
                  res.display_name = '支付宝'
                  alipayRemit.push(res)
                  break
                default:
                  if (res.detail && res.detail.length > 0) {
                    res.detail.sort((a, b) => {
                      return a.rank - b.rank
                    })
                    res.detail.forEach(item => {
                      item.selected = false
                    })
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
          payees.push({display_name: '银行转帐', detail: bankRemit, folded: true, icon: require('../../assets/transfer.svg'), client_description: '线下入款，您的首选'})
        }
        if (wexinRemit.length > 0) {
          payees.push({display_name: '微信转帐', detail: wexinRemit, folded: true, icon: require('../../assets/wechat.svg'), client_description: '微信在线支付'})
        }
        if (alipayRemit.length > 0) {
          payees.push({display_name: '支付宝转帐', detail: alipayRemit, folded: true, icon: require('../../assets/alipay.svg'), client_description: '支付宝在线支付'})
        }
        if (payees.length !== 0) {
          this.payees = payees
        }
      })
  },
  methods: {
    toggleGroup (group) {
      if (!this.selectedGroup || this.selectedGroup !== group) {
        this.selectedGroup = group
      }
      group.folded = !group.folded
    },
    selectPayee (payee) {
      this.selectedPayee = payee
      if (this.currentPay.amount) {
        this.validateAmount(this.currentPay.amount)
      }
      if (payee.remit_type && payee.remit_type.id) {
        switch (payee.remit_type.id) {
          case 1:
            this.$router.push({path: '/my/deposit/remit/bank'})
            break
          case 2:
            this.$router.push({path: '/my/deposit/remit/wechat'})
            break
          case 3:
            this.$router.push({path: '/my/deposit/remit/alipay'})
            break
        }
      } else {
        this.showDialog = true
        this.currentPay = Object.assign({}, this.currentPay,
          {
            'type_id': payee.payment_type,
            'payee_id': payee.payee_id,
            'gateway_id': payee.gateway_id,
            'token': this.$cookie.get('access_token')
          })
      }
    },
    formatPayees (payees) {
      let arr = payees.filter(function (item, index, arr) {
        return item.detail.length
      })
      return arr
    },
    inputAmount (val) {
      if (!val) {
        this.currentPay.amount = ''
      }
      if (val && !validateDepositAmount(val)) {
        this.$nextTick(() => {
          this.currentPay.amount = val.slice(0, -1)
          this.validateAmount(this.currentPay.amount)
        })
      }
    },
    inputAmountEvt (evt) {
      let value = evt.target.value
      let formatted = !value ? '' : value.replace(/^[0]|[^0-9]/g, '')
      this.$nextTick(() => {
        this.currentPay.amount = formatted
        this.validateAmount(formatted)
      })
    },
    validateAmount (value) {
      if (value === '') {
        this.warnMessage = ''
        return
      }
      let amount = parseFloat(value)
      let meetLower = !this.onlineLimit.lower || amount >= parseFloat(this.onlineLimit.lower)
      let meetUpper = !this.onlineLimit.upper || amount <= parseFloat(this.onlineLimit.upper)
      if (!meetLower) {
        this.warnMessage = '必须大于最小存款金额'
      } else if (!meetUpper) {
        this.warnMessage = '必须小于最大存款金额'
      } else {
        this.warnMessage = ''
      }
    },
    addAmount (amount) {
      this.currentPay.amount = amount
    },
    submit (e) {
      if (!this.warnMessage) {
        window.gtag('event', '充值', {'event_category': '在線支付', 'event_label': this.selectedGroup.display_name})

        let token = this.$cookie.get('access_token')
        if (!token) {
          let next = '/login?next=' + this.$route.fullPath
          this.$router.push(next)
        }
        this.$store.dispatch('setCustomTitle', '充值')
        this.$router.push({path: '/my/deposit/submit_success'})
      } else {
        e.preventDefault()
      }
    }
  }
}
</script>
<style lang="less" scoped>
.payment-types {

  /deep/ .weui-cells {
    font-size: 16px;
    line-height: 1.2;
    > .weui-cell {
      padding: 5px 16px;
      color: #333;
    }
  }
  /deep/ .weui-cell {
    .vux-label-desc {
      font-size: 12px;
      color: #999;
      font-weight: lighter;
    }
    &.title{
      padding: 5px 16px;
      &.selected .vux-label-desc {
        color:  #f90;
      }
    }
  }
  .weui-cell.selected {
    /deep/ .vux-label {
      color: #f90;
    }
  }

  .sub-group {
    width: 100%;
    position: relative;

    .option {
      margin-left: 41px;
      font-size: 14px;
    }
    &::before {
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
    &.folded {
      .option {
        display: none;
      }
    }
  }
}
.dialog-title {
  height: 25px;
  line-height: 25px;
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
}
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  &::before,&::after{
    background-color: #999;
  }
}
.amount-box {
  width: 100%;
  color: #333;
  .amount-field {
    display: block;
    position: relative;
    width: 100%;
    .amount-field-text {
      height: 20px;
      line-height: 20px;
      color: #666;
    }
    .amount-field-input {
      outline: none;
      border: none;
      background: none;
      border-radius: 0;
      box-shadow: none;
      display: block;
      width: 100%;
      height: 43px;
      padding-left: 20px;
      font-size: 36px;
    }
    &::after {
      content: " ";
        position: absolute;
        right: 0;
        left: 0;
        bottom: 0;
        height: 2px;
        color: #ddd;
        border-bottom: 2px solid #ddd;
        transform-origin: 0 100%;
        transform: scaleY(.5)
    }
    .amount-icon {
      position: absolute;
      bottom: 0;
      left: 0;
      font-size: 28px;
    }
  }
  .hint {
    height: 24px;
    line-height: 24px;
    font-size: 12px;
    color: #999;
    font-weight: lighter;
    margin-bottom: 10px;
  }
  .amount-btns {
    margin-bottom: 10px;
    .btn {
      width: 95%;
      padding: 5px 1px;
      margin-bottom: 5px;
      font-size: 14px;
    }
  }
  &.warn {
    color: @red;
    .amount-field {
      &::after{
        color: @red;
        border-color: @red;
      }
      .amount-field-input{
        color: @red;
      }
    }
    .hint{
      color: @red;
    }
  }
}
.unregistered-box {
  box-sizing: border-box;
  padding: 20px 30px 0 30px;
  .unregistered-img {
    width: 100%;
    height: 200px;
    background: url('../../assets/unregistered.png') no-repeat;
    background-size: contain;
    background-position: center center;
  }
  .unregistered-text {
    width: 100%;
    height: 60px;
    line-height: 60px;
    color: #666;
    font-size: 14px;
    text-align: center;
  }
  @media screen and (min-width: 321px) {
    .unregistered-button {
      position: absolute;
      bottom: 100px;
      left: 30px;
      right: 30px;
    }
  }
}
.payee-icon {
  margin-right: 8px;
  width: 32px;
  height: 32px;
  background-repeat: no-repeat;
  background-size: contain;
}

.skeletons {
  .row {
    box-sizing: border-box;
    width: 100%;
    height: 42px;
    padding: 5px 16px;
    border-bottom: 1px solid #ddd;
  }

  .icon, .bar {
    display: inline-block;
    vertical-align: middle;
  }

  .icon {
    width: 32px;
    height: 32px;
  }

  .bar {
    width: 50%;
  }
}
</style>
