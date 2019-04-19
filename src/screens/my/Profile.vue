<template>
  <div class="stretch-layout wrapper">
    <div>
      <div class="profile-section">
        <small class="profile-hint">
          如需修改手机号码请 <a class="service-link" :href="customerServiceUrl" target="_blank">联系客服</a>
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
        <v-form-item label="昵称" prop="nickname">
          <v-input
            v-model="member.nickname">
          </v-input>
        </v-form-item>
        <v-form-item class="avatar-selector-wrapper" label="头像">
          <div class="avatar-selector">
            <div v-if="previewImage" class="avatar" :style="{'background-image': `url('${previewImage}')`}"></div>
            <label class="select">
              变换头像
              <input @change="setAvatar"
                type="file"
                ref="fileImgSend"
                class="img-upload-input"
                accept="image/*">
            </label>
            <div class="arrow"></div>
          </div>
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
const inputs = ['phone', 'email', 'qq', 'wechat', 'nickname', 'avatar']
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
    const nicknameValidator = (rule, value, callback) => {
      if (originUser.nickname === value) {
        callback()
      } else if (value.length > 10) {
        callback(new Error('昵称限制10字元以下'))
      } else {
        callback()
      }
    }
    return {
      member: {
        phone: '',
        email: '',
        wechat: '',
        qq: '',
        nickname: '',
        avatar: ''
      },
      origin: {
        phone: '',
        email: '',
        wechat: '',
        qq: '',
        nickname: '',
        avatar: ''
      },
      previewImage: '',
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
        phone: [{validator: phoneValidator}],
        nickname: [{validator: nicknameValidator}]
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
    customerServiceUrl () {
      return this.systemConfig.customer_service_url
    },
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
    setAvatar (e) {
      let file = e.target.files[0]
      this.previewImage = URL.createObjectURL(file)
      if (file.size > 1024 * 1024) {
        this.$vux.toast.show({
          text: '图片尺寸太大，请选择较小尺寸的图片',
          type: 'warn'
        })
      } else {
        this.member.avatar = file
      }
    },
    init () {
      inputs.forEach(input => {
        if (input === 'avatar') {
          this.previewImage = this.user[input]
        } else {
          this.member[input] = this.user[input] || ''
          this.origin[input] = this.user[input] || ''
        }
      })
    },
    submit () {
      if (this.loading) {
        return
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          let sendData = new FormData()
          Object.keys(this.member).forEach(key => {
            let value = this.member[key]
            if (key !== 'phone' || !this.user.phone) {
              if (value !== '') {
                sendData.append(key, value)
              }
            }
          })
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

.v-form-item.avatar-selector-wrapper {
  height: 80px;
  .avatar-selector {
    display: flex;
    align-items: center;
    height: 100%;
    .avatar {
      height: 60px;
      width: 60px;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
      border-radius: 10px;
    }
    .select {
      margin-left: auto;
      color: #bfbfbf;
      &::after {
        display: inline-block;
        content: '';
        width: 8px;
        height: 8px;
        border-right: 2px solid #999;
        border-bottom: 2px solid #999;
        transform-origin: center;
        transform: rotate(-45deg);
      }
    }
    .img-upload-input {
      display: none;
    }
  }
}
</style>
