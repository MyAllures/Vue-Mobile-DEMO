<template>
  <div :class="['container', `status${currentEnvelope.status}`]">
    <div class="icon"></div>
    <div class="content">
      <div class="msg">{{item.content || '恭喜发财，大吉大利'}}</div>
      <div v-if="personal_setting.chatable" class="status-text">{{currentEnvelope.status | statusFilter}}</div>
      <div v-else class="status-text">达成输入框内指示的发言条件才可以抢红包</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  filters: {
    statusFilter (val) {
      switch (val) {
        case 1:
          return '已过期'
        case 2:
          return '已领取'
        case 3:
          return '已领完'
        case 4:
          return '领取红包'
      }
    }
  },
  name: 'Envelope',
  props: {
    item: {
      type: Object
    }
  },
  data () {
    return {
      today: this.$moment()
    }
  },
  computed: {
    ...mapState([
      'envelope', 'user', 'personal_setting'
    ]),
    currentEnvelope () {
      const envelopeId = this.item.envelope_status.id
      if (!this.envelope[envelopeId]) {
        return {}
      } else {
        return this.envelope[envelopeId]
      }
    }
  },
  created () {
    const envelopeId = this.item.envelope_status.id
    if (!this.envelope[envelopeId]) {
      this.$store.dispatch('updateEnvelope', this.checkEnvelopStatus(this.item))
    }
  },
  methods: {
    checkEnvelopStatus (item) {
      let status
      const envelopeStatus = item.envelope_status
      const data = {
        avatar: item.sender.avatar,
        sendername: item.sender.nickname,
        content: item.content,
        users: envelopeStatus.users,
        total: envelopeStatus.total
      }
      if (this.today.isAfter(envelopeStatus.expired_time)) {
        status = 1
      } else {
        const me = envelopeStatus.users.find(user => this.user.username === user.username)
        if (me) {
          status = 2
          data.amount = me.amount
        } else if (envelopeStatus.total === envelopeStatus.users.length) {
          status = 3
        } else {
          status = 4
        }
      }
      data.status = status
      return {
        data: data,
        id: envelopeStatus.id
      }
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 70%;
  background-color: #fa9d3b;
  padding: 10px;
  color: #fff;
  position: relative;
  &.status1 {
    background: #D69F14;
    opacity: .6;
  }
  &.status2 {
    background: #fa9d3b;
    opacity: .6;
    .icon {
      background-image: url('../assets/envelope_opened.png');
    }
  }
  &.status3 {
    background: #D69F14;
    opacity: .6;
    .icon {
      background-image: url('../assets/envelope_opened.png');
    }
  }
  .icon {
    height: 36px;
    width: 31px;
    background: url('../assets/envelope_normal.png') no-repeat;
    background-size: cover;
    margin-right: 5px;
  }
  .content {
    min-height: 36px;
    width: calc(~'100%' - 36px);
    .msg {
      height: 18px;
      width: 100%;
      overflow : hidden;
      line-height: 18px;
      font-size: 14px;
      text-overflow : ellipsis;
      white-space : nowrap;
    }
    .status-text {
      min-height: 18px;
      width: 100%;
      line-height: 18px;
      font-size: 12px;
    }
  }
}
</style>

