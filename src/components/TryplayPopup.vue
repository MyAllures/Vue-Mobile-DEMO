<template>
<div v-transfer-dom>
  <popup v-model="$store.state.showVerifyPopup" :height="'calc(50vh + 100px)'" @on-show="fetchCaptcha()" @on-hide="reset" is-transparent>
    <div class="verify-popup">
      <p class="text-center">请输入验证码以继续试玩</p>
      <group>
        <x-input
          v-model="verification_code_1"
          class="captcha-input"
          title="验证码"
          placeholder="请输入验证码"
          label-width="100"
          :show-clear="false"
          :max="4">
          <img slot="right"
            @click="fetchCaptcha()"
            :src="captcha_src"
            alt="captcha"
            class="captcha">
        </x-input>
      </group>
      <div class="continue">
        <div class="text-danger text-center m-a">{{error}}</div>
        <x-button class="trial-btn" type="primary" @click.native="tryDemo">继续试玩</x-button>
      </div>
    </div>
  </popup>
</div>
</template>
<script>
import { TransferDom, XInput, Group, XButton, Popup } from 'vux'
import { register, fetchCaptcha } from '../api'
export default {
  directives: {
    TransferDom
  },
  components: {
    XInput,
    Group,
    XButton,
    Popup
  },
  name: 'TryplayPopup',
  data () {
    return {
      captcha_src: '',
      verification_code_0: '',
      verification_code_1: '',
      error: ''
    }
  },
  watch: {
    'verification_code_1': function () {
      if (this.error) {
        this.error = ''
      }
    }
  },
  methods: {
    fetchCaptcha () {
      return fetchCaptcha().then(res => {
        this.captcha_src = res.captcha_src
        this.verification_code_0 = res.captcha_val
      })
    },
    tryDemo () {
      register({
        account_type: 0,
        verification_code_0: this.verification_code_0,
        verification_code_1: this.verification_code_1
      }).then(user => {
        if (user.trial_auth_req === 1) {
          return Promise.reject(user)
        }
        return this.$store.dispatch('login', { user })
      }).then(result => {
        this.$router.push({name: 'Home'})
        this.$store.dispatch('fetchUser')
        this.$store.dispatch('closeVerifyPopup')
      }).catch(error => {
        this.fetchCaptcha()
        this.error = error.msg
      })
    },
    reset () {
      this.error = ''
      this.verification_code_0 = ''
      this.verification_code_1 = ''
    }
  }
}
</script>

<style lang="less" scoped>
.captcha {
  width: 100px;
  height: 40px;
  vertical-align: middle;
}
.captcha-input {
  height: 30px;
}
.verify-popup {
  width: 95%;
  background-color: white;
  margin: 0 auto;
  border-radius: 5px;
  padding-top: 10px;
}
.continue {
  padding: 0 15px 25px 15px;
}
</style>
