<template>
  <div v-transfer-dom>
    <x-dialog
      class="red-envelope-dialog"
      :show.sync="isShowDialog"
      :hide-on-blur="true"
      @on-hide="reset"
      :dialog-style="dialogStyle">
      <div class="container">
        <div class="header">
          <div class="ellipse"></div>
          <div class="rectangle"></div>
          <div class="coin"></div>
        </div>
        <div class="content">
          <div class="balance-field">
            我的余额：{{user.balance | currency('￥')}}
          </div>
          <div class="form-item">
            <div class="form-item__content">
              <div class="form-item__label">红包总额</div>
              <AmountInput
                class="form-item__input"
                v-model="envelope.pack_amount"
                placeholder="请输入红包金额"
                :match="/^([1-9]\d*(\.[\d]{0,2})?|0(\.[\d]{0,2})?)/"/>
            </div>
            <div class="form-item__hint">{{amountHint}}</div>
          </div>
          <div class="form-item">
            <div class="form-item__content">
              <div class="form-item__label">红包个数</div>
              <AmountInput
                class="form-item__input"
                v-model="envelope.pack_nums"
                placeholder="请输入红包个数"
                :match="/^([1-9]\d*)/"/>
            </div>
            <div class="form-item__hint">{{numHint}}</div>
          </div>
          <div class="form-item">
            <div class="form-item__content">
              <input v-model="envelope.content" class="form-item__input" maxlength="10" placeholder="恭喜发财，大吉大利！"></input>
            </div>
          </div>
          <div class="footer">
            <div class="error">{{error}}</div>
            <x-button
              type="primary"
              action-type ="button"
              :show-loading="loading"
              :disabled="loading"
              @click.native="submit">塞钱进红包
            </x-button>
          </div>
        </div>
      </div>
      <div class="close-area" @click="$emit('update:isShowRedEnvelopeDialog', false)">
        <div class="icon">
          <cross-icon></cross-icon>
        </div>
      </div>
    </x-dialog>
  </div>
</template>

<script>
import {Group, XInput, XTextarea, XButton, TransferDom, XDialog} from 'vux'
import {sendRedEnvelope} from '@/api'
import {msgFormatter} from '@/utils'
import { mapState } from 'vuex'
import AmountInput from '@/components/AmountInput'
import CrossIcon from '@/components/icon/Cross'
const validateItems = ['pack_amount', 'pack_nums']
export default {
  name: 'EnvelopeDialog',
  components: {
    XDialog,
    Group,
    XInput,
    XTextarea,
    XButton,
    AmountInput,
    CrossIcon
  },
  directives: {
    TransferDom
  },
  props: {
    isShowRedEnvelopeDialog: {
      type: Boolean
    }
  },
  data () {
    const width = `${window.innerWidth - 40}px`
    const dialogStyle = {
      'max-width': width,
      width: width,
      'height': '455px',
      'background': 'rgba(0,0,0,0)'
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
        pack_amount: {
          error: '',
          validate: (value) => {
            if (!value) {
              return '请输入金额'
            } else {
              value = parseFloat(value)
              if (value < this.envelopeSetting.min_amount) {
                return '须高于最低金额限制'
              } else if (value > this.envelopeSetting.max_amount) {
                return '不能超过最高金额限制'
              } else {
                return ''
              }
            }
          }
        },
        pack_nums: {
          error: '',
          validate: (value) => {
            if (!value) {
              return '请输入个数'
            } else {
              value = parseInt(value)
              if (value > this.envelopeSetting.max_count) {
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
      'user', 'roomId'
    ]),
    ...mapState('chatroom', {
      ws: state => state.ws
    }),
    envelopeSetting () {
      return this.$store.state.systemConfig.chatroomEnvelopeSettings
    },
    amountHint () {
      let hint = []
      if (this.envelopeSetting.min_amount) {
        hint.push(`最小金额 ：￥${this.envelopeSetting.min_amount}`)
      }
      if (this.envelopeSetting.max_amount) {
        hint.push(`最大金额 ：￥${this.envelopeSetting.max_amount}`)
      }
      return hint.join(', ')
    },
    numHint () {
      if (this.envelopeSetting.max_count) {
        return '最多个数 ' + this.envelopeSetting.max_count
      }
      return ''
    }
  },
  watch: {
    'isShowRedEnvelopeDialog': function (status) {
      this.isShowDialog = status
    },
    'isShowDialog': function (status) {
      this.$emit('update:isShowRedEnvelopeDialog', status)
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
          pack_amount: parseFloat(this.envelope.pack_amount),
          pack_nums: parseFloat(this.envelope.pack_nums),
          content: this.envelope.content,
          room: this.ws.roomId
        }
        if (!envelope.content) {
          envelope.content = '恭喜发财，大吉大利'
        }
        sendRedEnvelope(envelope).then(data => {
          this.$emit('hidePanel')
          this.$emit('update:isShowRedEnvelopeDialog', false)
          this.$store.dispatch('fetchUser')
        }).catch(errorRes => {
          this.$vux.toast.show({
            text: msgFormatter(errorRes),
            type: 'warn'
          })
        }).finally(() => {
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

.red-envelope-dialog {
  font-weight: lighter;
  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
  }
  .container {
    position: relative;
    height: 415px;
    box-sizing: border-box;
    background-image: url('../../assets/envelope/flower_l.png'), url('../../assets/envelope/flower_r.png'), linear-gradient(to bottom, #e76953, #ee513d);
    background-size: auto, auto, cover;
    background-position: left 90%, right 40%, center;
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  .header {
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
    .coin {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      height: 60px;
      width: 60px;
      background: url('../../assets/envelope/coin.png') no-repeat center;
      background-size: contain;
    }
  }
  .content {
    padding: 0 15px;
    .balance-field {
      width: 100%;
      height: 40px;
      line-height: 30px;
      font-size: 14px;
      color: #fdebc5;
    }
    .form-item {
      width: 100%;
      margin-bottom: 10px;
      .form-item__content {
        display: flex;
        align-items: center;
        height: 40px;
        background: #fff;
        border-radius: 4px;
        font-size: 14px;
        .form-item__label {
          flex: 0 0 auto;
          width: 80px;
          color: #666;
        }
        .form-item__input {
          flex: 1 1 auto;
          height: 100%;
          width: 100%;
          border: 0;
          outline: 0;
          -webkit-appearance: none;
          background-color: transparent;
          font-size: inherit;
          padding: 0 5px;
          color: inherit;
          box-sizing: border-box;
          &::placeholder {
            color: #bfbfbf;
          }
        }
      }
      .form-item__hint {
        height: 30px;
        line-height: 30px;
        font-size: 13px;
        text-align: left;
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
  .close-area {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 15px;
    height: 40px;;
    text-align: center;
    color: #fff;
    .icon {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      padding: 2px;
    }
  }

  .footer {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 190px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    background: transparent;
    margin: 0 auto;
    & /deep/ .weui-btn.weui-btn_primary {
      height: 40px;
      color: #e76953;
      background: #ffd264;
    }
    & /deep/ .weui-btn_disabled.weui-btn_primary {
      color: lighten(#e76953, 10%);
      background: lighten(#ffd264, 10%);
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
