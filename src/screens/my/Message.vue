<template>
<div>
  <group>
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
      <p class="content" v-if="message.showContent">
        {{message.content}}
      </p>
    </template>
  </group>
  <div class="view-more" v-if='!ended'>
    <x-button @click.native="getMessages">查看更多</x-button>
  </div>
</div>
</template>
<script>
import { Group, Cell, XButton } from 'vux'
import { readMessage, fetchMessages } from '../../api'

export default {
  data () {
    return {
      messages: [],
      page: 0,
      limit: 20,
      ended: false
    }
  },
  created () {
    this.getMessages()
  },
  methods: {
    read (message) {
      this.$set(message, 'showContent', !message.showContent)
      if (!message.status) {
        readMessage(message).then((response) => {
          message.status = 1
          this.$root.unread = this.$root.unread - 1 + ''
          if (this.$root.unread <= 0) {
            this.$root.unread = 0
          }
        })
      }
    },
    getMessages () {
      fetchMessages(this.limit, this.page)
        .then(res => {
          this.messages = this.page === 0 ? res.results : this.messages.concat(res.results)
          if (this.messages.length === this.limit) {
            this.page += 1
          } else {
            this.ended = true
          }
        })
    }
  },
  components: {
    Group,
    Cell,
    XButton
  }
}
</script>
<style lang='less' scoped>
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
}
.view-more {
  margin: 10px;
}
</style>
