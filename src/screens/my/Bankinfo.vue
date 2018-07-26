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

    <group label-width="100px" :title="$t('profile.bankinfo_hint')" v-if="!user.bank">
      <div v-if="inputErrors.length">
        <ul slot="after-title" class="input-errors">
          <li class="text" v-for="(error, index) in inputErrors" :key="index">
            {{error}}
          </li>
        </ul>
      </div>
      <cell
        :title="$t('profile.select_bank')"
        is-link
        :border-intent="false"
        :arrow-direction="showBankOptions ? 'up' : 'down'"
        value-align="left"
        @click.native="showBankOptions = !showBankOptions">{{bankName}}</cell>
      <x-input
        autocapitalize="off"
        :title="$t('profile.bank_province')"
        type="text"
        ref="province"
        required
        @on-blur="validateErrors"
        v-model="member.bank.province" >
      </x-input>
      <x-input
        autocapitalize="off"
        :title="$t('profile.bank_city')"
        type="text"
        ref="city"
        required
        @on-blur="validateErrors"
        v-model="member.bank.city">
      </x-input>

      <x-input
      autocapitalize="off"
        :title="$t('profile.bank_account')"
        keyboard="number"
        ref="account"
        required
        @on-blur="validateErrors"
        @on-change="inputAmount"
        :is-type="bankAccountValidator"
        v-model="member.bank.account">
      </x-input>
    </group>

    <div v-else>
      <p class="tip">{{$t('profile.bankinfo_update_tip')}}</p>
      <div class="stamp-wrapper">
        <div class="stamp hasicon">
          <div class="item">
            <img src="../../assets/icon_bankcard.png" class="icon" alt="bank">
            <div class="item-title">{{$t('profile.bank_name')}}</div>
            <div class="item-content">{{user.bank.bank}}</div>
          </div>
          <div class="item">
            <div class="item-title">{{$t('profile.bank_province')}}</div>
            <div class="item-content">{{user.bank.province}}</div>
          </div>
          <div class="item half">
            <div class="item-title">{{$t('profile.bank_city')}}</div>
            <div class="item-content">{{user.bank.city}}</div>
          </div>
          <div class="item half">
            <div class="item-title">{{$t('profile.bank_account')}}</div>
            <div class="item-content">{{user.bank.account}}</div>
          </div>
        </div>
      </div>
      <div class="set-bottom" v-if="systemConfig.customerServiceUrl">
        <a target="_blank" :href="systemConfig.customerServiceUrl" class="service-btn">
          <span>{{$t('misc.need_help')}}</span>
        </a>
      </div>
    </div>



      <div class="text-danger text-center" v-show="errorMsg">{{errorMsg}}</div>
      <div class="m-a" v-if="!user.bank">
        <x-button type="primary" @click.native="submit">
          <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
          <span v-else>{{$t('profile.submit')}}</span>
        </x-button>
      </div>
      <x-address style="display: none"
        title="请选择"
        v-model="selectedBank"
        :list="banks"
        :show.sync="showBankOptions">
      </x-address>
  </div>
</template>
<script>
import { Cell, Group, XInput, XButton, Datetime, Selector, Spinner, XAddress, Alert, Icon } from 'vux'
import { fetchBank, addUserBank } from '../../api'
import { mapActions, mapGetters } from 'vuex'
import { validateBankAccount, msgFormatter } from '../../utils'
export default {
  name: 'bankinfo',
  data () {
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
      selectedBank: [],
      inputErrors: [],
      valid: false,
      showBankOptions: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    systemConfig () {
      return this.$store.state.systemConfig
    },
    bankName () {
      let currentBank = this.banks.find(item => {
        return item.value === this.selectedBank[0]
      })
      return currentBank ? currentBank.name : ''
    }
  },
  watch: {
    'selectedBank': function (selectedBank) {
      this.member.bank.bank = selectedBank[0]
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
    inputAmount (val) {
      let formatted = !val ? '' : val.replace(/[^0-9]/g, '')
      this.$nextTick(() => {
        this.member.bank.account = formatted
      })
    },
    validate () {
      let valid = true
      for (let x in this.$refs) {
        valid = this.$refs[x].valid && valid
      }
      this.valid = valid && !!this.member.bank.bank
    },
    validateErrors () {
      const inputErrors = []
      if (this.$refs.province.firstError) {
        inputErrors.push('请輸入省份')
      }
      if (this.$refs.city.firstError) {
        inputErrors.push('请輸入县市')
      }
      if (this.$refs.account.firstError) {
        if (this.$refs.account.firstError === '必填哦') {
          inputErrors.push('请輸入银行账号')
        } else {
          inputErrors.push(this.$refs.account.firstError)
        }
      }
      this.inputErrors = inputErrors
    },
    validateAll () {
      let valid = true
      for (let key in this.$refs) {
        let ref = this.$refs[key]
        ref.validate()
        if (ref.firstError) {
          ref.forceShowError = true
          valid = false
        }
      }
      this.validateErrors()
      return valid
    },
    ...mapActions([
      'fetchUser'
    ]),
    bankAccountValidator (value) {
      if (!validateBankAccount(value)) {
        return {
          valid: false,
          msg: '该帐号格式无效'
        }
      } else {
        return {
          valid: true
        }
      }
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
        this.selectedBank = [this.banks[0].value]
      })
    },
    submit () {
      if (this.validateAll()) {
        if (!window.confirm(this.$t('profile.bankinfo_confirm'))) {
          return
        }
        this.loading = true
        addUserBank(this.user, this.member).then((response) => {
          this.loading = false
          this.fetchUser({})
          this.$root.showToast = true
          this.$root.toastText = this.$t('profile.bank_sucess')
          setTimeout(() => {
            this.$router.push({name: 'My'})
          }, 2000)
        }).catch(errRes => {
          this.errorMsg = msgFormatter(errRes)
          this.loading = false
        })
      }
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
    Icon
  }
}
</script>
<style lang="less" scoped>
.text-muted {
  color: #999;
  display: block;
  width: 100%;
  height: 100;
  text-align: center;
}

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
</style>
