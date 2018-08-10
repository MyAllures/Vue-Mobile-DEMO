<template>
  <div>
    <div v-if="parseInt(systemConfig.regPresentAmount)" class="register-money-area">
      <icon class="volume-up" name="volume-up"></icon>
      <div class="register-money" v-if="!systemConfig.needBankinfo">
        现在注册立领{{systemConfig.regPresentAmount|currency('￥', 0)}}红包
      </div>
      <div v-else class="register-money">
        注册账号并填写银行信息即可领取 {{systemConfig.regPresentAmount | currency('￥', 0)}} 红包
        <div v-transfer-dom>
          <alert v-model="showInfo" title="注意">
            <ul style="list-style: square inside; color: #999; text-align: left; line-height: 1.6;">
              <li>登录后请到「我的」> 「取款银行卡」填写</li>
              <li>同一银行卡信息最多仅可领取一次</li>
              <li>同一 IP 最多仅可领取一次，请勿重复注册</li>
              <li>本平台保留对本次活动的全部解释权</li>
            </ul>
          </alert>
        </div>
      </div>
      <div v-if="systemConfig.needBankinfo" class="register-money-info" @click="showInfo = true">&#8230;</div>
    </div>
    <v-form :model="user" :rules="rules" ref="form" @click.native="error = ''">
      <v-form-item required :label="$t('misc.username')" prop="username">
        <v-input
          :placeholder="$t('validate.username_validate')"
          v-model="user.username">
        </v-input>
      </v-form-item>
      <v-form-item required :label="$t('misc.password')" prop="password">
        <v-input
          type="password"
          :placeholder="$t('validate.password_validate')"
          autocomplete="new-password"
          v-model="user.password">
        </v-input>
      </v-form-item>
      <v-form-item required :label="$t('misc.confirm_password')" prop="confirmation_password">
        <v-input
          type="password"
          placeholder="再次输入密码"
          autocomplete="new-password"
          v-model="user.confirmation_password">
        </v-input>
      </v-form-item>
      <v-form-item required :label="$t('misc.real_name')" prop="real_name">
        <v-input
          placeholder="用于取款"
          v-model="user.real_name">
        </v-input>
      </v-form-item>
      <v-form-item required :label="$t('misc.phone')" prop="phone">
        <v-input
          v-model="user.phone">
        </v-input>
      </v-form-item>
      <v-form-item v-if="smsValidationEnabled" required :label="$t('misc.captcha')" prop="phone">
        <v-input
          autocomplete="off"
          v-model="user.sms_code">
          <x-button
          class="sms-btn"
          slot="right"
          type="primary"
          mini
          action-type ="button"
          :disabled="!user.phone||SMSLoading||countdown!=='stop'"
          @click.native="sendSMSCode">{{countdown!=='stop'?`${countdown}s`:SMSText}}</x-button>
        </v-input>
      </v-form-item>
      <v-form-item required label="QQ" prop="qq">
        <v-input
          autocomplete="off"
          v-model="user.qq">
        </v-input>
      </v-form-item>
      <v-form-item required :label="$t('misc.withdraw_password')" prop="withdraw_password">
        <v-input
          type="password"
          autocomplete="new-password"
          placeholder="6位数字，用于取款"
          v-model="user.withdraw_password">
        </v-input>
      </v-form-item>
      <v-form-item v-if="!smsValidationEnabled" required :label="$t('misc.captcha')" prop="verification_code_1">
        <v-input
          autocomplete="off"
          v-model="user.verification_code_1">
          <img class="captcha" slot="right" :src="captcha_src" @click="fetchCaptcha" alt="captcha"/>
        </v-input>
      </v-form-item>
    </v-form>
    <div class="read-agreement m-t">
      <check-icon :value.sync="user.hasAgree">
        我已阅读并完全同意
      </check-icon>
      <span class="link" @click="agreement.showAgreement= true">用户协议</span>
    </div>
    <div class="actions">
      <div v-if="error" class="error text-center text-danger">{{error}}</div>
      <x-button type="primary"
                ref="submit"
                action-type ="button"
                :show-loading="loading"
                :disabled="!inputCompleted"
                @click.native="submitForm">
                注册
      </x-button>
    </div>
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
  import { XButton, Popup, CheckIcon, TransferDom, Alert } from 'vux'
  import VForm from '@/components/Form'
  import VFormItem from '@/components/FormItem'
  import VInput from '@/components/Input'
  import { mapState } from 'vuex'
  import Icon from 'vue-awesome/components/Icon'
  import 'vue-awesome/icons/volume-up'
export default {
    name: 'Register',
    components: {
      XButton,
      Popup,
      CheckIcon,
      Icon,
      Alert,
      VForm,
      VFormItem,
      VInput
    },
    directives: {
      TransferDom
    },
    data () {
      const usernameValidator = (rule, value, callback) => {
        if (!validateUserName(value)) {
          callback(new Error('请输入6~15位数字或字母'))
        } else {
          checkUserName(value).then(response => {
            if (response.length > 0) {
              callback()
            } else {
              callback(new Error('用户名已经存在'))
            }
          })
        }
      }
      const passwordValidator = (rule, value, callback) => {
        if (!validatePassword(value)) {
          callback(new Error('请输入6~15位数字或字母'))
        } else {
          callback()
        }
      }
      const repeatPasswordValidator = (rule, value, callback) => {
        if (value !== this.user.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }
      const withdrawPasswordValidator = (rule, value, callback) => {
        if (!validateWithdrawPassword(value)) {
          callback(new Error('请输入6位纯数字'))
        } else {
          callback()
        }
      }
      const qqValidator = (rule, value, callback) => {
        if (!validateQQ(value)) {
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
        rules: {
          username: [{validator: usernameValidator}],
          password: [{validator: passwordValidator}],
          confirmation_password: [{validator: repeatPasswordValidator}],
          withdraw_password: [{validator: withdrawPasswordValidator}],
          qq: [{validator: qqValidator}],
          phone: [{validator: phoneValidator}]
        },
        captcha_src: '',
        error: '',
        loading: false,
        SMSLoading: false,
        SMSText: '获取验证码',
        countdown: 'stop',
        countdownInterval: null
      }
    },
    computed: {
      ...mapState([
        'systemConfig'
      ]),
      smsValidationEnabled () {
        return this.systemConfig.smsValidationEnabled
      },
      requiredField () {
        const fields = ['username', 'password', 'confirmation_password', 'real_name', 'phone', 'qq', 'withdraw_password', 'hasAgree']
        if (this.smsValidationEnabled) {
          fields.push('sms_code')
        } else {
          fields.push('verification_code_1')
        }
        return fields
      },
      inputCompleted () {
        const user = this.user
        return this.requiredField.every((feild) => user[feild])
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
      fetchCaptcha () {
        if (this.smsValidationEnabled) { return }
        fetchCaptcha().then(res => {
          this.captcha_src = res.captcha_src
          this.user.verification_code_0 = res.captcha_val
        })
      },
      setCountdown () {
        this.countdown = 60
        this.countdownInterval = setInterval(() => {
          this.countdown--
          if (this.countdown <= 0) {
            clearInterval(this.countdownInterval)
            this.countdown = 'stop'
            this.SMSText = '重新获取'
          }
        }, 1000)
      },
      sendSMSCode () {
        if (this.SMSLoading) {
          return
        }
        this.$refs.form.validateField('phone', (msg) => {
          if (!msg) {
            this.SMSLoading = true
            sendSMSCode(this.user.phone).then(res => {
              this.SMSLoading = false
              let resMsg = msgFormatter(res)
              this.$vux.toast.show({
                text: resMsg,
                type: 'success'
              })
              this.setCountdown()
            }).catch(errorMsg => {
              this.SMSLoading = false
              let resMsg = msgFormatter(errorMsg)
              this.$vux.toast.show({
                text: resMsg,
                type: 'warn'
              })
            })
          }
        })
      },
      submitForm () {
        if (this.loading) {
          return
        }
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true
            const userInfo = {}
            Object.keys(this.user).forEach(key => {
              let value = this.user[key]
              if (value !== undefined && value !== '') {
                userInfo[key] = value
              }
            })
            register(userInfo).then(result => {
              window.gtag('event', '註冊', {'event_category': '會員註冊'})
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
          } else {
            return false
          }
        })
      }
    },
    beforeDestroy () {
      clearInterval(this.countdownInterval)
    }
  }
</script>

<style lang="less" scoped>
@import '../styles/vars.less';
.actions {
  margin-top: 1em;
  padding: 0 30px;
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
  color: #333;
  padding-left: 1em;
  .link {
    color: #4a90e2;
    vertical-align: middle;
  }
}
.agreement {
  color: #4a4a4a;
  padding: 1em;
}

.register-money-area {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 0 10px 12px;
  margin-bottom: 12px;
  background: #fce4bd;
  color: #bb7605;
  .volume-up {
    flex: 0 0 auto;
    margin-right: 4px;
    margin-top: 2px;
  }
  .register-money {
    flex: 1 1 auto;
    display: flex;
    width: 100%;
    text-align: left;
    font-size: 14px;
  }
  .register-money-info {
    flex: 0 0 auto;
    width: 53px;
    text-align:center;
  }
}



.sms-btn {
  height: 32px;
  border-radius: 4px;
  font-size: 14px;
}
</style>
