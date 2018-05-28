<template>
  <div>
    <form class="container" autocomplete="off">
    <div v-if="parseInt(systemConfig.regPresentAmount)">
      <div class="register-money" v-if="!systemConfig.needBankinfo">
        现在注册立领{{systemConfig.regPresentAmount|currency('￥', 0)}}红包
      </div>
      <div v-else class="register-money">
        注册账号并填写银行信息即可领取 {{systemConfig.regPresentAmount | currency('￥', 0)}} 红包
        <icon type="info" @click.native="showInfo=true"></icon>
        <div v-transfer-dom>
          <alert v-model="showInfo" title="注意">
            <ul style="list-style: square inside; color: #999; text-align: left; line-height: 1.6;">
              <li>登录后请到「我的」> 「取款账号」填写</li>
              <li>同一银行卡信息最多仅可领取一次</li>
              <li>同一 IP 最多仅可领取一次，请勿重复注册</li>
              <li>本平台保留对本次活动的全部解释权</li>
            </ul>
          </alert>
        </div>
      </div>
    </div>
    <group>
      <div v-if="showInputErrors.length">
        <ul slot="after-title" class="input-errors">
          <li class="text" v-for="(error, index) in showInputErrors" :key="index">
            {{error}}
          </li>
        </ul>
      </div>
      <x-input
        :class="{'weui-cell_warn': inputErrors['username']}"
        show-clear
        @on-blur="validate($event, 'username')"
        ref="username"
        :placeholder="$t('validate.username_validate')"
        :title="$t('misc.username')"
        label-width="100"
        :debounce="1000"
        v-model="user.username">
      </x-input>
      <x-input
        :class="{'weui-cell_warn': inputErrors['password']}"
        show-clear
        type="password"
        @on-blur="validate($event, 'password')"
        ref="password"
        :placeholder="$t('validate.password_validate')"
        autocomplete="off"
        :title="$t('misc.password')"
        label-width="100"
        v-model="user.password">
      </x-input>
      <x-input
        :class="{'weui-cell_warn': inputErrors['confirmation_password']}"
        show-clear
        type="password"
        @on-blur="validate($event, 'confirmation_password')"
        ref="confirmation_password"
        placeholder="再次输入密码"
        autocomplete="off"
        :title="$t('misc.confirm_password')"
        label-width="100"
        v-model="user.confirmation_password">
      </x-input>
      <x-input
        :class="{'weui-cell_warn': inputErrors['real_name']}"
        show-clear
        placeholder="用于取款"
        @on-blur="validate($event, 'real_name')"
        ref="real_name"
        :title="$t('misc.real_name')"
        label-width="100"
        v-model="user.real_name">
      </x-input>
      <x-input
        :class="{'weui-cell_warn': inputErrors['phone']}"
        show-clear
        @on-change="validate($event, 'phone')"
        ref="phone"
        :title="$t('misc.phone')"
        label-width="100"
        v-model="user.phone">
      </x-input>
       <x-input
        v-if="smsValidationEnabled"
        :class="{'weui-cell_warn': inputErrors['sms_code']}"
        show-clear
        @on-blur="validate($event, 'sms_code')"
        ref="sms_code"
        autocomplete="off"
        :title="$t('misc.captcha')"
        label-width="100"
        v-model="user.sms_code">
        <x-button
          slot="right"
          type="primary"
          mini
          action-type ="button"
          :disabled="!user.phone||!!inputErrors['phone']||SMSLoading"
          @click.native="sendSMSCode">发送验证码</x-button>
      </x-input>
      <x-input
        :class="{'weui-cell_warn': inputErrors['qq']}"
        show-clear
        @on-blur="validate($event, 'qq')"
        ref="qq"
        autocomplete="off"
        :title="'QQ'"
        label-width="100"
        v-model="user.qq">
      </x-input>
      <x-input
        :class="{'weui-cell_warn': inputErrors['withdraw_password']}"
        show-clear
        @on-blur="validate($event, 'withdraw_password')"
        autocomplete="off"
        type="password"
        :title="$t('misc.withdraw_password')"
        placeholder="6位数字，用于取款"
        label-width="100"
        v-model="user.withdraw_password">
      </x-input>
      <x-input
        v-if="!smsValidationEnabled"
        :class="{'weui-cell_warn': inputErrors['verification_code_1']}"
        show-clear
        @on-blur="validate($event, 'verification_code_1')"
        ref="verification_code_1"
        autocomplete="off"
        :title="$t('misc.captcha')"
        label-width="100"
        v-model="user.verification_code_1">
        <img class="captcha" slot="right" :src="captcha_src" @click="fetchCaptcha"/>
      </x-input>
    </group>
    <div class="read-agreement m-t">
      <check-icon :value.sync="user.hasAgree">
        我已阅读并完全同意
      </check-icon>
      <span class="link" @click="agreement.showAgreement= true">用户协议</span>
    </div>
    <div class="actions">
      <div v-if="error" class="error">{{error}}</div>
      <x-button type="primary"
                ref="submit"
                action-type ="button"
                :show-loading="loading"
                :disabled="false"
                @click.native="submitForm">
                注册
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
  import { fetchCaptcha, checkUserName, register, sendSMSCode } from '../api'
  import { validateUserName, validatePassword, validateWithdrawPassword, msgFormatter, validateQQ, validatePhone } from '../utils'
  import { XInput, Group, XButton, Flexbox,
    FlexboxItem, Selector, CellBox, Cell,
    Popup, CheckIcon, TransferDom,
    Icon, Alert } from 'vux'
  import { mapState } from 'vuex'
export default {
    name: 'Register',
    components: {
      XInput,
      Group,
      XButton,
      Flexbox,
      FlexboxItem,
      Selector,
      Cell,
      CellBox,
      Popup,
      CheckIcon,
      Icon,
      Alert
    },
    directives: {
      TransferDom
    },
    data () {
      const usernameValidator = (value, type) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            resolve('请输入用户名称')
          } else if (!validateUserName(value)) {
            resolve('请输入6~15位数字或字母')
          } else {
            checkUserName(value).then(response => {
              if (response.length > 0) {
                resolve('')
              } else {
                resolve('用户名已经存在')
              }
            })
          }
        })
      }
      const passwordValidator = (value) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            resolve('请输入密码')
          } else if (!validatePassword(value)) {
            resolve('请输入6~15位数字或字母')
          } else {
            resolve('')
          }
        })
      }
      const repeatPasswordValidator = (repeatValue, value) => {
        return new Promise((resolve, reject) => {
          if (value !== repeatValue) {
            resolve('两次输入密码不一致')
          } else {
            resolve('')
          }
        })
      }
      const withdrawPasswordValidator = (value) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            resolve('请输入取款密码')
          } else if (!validateWithdrawPassword(value)) {
            resolve('请输入6位纯数字')
          } else {
            resolve('')
          }
        })
      }
      const qqValidator = (value) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            resolve('请输入QQ')
          } else if (!validateQQ(value)) {
            resolve('QQ号码格式无效')
          } else {
            resolve('')
          }
        })
      }
      const phoneValidator = (value) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            resolve('请输入手机号码')
          } else if (!validatePhone(value)) {
            resolve('手机号码格式无效')
          } else {
            resolve('')
          }
        })
      }
      const realnameValidator = (value) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            resolve('请输入真实姓名')
          } else {
            resolve('')
          }
        })
      }
      const captchaValidator = (value) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            resolve('请输入验证码')
          } else {
            resolve('')
          }
        })
      }
      const agreementValidator = (value) => {
        return new Promise((resolve, reject) => {
          if (!value) {
            resolve('请阅读并同意用户协议')
          } else {
            resolve('')
          }
        })
      }
      return {
        showInfo: false,
        agreement: {
          showAgreement: false
        },
        user: {
          username: '',
          password: '',
          confirmation_password: '',
          real_name: '',
          phone: '',
          qq: '',
          withdraw_password: '',
          hasAgree: true,
          verification_code_0: '',
          verification_code_1: '',
          sms_code: ''
        },
        inputErrors: {
          username: '',
          password: '',
          confirmation_password: '',
          real_name: '',
          phone: '',
          qq: '',
          withdraw_password: '',
          hasAgree: '',
          verification_code_1: '',
          sms_code: ''
        },
        validators: {
          username: usernameValidator,
          password: passwordValidator,
          confirmation_password: repeatPasswordValidator,
          qq: qqValidator,
          withdraw_password: withdrawPasswordValidator,
          real_name: realnameValidator,
          phone: phoneValidator,
          hasAgree: agreementValidator,
          verification_code_1: captchaValidator,
          sms_code: captchaValidator
        },
        captcha_src: '',
        error: '',
        loading: false,
        SMSLoading: false
      }
    },
    computed: {
      ...mapState([
        'systemConfig'
      ]),
      nextStepDisabled () {
        if (this.user.username && this.user.password && this.user.confirmation_password) {
          let usernameValid = this.$refs.username.valid
          let passwordValid = this.$refs.password.valid && this.$refs.confirmation_password.valid

          return !(usernameValid && passwordValid)
        } else {
          return true
        }
      },
      showInputErrors () {
        const keys = Object.keys(this.inputErrors)
        const errors = []
        keys.forEach(key => {
          const msg = this.inputErrors[key]
          if (msg) {
            errors.push(msg)
          }
        })
        return errors
      },
      smsValidationEnabled () {
        return this.systemConfig.smsValidationEnabled
      }
    },
    watch: {
      'user.hasAgree': function (hasAgree) {
        this.validate(hasAgree, 'hasAgree')
      }
    },
    created () {
      this.fetchCaptcha()
    },
    methods: {
      validate (value, input) {
        let currentValue = value || this.user[input]
        if (input === 'confirmation_password') {
          this.validators['confirmation_password'](currentValue, this.user.password).then(msg => {
            this.inputErrors[input] = msg
          })
        } else {
          this.validators[input](currentValue).then(msg => {
            this.inputErrors[input] = msg
            if (input === 'password' && this.user.confirmation_password && this.user.password) {
              this.validate(this.user.confirmation_password, 'confirmation_password')
            }
          })
        }
      },
      validateAll () {
        const inputs = ['username', 'password', 'confirmation_password', 'real_name', 'phone', 'qq', 'withdraw_password', 'hasAgree', this.smsValidationEnabled ? 'sms_code' : 'verification_code_1']
        const validatePromises = inputs.map(input => {
          const currentValue = this.user[input]
          if (input === 'confirmation_password') {
            return this.validators['confirmation_password'](currentValue, this.user.password).then(msg => {
              this.inputErrors['confirmation_password'] = msg
              return msg
            })
          } else {
            return this.validators[input](currentValue).then(msg => {
              this.inputErrors[input] = msg
              return msg
            })
          }
        })
        return Promise.all(validatePromises)
      },
      fetchCaptcha () {
        if (this.smsValidationEnabled) { return }
        fetchCaptcha().then(res => {
          this.captcha_src = res.captcha_src
          this.user.verification_code_0 = res.captcha_val
        })
      },
      sendSMSCode () {
        if (this.SMSLoading) {
          return
        }
        this.SMSLoading = true
        sendSMSCode(this.user.phone).then(res => {
          this.SMSLoading = false
          this.error = res.msg
          this.$nextTick(() => {
            this.$refs.submit.$el.scrollIntoView(false)
          })
        }).catch(errorMsg => {
          this.SMSLoading = false
          this.error = msgFormatter(errorMsg)
          this.$nextTick(() => {
            this.$refs.submit.$el.scrollIntoView(false)
          })
        })
      },
      submitForm () {
        if (this.loading) {
          return
        }
        this.validateAll().then(msgs => {
          const isValid = msgs.filter(msg => { return msg }).length === 0
          if (isValid) {
            this.loading = true
            const userInfo = {}
            Object.keys(this.user).forEach(key => {
              let value = this.user[key]
              if (value !== undefined && value !== '') {
                userInfo[key] = value
              }
            })
            register(userInfo).then(result => {
              this.loading = false
              if (result.code === 9001) {
                this.error = result.msg
                this.$nextTick(() => {
                  this.$refs.submit.$el.scrollIntoView(false)
                })
              }

              return this.$store.dispatch('login', {
                user: {
                  username: this.user.username,
                  password: this.user.password
                }
              })
            }).catch(errorMsg => {
              this.loading = false
              this.fetchCaptcha()
              this.error = msgFormatter(errorMsg)
              throw new Error(this.error)
            }).then(result => {
              this.$router.push({ name: 'Home' })
              this.$store.dispatch('fetchUser')
              if (this.systemConfig.regPresentAmount && this.systemConfig.needBankinfo) {
                setTimeout(() => {
                  this.$root.bus.$emit('showFeatureGuide')
                }, 200)
              }
            }).catch(() => {})
          }
        })
      }
    }
  }
</script>

<style lang="less" scoped>
@import '../styles/vars.less';
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

.register-money {
  width: 100%;
  color: @red;
  text-align: center;
  margin-top: 15px;
}
</style>
