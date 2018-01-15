<template>
  <div class="vux-center result-hint">
    <div v-if="status=== 1 || status === 3" class="m-t">
      <div v-if="this.status !== 1">
        <div v-if="this.checkTimes <= 5">
          <spinner class="vux-spinner"></spinner>
          <div class="hint">{{$t('deposit.checking_result')}}</div>
        </div>
        <div class="buttons" v-else>
          <div class="hint m-b">{{$t('deposit.check_later')}}</div>
          <x-button @click.native="refresh">{{$t('deposit.refresh')}}</x-button>
          <x-button @click.native="$router.push('/finance?active=deposit')">{{$t('deposit.view_history')}}</x-button>
        </div>
      </div>
      <div v-else>
        <i class="weui_icon weui_icon_success_circle"></i>
        <div class="text-green">成功充值：￥{{amount}}</div>
        <div class="buttons">
          <x-button @click.native="$router.push('/')">{{$t('deposit.play_games')}}</x-button>
          <x-button @click.native="$router.push('/fin/Payment_record')">{{$t('deposit.view_history')}}</x-button>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="hint" v-if="status === 2">{{$t('deposit.status_fail')}}</div>
      <div class="hint" v-if="status === 4">{{$t('deposit.status_canceled')}}</div>
    </div>
  </div>
</template>

<script>
import { Spinner, XButton } from 'vux'
import { onlinepaySuccess } from '../api'
import { mapActions } from 'vuex'
export default {
  data () {
    return {
      checkTimes: 0,
      confirmed: false,
      amount: '',
      status: 3
    }
  },
  computed: {
    transactionId () {
      let query = this.$route.query
      return query.payid || query.BillNo || query.transactionId
    }
  },
  created () {
    this.updateStatus()
  },
  methods: {
    ...mapActions([
      'fetchUser'
    ]),
    refresh () {
      this.checkTimes = 0
      this.updateStatus()
    },
    updateStatus () {
      if (this.checkTimes > 5 || this.status !== 3 || !this.transactionId) {
        return
      }
      onlinepaySuccess(this.transactionId).then(response => {
        // response.data is a array
        let data = response[0]
        this.status = data.status
        this.amount = data.amount
        // once we confirm that this transaction is finished, need to update member's info again
        if (this.status === 1) {
          this.fetchUser({})
        } else {
          if (data.status === 3) {
            this.checkTimes += 1
          }
          setTimeout(() => {
            this.updateStatus()
          }, 1000)
        }
      }, response => {
        if (response.status === 401) {
          this.$router.push('/login?next=' + this.$route.path)
        }
      })
    }
  },
  components: {
    Spinner,
    XButton
  }
}
</script>

<style lang="less" scoped>
.m-t{
  margin-top: 20px;
}
.result-hint {
  height: 100%;
  text-align: center;
  .hint{
    color: #999;
    margin-top: 10px;
  }
  .text-green {
    margin-top: 10px;
  }
  .buttons {
    margin: 20px;
  }
}
</style>
