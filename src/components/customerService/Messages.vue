<template>
  <div class="container">
    <cube-scroll
      :data="messages"
      :options="options"
      @pulling-down="onPullingDown"
      ref="msg-scroll">
      <ul class="msgs">
        <li :ref="`message-${msgIndex}`" class="msg" v-for="(msg, msgIndex) in messages" :key="msgIndex">
          <div :class="msg.wrapperClassList">
              <div :class="['content', ...msg.contentClassList]">
                <template v-if="msg.isChatMsg">
                  <template>
                    <img v-if="msg.user.avatar_url" class="avatar" :src="msg.user.avatar_url" alt="a">
                    <i class="no-avatar" v-else>{{msg.user.username[0].toUpperCase()}}</i>
                  </template>
                  <div class="user-wrapper">
                    <p class="username">{{msg.user.nickname || msg.user.username}}</p>
                    <div class="msg-wrapper" v-if="msg.text">
                      <span class="bubble" v-if="msg.type === MSG_TYPE.normal">
                        {{msg.text}}
                      </span>
                      <img class="image bubble" v-if="msg.type === MSG_TYPE.image" :src="msg.text" alt="img"/>
                      <img class="sticker-img" v-if="msg.type === MSG_TYPE.sticker" :src="msg.text" alt="sticker">
                      <span class="date">{{$moment(msg.created_at).format('HH:mm:ss')}}</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <p v-html="msg.text"></p>
                </template>
              </div>
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
import {EMITTED_ACTION, MSG_TYPE} from '@/utils/CustomerService'
export default {
  props: {
    rawMessages: {
      type: Array,
      default: []
    },
    hasHistory: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      MSG_TYPE,
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
      this.$store.dispatch('customerService/deleteMessage', {msgid: 999})
      setTimeout(() => {
        this.$store.state.ws.venom.send({action: EMITTED_ACTION.history_message})
      }, 2000)
    }
  },
  watch: {
    hasHistory: {
      handler (isHas) {
        if (isHas) {
          this.options.pullDownRefresh = {threshold: 60, stopTime: 1000}
        } else {
          this.options.pullDownRefresh = false
        }
      },
      immediate: true
    }
  },
  computed: {
    messages () {
      const myName = this.$store.state.user.username
      return map(this.rawMessages, msg => {
        let wrapperClassList = []
        let contentClassList = []
        let isChatMsg = false
        switch (msg.type) {
          case MSG_TYPE.pulldown:
            wrapperClassList = ['pulldown']
            contentClassList = ['tip']
            break
          case MSG_TYPE.welcome:
            wrapperClassList = ['welcome']
            contentClassList = ['box']
            break
          case MSG_TYPE.datetag:
            wrapperClassList = ['datetag']
            contentClassList = ['date-badge']
            if (msg.text === this.$moment().format('YYYY-MM-DD')) { msg.text = '今天' }
            break
          case MSG_TYPE.sticker:
            wrapperClassList = [(msg.user && (msg.user.username === myName)) ? 'self-sent' : 'other-sent']
            contentClassList = ['sticker']
            isChatMsg = true
            break
          case MSG_TYPE.image:
            wrapperClassList = [(msg.user && (msg.user.username === myName)) ? 'self-sent' : 'other-sent']
            contentClassList = ['image']
            isChatMsg = true
            break
          case MSG_TYPE.normal:
            wrapperClassList = [(msg.user && (msg.user.username === myName)) ? 'self-sent' : 'other-sent']
            contentClassList = ['text']
            isChatMsg = true
            break
          default:
            return
        }
        return {
          ...msg,
          wrapperClassList,
          contentClassList,
          isChatMsg
        }
      })
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
  .bubble {
    display: inline-block;
    box-sizing: border-box;
    padding: 5px 10px;
    max-width: 240px;
    font-size: 14px;
    word-break: break-all;
    &.image {
      padding: 0;
    }
  }
  .date {
    font-size: 12px;
    transform: scale(.75);
    color: #999;
  }
  .content {
    display: flex;
    align-items: flex-start;
  }
  .msg-wrapper {
    display: flex;
    align-items: flex-end;
  }
  .sticker-img {
    display: inline-block;
    width: 120px;
    height: 120px;
  }

  .self-sent {
    display: flex;
    justify-content: flex-end;
    .avatar, .no-avatar, .username {
      display: none;
    }
    .bubble {
      order: 2;
      border-radius: 8px 0 8px 8px;
      background-color: #166fd8;
      color: #fff;
    }
    .sticker-img {
      order: 2;
    }
    .date {
      order: 1;
    }
  }

  .other-sent {
    display: flex;
    justify-content: flex-start;
    .avatar, .no-avatar {
      order: 1;
      width: 36px;
      height: 36px;
      border-radius: 15px;
    }
    .avatar {
      background-color: #ddd;
      margin-right: 5px;
    }
    .no-avatar {
      order: 1;
      line-height: 36px;
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
    .bubble {
      border-radius: 0px 8px 8px 8px;
      background-color: #fff;
      color: #333;
    }
  }

  .datetag, .welcome, .pulldown {
    display: flex;
    justify-content: center;
  }

  .date-badge {
    display: inline-block;
    padding: 1px 10px;
    background-color: #e0e0e0;
    border-radius: 10px;
    font-size: 12px;
    color: #999;
  }

  .box {
    background-color: #fff;
    border-radius: 8px;
    padding: 5px 13px;
    text-align: left;
    font-size: 14px;
    color: #333;
  }

  .pulldown {
    padding-top: 10px;
    .tip {
      font-size: 12px;
      color: #999;
    }
  }
}

</style>
