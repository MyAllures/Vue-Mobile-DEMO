<template>
    <div>
        <group label-width="120px">
            <div v-if="inputErrors.length">
                <ul class="text-warning input-errors">
                    <li v-for="(error, index) in inputErrors" :key="index">{{error}}</li>
                </ul>
            </div>
            <x-input
            autocapitalize="off"
            autocomplete="new-password"
            :title="$t('change_password.w_old')"
            :show-clear="true"
            required
            type="password"
            ref="oldPassword"
            @on-blur="validateErrors"
            v-model="password.current_password">
            </x-input>
            <x-input
            autocapitalize="off"
            autocomplete="new-password"
            :title="$t('change_password.w_new')"
            :show-clear="true"
            required
            type="password"
            ref="newPassword"
            @on-change="validateErrors"
            @on-blur="validateErrors"
            v-model="password.new_password"
            :is-type="passwordValidator"
            :max="6">
            </x-input>
            <x-input
            autocapitalize="off"
            autocomplete="new-password"
            :title="$t('change_password.w_repeat')"
            :show-clear="true"
            type="password"
            ref="confirmPassword"
            :max="6"
            @on-blur="validateErrors"
            :class="!confirmWithdrawPasswordValidator.valid?'weui-cell_warn':''"
            v-model="password.repeat_password">
            </x-input>
        </group>
        <div class="text-center text-danger m-t">{{errorMsg}}</div>
        <div class="text-center text-success m-t" v-if="changed">{{$t('change_password.success')}}</div>
        <div class="m-a">
          <x-button type="primary" @click.native="submit">
              <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
              <span v-else>{{$t('profile.submit')}}</span>
          </x-button>
        </div>
    </div>
</template>
<script>
import { Group, Cell, XButton, XInput, Spinner } from 'vux'
import { changeWpassword } from '../../api'
import { msgFormatter, validateWithdrawPassword } from '../../utils'
export default {
  data () {
    return {
      errorMsg: '',
      loading: false,
      password: {
        current_password: '',
        repeat_password: '',
        new_password: ''
      },
      valid: false,
      inputErrors: [],
      changed: false,
      confirmWithdrawPasswordValidator: {
        valid: true
      }
    }
  },
  methods: {
    validateErrors () {
      const inputErrors = []
      if (this.$refs.oldPassword.firstError) {
        inputErrors.push('请輸入当前取款密码')
      }
      if (this.$refs.newPassword.firstError) {
        if (this.$refs.newPassword.firstError === '必填哦') {
          inputErrors.push('请输入新取款密码')
        } else {
          inputErrors.push(this.$refs.newPassword.firstError)
        }
      }
      this.$set(this.confirmWithdrawPasswordValidator, 'valid', !(this.password.repeat_password !== this.password.new_password))
      if (!this.confirmWithdrawPasswordValidator.valid) {
        inputErrors.push('两次输入密码不一致')
      }
      this.inputErrors = inputErrors
    },
    validateAll () {
      let newPassword = this.$refs.newPassword
      let oldPassword = this.$refs.oldPassword
      newPassword.validate()
      oldPassword.validate()
      if (newPassword.firstError) {
        newPassword.forceShowError = true
      }
      if (oldPassword.firstError) {
        oldPassword.forceShowError = true
      }
      this.validateErrors()
      return newPassword.valid && oldPassword.valid && this.confirmWithdrawPasswordValidator.valid
    },
    passwordValidator (value) {
      if (!validateWithdrawPassword(value)) {
        return {
          valid: false,
          msg: '请输入6位纯数字'
        }
      } else {
        return {
          valid: true
        }
      }
    },
    submit () {
      this.errorMsg = ''
      if (this.validateAll()) {
        this.loading = true
        changeWpassword(this.password).then((response) => {
          this.changed = true
          setTimeout(() => {
            this.$router.push({name: 'My'})
            this.loading = false
          }, 2000)
        }, (response) => {
          this.loading = false
          this.errorMsg = msgFormatter(response)
        })
      }
    }
  },
  components: {
    Group,
    Cell,
    XButton,
    XInput,
    Spinner
  }
}
</script>
<style lang="less" scoped>
.input-errors {
  font-size: 14px;
  margin-left: 10px;
  color: #ff9800;
  li {
    list-style: circle inside;
  }
}
.hidden {
  display: none;
  visibility: hidden;
}
</style>
