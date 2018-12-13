<template>
  <div class="container">
    <div class="stretch-layout wrapper">
      <div class="form p-t-lg">
        <v-form :model="password" :rules="rules" ref="form" @click.native="errorMsg = ''">
           <v-form-item required :label="$t('change_password.w_old')" prop="current_password">
             <v-input type="password"
               autocapitalize="off"
               v-model="password.current_password">
             </v-input>
           </v-form-item>
           <v-form-item required :label="$t('change_password.w_new')" prop="new_password">
             <v-input type="password"
               autocapitalize="off"
               v-model="password.new_password">
             </v-input>
           </v-form-item>
           <v-form-item required :label="$t('change_password.w_repeat')" prop="repeat_password">
             <v-input type="password"
               autocapitalize="off"
               v-model="password.repeat_password">
             </v-input>
           </v-form-item>
        </v-form>
      </div>

      <div class="m-b-lg text-center">
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
import { changeWpassword } from '../../api'
import { msgFormatter, validateWithdrawPassword } from '../../utils'
import VForm from '@/components/Form'
import VFormItem from '@/components/FormItem'
import VInput from '@/components/Input'
export default {
  data () {
    const newPasswordValidator = (rule, value, callback) => {
      if (!validateWithdrawPassword(value)) {
        callback(new Error('请输入6位纯数字'))
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
        current_password: '',
        repeat_password: '',
        new_password: ''
      },
      valid: false,
      changed: false,
      confirmWithdrawPasswordValidator: {
        valid: true
      },
      rules: {
        new_password: [{validator: newPasswordValidator}],
        repeat_password: [{validator: repeatPasswordValidator}]
      }
    }
  },
  computed: {
    inputCompleted () {
      return this.password.current_password !== '' && this.password.repeat_password !== '' && this.password.new_password !== ''
    }
  },
  methods: {
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.errorMsg = ''
          this.loading = true
          changeWpassword(this.password).then((response) => {
            this.changed = true
            this.$refs.form.resetFields()
            setTimeout(() => {
              this.$router.push({name: 'My'})
              this.loading = false
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

.input-errors {
  font-size: 14px;
  margin-left: 10px;
  color: @orange;
  li {
    list-style: circle inside;
  }
}
.hidden {
  display: none;
  visibility: hidden;
}

.submit-btn {
  width: 85%;
}
</style>
