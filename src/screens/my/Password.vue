<template>
  <div>
    <group label-width="'120px'">
        <div v-if="inputErrors.length">
          <ul slot="after-title" class="text-warning input-errors">
            <li v-for="(error, index) in inputErrors" :key="index">{{error}}</li>
          </ul>
        </div>
        <x-input
          autocapitalize="off"
          :title="$t('change_password.old')"
          :show-clear="true"
          required
          type="password"
          ref="oldPassword"
          @on-blur="validateErrors"
          v-model="password.prev_password">
        </x-input>

        <x-input
          autocapitalize="off"
          :title="$t('change_password.new')"
          :show-clear="true"
          required
          type="password"
          ref="newPassword"
          :max="15"
          @on-change="validateErrors"
          @on-blur="validateErrors"
          :is-type="passwordValidator"
          v-model="password.new_password">
          </x-input>

        <x-input
          autocapitalize="off"
          :title="$t('change_password.repeat')"
          :show-clear="true"
          type="password"
          ref="confirmPassword"
          :max="15"
          @on-blur="validateErrors"
          :class="!confirmPasswordValidator.valid?'weui-cell_warn':''"
          v-model="password.repeat_password">
        </x-input>

    </group>
    <div class="text-center text-danger m-t">{{errorMsg}}</div>
    <div class="text-center text-success m-t" v-if="changed">{{$t('change_password.success')}}</div>
    <div class="m-a">
      <x-button type="primary" @click.native="submit">
        <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
        <span v-else>{{$t('action.submit')}}</span>
      </x-button>
    </div>
  </div>
</template>
<script>
import { Group, Cell, XButton, XInput, Spinner } from 'vux'
import { changePassword } from '../../api'
import { msgFormatter } from '../../utils'
import { validatePassword } from '../../validate'

export default {
  name: 'changepassword',
  data () {
    return {
      errorMsg: '',
      loading: false,
      password: {
        prev_password: '',
        repeat_password: '',
        new_password: ''
      },
      inputErrors: [],
      changed: false,
      confirmPasswordValidator: {
        valid: true
      }
    }
  },
  methods: {
    validateErrors () {
      const inputErrors = []
      if (this.$refs.oldPassword.firstError) {
        inputErrors.push('请輸入当前密码')
      }
      if (this.$refs.newPassword.firstError) {
        if (this.$refs.newPassword.firstError === '必填哦') {
          inputErrors.push('请输入新密码')
        } else {
          inputErrors.push(this.$refs.newPassword.firstError)
        }
      }
      this.$set(this.confirmPasswordValidator, 'valid', !(this.password.repeat_password !== this.password.new_password))
      if (!this.confirmPasswordValidator.valid) {
        inputErrors.push('确认输入密码不一致')
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
      return newPassword.valid && oldPassword.valid && this.confirmPasswordValidator.valid
    },
    passwordValidator (value) {
      if (!validatePassword(value)) {
        return {
          valid: false,
          msg: '请输入8~15字元，其中至少包含一大写字母及一数字'
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
        changePassword(this.password).then((response) => {
          this.changed = true
          setTimeout(() => {
            this.$router.push({name: 'Login'})
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
<style lang='less'>
.vux-group-tip {
  color: #ff9800;
  text-align: center;
}
.input-errors {
  font-size: 14px;
  margin-left: 10px;
  li {
    list-style: circle inside;
    color: #ff9800;
  }
  li:first-child {
    padding-top: 10px;
  }
  li:last-child {
    padding-bottom: 10px;
  }
}
</style>
