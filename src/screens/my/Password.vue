<template>
  <div class="container">
    <div class="stretch-layout wrapper">
      <div class="form p-t-lg ">
        <v-form :model="password" :rules="rules" ref="form" @click.native="errorMsg = ''">
           <v-form-item required :label="$t('change_password.old')" prop="prev_password">
             <v-input type="password"
               autocapitalize="off"
               v-model="password.prev_password">
             </v-input>
           </v-form-item>
           <v-form-item required :label="$t('change_password.new')" prop="new_password">
             <v-input type="password"
               autocapitalize="off"
               v-model="password.new_password">
             </v-input>
           </v-form-item>
           <v-form-item required :label="$t('change_password.repeat')" prop="repeat_password">
             <v-input type="password"
               autocapitalize="off"
               v-model="password.repeat_password">
             </v-input>
           </v-form-item>
        </v-form>
      </div>

      <div class="m-b-lg">
        <div class="text-center text-success m-t" v-if="changed">{{$t('change_password.success')}}</div>
        <div class="text-center text-danger m-t">{{errorMsg}}</div>
        <x-button type="primary" :disabled="!inputCompleted" class="submit-btn" @click.native="submit">
          <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
          <span v-else>{{$t('action.submit')}}</span>
        </x-button>
      </div>
    </div>
  </div>
</template>
<script>
import { Group, Cell, XButton, XInput, Spinner } from 'vux'
import { changePassword } from '../../api'
import { msgFormatter, validatePassword } from '../../utils'
import VForm from '@/components/Form'
import VFormItem from '@/components/FormItem'
import VInput from '@/components/Input'
export default {
  name: 'changepassword',
  data () {
    const newPasswordValidator = (rule, value, callback) => {
      if (!validatePassword(value)) {
        callback(new Error('请输入6~15位数字或字母'))
      } else {
        callback()
      }
    }
    const repeatPasswordValidator = (rule, value, callback) => {
      if (value !== this.password.new_password) {
        callback(new Error('确认密码必须相同'))
      } else {
        callback()
      }
    }

    return {
      errorMsg: '',
      loading: false,
      password: {
        prev_password: '',
        repeat_password: '',
        new_password: ''
      },
      changed: false,
      confirmPasswordValidator: {
        valid: true
      },
      rules: {
        new_password: [{validator: newPasswordValidator}],
        repeat_password: [{validator: repeatPasswordValidator}]
      }
    }
  },
  methods: {
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.errorMsg = ''
          this.loading = true
          changePassword(this.password).then((response) => {
            this.sendGaEvent({label: '我的帳號', category: '修改密碼', action: '提交'})
            this.changed = true
            this.$refs.form.resetFields()
            setTimeout(() => {
              this.$store.dispatch('logout').then(() => {
                this.$router.push({name: 'Login'})
                this.loading = false
              }).catch(() => {
                this.$store.dispatch('resetUser')
                this.$router.push({name: 'Login'})
                this.loading = false
              })
            }, 2000)
          }, (response) => {
            this.loading = false
            this.errorMsg = msgFormatter(response)
          })
        } else {
          return false
        }
      })
    }
  },
  computed: {
    inputCompleted () {
      return this.password.prev_password !== '' && this.password.repeat_password !== '' && this.password.new_password !== ''
    }
  },
  components: {
    Group,
    Cell,
    XButton,
    XInput,
    Spinner,
    VForm,
    VFormItem,
    VInput
  }
}
</script>
<style lang="less" scoped>
.container {
  height: 100%;
}

.wrapper {
  height: 100%;
}

.submit-btn {
  width: 85%;
}
</style>
