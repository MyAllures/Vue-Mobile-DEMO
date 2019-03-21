<template>
  <div class="stretch-layout wrapper">
    <div>
      <div class="profile-section">
        <small class="profile-hint">
          如需修改真实姓名或手机号码请 <span v-if="$store.state.systemConfig.serviceAction" class="service-link" @click="$store.state.systemConfig.serviceAction()">联系客服</span>
        </small>
        <div class="profile-field">
           <p class="title">真实姓名</p>
           <p class="text">{{user.real_name}}</p>
        </div>
        <div class="profile-field" v-if="user.phone">
           <p class="title">手机号码</p>
           <p class="text">{{user.phone}}</p>
        </div>
      </div>
      <v-form :model="member" :rules="rules" ref="form" @click.native="response.msg = ''">
         <v-form-item v-if="!user.phone" :label="$t('misc.phone')" prop="phone">
          <v-input
            v-model="member.phone">
          </v-input>
        </v-form-item>
        <v-form-item :label="$t('misc.email')" prop="email">
          <v-input
            v-model="member.email">
          </v-input>
        </v-form-item>
        <v-form-item :label="$t('misc.wechat')" prop="wechat">
          <v-input
            v-model="member.wechat">
          </v-input>
        </v-form-item>
        <v-form-item :label="$t('misc.qq')" prop="qq">
          <v-input
            v-model="member.qq">
          </v-input>
        </v-form-item>
      </v-form>
    </div>

    <div class="m-b-lg">
      <div :class="['text-center', 'm-t', response.success? 'text-success':'text-danger']">{{response.msg}}</div>
      <x-button class="submit-btn" type="primary" :disabled="!hasChange" @click.native="submit">
        <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
        <span v-else>{{$t('profile.submit')}}</span>
      </x-button>
    </div>
  </div>
</template>
<script>
import { XButton, Spinner } from 'vux'
import { changeUserInformation } from '../../api'
import { msgFormatter, validateEmail, validateQQ, validatePhone } from '../../utils'
import { mapActions, mapGetters, mapState } from 'vuex'
import VForm from '@/components/Form'
import VFormItem from '@/components/FormItem'
import VInput from '@/components/Input'
const inputs = ['phone', 'email', 'qq', 'wechat']
const originUser = {}
export default {
  name: 'profile',
  data () {
    const user = this.$store.state.user
    inputs.forEach(input => {
      originUser[input] = user[input] || ''
    })
    const qqValidator = (rule, value, callback) => {
      if (originUser.qq === value) {
        callback()
      } else if (!validateQQ(value)) {
        callback(new Error('QQ号码格式无效'))
      } else {
        callback()
      }
    }
    const emailValidator = (rule, value, callback) => {
      if (originUser.email === value) {
        callback()
      } else if (!validateEmail(value)) {
        callback(new Error('邮箱地址格式无效'))
      } else {
        callback()
      }
    }
    const phoneValidator = (rule, value, callback) => {
      if (originUser.phone === value) {
        callback()
      } else if (!validatePhone(value)) {
        callback(new Error('手机号码格式无效'))
      } else {
        callback()
      }
    }
    const wechatValidator = (rule, value, callback) => {
      if (originUser.wechat === value) {
        callback()
      } else if (!value) {
        callback(new Error('微信格式无效'))
      } else {
        callback()
      }
    }
    return {
      member: {
        phone: '',
        email: '',
        wechat: '',
        qq: ''
      },
      origin: {
        phone: '',
        email: '',
        wechat: '',
        qq: ''
      },
      loading: false,
      response: {
        msg: '',
        success: true
      },
      valid: false,
      rules: {
        email: [{validator: emailValidator}],
        qq: [{validator: qqValidator}],
        wechat: [{validator: wechatValidator}],
        phone: [{validator: phoneValidator}]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    ...mapState([
      'systemConfig'
    ]),
    hasChange () {
      return inputs.some((key) => this.origin[key] !== this.member[key])
    }
  },
  created () {
    this.init()
  },
  methods: {
    ...mapActions([
      'fetchUser'
    ]),
    init () {
      inputs.forEach(input => {
        this.member[input] = this.user[input] || ''
        this.origin[input] = this.user[input] || ''
      })
    },
    submit () {
      if (this.loading) {
        return
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          const sendData = {}
          Object.keys(this.member).forEach(key => {
            let value = this.member[key]
            if (value !== '') {
              sendData[key] = value
            }
          })
          if (this.user.phone) {
            delete sendData.phone
          }
          changeUserInformation(this.user.id, sendData).then((response) => {
            this.sendGaEvent({label: '我的帳號', category: '修改基本資料', action: '提交'})
            this.$store.dispatch('fetchUser').then(() => {
              this.init()
              this.$nextTick(() => {
                this.loading = false
                this.response.success = true
                this.response.msg = '已修改完成'
              })
            })
          }).catch((errorMsg) => {
            this.loading = false
            this.response.success = false
            this.response.msg = msgFormatter(errorMsg)
          })
        }
      })
    }
  },
  components: {
    XButton,
    Spinner,
    VForm,
    VFormItem,
    VInput
  }
}
</script>
<style lang="less" scoped>
.wrapper {
  height: 100%;
  overflow-y: auto;
}

.profile-section {
  padding: 20px 15px;
  .profile-hint {
    display: block;
    color: #666;
    font-size: 14px;
    margin-bottom: 15px;
  }
  .profile-field {
    &:nth-child(2n+1) {
      margin-top: 15px;
    }
    .title {
      color: #999;
      font-size: 13px;
    }
    .text {
      color: #333;
      font-size: 16px;
    }
  }
}

.submit-btn {
  width: 85%;
}
</style>
