<template>
  <form class="container" autocomplete="off">
    <group :title="$t('login.welcome')">
      <x-input
        required
        show-clear
        ref="username"
      @on-change="validate"
      :title="$t('misc.username')"
      label-width="100"
      v-model="user.username">
      </x-input>
      <x-input
        required
        show-clear
        type="password"
        ref="password"
        autocomplete="off"
        @on-change="validate"
        :title="$t('misc.password')"
        label-width="100"
        v-model="user.password">
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
                    @click.native="tryplay">
                    {{$t('misc.try')}}
          </x-button>
        </flexbox-item>
      </flexbox>
    </div>
  </form>
</template>

<script>
  import { XInput, Group, XButton, Flexbox, FlexboxItem } from 'vux'
  import urls from '../api/urls'
  import { register } from '../api'

  export default {
    name: 'Home',
    data () {
      return {
        user: {
          username: '',
          password: '',
          verification_code_0: ''
        },
        valid: false,
        captcha: '',
        display_verification: false,
        loading: false,
        error: ''
      }
    },
    methods: {
      validate () {
        let valid = true
        for (let x in this.$refs) {
          valid = this.$refs[x].valid && valid
        }
        this.valid = valid
      },
      fetchCaptcha () {
        this.$http.get(urls.verification).then(response => {
          this.captcha = urls.domain + response.data.captcha_src
          this.user.verification_code_0 = response.data.captcha_val
          this.display_verification = true
        })
      },
      submit () {
        this.loading = true
        if (this.valid) {
          this.$store.dispatch('login', {
            user: this.user
          }).then(res => {
            this.error = ''
            this.loading = false
            this.$router.push('/')
          }, error => {
            this.loading = false
            this.error = error
          })
        }
      },
      tryplay () {
        this.$store.commit('UPDATE_LOADING', {isLoading: true})
        register({ account_type: 0 }).then(user => {
          return this.$store.dispatch('login', { user })
        }).then(result => {
          this.$store.commit('UPDATE_LOADING', {isLoading: false})
          this.$router.push({ name: 'Home' })
        }, errorMsg => {
          this.$store.commit('UPDATE_LOADING', {isLoading: false})
          this.error = errorMsg
        })
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
  .login-button {
    background-color:#1AAD19;
    width: 100%;
  }
</style>
