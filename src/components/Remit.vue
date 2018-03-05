<template>
  <div>
    <div v-if="remitpayees.length">
      <tab :line-width="2">
        <tab-item v-for="(p,idx) in remitpayees" :key="idx" :selected="remit.remit_info.remit_payee === p.id" @click.native="togglePayee(p)">{{payeeName(p)}}</tab-item>
      </tab>

      <div class="qr-code" v-if="activePayee.remit_type !== 1">
        <img :src="activePayee.qr_code">
        <div class="scan-tip text-muted">填写入款信息请前请先截屏并用{{payeeName(activePayee)}}扫描进行充值</div>
      </div>

      <group label-width="'100px'" v-else :title="$t('remit.bank_remit_title')">
        <div v-if="activePayee.remit_type === 1">
          <cell :title="$t('remit.bank_account')" :value="activePayee.account"></cell>
          <cell :title="$t('remit.bank_name')" :value="activePayee.bank.name"></cell>
          <cell :title="$t('remit.payee_name')" :value="activePayee.payee_name"></cell>
          <cell :title="$t('remit.bank_address')" :value="activePayee.address"></cell>
        </div>
      </group>

      <group label-width="'100px'" :title="limitHint" >
        <div v-if="inputErrors.length">
          <ul class="input-errors">
            <li class="text" v-for="(error, index) in inputErrors" :key="index">
              {{error}}
            </li>
          </ul>
        </div>
        <x-input
          autocapitalize="off"
          :title="$t('my.depositor')"
          required
          type="text"
          ref="depositor"
          @on-blur="validateErrors"
          v-model="remit.remit_info.depositor">
        </x-input>
        <datetime
          :title="$t('my.deposited_at')"
          :end-date="endDate"
          v-model="remit.remit_info.deposited_at"
          format="YYYY-MM-DD HH:mm"
          :confirm-text="$t('my.ok')"
          :placeholder="$t('my.select')"
          :class="['fix-arrow', {warn:datetimeValidator.firstError}]"
          @on-hide="datetimeValidator.validate"
          @on-change="datetimeValidator.validate"
          ref="datetime"
          :cancel-text="$t('my.cancel')">
        </datetime>
        <x-input
          autocapitalize="off"
          :title="$t('my.amount')"
          required
          type="number"
          keyboard="number"
          ref="amount"
          @on-blur="validateErrors"
          @on-change="validateErrors"
          :is-type="amountValidator"
          v-model="remit.amount">
        </x-input>
        <x-textarea
          autocapitalize="off"
          :title="$t('my.memo')"
          :placeholder="$t('my.memo_tip')"
          type="text"
          :rows="1"
          v-model="remit.memo">
        </x-textarea>
      </group>

      <div class="vux-group-tip text-danger">{{errorMsg}}</div>
      <div class="m-a" v-if="!remitSuccess">
        <x-button type="primary" @click.native="submit">
          <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
          <span v-else>{{$t('deposit.process')}}</span>
        </x-button>
      </div>
      <div class="m-a" v-else>
        <div class="vux-group-tip text-success m-b">{{$t('remit.remit_success')}}</div>
        <x-button type="primary" @click.native="remitSuccess=false">继续充值</x-button>
        <x-button @click.native="$router.push('/fin/payment_record')">查看充值记录</x-button>
      </div>

    </div>

    <div class="vux-group-tip  errormsg" v-else>
      <div class="loading text-center m-t" v-if="responseLoading"><i class='fa fa-spinner '></i> 正在加载中...</div>
      <span v-else class="text-danger">{{$t('remit.noremitpayee')}}</span>
    </div>
  </div>
</template>

<script>
  import {
    Tab,
    TabItem,
    Group,
    XInput,
    XTextarea,
    XButton,
    XImg,
    Datetime,
    Spinner,
    Flexbox,
    FlexboxItem,
    Cell
  } from 'vux'
  import moment from 'moment'
  import { getRemitPayees, postRemit } from '../api'
  export default {
    data () {
      return {
        loading: false,
        remit: {
          remit_info: {
            remit_payee: '',
            depositor: '',
            deposited_at: ''
          },
          memo: '',
          amount: ''
        },
        endDate: moment(new Date()).format('YYYY-MM-DD'),
        limit: this.$store.state.user.level.remit_limit,
        remitpayees: [],
        activePayee: '',
        isPayeeAvailable: true,
        errorMsg: '',
        remitSuccess: false,
        responseLoading: true,
        inputErrors: [],
        datetimeValidator: {
          firstError: '',
          validate: () => {
            let validator = this.datetimeValidator
            if (!this.remit.remit_info.deposited_at) {
              validator.firstError = validator.msg
            } else {
              validator.firstError = ''
            }
            this.validateErrors()
          },
          reset: () => {
            this.remit.remit_info.deposited_at = ''
            this.datetimeValidator.firstError = ''
          },
          msg: '必须输入存款日期'
        }
      }
    },
    computed: {
      limitHint () {
        let lower = this.limit.lower
        let upper = this.limit.upper
        let lowerHint = lower ? (this.$t('message.min') + ' ￥' + lower) : ''
        let comma = (lower && upper ? ', ' : '')
        let upperHint = upper ? (this.$t('message.max') + ' ￥' + upper) : ''
        return lowerHint + comma + upperHint
      }
    },
    created () {
      getRemitPayees()
        .then(response => {
          this.remitpayees = response
          this.responseLoading = false
          this.togglePayee(this.remitpayees[0])
        })
    },
    components: {
      Group,
      XInput,
      XButton,
      Datetime,
      Spinner,
      XTextarea,
      Tab,
      TabItem,
      XImg,
      Flexbox,
      FlexboxItem,
      Cell
    },
    methods: {
      validateErrors () {
        const inputErrors = []
        if (this.$refs.amount.firstError) {
          if (this.$refs.amount.firstError === '必填哦') {
            inputErrors.push('必须输入金额')
          } else {
            inputErrors.push(this.$refs.amount.firstError)
          }
        }
        if (this.$refs.depositor.firstError) {
          inputErrors.push('必须输入存款人')
        }
        if (this.datetimeValidator.firstError) {
          inputErrors.push(this.datetimeValidator.firstError)
        }
        this.inputErrors = inputErrors
      },
      amountValidator (value) {
        let amount = parseInt(value)
        let meetLower = !this.limit.lower || amount >= parseInt(this.limit.lower)
        let meetUpper = !this.limit.upper || amount <= parseInt(this.limit.upper)
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
        let depositor = this.$refs.depositor
        depositor.validate()
        if (depositor.firstError) {
          depositor.forceShowError = true
        }
        this.datetimeValidator.validate()
        this.validateErrors()
        return depositor.valid && amount.valid && !this.datetimeValidator.firstError
      },
      payeeName (payee) {
        switch (payee.remit_type) {
          case 1:
            return payee.bank.name
          case 2:
            return '微信'
          case 3:
            return '支付宝'
        }
      },
      togglePayee (payee) {
        this.remit.remit_info.remit_payee = payee.id
        this.activePayee = payee
      },
      submit () {
        if (this.validateAll()) {
          this.errorMsg = ''
          this.loading = true
          postRemit(this.remit).then(response => {
            this.loading = false
            this.remitSuccess = true
            this.remit.remit_info.deposited_at = ''
            this.$refs.amount.reset()
            this.$refs.depositor.reset()
            this.remit.memo = ''
            this.$nextTick(() => {
              this.$refs.amount.firstError = ''
              this.$refs.depositor.firstError = ''
              this.datetimeValidator.reset()
              this.inputErrors = []
            })
          }, (response) => {
            this.loading = false
            this.errorMsg = response[0].replace(':', ',')
          })
        }
      }
    }
  }
</script>

<style scoped lang="less">

  .scan-tip {
    color: #999;
    margin: 5px 10px;
    font-size: 14px;
    text-align: center;
  }

  .remit-details {
    background-color: #fff;
    margin: 10px;
    text-align: center;
    padding: 5px;
  }

  .qr-code {
    margin: 10px auto 0;

    img {
      width: 150px;
      height: 150px;
      margin: auto;
      display: block;
      background: #ffffff;
    }

  }

  .errormsg span {
    margin: 10px 0;
    display: block;
  }

  .fix-arrow > .weui_cell_ft.with_arrow::after {
    content: " ";
    display: inline-block;
    transform: rotate(45deg) translateY(-50%);
    height: 6px;
    width: 6px;
    border-width: 2px 2px 0 0;
    border-color: #C8C8CD;
    border-style: solid;
    position: absolute;
    top: 50%;
    right: 15px;
  }

  .text-success {
    color: #4caf50;
  }

  .vux-group-tip, .vux-group-tip p {
    font-size: 14px;
    text-align: center;
    padding-top: .3em;
    padding-left: 10px;
    padding-right: 5px;
  }

  .vux-datetime.warn /deep/ p {
    color: #E64340;
  }
</style>
