<template>
  <div>
    <form class="container" autocomplete="off" v-if="nowStep === 1">
    <group>
      <x-input
        required
        show-clear
        :is-type="checkValid.checkUser"
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
        ref="confirmation_password"
        autocomplete="off"
        :title="$t('misc.confirm_password')"
        label-width="100"
        v-model="user.confirmation_password">
      </x-input>
    </group>
    <div class="actions">
      <x-button type="primary"
                action-type ="button"
                :disabled="nextStepDisabled"
                @click.native="nowStep = 2">
                {{$t('misc.next_step')}}
      </x-button>
    </div>
  </form>

  <form class="container" autocomplete="off" v-else>
    <group>
      <x-input
        required
        show-clear
        is-type="china-name"
        ref="real_name"
        :title="$t('misc.real_name')"
        label-width="100"
        v-model="user.real_name">
      </x-input>
      <x-input
        required
        show-clear
        is-type="china-mobile"
        ref="phone"
        :title="$t('misc.phone')"
        label-width="100"
        v-model="user.phone">
      </x-input>
      <x-input
        required
        show-clear
        is-type="email"
        ref="email"
        autocomplete="off"
        :title="'email'"
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
        nowStep: 1,
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
        error: ''
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

<style scoped>
  .container {
    margin-top: 60px;
  }
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
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleY(0.5);
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
</style>
