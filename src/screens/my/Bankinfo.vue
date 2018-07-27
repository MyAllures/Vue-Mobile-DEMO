<template>
  <div>
    <div v-if="!user.bank && systemConfig.regPresentAmount && systemConfig.needBankinfo" class="register-money">
      <p class="text">
        <img src="../../assets/icon_announcement.png" class="horn-icon"/>
        <span>添加银行卡信息即可领取注册彩金 {{systemConfig.regPresentAmount | currency('￥', 0)}}</span>
        <span @click="showInfo = true" class="more-points text-right fr">...</span>
      </p>
      <div>
        <alert v-model="showInfo" title="注意">
          <ul style="list-style: square inside; color: #999; text-align: left; line-height: 1.6;">
            <li>同一银行卡信息最多仅可领取一次</li>
            <li>同一 IP 最多仅可领取一次，请勿重复注册</li>
            <li>本平台保留对本次活动的全部解释权</li>
          </ul>
        </alert>
      </div>
    </div>
    <div v-if="!user.bank">
      <div class="form m-t">
        <v-form :model="member.bank" :rules="rules" ref="form" @click.native="errorMsg = ''">
          <v-form-item required :label="$t('profile.select_bank')" prop="bank">
            <v-input :type="'select'"
              :options="banks"
              @selectOption="selectOption">
            </v-input>
          </v-form-item>
          <v-form-item required :label="$t('profile.bank_province')" prop="province">
            <v-input
              autocapitalize="off"
              v-model="member.bank.province">
            </v-input>
          </v-form-item>
          <v-form-item required :label="$t('profile.bank_city')" prop="city">
            <v-input
              autocapitalize="off"
              v-model="member.bank.city">
            </v-input>
          </v-form-item>
          <v-form-item required :label="$t('profile.bank_account')" prop="account">
            <v-input
              autocapitalize="off"
              v-model="member.bank.account"
              :filter="/^[0]|[^0-9]/g">
            </v-input>
          </v-form-item>
        </v-form>
      </div>
      <div class="set-bottom">
        <p class="tip"> 提交後不可自行更改，如需更改请联系客服 </p>
        <div class="text-danger text-center" v-show="errorMsg">{{errorMsg}}</div>
        <x-button type="primary" :disabled="!inputCompleted" class="submit-btn" @click.native="submit">
          <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
          <span v-else>{{$t('profile.submit')}}</span>
        </x-button>
      </div>
    </div>

    <div v-else>
      <p class="tip">{{$t('profile.bankinfo_update_tip')}}</p>
      <div class="stamp-wrapper">
        <div class="stamp hasicon">
          <div class="item">
            <img src="../../assets/icon_bankcard.png" class="icon" alt="bank">
            <div class="item-title">{{$t('profile.bank_account')}}</div>
            <div class="item-content bigger">{{user.bank.account}}</div>
          </div>
          <div class="item">
            <div class="item-title">{{$t('profile.bank_name')}}</div>
            <div class="item-content">{{user.bank.bank}}</div>
          </div>
          <div class="item half">
            <div class="item-title">{{$t('profile.bank_province')}}</div>
            <div class="item-content">{{user.bank.province}}</div>
          </div>
          <div class="item half">
            <div class="item-title">{{$t('profile.bank_city')}}</div>
            <div class="item-content">{{user.bank.city}}</div>
          </div>
        </div>
      </div>
      <div class="set-bottom" v-if="systemConfig.customerServiceUrl">
        <a target="_blank" :href="systemConfig.customerServiceUrl" class="service-btn">
          <span>{{$t('misc.need_help')}}</span>
        </a>
      </div>
    </div>

  </div>
</template>
<script>
import { Cell, Group, XInput, XButton, Datetime, Selector, Spinner, XAddress, Alert, Icon } from 'vux'
import { fetchBank, addUserBank } from '../../api'
import { mapGetters } from 'vuex'
import { validateBankAccount, msgFormatter } from '../../utils'
import VForm from '@/components/Form'
import VFormItem from '@/components/FormItem'
import VInput from '@/components/Input'
export default {
  name: 'bankinfo',
  data () {
    const bankAccountValidator = (rule, value, callback) => {
      if (!validateBankAccount(value)) {
        callback(new Error('该帐号格式无效'))
      } else {
        callback()
      }
    }

    return {
      showInfo: false,
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
      inputErrors: [],
      valid: false,
      rules: {
        'account': [{validator: bankAccountValidator}]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    systemConfig () {
      return this.$store.state.systemConfig
    },
    inputCompleted () {
      return this.member.bank.bank !== '' &&
          this.member.bank.city !== '' &&
          this.member.bank.province !== '' &&
          this.member.bank.account !== ''
    }
  },
  created () {
    if (!this.user.bank) {
      this.fetchBank(true)
    } else {
      this.checkBankValue()
    }
  },
  methods: {
    selectOption (option) {
      this.member.bank.bank = option[0].value
    },
    inputAmount (val) {
      let formatted = !val ? '' : val.replace(/[^0-9]/g, '')
      this.$nextTick(() => {
        this.member.bank.account = formatted
      })
    },
    fetchBank (index) {
      fetchBank(true).then(response => {
        response.forEach(item => {
          this.banks.push({
            name: item.value,
            value: item.key + ''
          })
        })
        this.member.bank.bank = this.banks[0].value
      })
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!window.confirm(this.$t('profile.bankinfo_confirm'))) {
            return
          }
          this.loading = true
          addUserBank(this.user, this.member).then((response) => {
            this.loading = false
            this.$store.dispatch('fetchUser')
            setTimeout(() => {
              this.$router.push({name: 'My'})
            }, 2000)
          }).catch(errRes => {
            this.errorMsg = msgFormatter(errRes)
            this.loading = false
          })
        } else {
          return false
        }
      })
    },
    checkBankValue () {
      this.member.bank.bank = this.user.bank.bank.toString()
      this.member.bank.city = this.user.bank.city
      this.member.bank.province = this.user.bank.province
      this.member.bank.account = this.user.bank.account
    }
  },
  components: {
    Group,
    Cell,
    XInput,
    XButton,
    Datetime,
    Selector,
    Spinner,
    XAddress,
    Alert,
    Icon,
    VForm,
    VFormItem,
    VInput
  }
}
</script>
<style lang="less" scoped>
.register-money {
  width: 100%;
  height: 42px;
  line-height: 42px;
  background-color: #fce4bd;
  font-size: 14px;
  color: #bb7605;
}

.tip {
  font-size: 14px;
  color: #666;
  margin-top: 20px;
  margin-bottom: 10px;
}

.service-btn {
  display: inline-block;
  width: 85%;
  height: 40px;
  line-height: 40px;
  color: #fff;
  background-color: #166fd8;
  border-radius: 4px;
}

.horn-icon {
  display: inline-block;
  margin-left: 10px;
  vertical-align: middle;
}

.more-points {
  display: inline-block;
  padding-right: 10px;
}

.account-number {
  font-size: 22px;
}

.submit-btn {
  width: 85%;
}
</style>
