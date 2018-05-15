<template>
  <div :class="['container', {disabled:currentEnvelope.status === 1 || currentEnvelope.status === 3}]">
    <div class="icon"></div>
    <div class="content">
      <div class="msg">{{item.content || '恭喜发财，大吉大利'}}</div>
      <div class="status">{{currentEnvelope.status | statusFilter}}</div>
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

    }
  },
  computed: {
    ...mapState([
      'envelope', 'user'
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

      if (envelopeStatus.expired) {
        status = 1
      } else {
        const me = envelopeStatus.users.find(user => this.user.id === user.receiver_id)
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
  margin-top: 5px;
  box-sizing: border-box;
  width: 70%;
  border-radius: 5px;
  background-color: #fa9d3b;
  padding: 10px;
  color: #fff;
  position: relative;
  &.disabled {
    background: #f5c38e;
  }
  .icon {
    height: 36px;
    width: 31px;
    background: url('../assets/envelope_msg.png') no-repeat;
    background-size: cover;
    margin-right: 5px;
  }
  .content {
    height: 36px;
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
    .status {
      height: 18px;
      width: 100%;
      line-height: 18px;
      font-size: 12px;
    }
  }
  &:after {
    content: '';
    position: absolute;
    top: 14px;
    width: 0;
    height: 0;
    border: 9px solid transparent;
    border-top: 0;
    margin-top: -7px;
    border-right-color: #fa9d3b;
  }
}

.item-left .container{
  &:after {
    left: 0;
    border-left: 0;
    margin-left: -8px;
  }
  &.disabled:after {
    border-right-color: #f5c38e;
  }
}

.item-right .container{
  float: right;
  &:after {
    right: 0;
    border-right: 0;
    margin-right: -9px;
    border-left-color: #fa9d3b;
  }
  &.disabled:after {
    border-left-color: #f5c38e;
  }
}
</style>

