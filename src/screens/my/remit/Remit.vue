<template>
  <div>
    <router-view :payee="payee" :limitHint="limitHint"></router-view>
    <div class="dot-title">
      <span class="dot"></span>
      请填入存款讯息
    </div>
    <v-form :model="remit" :rules="rules" ref="form" @click.native="errorMsg = ''">
      <v-form-item required :label="$t('my.depositor')" prop="remit_info.depositor">
        <v-input
          autocapitalize="off"
          v-model="remit.remit_info.depositor">
        </v-input>
      </v-form-item>
      <v-form-item required :label="$t('my.deposited_at')" prop="remit_info.deposited_at">
        <v-datetime
          :endDate="endDate"
          v-model="remit.remit_info.deposited_at"
          format="YYYY-MM-DD HH:mm">
        </v-datetime>
      </v-form-item>
      <v-form-item required :label="$t('my.amount')" prop="amount">
        <v-input
          autocapitalize="off"
          v-model="remit.amount"
          @input="inputAmount">
        </v-input>
      </v-form-item>
      <v-form-item :label="$t('my.memo')" prop="memo">
        <v-input
          type="textarea"
          autocapitalize="off"
          :rows="1"
          :placeholder="$t('my.memo_tip')"
          v-model="remit.memo">
        </v-input>
      </v-form-item>
    </v-form>
    <div class="submit-button">
      <div class="vux-group-tip text-danger">{{errorMsg}}</div>
      <x-button type="primary" :disabled="!inputCompleted" @click.native="submit">
        <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
        <span v-else>{{$t('action.submit')}}</span>
      </x-button>
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
    FlexboxItem
  } from 'vux'
  import { postRemit } from '@/api'
  import { msgFormatter, validateDepositAmount } from '@/utils'
  import VForm from '@/components/Form'
  import VFormItem from '@/components/FormItem'
  import VInput from '@/components/Input'
  import VDatetime from '@/components/Datetime'
  export default {
    props: {
      payee: {
        type: Object
      }
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
      VForm,
      VFormItem,
      VInput,
      VDatetime
    },
    data () {
      const amountValidator = (rule, value, callback) => {
        let amount = parseInt(value)
        let meetLower = !this.limit.lower || amount >= parseInt(this.limit.lower)
        let meetUpper = !this.limit.upper || amount <= parseInt(this.limit.upper)

        if (!meetLower) {
          callback(new Error('必须大于最小存款金额'))
        } else if (!meetUpper) {
          callback(new Error('必须小于最大存款金额'))
        } else {
          callback()
        }
      }
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
        endDate: this.$moment(new Date()).format('YYYY-MM-DD'),
        limit: this.$store.state.user.level.remit_limit,
        isPayeeAvailable: true,
        errorMsg: '',
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
        },
        rules: {
          amount: [{validator: amountValidator}]
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
      },
      inputCompleted () {
        return this.remit.remit_info.depositor !== '' && this.remit.remit_info.deposited_at !== '' && this.remit.amount !== ''
      }
    },
    created () {
      this.remit.remit_info.remit_payee = this.payee.id
    },
    methods: {
      inputAmount (val) {
        if (!val) {
          this.remit.amount = ''
        }
        if (val && !validateDepositAmount(val)) {
          this.$nextTick(() => {
            this.remit.amount = val.slice(0, -1)
          })
        }
      },
      submit () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.errorMsg = ''
            this.loading = true
            postRemit(this.remit).then(response => {
              let remitType = ''
              switch (this.payee.remit_type) {
                case 1:
                  remitType = '銀行'
                  break
                case 2:
                  remitType = '微信'
                  break
                case 3:
                  remitType = '支付宝'
                  break
                default:
                  remitType = ''
              }
              window.gtag('event', '充值', {'event_category': '線下匯款', 'event_label': remitType + '轉帳'})

              this.loading = false
              this.$refs.form.resetFields()
              this.$store.dispatch('setCustomTitle', remitType + '转帐')
              this.$router.push({path: '/my/deposit/submit_success'})
            }).catch((response) => {
              this.loading = false
              this.errorMsg = msgFormatter(response)
            })
          } else {
            return false
          }
        })
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

  .vux-group-tip {
    width: 100%;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    text-align: center;
  }
  .tab-selector {
    width: 100%;
    overflow-x: auto;
  }
  .submit-button {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 30px 40px 30px;
  }

  .vux-datetime {
    margin: 10px;
  }
</style>
