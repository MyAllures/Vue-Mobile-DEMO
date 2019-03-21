<template>
  <div class="container">
    <cube-scroll
      :data="messages"
      :options="options"
      @pulling-down="onPullingDown"
      ref="msg-scroll">
      <ul class="msgs">
        <li class="msg" v-for="(msg, msgIndex) in messages" :key="msgIndex">
          <div :class="msg.wrapperClassList">
            <template v-if="msg.displayType === 'system'">
              <div :class="['content', ...msg.contentClassList]">
                <p v-html="msg.text"></p>
              </div>
            </template>
            <template v-else>
              <div :class="['content', ...msg.contentClassList]">
                <template v-if="msg.user">
                  <img v-if="msg.user.avatar_url" class="avatar" :src="msg.user.avatar_url" alt="a">
                  <i class="no-avatar" v-else>{{msg.user.username[0].toUpperCase()}}</i>
                </template>
                <div class="user-wrapper">
                  <p class="username" v-if="msg.user">{{msg.user.nickname || msg.user.username}}</p>
                  <div class="msg-wrapper" v-if="msg.text">
                    <span class="bubble">{{msg.text}}</span>
                    <span class="date">{{msg.timestamp}}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </li>
      </ul>
      <template slot="pulldown" slot-scope="props">
        <div v-if="props.pullDownRefresh"
          class="cube-pulldown-wrapper"
          :style="props.pullDownStyle">
          <div v-if="props.beforePullDown"
            class="before-trigger"
            :style="{paddingTop: props.bubbleY + 'px'}">
            <span :class="{rotate: props.bubbleY > options.pullDownRefresh.threshold - 60}">↓</span>
          </div>
          <div class="after-trigger" v-else>
            <div v-show="props.isPullingDown" class="loading">
              <cube-loading :size="20"></cube-loading>
            </div>
            <transition name="fade">
              <div v-show="!props.isPullingDown" class="text-wrapper">
                <i>check</i>
              </div>
            </transition>
          </div>
        </div>
      </template>
    </cube-scroll>
  </div>
</template>

<script>
import {map} from 'lodash'
import {EMITTED_ACTION, RECEIVED_ACTION} from '@/utils/CustomerService'
export default {
  props: {
    rawMessages: {
      type: Array,
      default: []
    }
  },
  data () {
    return {
      options: {
        pullDownRefresh: {
          threshold: 60,
          stopTime: 1000
        }
      }
    }
  },
  methods: {
    onPullingDown () {
      console.log('delete')
      this.$store.dispatch('customerService/deleteMessage', {msgid: 999})
      setTimeout(() => {
        this.options.pullDownRefresh = false
        this.$store.state.ws.venom.send({action: EMITTED_ACTION.history_message})
      }, 2000)
    }
  },
  computed: {
    messages () {
      const myName = this.$store.state.user.username
      return map(this.rawMessages, msg => {
        let wrapperClassList = []
        let timestamp = ''
        let displayType = '' // chatting, system
        let contentClassList = []
        if (msg.date_tag) {
          displayType = 'system'
          wrapperClassList = ['date_tag']
          contentClassList = ['date-badge']
          if (msg.text === this.$moment().format('YYYY-MM-DD')) { msg.text = '今天' }
        } else if (msg.action === RECEIVED_ACTION.welcome_message) {
          displayType = 'system'
          wrapperClassList = [msg.action]
          contentClassList = ['box']
        } else if (msg.action === 'pulldown') {
          displayType = 'system'
          wrapperClassList = [msg.action]
          contentClassList = ['tip']
        } else {
          displayType = 'chatting'
          wrapperClassList = [msg.action, (msg.user && (msg.user.username === myName)) ? 'self-sent' : 'other-sent']
          timestamp = this.$moment(msg.created_at).format('HH:mm:ss')
          contentClassList = []
        }
        return {
          ...msg,
          wrapperClassList,
          timestamp,
          displayType,
          contentClassList
        }
      })
    },
    watch: {
      'has_history_message': {
        handler () {

        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  height: 100%;
  padding-left: 10px;
  padding-right: 10px;
}

.msg {
  margin-bottom: 10px;
  margin-top: 10px;
  .self-sent {
    display: flex;
    justify-content: flex-end;
    .avatar, .no-avatar {
      display: none;
    }
    .username {
      display: none;
    }
    .msg-wrapper {
      display: flex;
      align-items: flex-end;
    }
    .content {
      display: flex;
      align-items: flex-start;
    }
    .bubble {
      order: 2;
      display: inline-block;
      box-sizing: border-box;
      padding: 5px 10px;
      max-width: 240px;
      border-radius: 8px 0 8px 8px;
      background-color: #166fd8;
      font-size: 14px;
      color: #fff;
      word-break: break-all;
    }
    .date {
      order: 1;
      font-size: 12px;
      transform: scale(.75);
      color: #999;
    }
  }

  .other-sent {
    display: flex;
    justify-content: flex-start;
    .content {
      display: flex;
      align-items: flex-start;
    }
    .msg-wrapper {
      display: flex;
      align-items: flex-end;
    }
    .avatar {
      order: 1;
      width: 36px;
      height: 36px;
      border-radius: 15px;
      background-color: #ddd;
      margin-right: 5px;
    }
    .no-avatar {
      order: 1;
      width: 36px;
      height: 36px;
      line-height: 36px;
      border-radius: 15px;
      background-color: azure;
      color: #333;
      text-align: center;
      margin-right: 5px;
    }
    .user-wrapper {
      order: 2;
    }
    .username {
      font-size: 14px;
      color: #166fd8;
      margin-bottom: 5px;
    }
    .date {
      font-size: 12px;
      transform: scale(.75);
      color: #999;
    }
    .bubble {
      display: inline-block;
      box-sizing: border-box;
      padding: 5px 10px;
      border-radius: 0px 8px 8px 8px;
      max-width: 240px;
      background-color: #fff;
      color: #333;
      font-size: 14px;
      word-break: break-all;
    }
  }

  // naminig rule apply backend response action type
  .date_tag {
    display: flex;
    justify-content: center;
    .date-badge {
      display: inline-block;
      padding: 1px 10px;
      background-color: #e0e0e0;
      border-radius: 10px;
      font-size: 12px;
      color: #999;
    }
  }

  .welcome_message {
    display: flex;
    justify-content: center;
    .box {
      background-color: #fff;
      border-radius: 8px;
      padding: 5px 13px;
      text-align: left;
      font-size: 14px;
      color: #333;
    }
  }

  // custom for display
  .pulldown {
    display: flex;
    justify-content: center;
    padding-top: 10px;
    .tip {
      font-size: 12px;
      color: #999;
    }
  }
}

</style>
