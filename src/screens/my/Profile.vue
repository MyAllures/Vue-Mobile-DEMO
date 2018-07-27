<template>
  <div class="stretch-layout wrapper">
    <div>
      <div class="profile-section">
        <small class="profile-hint">
          如需修改真实姓名或手机号码请 <a class="service-link" :href="customerServiceUrl" target="_blank">联系客服</a>
        </small>
        <div class="profile-field">
           <p class="title">真实姓名</p>
           <p class="text">{{user.real_name}}</p>
        </div>
        <div class="profile-field">
           <p class="title">手机号码</p>
           <p class="text">{{user.phone}}</p>
        </div>
      </div>
      <group label-width="'100px'">
        <div v-if="inputErrors.length">
          <ul class="input-errors">
            <li class="text" v-for="(error, index) in inputErrors" :key="index">
              {{error}}
            </li>
          </ul>
        </div>
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
import { Cell, Group, XInput, XButton, Datetime, Selector, Spinner } from 'vux'
import { changeUserInformation } from '../../api'
import { msgFormatter, validateEmail, validateQQ } from '../../utils'
import { mapActions, mapGetters, mapState } from 'vuex'
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
    ...mapState([
      'systemConfig'
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
    },
    customerServiceUrl () {
      return this.systemConfig.customer_service_url
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
