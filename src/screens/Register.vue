<template>
  <div>
    <form class="container" autocomplete="off">
    <group>
      <div v-if="!valid">
        <ul slot="after-title" class="input-errors">
          <li class="text" v-for="(error, index) in inputErrors" :key="index">
            {{error}}
          </li>
        </ul>
      </div>
      <x-input
        required
        show-clear
        :is-type="checkValid.checkUser"
        @on-change="validate"
        @on-blur="validate"
        ref="username"
        :placeholder="$t('validate.username_validate')"
        :title="$t('misc.username')"
        label-width="100"
        v-model="user.username">
      </x-input>
      <x-input
        required
        show-clear
        :is-type="checkValid.checkPassword"
        type="password"
        @on-change="validate"
        @on-blur="validate"
        ref="password"
        :placeholder="$t('validate.password_validate')"
        autocomplete="off"
        :title="$t('misc.password')"
        label-width="100"
        v-model="user.password">
      </x-input>
      <x-input
        required
        show-clear
        type="password"
        :is-type="checkValid.checkPasswordConfirmation"
        @on-change="validate"
        @on-blur="validate"
        ref="confirmation_password"
        autocomplete="off"
        :title="$t('misc.confirm_password')"
        label-width="100"
        v-model="user.confirmation_password">
      </x-input>
    </group>
  </form>

  <form class="container" autocomplete="off">
    <group>
      <x-input
        required
        show-clear
        is-type="china-name"
        @on-change="validate"
        @on-blur="validate"
        ref="real_name"
        :title="$t('misc.real_name')"
        label-width="100"
        v-model="user.real_name">
      </x-input>
      <x-input
        required
        show-clear
        is-type="china-mobile"
        @on-change="validate"
        @on-blur="validate"
        ref="phone"
        :title="$t('misc.phone')"
        label-width="100"
        v-model="user.phone">
      </x-input>
      <x-input
        required
        show-clear
        is-type="email"
        @on-change="validate"
        @on-blur="validate"
        ref="email"
        autocomplete="off"
        :title="'EMAIL'"
        label-width="100"
        v-model="user.email">
      </x-input>
      <div class="withdraw-password">
        <p class="m-b">{{$t('misc.withdraw_password')}}</p>
        <Flexbox :justify="'center'">
          <flexbox-item><selector v-model="rawWithdrawPassword[0]" :placeholder="''+withdrawPwdOptions[0]" :options="withdrawPwdOptions"></selector></flexbox-item>
          <flexbox-item><selector v-model="rawWithdrawPassword[1]" :placeholder="''+withdrawPwdOptions[1]" :options="withdrawPwdOptions"></selector></flexbox-item>
          <flexbox-item><selector v-model="rawWithdrawPassword[2]" :placeholder="''+withdrawPwdOptions[2]" :options="withdrawPwdOptions"></selector></flexbox-item>
          <flexbox-item><selector v-model="rawWithdrawPassword[3]" :placeholder="''+withdrawPwdOptions[3]" :options="withdrawPwdOptions"></selector></flexbox-item>
          <flexbox-item><selector v-model="rawWithdrawPassword[4]" :placeholder="''+withdrawPwdOptions[4]" :options="withdrawPwdOptions"></selector></flexbox-item>
          <flexbox-item><selector v-model="rawWithdrawPassword[5]" :placeholder="''+withdrawPwdOptions[5]" :options="withdrawPwdOptions"></selector></flexbox-item>
        </Flexbox>
      </div>
      <x-input
        required
        show-clear
        @on-change="validate"
        @on-blur="validate"
        ref="verification_code_1"
        autocomplete="off"
        :title="$t('misc.captcha')"
        label-width="100"
        v-model="user.verification_code_1">
        <img class="captcha" slot="right" :src="captcha_src" @click="fetchCaptcha"/>
      </x-input>
    </group>
    <div class="read-agreement m-t">
      <check-icon :value.sync="agreement.isAgree">
        我已阅读并完全同意
      </check-icon>
      <span class="link" @click="agreement.showAgreement= true">用户协议</span>
    </div>
    <div class="actions">
      <div v-if="error" class="error">{{error}}</div>
      <x-button type="primary"
                action-type ="button"
                :show-loading="false"
                :disabled="false"
                @click.native="submitForm">
                {{$t('misc.submit')}}
      </x-button>
    </div>
  </form>
  <div v-transfer-dom>
    <popup v-model="agreement.showAgreement" height="50%">
      <div class="agreement">
        <h3>用户协议</h3>
        </br>
        <p>01. 使用本公司网站的客户，请留意阁下所在的国家或居住地的相关法律规定，如有疑问应就相关问题，寻求当地法律意见。</p></br>
        <p>02. 若发生遭黑客入侵破坏行为或不可抗拒之灾害导致网站故障或资料损坏、资料丢失等情况，我们将以本公司之后备资料为最后处理依据；为确保各方利益，请各会员投注后打印资料。本公司不会接受没有打印资料的投诉。</p></br>
        <p>03. 为避免纠纷，各会员在投注之后，务必进入下注明细检查及打印资料。若发现任何异常，请立即与代理商联系查证，一切投注将以本公司资料库的资料为准，不得异议。如出现特殊网络情况或线路不稳定导致不能下注或下注失败。本公司概不负责。</p></br>
        <p>04. 开奖结果以官方公布的结果为准。</p></br>
        <p>05. 如遇到官方停止销售或者开奖结果不确定的情况，本公司将对相关注单进行无效处理，并且返还下注本金。</p></br>
        <p>06. 我们将竭力提供准确而可靠的开奖统计等资料，但并不保证资料绝对无误，统计资料只供参考，并非是对客户行为的指引，本公司也不接受关于统计数据产生错误而引起的相关投诉。</p></br>
        <p>07. 本公司拥有一切判决及注消任何涉嫌以非正常方式下注之权利，在进行更深入调查期间将停止发放与其有关之任何彩金。客户有责任确保自己的帐户及密码保密，如果客户怀疑自己的资料被盗用，应立即通知本公司，并须更改其个人详细资料。所有被盗用帐号之损失将由客户自行负责。</p></br>
        <p>管理层 敬啟</p>
        <hr>
        </br>
        <p>注册本站会员并使用本站任何服务即表示您完全同意此协议</p>
      </div>
    </popup>
    </div>
  </div>
</template>

<script>
  import { fetchCaptcha, checkUserName, register } from '../api'
  import { validateUserName, validatePassword, validateWithdrawPassword, msgFormatter } from '../utils'
  import { XInput, Group, XButton, Flexbox, FlexboxItem, Selector, Cell, Popup, CheckIcon, TransferDom } from 'vux'

export default {
    name: 'Register',
    data () {
      return {
        agreement: {
          isAgree: false,
          showAgreement: false
        },
        withdrawPwdOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        user: {
          username: '',
          password: '',
          confirmation_password: '',
          real_name: '',
          phone: '',
          email: '',
          withdraw_password: '',
          verification_code_0: '',
          verification_code_1: ''
        },
        rawWithdrawPassword: [],
        checkValid: {
          checkUser: (val) => {
            if (validateUserName(val)) {
              checkUserName(val).then(response => {
                this.usernameNotUsed = response.length > 0
              })
            }
            return {
              valid: this.usernameNotUsed > 0 && validateUserName(val),
              msg: !validateUserName(val) ? this.$t('validate.validate_error') : this.$t('validate.username_exist')
            }
          },
          checkPassword: (val) => {
            return {
              valid: this.user.confirmation_password ? validatePassword(val) && this.user.confirmation_password === val : validatePassword(val),
              msg: this.user.confirmation_password === val ? this.$t('validate.validate_error') : this.$t('validate.password_diff')
            }
          },
          checkPasswordConfirmation: (val) => {
            return {
              valid: this.user.password === val,
              msg: this.$t('validate.password_diff')
            }
          },
          checkWithdrawPassword: (val) => {
            return {
              valid: validateWithdrawPassword(val),
              msg: this.$t('validate.validate_error')
            }
          }
        },
        captcha_src: '',
        error: '',
        valid: true,
        inputErrors: []
      }
    },
    methods: {
      handleAgreementClick () {
        this.agreement.showAgreement = false
        this.agreement.isAgree = true
      },
      fetchCaptcha () {
        fetchCaptcha().then(res => {
          this.captcha_src = res.captcha_src
          this.user.verification_code_0 = res.captcha_val
        })
      },
      submitForm () {
        if (!this.agreement.isAgree) {
          this.valid = false
          this.error = '请阅读并同意用户协议'
          setTimeout(() => {
            this.error = ''
          }, 3000)
          return
        }

        register(this.user).then(result => {
          return this.$store.dispatch('login', {
            user: {
              username: this.user.username,
              password: this.user.password
            }
          })
        }).then(result => {
          this.$router.push({ name: 'Home' })
        }, errorMsg => {
          this.fetchCaptcha()
          this.error = msgFormatter(errorMsg)
        })
      },
      validate () {
        let valid = true
        let msg = []
        for (let x in this.$refs) {
          let input = this.$refs[x]
          valid = input.valid && valid
          if (input && input.touched) {
            let errors = input.errors
            let title = input.title
            let key = Object.keys(errors)[0]
            if (errors[key] && !input.valid) {
              if (errors[key].indexOf(title) === -1) {
                msg.push(title + errors[key])
              } else {
                msg.push(errors[key])
              }
            }
          }
        }
        this.inputErrors = msg
        this.valid = valid && !!this.password.confirmation_password && this.agreement.isAgree
      }
    },
    computed: {
      nextStepDisabled () {
        if (this.user.username && this.user.password && this.user.confirmation_password) {
          let usernameValid = this.$refs.username.valid
          let passwordValid = this.$refs.password.valid && this.$refs.confirmation_password.valid

          return !(usernameValid && passwordValid)
        } else {
          return true
        }
      }
    },
    watch: {
      'rawWithdrawPassword': function () {
        this.user.withdraw_password = this.rawWithdrawPassword.join('')
      }
    },
    created () {
      this.fetchCaptcha()
    },
    components: {
      XInput,
      Group,
      XButton,
      Flexbox,
      FlexboxItem,
      Selector,
      Cell,
      Popup,
      CheckIcon
    },
    directives: {
      TransferDom
    }
  }
</script>

<style lang="less" scoped>
.error {
  color: #ff9800;
  text-align: center;
  margin-bottom: 0.5em;
}
.actions {
  margin-top: 1em;
  padding: 0 1em;
}
.captcha {
  vertical-align: middle;
}
.withdraw-password {
  position: relative;
  padding: 10px 15px;
}
.withdraw-password:before {
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
.weui-cell_select /deep/ .weui-select {
  border: 1px solid #ddd;
  padding-right: 0;
}
.weui-cell_select /deep/ .weui-cell__bd:after {
  border-width: 0px 2px 2px 0;
  right: 8px;
  margin-top: -5px;
}
.weui-cell__hd /deep/ .weui-label {
  width: 80px;
}
.input-errors {
  font-size: 14px;
  margin-left: 10px;
  padding-top: 10px;
  padding-bottom: 10px;
  .text {
    list-style: circle inside;
    color: #ff9800;
  }
}

.read-agreement {
  padding-left: 1em;
  .link {
    color: @azul;
    text-decoration: underline;
    vertical-align: middle;
  }
}
.agreement {
  color: #4a4a4a;
  padding: 1em;
}
</style>
