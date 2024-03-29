<template>
<div>
  <div v-if="messages.length">
    <group class="landing-msgs">
      <template v-for="(message, index) in messages">
        <cell :class="['cell-box', message.status ? 'read' : 'unread']"
              :title="message.title"
              is-link
              :arrow-direction="message.showContent ? 'up' : 'down'"
              :key="'message' + index"
              @click.native="read(message)">
          <div slot="default">
            <span class="sent-at">{{message.sent_at | moment('YYYY-MM-DD hh:mm')}}</span>
          </div>
        </cell>
        <p class="content" v-if="message.showContent" v-html="message.content"></p>
      </template>
    </group>
    <div class="view-more" v-if='!ended'>
      <x-button @click.native="getMessages">查看更多</x-button>
    </div>
  </div>
  <div class="skeleton" v-else-if="loading">
    <div class="cell" v-for="i in 5" :key="i">
      <div class="row">
        <rowSkeleton color="#eee" :seperatePoints="[skeletonBar[i - 1], 70]" highlight="#fff"></rowSkeleton>
      </div>
    </div>
  </div>
  <div class="text-center p-t-lg grey" v-else>
    目前没有消息
  </div>
</div>
</template>
<script>
import { Group, Cell, XButton } from 'vux'
import { readMessage, fetchMessages } from '../../api'
import rowSkeleton from '../../components/skeletonPattern/rowSkeleton'

export default {
  data () {
    return {
      messages: [],
      limit: 10,
      ended: false,
      loading: false,
      skeletonBar: [30, 40, 25, 35, 30],
      count: 0,
      delta: 0
    }
  },
  created () {
    this.getMessages()
  },
  methods: {
    read (message) {
      this.$set(message, 'showContent', !message.showContent)
      if (!message.status) {
        readMessage(message.id).then((response) => {
          message.status = 1
        })
      }
    },
    getMessages () {
      this.loading = true
      fetchMessages(this.limit, this.messages.length).then(res => {
        this.count = res.count
        this.messages = [...this.messages, ...res.results]
        this.ended = (this.messages.length === this.count)
        this.loading = false
      })
    },
    updateUnreadMessages () {
      this.loading = true
      fetchMessages(this.delta, 0).then(res => {
        this.messages.unshift(...res.results)
        this.loading = false
      })
    }
  },
  watch: {
    '$store.state.user.unread': function (val, oldVal) {
      if (val > oldVal) {
        this.delta = (val - oldVal)
        this.updateUnreadMessages()
      }
    }
  },
  components: {
    Group,
    Cell,
    XButton,
    rowSkeleton
  }
}
</script>
<style lang="less" scoped>
.messages {
  background-color: #fff;
  line-height: 1.41176471;
  font-size: 17px;
  overflow: hidden;
  position: relative;
}
.sent-at {
  font-size: 13px;
  margin-right: 15px;
}
.cell-box .content {
  font-size: 14px;
  height: 20px;
  text-overflow:ellipsis;
  white-space:nowrap;
  overflow:hidden;
  width: 200px;
}
.read /deep/ .vux-cell-bd {
  color: #999;
}
.content {
  padding: 0 15px 10px;
  color: #999;
  font-size: 14px;
  word-break: break-all;
}
.view-more {
  margin: 10px;
}

.landing-msgs /deep/ .weui-cells {
  margin-top: 0;
}

.skeleton {
  height: 250px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  .cell {
    width: 90%;
    height: 100%;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
  }

  .row {
    width: 100%;
  }
}
</style>
