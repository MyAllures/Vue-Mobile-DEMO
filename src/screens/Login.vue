<template>
  <form class="container" autocomplete="off">
    <group :title="$t('login.welcome')">
      <x-input
        required
        show-clear
        ref="username"
        placeholder="请输入用户名"
        @on-change="validate"
        :title="$t('misc.username')"
        label-width="100"
        v-model="user.username">
      </x-input>
      <x-input
        required
        show-clear
        placeholder="请输入密码"
        type="password"
        ref="password"
        autocomplete="off"
        @on-change="validate"
        :title="$t('misc.password')"
        label-width="100"
        v-model="user.password">
      </x-input>
      <x-input v-if="illegalTriedLogin"
        v-model="user.verification_code_1"
        class="captcha-input"
        title="验证码"
        placeholder="请输入验证码"
        label-width="100"
        :show-clear="false"
        :max="4">
        <img slot="right" @click="fetchCaptcha()" :src="captcha_src" class="captcha">
      </x-input>
    </group>

    <div class="actions">
      <div v-if="error" class="error">{{error}}</div>
      <x-button type="primary"
                action-type ="button"
                :show-loading="loading"
                :disabled="!valid"
                @click.native="submit">{{$t('misc.login')}}
      </x-button>
      <flexbox class="m-t">
        <flexbox-item>
          <x-button type="default"
                    action-type ="button"
                    link="/register">
                    {{$t('misc.register')}}
          </x-button>
        </flexbox-item>
        <flexbox-item>
          <x-button type="default"
                    action-type ="button"
                    @click.native="tryDemo">
                    {{$t('misc.try')}}
          </x-button>
        </flexbox-item>
      </flexbox>
    </div>
  </form>
</template>

<script>
  import { XInput, Group, XButton, Flexbox, FlexboxItem } from 'vux'
  import { fetchCaptcha, register } from '../api'
  import { msgFormatter } from '../utils'

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
        valid: false,
        loading: false,
        error: '',
        illegalTriedLogin: false,
        illegalTrial: false,
        captcha_src: ''
      }
    },
    methods: {
      handleClose () {
        this.$store.dispatch('closeVerifyPopup')
      },
      validate () {
        let valid = true
        for (let x in this.$refs) {
          valid = this.$refs[x].valid && valid
        }
        this.valid = valid
      },
      fetchCaptcha () {
        return fetchCaptcha().then(res => {
          this.captcha_src = res.captcha_src
          this.user.verification_code_0 = res.captcha_val
        })
      },
      submit () {
        this.loading = true
        if (this.valid) {
          this.$store.dispatch('login', {
            user: this.user
          }).then(res => {
            this.$store.dispatch('fetchUser')
            this.illegalTriedLogin = false
            this.error = ''
            this.loading = false
            this.$router.push('/')
          }, error => {
            if (error.data.auth_req === 1) {
              this.fetchCaptcha().then(res => {
                this.illegalTriedLogin = true
              })
            }
            this.loading = false
            this.error = error.msg
          })
        }
      },
      tryDemo () {
        register({ account_type: 0 }).then(user => {
          if (user.trial_auth_req === 1) {
            this.$store.dispatch('openVerifyPopup')
            let msg = ''
            return Promise.reject(msg)
          }
          return this.$store.dispatch('login', { user })
        }).then(result => {
          this.$router.push({name: 'Home'})
          this.$store.dispatch('fetchUser')
        }, errorMsg => {
          if (errorMsg) {
            this.$vux.toast.show({
              text: msgFormatter(errorMsg),
              type: 'warn'
            })
          }
        })
      }
    },
    watch: {
      'error': function (error) {
        if (error) {
          setTimeout(() => {
            this.error = ''
          }, 3000)
        }
      }
    },
    components: {
      XInput,
      Group,
      XButton,
      Flexbox,
      FlexboxItem
    }
  }
</script>

<style lang="less" scoped>
@import '../styles/vars.less';

.container {
  margin-top: 60px;
}
.error {
  color: @red;
  text-align: center;
  margin-bottom: 0.5em;
}
.actions {
  margin-top: 1em;
  padding: 0 1em;
}
.login-button {
  width: 100%;
}
.captcha {
  width: 100px;
  height: 40px;
  vertical-align: middle;
}
.captcha-input {
  height: 30px;
}
</style>
