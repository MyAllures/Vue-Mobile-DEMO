<template>
  <div class="wrapper">
    <div class="wrapper stretch-layout" v-if="user && user.bank">
      <div>
        <p class="text title">收款银行资料</p>
        <div class="stamp-wrapper">
          <div class="stamp hasicon">
            <div class="item">
              <img src="../../assets/icon_bankcard.png" class="icon" alt="bank">
              <div class="item-title">{{$t('my.bank_account')}}</div>
              <div class="item-content bigger">{{user.bank.account}}</div>
            </div>
            <div class="item half">
              <div class="item-title">{{$t('my.bank_name')}}</div>
              <div class="item-content">{{user.bank.bank}}</div>
            </div>
            <div class="item half">
              <div class="item-title">{{$t('my.receiver')}}</div>
              <div class="item-content">{{user.real_name}}</div>
            </div>
          </div>
        </div>
        <p class="hint">{{limitHint + ', 当前余额：￥' + user.balance}}</p>
        <div class="form">
          <v-form :model="withdraw" :rules="rules" ref="form" @click.native="errorMsg = ''">
            <v-form-item required :label="$t('withdraw.amount')" prop="amount">
              <v-input
                autocapitalize="off"
                v-model="withdraw.amount"
                :filter="/^[0]|[^0-9]/g">
              </v-input>
            </v-form-item>
            <v-form-item required :label="$t('withdraw.password')" prop="withdraw_password">
              <v-input
                type="password"
                autocapitalize="off"
                autocomplete="new-password"
                v-model="withdraw.withdraw_password">
              </v-input>
            </v-form-item>
          </v-form>
        </div>
      </div>
      <div class="text-center m-b-lg">
        <div class="text-danger">{{errorMsg}}</div>
        <x-button class="submit-btn" type="primary" :disabled="!inputCompleted" @click.native="submit">
          <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
          <span v-else>{{$t('withdraw.submit')}}</span>
        </x-button>
      </div>
    </div>
    <div v-else class="text-center m-t-lg">
      <img src="../../assets/my/no_bankinfo.png" alt="尚未建立银行资讯" class="figure">
      <div class="figure-caption">
        <p class="sub">申请取款须先建立银行资讯</p>
      </div>
      <div class="set-bottom">
        <x-button class="submit-btn" type="primary" @click.native="createBank">
          <span>创建银行资讯</span>
        </x-button>
      </div>
    </div>
  </div>
</template>

<script>
  import VForm from '@/components/Form'
  import VFormItem from '@/components/FormItem'
  import VInput from '@/components/Input'
  import {Group, Cell, XButton, XInput, Spinner, Alert} from 'vux'
  import { postWithdraw } from '../../api'
  import { msgFormatter } from '../../utils'
  import { mapState } from 'vuex'
  export default {
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
      const wpasswordValidator = (rule, value, callback) => {
        if (value.length !== 6) {
          callback(new Error('取款密码必须是六位数字'))
        } else {
          callback()
        }
      }

      return {
        withdraw: {
          amount: undefined,
          withdraw_password: undefined
        },
        errorMsg: '',
        loading: false,
        show: false,
        rules: {
          amount: [{validator: amountValidator}],
          withdraw_password: [{validator: wpasswordValidator}]
        }
      }
    },
    computed: {
      ...mapState([
        'user',
        'systemConfig'
      ]),
      limit () {
        return this.user.level.withdraw_limit
      },
      limitHint () {
        let lower = this.limit.lower
        let upper = this.limit.upper
        let lowerHint = lower ? (this.$t('message.min') + '：￥' + lower) : ''
        let comma = (lower && upper ? ', ' : '')
        let upperHint = upper ? (this.$t('message.max') + ' ' + upper) : ''
        return lowerHint + comma + upperHint
      },
      inputCompleted () {
        return this.withdraw.amount !== '' && this.withdraw.withdraw_password !== ''
      }
    },
    mounted () {
      this.$root.loading = false
    },
    methods: {
      createBank () {
        this.$router.push({
          name: 'bankinfo',
          query: {
            next: 'withdraw'
          }
        })
      },
      submit () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true
            postWithdraw(this.withdraw)
              .then(response => {
                this.sendGaEvent({label: '我的帳號', category: '申請取款', action: '提交'})
                this.loading = false
                this.show = true
                this.$refs.form.resetFields()
                this.errorMsg = ''
                this.$router.push({name: 'WithdrawSuccess'})
                setTimeout(() => {
                  this.$store.dispatch('fetchUser')
                }, 2000)
              }, (error) => {
                this.loading = false
                this.errorMsg = msgFormatter(error)
              })
          } else {
            return false
          }
        })
      }
    },
    components: {
      Group,
      Cell,
      XButton,
      XInput,
      Spinner,
      Alert,
      VForm,
      VFormItem,
      VInput
    }
  }
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  overflow: auto;
}


.text {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
  margin-bottom: 10px;
}

.title {
  margin-left: 15px;
}

.form {
  margin-top: 10px;
}

.hint {
  margin-top: 15px;
  margin-left: 15px;
  font-size: 13px;
  color: #999;
}

.figure {
  width: 200px;
  height: 200px;
  &-caption {
    margin-top: 15px;
    .main {
      font-size: 16px;
      color: #333;
    }
    .sub {
      font-size: 14px;
      color: #666;
    }
  }
}

.submit-btn {
  width: 85%;
}
</style>
