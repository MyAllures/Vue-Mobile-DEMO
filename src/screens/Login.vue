<template>
  <div class="login-area text-center">
      <img class="img" src="../assets/pic_login.png" alt="Login">
      <p class="greeting-text">欢迎登录</p>
      <div class="form">
        <v-form :model="user" ref="form" @click.native="errorMsg = ''">
          <v-form-item required :label="$t('misc.username')" prop="username">
            <v-input ref="username"
              autocapitalize="off"
              v-model="user.username">
            </v-input>
          </v-form-item>
          <v-form-item required :label="$t('misc.password')" prop="password">
            <v-input ref="password"
              type="password"
              autocapitalize="off"
              v-model="user.password">
            </v-input>
          </v-form-item>
          <v-form-item v-if="illegalTriedLogin" :label="'验证码'" prop="verification_code_1">
            <v-input autocapitalize="off"
              :hasCaptcha="true"
              v-model="user.verification_code_1">
              <img slot="captcha" class="captcha" :src="captcha_src" alt="captcha">
            </v-input>
          </v-form-item>
        </v-form>
      </div>

      <div class="actions">
        <div class="error">
          <p v-show="error" class="error">{{error}}</p>
        </div>
        <x-button type="primary"
                  action-type ="button"
                  :show-loading="loading"
                  :disabled="!valid"
                  @click.native="submit">{{$t('misc.login')}}
        </x-button>
        <flexbox class="m-t text-buttons">
          <flexbox-item class="register text-center" @click.native="$router.push({path: '/register'})">
            <span>{{$t('misc.register')}}</span>
          </flexbox-item>
          <flexbox-item class="text-center" @click.native="tryDemo">
            <span>{{$t('misc.try')}}</span>
          </flexbox-item>
        </flexbox>
      </div>
    <tryplay-popup />
  </div>
</template>

<script>
import { XInput, Group, XButton, Flexbox, FlexboxItem } from 'vux'
import { fetchCaptcha } from '../api'
import { msgFormatter } from '../utils'
import TryplayPopup from '../components/TryplayPopup'
import freetrial from '../mixins/freetrial.js'
import VForm from '@/components/Form'
import VFormItem from '@/components/FormItem'
import VInput from '@/components/Input'

const inputs = ['username', 'password']
export default {
  name: 'Home',
  data () {
    return {
      user: {
        username: '',
        password: '',
        verification_code_0: '',
        verification_code_1: ''
      },
      loading: false,
      error: '',
      illegalTriedLogin: false,
      captcha_src: '',
      validators: {
        'username': true,
        'password': true
      },
      syncTimer: null,
      usernameDom: null,
      passwordDom: null
    }
  },
  mixins: [freetrial],
  computed: {
    valid () {
      return inputs.every(input => this.validators[input] === true)
    }
  },
  mounted () {
    this.usernameDom = this.$refs.username.$el.getElementsByClassName('weui-input')[0]
    this.passwordDom = this.$refs.password.$el.getElementsByClassName('weui-input')[0]
    this.syncTimer = setInterval(() => {
      if (this.usernameDom.value !== this.user.username) {
        this.user.username = this.usernameDom.value
      }
      if (this.passwordDom.value !== this.user.password) {
        this.user.password = this.passwordDom.value
      }
    }, 500)
  },
  methods: {
    handleClose () {
      this.$store.dispatch('closeVerifyPopup')
    },
    validate (value, input) {
      this.validators[input] = !!value
    },
    fetchCaptcha () {
      return fetchCaptcha().then(res => {
        this.captcha_src = res.captcha_src
        this.user.verification_code_0 = res.captcha_val
      })
    },
    submit () {
      this.loading = true
      this.$nextTick(() => {
        if (this.valid) {
          this.$store.dispatch('login', {
            user: this.user
          }).then(res => {
            this.sendGaEvent({
              category: '会员登入',
              action: '登入'
            })
            this.$store.dispatch('fetchUser')
            this.illegalTriedLogin = false
            this.error = ''
            this.loading = false
            this.$router.push('/')
          }, error => {
            if (error.data && error.data.auth_req === 1) {
              this.fetchCaptcha().then(res => {
                this.illegalTriedLogin = true
              })
            }
            this.loading = false
            this.error = msgFormatter(error)
          })
        }
      })
    }
  },
  components: {
    XInput,
    Group,
    XButton,
    Flexbox,
    FlexboxItem,
    TryplayPopup,
    VForm,
    VFormItem,
    VInput
  },
  beforeDestroy () {
    clearInterval(this.syncTimer)
    this.syncTimer = null
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';
.login-area {
  margin-top: 25px;
}

.img {
  width: 140px;
  height: 140px;
}

.greeting-text {
  font-size: 16px;
  color: #666;
  margin-top: 10px;
}

.form {
  margin-top: 25px;
}

.error {
  color: @red;
  text-align: center;
  height: 20px;
  line-height: 20px;
}

.actions {
  margin-top: 1em;
  padding: 0 1em;
}
.login-button {
  width: 85%;
  height: 40px;
}

.captcha {
  width: 100px;
  height: 35px;
  vertical-align: middle;
}

.seperate {
  width: 2px;
  height: 16px;
  border: solid 1px #999;
}

.register {
  border-right: 1px solid #999;
}

.text-buttons {
  color: #333;
}
</style>
