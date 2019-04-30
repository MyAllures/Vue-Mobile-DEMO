<template>
  <div v-transfer-dom>
    <x-dialog
      class="envelope-dialog"
      :show.sync="isShowDialog"
      :hide-on-blur="true"
      @on-hide="reset"
      :dialog-style="dialogStyle">
      <div class="envelope-header">
        <div class="ellipse"></div>
        <div class="rectangle"></div>
      </div>
      <!-- <div class="close-btn" @click="$emit('update:isShowEnvelopeDialog', false)"></div> -->
      <div class="envelope-content">
        <div class="balance-field">
          <span>我的余额</span>
          <span class="balance">{{user.balance | currency('￥')}}</span>
        </div>
        <group label-width="120px" label-align="left" label-margin-right="10px">
          <x-input
            autocapitalize="off"
            title="红包金额"
            placeholder="请输入红包金额"
            placeholder-align="right"
            v-model="envelope.pack_amount"
            @on-change="inputnum($event, 'pack_amount')"
            keyboard="number">
          </x-input>
          <div class="input-validate">
            最高金额 {{systemConfig.envelopeSettings.max_amount | currency('￥')}}
            &nbsp;
            最低金额 {{systemConfig.envelopeSettings.min_amount | currency('￥')}}
          </div>
          <x-input
            autocapitalize="off"
            title="红包个数"
            placeholder="请输入红包个数"
            placeholder-align="right"
            v-model="envelope.pack_nums"
            @on-change="inputnum($event, 'pack_nums')"
            keyboard="number">
          </x-input>
          <div class="input-validate">
            最多个数 {{systemConfig.envelopeSettings.per_max_count}}
          </div>
          <x-textarea
            title=""
            placeholder="恭喜发财，大吉大利"
            :height="50"
            :max="20"
            v-model="envelope.content"></x-textarea>
        </group>
        <div class="footer">
          <div class="error">{{error}}</div>
          <x-button
            type="primary"
            action-type ="button"
            :show-loading="loading"
            :disabled="false"
            @click.native="submit">确认发出
          </x-button>
        </div>
      </div>
    </x-dialog>
  </div>
</template>

<script>
import {Group, XInput, XTextarea, XButton, TransferDom, XDialog} from 'vux'
import {sendEnvelope} from '../api'
import {msgFormatter} from '../utils'
import { mapState } from 'vuex'
const validateItems = ['pack_amount', 'pack_nums']
export default {
  name: 'EnvelopeDialog',
  components: {
    XDialog,
    Group,
    XInput,
    XTextarea,
    XButton
  },
  directives: {
    TransferDom
  },
  props: {
    isShowEnvelopeDialog: {
      type: Boolean
    }
  },
  data () {
    const width = `${window.innerWidth - 40}px`
    const dialogStyle = {
      'max-width': width,
      width: width,
      'height': '415px',
      'box-sizing': 'border-box',
      'background-image': `url('${require('../assets/envelope/flower_l.png')}'), url('${require('../assets/envelope/flower_r.png')}'), linear-gradient(to bottom, #e76953, #ee513d)`,
      'background-size': 'auto, auto, cover',
      'background-position': 'left 90%, right center, center',
      'background-repeat': 'no-repeat, no-repeat, no-repeat'
    }
    return {
      isShowDialog: false,
      envelope: {
        pack_amount: '',
        pack_nums: '',
        content: ''
      },
      loading: false,
      error: '',
      dialogStyle,
      validators: {
        'pack_amount': {
          error: '',
          validate: (value) => {
            if (!value) {
              return '请输入金额'
            } else {
              value = parseInt(value)
              if (value < this.systemConfig.envelopeSettings.min_amount) {
                return '须高于最低金额限制'
              } else if (value > this.systemConfig.envelopeSettings.max_amount) {
                return '不能超过最高金额限制'
              } else {
                return ''
              }
            }
          }
        },
        'pack_nums': {
          error: '',
          validate: (value) => {
            if (!value) {
              return '请输入个数'
            } else {
              value = parseInt(value)
              if (value > this.systemConfig.envelopeSettings.per_max_count) {
                return '红包数量超出限制'
              } else {
                return ''
              }
            }
          }
        }
      }
    }
  },
  computed: {
    ...mapState([
      'user', 'systemConfig', 'roomId'
    ])
  },
  watch: {
    'isShowEnvelopeDialog': function (status) {
      this.isShowDialog = status
    },
    'isShowDialog': function (status) {
      this.$emit('update:isShowEnvelopeDialog', status)
    }
  },
  methods: {
    inputnum (val, input) {
      let formatted = !val ? '' : val.replace(/^[0]|[^0-9]/g, '')
      this.$nextTick(() => {
        this.envelope[input] = formatted
        this.validate(formatted, input)
      })
    },
    submit () {
      if (this.loading) {
        return
      }
      const errors = this.validateAll()
      if (errors.length === 0) {
        this.loading = true
        const envelope = {
          pack_amount: parseInt(this.envelope.pack_amount),
          pack_nums: parseInt(this.envelope.pack_nums),
          content: this.envelope.content,
          room: this.roomId
        }
        if (!envelope.content) {
          envelope.content = '恭喜发财，大吉大利'
        }
        sendEnvelope(envelope).then(data => {
          this.$emit('hidePanel')
          this.loading = false
          this.$emit('update:isShowEnvelopeDialog', false)
          this.$store.dispatch('fetchUser')
        }, error => {
          this.error = msgFormatter(error)
          this.loading = false
        })
      } else {
        this.error = errors[0]
      }
    },
    reset () {
      this.envelope = {
        pack_amount: '',
        pack_nums: '',
        content: ''
      }
      this.error = ''
    },
    validate (value, input) {
      this.error = this.validators[input].validate(value)
    },
    validateAll () {
      return validateItems
        .map(item => this.validators[item].validate(this.envelope[item]))
        .filter(msg => msg)
    }
  }
}
</script>
<style lang="less" scoped>

.envelope-dialog {
  font-weight: lighter;
  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
  }
  .envelope-header {
    position: relative;
    height: 80px;
    width: 100%;
    .rectangle {
      position: absolute;
      top: 0;
      height: 30px;
      width: 100%;
      background-image: linear-gradient(to bottom, #e76953, #d85b47);
    }
    .ellipse {
      height: 60px;
      width: 100%;
      background-image: linear-gradient(to bottom, #e76953, #ca4e3b);
      clip-path: ellipse(50% 40% at 50% 50%);
    }
  }
  .envelope-content {
    padding: 0 15px;
  }
  .text-field {
    width: 100%;
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: #ffffff;
  }
  .balance-field {
    width: 100%;
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    color: #ffffff;
    .balance {
      margin-left: 10px;
    }
  }
  .input-validate{
    text-align: left;
    height: 30px;
    line-height: 30px;
    background: #de5547;
    color: rgba(255, 255, 255, .8);
    font-size: 12px;
  }

  & /deep/ .weui-cells.vux-no-group-title {
    margin-top: 0;
    &::after {
      border: none;
    }
  }

  .footer {
    width: 235px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    background: transparent;
    margin: 0 auto;
    padding-top: 5px;
    & /deep/ .weui-btn.weui-btn_primary {
      color: #4a4a4a;
      background: #f5b723;
    }
    & /deep/ .weui-btn_disabled.weui-btn_primary {
      color: #a4a4a4;
      background: #fadb91;
    }
    .error {
      width: 100%;
      word-wrap: break-word;
      margin-bottom: 5px;
      color: #fff;
      text-align: center;
    }
  }
}
</style>
