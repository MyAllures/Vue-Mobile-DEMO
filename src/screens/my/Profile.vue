<template>
  <div>
    <group label-width="'100px'" :title="$t('profile.profile_hint')">
      <cell :title="$t('profile.username')" :value="user.username" ></cell>
      <cell :title="$t('profile.real_name')" :value="user.real_name"></cell>
      <cell :title="$t('profile.phone')" :value="user.phone"></cell>
    </group>
    <group label-width="'100px'" :title="$t('profile.basic_info')">
      <div v-if="inputErrors.length">
        <ul class="input-errors">
          <li class="text" v-for="(error, index) in inputErrors" :key="index">
            {{error}}
          </li>
        </ul>
      </div>
      <datetime :title="$t('profile.birthday')"
          v-model="member.birthday"
          :confirm-text="$t('profile.ok')"
          :cancel-text="$t('profile.cancel')"
          :min-year="1920"
          :max-year="2050"
          @on-change="validate($event, 'birthday')"
          :class="['fix-arrow', {'weui-cell_warn': !validators['gender'].valid}]"
          placeholder="请选择">
      </datetime>
      <selector
        :class="{'weui-cell_warn': !validators['gender'].valid}"
        :title="$t('profile.gender')"
        :options="list"
        v-model="member.gender"
        placeholder="请选择"></selector>
      <x-input
      :class="{'weui-cell_warn': !validators['email'].valid}"
      autocapitalize="off"
      :title="$t('profile.email')"
      is-type="email"
      ref="email"
      @on-change="validate($event, 'email')"
      v-model="member.email">
      </x-input>

      <x-input
      :class="{'weui-cell_warn': !validators['wechat'].valid}"
      autocapitalize="off"
      :title="$t('profile.wechat')"
      type="text"
      ref="wechat"
      @on-change="validate($event, 'wechat')"
      v-model="member.wechat">
      </x-input>

      <x-input
      :class="{'weui-cell_warn': !validators['qq'].valid}"
      :title="$t('profile.qq')"
      show-clear
      :max="14"
      ref="qq"
      @on-change="validate($event, 'qq')"
      keyboard="number"
      type="text"
      v-model="member.qq">
      </x-input>
    </group>
    <div></div>

    <div :class="['text-center', 'm-t', response.success? 'text-success':'text-danger']">{{response.msg}}</div>
    <div class="m-a">
      <x-button type="primary" :disabled="!hasChange" @click.native="submit">
        <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
        <span v-else>{{$t('profile.submit')}}</span>
      </x-button>
    </div>
  </div>
</template>
<script>
import { Cell, Group, XInput, XButton, Datetime, Selector, Spinner } from 'vux'
import { changeUserInformation } from '../../api'
import { msgFormatter, validateEmail, validateQQ } from '../../utils'
import { mapActions, mapGetters } from 'vuex'
const inputs = ['email', 'qq', 'gender', 'wechat', 'birthday']
export default {
  name: 'profile',
  data () {
    return {
      validators: {
        email: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请输入邮箱地址'
            } else if (!validateEmail(value)) {
              return '邮箱地址格式无效'
            } else {
              return ''
            }
          },
          errorMsg: ''
        },
        birthday: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请选择生日'
            }
            return ''
          },
          errorMsg: ''
        },
        qq: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请输入QQ号'
            } else if (!validateQQ(value)) {
              return 'QQ号格式错误'
            }
            return ''
          },
          errorMsg: ''
        },
        wechat: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请输入微信号'
            }
            return ''
          },
          errorMsg: ''
        },
        gender: {
          origin: '',
          valid: true,
          validate: (value) => {
            if (!value) {
              return '请选择性别'
            }
            return ''
          },
          errorMsg: ''
        }
      },
      member: {
        birthday: '',
        gender: '',
        email: '',
        wechat: '',
        qq: ''
      },
      list: [{key: 'M', value: this.$t('profile.male')}, {key: 'F', value: this.$t('profile.female')}],
      loading: false,
      response: {
        msg: '',
        success: true
      },
      valid: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    inputErrors () {
      return inputs.filter(input => {
        return this.validators[input].valid === false
      }).map(input => {
        return this.validators[input].errorMsg
      })
    },
    hasChange () {
      return inputs.filter(input => {
        return this.validators[input].origin !== this.member[input]
      }).length
    }
  },
  watch: {
    'hasChange': function (hasChange) {
      this.response.msg = ''
    }
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      inputs.forEach(input => {
        this.member[input] = this.user[input] || ''
        this.validators[input].origin = this.user[input] || ''
      })
    },
    ...mapActions([
      'fetchUser'
    ]),
    validate (value, input) {
      this.member[input] = value
      const validator = this.validators[input]
      if (value === validator.origin) {
        validator.valid = true
        validator.errorMsg = ''
      } else {
        const errorMsg = validator.validate(value)
        if (errorMsg) {
          validator.valid = false
          validator.errorMsg = errorMsg
        } else {
          validator.valid = true
          validator.errorMsg = ''
        }
      }
    },
    validateAll () {
      inputs.forEach(input => {
        this.validators[input].validate()
      })
      return !this.inputErrors.length
    },
    submit () {
      this.response.msg = ''
      if (this.validateAll()) {
        this.loading = true
        changeUserInformation(this.user.id, this.member).then((response) => {
          this.$store.dispatch('fetchUser').then(() => {
            this.init()
            this.$nextTick(() => {
              this.loading = false
              this.response.success = true
              this.response.msg = '已修改完成'
            })
          })
        }, (errorMsg) => {
          this.loading = false
          this.response.success = false
          this.response.msg = msgFormatter(errorMsg)
        })
      }
    }
  },
  components: {
    Group,
    Cell,
    XInput,
    XButton,
    Datetime,
    Selector,
    Spinner
  }
}
</script>
<style @lang="less">
.fix-arrow > .weui_cell_ft.with_arrow::after {
  content: " ";
  display: inline-block;
  transform: rotate(45deg) translateY(-50%);
  height: 6px;
  width: 6px;
  border-width: 2px 2px 0 0;
  border-color: #C8C8CD;
  border-style: solid;
  position: absolute;
  top: 50%;
  right: 15px;
}
</style>
