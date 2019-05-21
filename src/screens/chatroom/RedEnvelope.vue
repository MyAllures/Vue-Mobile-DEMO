<template>
  <div :class="['red-envelope-container', {opened: status!=='acquirable'}]" @click="openRedEnvelope">
    <i class="icon"></i>
    <div class="content">
      <div class="msg">{{redEnvelope.description || '恭喜发财，大吉大利'}}</div>
      <div class="status-text">{{status | statusFilter}}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { takeRedEnvelope } from '@/api'
import { msgFormatter } from '@/utils'

function to (scrollTop) {
  document.body.scrollTop = document.documentElement.scrollTop = scrollTop
}
function getScrollTop () {
  return document.body.scrollTop || document.documentElement.scrollTop
}
let scrollTop
export default {
  filters: {
    statusFilter (val) {
      switch (val) {
        case 'expired':
          return '已过期'
        case 'acquired':
          return '已领取'
        case 'exhausted':
          return '已领完'
        case 'acquirable':
          return '领取红包'
      }
    }
  },
  name: 'RedEnvelope',
  props: {
    redEnvelopeStr: {
      type: String
    }
  },
  data () {
    return {
      today: this.$moment()
    }
  },
  computed: {
    ...mapState('chatroom', {
      redEnvelopeStatus: state => state.redEnvelopeStatus
    }),
    ...mapState(['user']),
    redEnvelope () {
      return JSON.parse(this.redEnvelopeStr)
    },
    status () {
      if (this.today.isAfter(this.redEnvelope.expired_time)) {
        return 'expired'
      }
      let status = this.redEnvelopeStatus[this.redEnvelope.id]
      if (!status) {
        return 'acquirable'
      }
      return status
    }
  },
  created () {

  },
  methods: {
    openRedEnvelope () {
      this.today = this.$moment()
      if (this.status === 'expired') {
        return
      }

      if (!this.user.account_type) {
        // 在弹出层显示之前，记录当前的滚动位置
        scrollTop = getScrollTop()
        // 使body脱离文档流
        document.body.classList.add('dialog-open')
        // 把脱离文档流的body拉上去，否则页面会回到顶部
        document.body.style.top = -scrollTop + 'px'

        this.$vux.confirm.show({
          title: '领取失败',
          content: '游客无法领取红包，请先注册',
          confirmText: '立即注册',
          showCancelButton: false,
          hideOnBlur: true,
          onConfirm: () => {
            this.$router.push({path: '/register'})
          },
          onHide: () => {
            // body又回到了文档流中
            document.body.classList.remove('dialog-open')
            to(scrollTop)
          }
        })
        return
      }
      let envelopeId = this.redEnvelope.id
      if (this.status === 'acquirable') {
        this.$vux.loading.show()
        takeRedEnvelope(envelopeId).then(data => {
          let envelopeStatus
          let actionStatus
          switch (data.status) {
            case 'acquired':
              actionStatus = 'success'
              envelopeStatus = 'acquired'
              break
            case 'exhausted':
              actionStatus = 'fail'
              envelopeStatus = 'exhausted'
              break
            default:
              actionStatus = 'error'
              envelopeStatus = 'acquirable'
          }
          this.$store.dispatch('chatroom/updateRedEnvelopeStatus', {
            id: envelopeId,
            status: envelopeStatus
          })
          this.$emit('take-envelope', {
            ...data,
            status: actionStatus,
            id: envelopeId
          })
        }).catch(errRes => {
          this.$emit('take-envelope', {
            message: msgFormatter(errRes) || '系统繁忙中请稍后再试',
            status: 'error',
            id: envelopeId
          })
        }).finally(() => {
          this.$vux.loading.hide()
        })
      } else {
        this.$store.dispatch('addKeepAlive', 'Chatroom')
        this.$router.push({path: `/red_envelope/${envelopeId}`})
      }
    }
  }
}
</script>

<style lang="less" scoped>
.red-envelope-container {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  width: 210px;
  height: 50px;
  padding: 10px 6px;
  background-color: #fa9d3b;
  border-radius: 8px;
  color: #fff;
  .icon {
    height: 35px;
    width: 38px;
    background: url("../../assets/envelope/normal.svg") no-repeat;
    background-size: contain;
  }
  &.opened {
    background: #fa9d3b;
    opacity: 0.6;
    .icon {
      background-image: url("../../assets/envelope/opened.svg");
    }
  }
  .content {
    .msg {
      font-size: 14px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .status-text {
      font-size: 12px;
    }
  }
}
</style>

