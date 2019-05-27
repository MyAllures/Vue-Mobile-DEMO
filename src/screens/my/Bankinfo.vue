<template>
  <div class="container">
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
    <div v-if="!user.bank" class="stretch-layout wrapper">
      <div class="form m-t">
        <v-form :model="member" :rules="rules" ref="form" @click.native="errorMsg = ''">
          <v-form-item required :label="$t('profile.select_bank')" prop="bank.bank">
            <v-input v-if="banks.length>0" :type="'select'"
              :options="banks"
              @selectOption="selectOption">
            </v-input>
          </v-form-item>
          <v-form-item required :label="$t('profile.bank_province')" prop="bank.province">
            <v-input
              autocapitalize="off"
              v-model="member.bank.province">
            </v-input>
          </v-form-item>
          <v-form-item required :label="$t('profile.bank_city')" prop="bank.city">
            <v-input
              autocapitalize="off"
              v-model="member.bank.city">
            </v-input>
          </v-form-item>
          <v-form-item required :label="$t('profile.bank_account')" prop="bank.account">
            <v-input
              autocapitalize="off"
              v-model="member.bank.account"
              :filter="/^[0]|[^0-9]/g">
            </v-input>
          </v-form-item>
          <template v-if="isPrimaryInfoEmpty">
            <div class="info-tip">须填写手机号码，用于取款申请核对</div>
            <v-form-item :label="$t('misc.phone')" prop="phone">
              <v-input
                v-model="member.phone">
              </v-input>
            </v-form-item>
            <v-form-item :label="$t('misc.wechat')" prop="wechat">
              <v-input
                v-model="member.wechat">
              </v-input>
            </v-form-item>
            <v-form-item :label="$t('misc.qq')" prop="qq">
              <v-input
                v-model="member.qq">
              </v-input>
            </v-form-item>
          </template>
        </v-form>
      </div>
      <div class="text-center m-b-lg">
        <p class="tip">提交後不可自行更改，如需更改请联系客服</p>
        <div class="text-danger text-center" v-show="errorMsg">{{errorMsg}}</div>
        <x-button type="primary" :disabled="!inputCompleted" class="submit-btn" @click.native="submit">
          <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
          <span v-else>{{$t('profile.submit')}}</span>
        </x-button>
      </div>
    </div>

    <div v-else>
      <p class="top-tip">{{$t('profile.bankinfo_update_tip')}}</p>
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
     <div class="set-bottom" v-if="systemConfig.serviceAction">
        <span @click="systemConfig.serviceAction()" class="service-btn">
          <span>{{$t('misc.need_help')}}</span>
        </span>
      </div>
    </div>

  </div>
</template>
<script>
import { Cell, Group, XInput, XButton, Selector, Spinner, XAddress, Alert, Icon } from 'vux'
import { fetchBank, addUserBank } from '../../api'
import { mapGetters } from 'vuex'
import { validateBankAccount, validateProvince, msgFormatter, validateQQ, validatePhone } from '../../utils'
import VForm from '@/components/Form'
import VFormItem from '@/components/FormItem'
import VInput from '@/components/Input'
export default {
  name: 'bankinfo',
  data () {
    const qqValidator = (rule, value, callback) => {
      if (value && !validateQQ(value)) {
        callback(new Error('QQ号码格式无效'))
      } else {
        callback()
      }
    }
    const phoneValidator = (rule, value, callback) => {
      if (!validatePhone(value)) {
        callback(new Error('手机号码格式无效'))
      } else {
        callback()
      }
    }
    const bankAccountValidator = (rule, value, callback) => {
      if (!validateBankAccount(value)) {
        callback(new Error('该帐号格式无效'))
      } else if (value.length > 20) {
        callback(new Error('银行帐号需为20位以内的数字'))
      } else {
        callback()
      }
    }
    const provinceValidator = (rule, value, callback) => {
      if (!validateProvince(value)) {
        callback(new Error('请输入中文字符'))
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
        },
        qq: '',
        phone: '',
        wechat: ''
      },
      inputErrors: [],
      valid: false,
      rules: {
        'bank.account': [{validator: bankAccountValidator}],
        'bank.province': [{validator: provinceValidator}],
        'bank.city': [{validator: provinceValidator}],
        qq: [{validator: qqValidator}],
        phone: [{validator: phoneValidator}]
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
      const bank = this.member.bank
      const member = this.member
      if (!this.isPrimaryInfoEmpty) {
        return bank.bank !== '' &&
          bank.city !== '' &&
          bank.province !== '' &&
          bank.account !== ''
      } else {
        return bank.bank !== '' &&
          bank.city !== '' &&
          bank.province !== '' &&
          bank.account !== '' &&
          member.phone !== ''
      }
    },
    isPrimaryInfoEmpty () {
      const user = this.user
      return !user.phone && !user.qq && (!user.wechat && user.wechat !== 0)
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
      this.member.bank.bank = option[0]
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
      })
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const _this = this
          _this.$vux.confirm.show({
            content: _this.$t('profile.bankinfo_confirm'),
            onConfirm () {
              _this.loading = true
              const sendData = {}
              Object.keys(_this.member).forEach(key => {
                let value = _this.member[key]
                if (value !== undefined && value !== '') {
                  sendData[key] = value
                }
              })
              addUserBank(_this.user, sendData).then((response) => {
                _this.loading = false
                _this.$store.dispatch('fetchUser')
                setTimeout(() => {
                  _this.$router.back()
                }, 2000)
              }).catch(errRes => {
                _this.errorMsg = msgFormatter(errRes)
                _this.loading = false
              })
            }
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

.top-tip {
  font-size: 14px;
  color: #666;
  margin-left: 15px;
  margin-top: 20px;
  margin-bottom: 10px;
}
.service-btn {
  display: inline-block;
  width: 85%;
  height: 40px;
  line-height: 40px;
  color: #fff;
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

.wrapper {
  height: 100%;
}

.container {
  height: calc(~"100%" - 45px);
}
.info-tip {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 21px 0 8px 22px;
  color: #666;
  background: #f0f0f0;
  font-size: 14px;
  &::before {
    position: absolute;
    left: 14px;
    font-size: 16px;
    content: '*';
    color: #d0021b;
  }
}
</style>
