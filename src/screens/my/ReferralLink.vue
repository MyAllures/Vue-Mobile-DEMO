<template>
  <div class="stretch-layout">
    <div class="top">
      <div class="title">推荐链结使用说明</div>
      <div class="rules">
        <a @click="actDialogType = 'referral'">
          活动规则 <img src="@/assets/red-envelope-v2/icon-arrow.svg" />
        </a>
      </div>
    </div>
    <div class="content-wrap">
      <div class="help">
        1. 使用以下二维码或推荐链结邀请好友注册<br />
        2. 好友需充值金额达到 {{ act.check_referral_deposit && act.check_referral_deposit.required_deposit || 0 }} 元以上<br />
        3. 可在我的推荐中查看，了解推荐人数
      </div>
      <div class="title">
        <img src="@/assets/red-envelope-v2/blue-point.svg" />
        我的推荐二维码
      </div>
      <div class="content">
        <div class="qrcode">
          <cube-loading v-if="codeLoading" />
          <qrcode ref="qr" :value="refLink" :options="{ width: 200, margin: 2 }" v-else />
        </div>
        <a class="weui-btn weui-btn_mini weui-btn_default download-qr" download="qrcode.jpg" @click="saveQRCode">保存至手机</a>
      </div>
      <div class="title">
        <img src="@/assets/red-envelope-v2/blue-point.svg" />
        我的推荐链结
      </div>
      <div class="content">
        <div class="link">
          <input type="text" :value="refLink" @click="$event.target.select()" readonly :disabled="codeLoading" />
          <button :data-clipboard-text="refLink" :disabled="codeLoading">复制</button>
        </div>
      </div>
    </div>
    <RedEnvPromotion :type="actDialogType" @hide="actDialogType = ''" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import VueQrcode from '@chenfengyuan/vue-qrcode'
import ClipboardJS from 'clipboard'
import RedEnvPromotion from '@/components/actV2/RedEnvPromotion'
import {
  fetchActRefCode
} from '@/api'

export default {
  name: 'referral_link',
  components: {
    qrcode: VueQrcode,
    RedEnvPromotion
  },
  data: () => ({
    clipboard: null,
    codeLoading: true,
    code: '',
    actDialogType: ''
  }),
  mounted () {
    this.getRefCode()
    this.setClipboard()
  },
  methods: {
    getRefCode () {
      fetchActRefCode().then(res => {
        this.code = res.referral_code
        this.codeLoading = false
      })
    },
    setClipboard () {
      this.clipboard = new ClipboardJS('[data-clipboard-text]')
      this.clipboard.on('success', e => {
        const toast = this.$createToast({
          txt: '复制成功',
          type: 'correct'
        })
        toast.show()
        e.trigger.focus()
      })
    },
    saveQRCode (e) {
      const image = this.$refs.qr.$el.toDataURL('image/jpg')
      e.target.href = image
    }
  },
  computed: {
    ...mapState('actv2', {
      act: state => state.referral.detail
    }),
    refLink () {
      const key = 'f'
      return this.codeLoading ? 'Loading...' : `${location.protocol}//${location.host}${location.pathname}?${key}=${this.code}`
    }
  },
  beforeDestroy () {
    this.clipboard && this.clipboard.destroy()
  }
}
</script>

<style>
.cube-toast-icon {
  line-height: 1;
}
</style>
<style lang="scss" scoped>
.stretch-layout {
  padding-bottom: 53px;
}
.top {
  display: flex;
  margin: 20px 16px 10px;
  justify-content: space-between;

  .title {
    font-size: 16px;
    color: #333;
  }
  .rules {
    a {
      font-size: 14px;
      color: #166fd8;
    }
    img {
      vertical-align: middle;
    }
  }
}
.content-wrap {
  margin: 0 16px 16px;
  font-size: 14px;
  color: #666;
}
.help {
  line-height: 20px;
}
.title {
  margin: 16px 0 10px;

  img {
    vertical-align: middle;
  }
}
.content {
  text-align: center;
}
.qrcode {
  margin: 0 auto 6px;
  width: 200px;
  height: 200px;
  background: #FFF;
  display: flex;
  justify-content: center;
  align-items: center;

  canvas {
    display: block;
  }
}
.download-qr {
  display: inline-block;
}
.link {
  display: flex;

  > * {
    border: 1px solid #ddd;
    background: #FFF;

    &:focus {
      position: relative;
    }
  }
  input {
    flex: 1;
    color: #999;
    padding: 10px;
    border-radius: 2px 0 0 2px;
  }
  button {
    flex: 0 0 60px;
    margin-left: -1px;
    font-size: 14px;
    color: #166fd8;
    border-radius: 0 2px 2px 0;
  }
}
</style>
