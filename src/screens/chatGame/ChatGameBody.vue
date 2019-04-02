<template>
  <div class="chat-game-body" ref="view">
    <ul class="message-group">
      <li
        v-for="(msg, index) in messages"
        :key="index"
        class="message-group-item">
        <div v-if="msg.type==='system'" class="system-message">{{msg.content}}</div>
        <div v-else-if="user.username !== msg.sender.username" :class="['other-message', {'bet-info': msg.type==='betrecord-sharing'}]">
          <div class="avatar" :style="{'background-image': msg.sender.avatar_url?`url('${msg.sender.avatar_url}')`:`url('${defaultAvatar}')`}"></div>
          <div class="right">
            <div class="nickname">{{msg.sender.nickname||msg.sender.username}}</div>
            <div class="content-wrapper">
              <bet-info v-if="msg.type==='betrecord-sharing'" :info="msg.bet_info"></bet-info>
              <div v-else class="text">{{msg.content}}</div>
            </div>
          </div>
        </div>
        <div v-else :class="['self-message', {'bet-info': msg.type==='betrecord-sharing'}]">
          <div class="content-wrapper">
            <div class="text">{{msg.content}}</div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import BetInfo from '@/screens/chatGame/BetInfo'
import { mapState } from 'vuex'
export default {
  name: 'ChatGameBody',
  components: {
    BetInfo
  },
  data () {
    const defaultAvatar = require('../../assets/avatar.png')
    return {
      notNeedScroll: false,
      defaultAvatar
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('eagle', {
      messages: state => state.messages
    })
  },
  watch: {
    'messages.length': function (newCount, oldCount) {
      if (newCount === 0) {
        return
      }
      this.notNeedScroll = false
      const view = this.$refs.view
      if (oldCount === 0) { // 初始
        this.$nextTick(() => {
          view.scrollTop = view.scrollHeight
        })
      } else if ( // 1. user正在閱讀之前訊息 2. 是否為自己發的訊息
        view.scrollTop + view.clientHeight + 100 > view.scrollHeight ||
        this.messages[newCount - 1].sender.username === this.user.username || this.messages[newCount - 1].type === 5) {
        this.$nextTick(() => {
          view.scrollTop = view.scrollHeight
        })
      } else {
        this.notNeedScroll = true
      }
    }
  },
  mounted () {
    this.notNeedScroll = false
    const view = this.$refs.view
    view.scrollTop = view.scrollHeight
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.chat-game-body {
  box-sizing: border-box;
  position: relative;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 10px;
  background: #eee;
  .message-group {
    .message-group-item {
      display: flex;
      margin-bottom: 10px;
      .system-message {
        display: inline-block;
        margin: 0 auto;
        padding: 0 10px;
        border-radius: 10px;
        font-size: 12px;
        color: #999;
        background: #e0e0e0;
        text-align: center;
      }

      .other-message, .self-message {
        &.bet-info {
          width: 90%;
          .right {
            width: 100%;
            .content-wrapper {
              width: 100%;
            }
          }
        }
      }
      .other-message {
        display: flex;
        color: #333;
        max-width: 90%;
        .avatar {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          margin-right: 5px;
          background-size: contain;
        }
        .nickname {
          font-size: 12px;
        }
        .content-wrapper {
          background: #fff;
          position: relative;
          border-radius: 10px;
          border-top-left-radius: 0;
          padding: 5px 10px;
          .text {
            font-size: 14px;
          }
        }
      }
      .self-message {
        max-width: calc(~"90%" - 41px);
        margin-left: auto;
        .content-wrapper {
          background: @azul;
          position: relative;
          border-radius: 10px;
          border-top-right-radius: 0;
          padding: 5px 10px;
          color: #fff;
          .text {
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
