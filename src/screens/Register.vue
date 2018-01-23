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
  </div>
</template>

<script>
  import { fetchCaptcha, checkUserName, register } from '../api'
  import { validateUserName, validatePassword, validateWithdrawPassword, msgFormatter } from '../utils'
  import { XInput, Group, XButton, Flexbox, FlexboxItem, Selector, Cell } from 'vux'

  export default {
    name: 'Register',
    data () {
      return {
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
      fetchCaptcha () {
        fetchCaptcha().then(res => {
          this.captcha_src = res.captcha_src
          this.user.verification_code_0 = res.captcha_val
        })
      },
      submitForm () {
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
        this.valid = valid && !!this.password.confirmation_password
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
      Cell
    }
  }
</script>

<style lang="less" scoped>
.error {
  color: #E64340;
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
</style>
