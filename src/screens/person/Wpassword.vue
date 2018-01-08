<template>
    <div>
        <group>
            <div v-if="!valid" :class="{'hidden': valid}"> 
                <ul slot="after-title" class="text-warning input-errors">
                    <li v-for="error in inputErrors">{{error}}</li>
                </ul>
            </div>
            <x-input
            autocapitalize="off" 
            :title="$t('change_password.w_old')"
            :show-clear=true 
            required
            type="password"
            ref="currentpassword"
            @on-change="validate"
            @on-blur="validate"
            v-model="password.current_password">   
            </x-input>

            <x-input
            autocapitalize="off" 
            :title="$t('change_password.w_new')"
            :show-clear=true 
            required
            type="password"
            ref="newpassword"
            @on-change="validate"
            @on-blur="validate"
            v-model="password.new_password"
            :min="6"
            :max="12">   
            </x-input>

            <x-input
            autocapitalize="off" 
            :title="$t('change_password.w_repeat')"
            :show-clear=true 
            type="password"
            ref="repeatpassword"
            @on-change="validate"
            @on-blur="validate"
            v-model="password.repeat_password"
            :required=false
            :min="6"
            :max="12"
            :equal-with="password.new_password">   
            </x-input>    
        </group>
        <div class="vux-group-tip text-danger m-t">{{errorMsg}}</div>
        <div class="m-a-md">
            <x-button type="primary" :disabled="!valid" @click.native="submit">
                <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
                <span v-else>{{$t('profile.submit')}}</span>
            </x-button>
            <div class="vux-group-tip text-success" v-if="changed">{{$t('change_password.success')}}</div>
        </div>
    </div>
</template>
<script>
import { Group, Cell, XButton, XInput, Spinner } from 'vux'
import { changeWpassword } from '../../api'
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
      changed: false
    }
  },
  methods: {
    validate () {
      let valid = true
      let msg = []
      for (let x in this.$refs) {
        let input = this.$refs[x]
        valid = input.valid && valid
        // when blur event trigger, touched will be true
        if (input && input.touched) {
          let errors = input.errors
          let title = input.title
          let key = Object.keys(errors)[0]
          if (errors[key] && !input.valid) {
            if (errors[key].indexOf(title) === -1) {
              msg.push(title + errors[key])
            } else {
              msg.push(errors[key])
            }
          }
        }
      }
      this.inputErrors = msg
      this.valid = valid && !!this.password.repeat_password
    },
    submit () {
      this.loading = true
      this.errorMsg = ''
      if (this.valid) {
        changeWpassword(this.password).then((response) => {
          this.loading = false
          this.changed = true
          setTimeout(() => {
            this.$router.push({name: 'My'})
          }, 2000)
        }, (response) => {
          this.loading = false
          this.errorMsg = response
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
.input-errors {
  font-size: 14px;
  margin-left: 10px;
  color: #ff9800;
  li {
    list-style: circle inside;
  }
  li:first-child {
    padding-top: 10px;
  }
  li:last-child {
    padding-bottom: 10px;
  }
}
.text-danger {
  text-align: center;
  margin-bottom: 10px;
  color: #f44336;
}
.hidden {
  display: none;
  visibility: hidden;
}
.m-a-md {
  text-align: center;
  color: #1AAD19;
}
</style>
