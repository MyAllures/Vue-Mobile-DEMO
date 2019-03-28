<template>
  <div class="chat-game-body">
    <ul class="message-group">
      <li
        v-for="(msg, index) in messages"
        :key="index"
        class="message-group-item">
        <div v-if="msg.type==='system'" class="system-message">{{msg.content}}</div>
        <div v-else-if="user.username !== msg.sender.username" class="other-message">
          <div class="avatar" :style="{'background-image': `url('${msg.sender.avatar_url}')`}"></div>
          <div>
            <div class="nickname">{{msg.sender.nickname||msg.sender.username}}</div>
            <div class="content-wrapper">
              <div class="text">{{msg.content}}</div>
            </div>
          </div>
        </div>
        <div v-else class="self-message">
          <div class="content-wrapper">
            <div class="text">{{msg.content}}</div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'ChatGameBody',
  props: {
    messages: {
      type: Array,
      default: []
    }
  },
  computed: {
    ...mapState([
      'user'
    ])
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
          background: lightblue;
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
