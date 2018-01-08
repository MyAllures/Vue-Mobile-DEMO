<template>
  <div>
    <group label-width="'100px'" :title="$t('profile.profile_hint')">
      <cell :title="$t('profile.username')" :value="user.username" ></cell>
      <cell :title="$t('profile.real_name')" :value="user.real_name"></cell>
      <cell :title="$t('profile.phone')" :value="user.phone"></cell>
    </group>
    <group label-width="'100px'" :title="$t('profile.basic_info')">
      <datetime :title="$t('profile.birthday')" 
          v-model="member.birthday" 
          :confirm-text="$t('profile.ok')" 
          :cancel-text="$t('profile.cancel')" 
          :min-year=1920 
          :max-year=2050 
          @on-change="validate"
          class="fix-arrow"
          placeholder="请选择">
      </datetime>
      <selector :title="$t('profile.gender')" :options="list" v-model="member.gender" placeholder="请选择"></selector>
      <x-input  
      autocapitalize="off" 
      :title="$t('profile.email')"
      required
      is-type="email"
      ref="email"
      @on-change="validate"
      v-model="member.email">   
      </x-input>

      <x-input  
      autocapitalize="off" 
      :title="$t('profile.wechat')"
      required
      type="text"
      ref="wechat"
      @on-change="validate"
      v-model="member.wechat">   
      </x-input>

      <x-input  
      :title="$t('profile.qq')"
      :show-clear=true 
      required
      :min="5"
      :max="14"
      ref="qq"
      @on-change="validate"
      keyboard="number"
      type="text"
      v-model="member.qq">   
      </x-input>
    </group>
    <div></div>

    <div class="vux-group-tip text-danger">{{errorMsg}}</div>
    <div class="m-a-md">
      <x-button type="primary" :disabled="!valid" @click.native="submit">
        <spinner v-if="loading" :type="'spiral'" class="vux-spinner-inverse"></spinner>
        <span v-else>{{$t('profile.submit')}}</span>
      </x-button>
    </div>
  </div>
</template>
<script>
import { Cell, Group, XInput, XButton, Datetime, Selector, Spinner } from 'vux'
import { changeUserInformation } from '../../api'
import { formatError } from '../../utils/error_handler'
import { mapActions, mapGetters } from 'vuex'
export default {
  name: 'profile',
  data () {
    return {
      member: {
        id: '',
        birthday: '',
        gender: '',
        email: '',
        wechat: '',
        qq: ''
      },
      list: [{key: 'M', value: this.$t('profile.male')}, {key: 'F', value: this.$t('profile.female')}],
      loading: false,
      errorMsg: '',
      valid: false
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  created () {
    this.member = {
      id: this.user.id,
      birthday: this.user.birthday,
      gender: this.user.gender,
      email: this.user.email,
      wechat: this.user.wechat,
      qq: this.user.qq
    }
  },
  methods: {
    ...mapActions([
      'fetchUser'
    ]),
    validate () {
      let valid = true
      for (let x in this.$refs) {
        valid = this.$refs[x].valid && valid
      }
      this.valid = valid
    },
    submit () {
      this.loading = true
      if (this.valid) {
        changeUserInformation(this.id, this.member).then((response) => {
          this.loading = false
          this.fetchUser({})
          this.$router.push({name: 'My'})
        }, (response) => {
          this.loading = false
          this.errorMsg = formatError(response.data.error)
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
