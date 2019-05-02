<template>
  <div class="container" ref="scrollContainer">
    <cube-scroll
      ref="scroll"
      :data="sortedMessages"
      :options="options"
      @scroll="onScroll"
      :scrollEvents='["scroll"]'
      @pulling-down="onPullingDown">
      <ul ref="msgs" class="msgs">
        <li class="msg pulldown" v-if="hasMoreHistory && showPullDownTip"><span class="tip">下拉阅读过往聊天记录 ↓</span></li>
        <li class="msg" v-if="tempDateTag">
          <div class="msg-badge">
            <div class="content badge">
              <p>{{tempDateTag}}</p>
            </div>
          </div>
        </li>
        <li class="msg" v-for="(msg, msgIndex) in sortedMessages" :key="msgIndex">
          <div :class="msg.wrapperClassList" v-if="msg">
            <div :class="['content', ...msg.contentClassList]">
              <template v-if="msg.isChatMsg">
                <template>
                  <img v-if="msg.user.avatar_url" class="avatar" :src="msg.user.avatar_url" alt="a">
                  <i class="no-avatar" v-else>{{msg.user.username[0].toUpperCase()}}</i>
                </template>
                <div class="user-wrapper">
                  <p class="username">客服 {{msg.user.nickname || msg.user.username}}</p>
                  <div class="msg-wrapper" v-if="msg.text">
                    <span class="bubble" v-if="msg.type === MSG_TYPE.normal">
                      {{msg.text}}
                    </span>
                    <img class="image bubble" v-if="msg.type === MSG_TYPE.image" :src="msg.text" alt="img" @load="handleScrollTop(!showFullHistory)" @click="showImgAction(msg.text)" />
                    <img class="sticker-img" v-if="msg.type === MSG_TYPE.sticker" :src="msg.text" alt="sticker" @load="handleScrollTop(!showFullHistory)" />
                    <span class="date">{{$moment(msg.created_at).format('HH:mm:ss')}}</span>
                  </div>
                </div>
              </template>
              <template v-else-if="msg.type === MSG_TYPE.review">
                <p class="review-box">
                  <span class="rating">您为这次对话给出了<span :style="{ color: getRatingColor(msg.rating) }">【{{ getRatingDesc(msg.rating) }}】</span></span>
                  <span class="comment" v-html="msg.text" v-if="msg.text"></span>
                </p>
                <a class="clear" href="#" @click.prevent="clearReview(msg.id, msg.session)"><img src="../../assets/cs/icon-review-remove.svg" />清除</a>
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
    <div class="to-bottom" v-if="showScrollToBottom" @click="scrollToLast">
      <img src="../../assets/icon_double_arrow_down.svg" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { concat, map, takeRight } from 'lodash'
import { MSG_TYPE, MSG_CAT, RATINGS } from '@/utils/CustomerService'
import { deleteServiceReview } from '@/api'

export default {
  data () {
    return {
      MSG_TYPE,
      MSG_CAT,
      RATINGS,
      defaultHistoryNum: 30,
      showFullHistory: false,
      showPullDownTip: true,
      showScrollToBottom: false,
      options: {
        pullDownRefresh: false
      },
      browser: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  },
  mounted () {
    window.addEventListener('resize', this.handleSize)
    this.handleScrollTop()
    this.options.pullDownRefresh = this.pullDownRefreshOptions
  },
  methods: {
    onScroll (pos) {
      const initial = this.$refs.scroll.scroll.y < this.$refs.scrollContainer.scrollHeight - this.$refs.msgs.scrollHeight
      // 42 = 10 + 32, 32 => height of one line
      this.showScrollToBottom = !initial && (this.$refs.scrollContainer.scrollHeight - this.$refs.msgs.scrollHeight + 42) < pos.y
    },
    handleSize () {
      if (window.innerHeight !== this.browser.height) {
        this.browser.height = window.innerHeight
        this.handleScrollTop()
      }
    },
    onPullingDown () {
      setTimeout(() => {
        this.showPullDownTip = false
        this.showFullHistory = true
      }, 500)
    },
    showImgAction (imgSrc) {
      this.$createActionSheet({
        title: '图片操作',
        pickerStyle: true,
        data: [{
          content: '查看大图'
        }],
        onSelect: (item, index) => {
          if (index === 0) {
            window.open(imgSrc)
          }
        }
      }).show()
    },
    scrollToLast () {
      const betterScroll = this.$refs.scroll.scroll
      if (betterScroll) {
        betterScroll.scrollTo(0, betterScroll.maxScrollY, 200)
      }
    },
    handleScrollTop (force = false) {
      this.$nextTick(() => {
        this.$refs.scroll && this.$refs.scroll.refresh()
        if (!this.showScrollToBottom || force) {
          this.scrollToLast()
        }
      })
    },
    catHasMessages (cat) {
      return this.received[cat] && this.received[cat].length > 0
    },
    getRatingDesc (rating) {
      const item = RATINGS.find(r => r.value === rating)
      return item.desc
    },
    getRatingColor (rating) {
      const item = RATINGS.find(r => r.value === rating)
      return item.color
    },
    clearReview (id, session) {
      deleteServiceReview(id).then(() => {
        this.$store.dispatch('customerService/deleteReview', id)
      })
    }
  },
  watch: {
    pullDownRefreshOptions (val) {
      this.options.pullDownRefresh = val
    },
    messageCollection () {
      this.handleScrollTop()
    }
  },
  computed: {
    ...mapState('customerService', {
      received: state => state.received
    }),
    pullDownRefreshOptions () {
      if (this.hasMoreHistory && this.showPullDownTip) {
        return { threshold: 60, stopTime: 1000 }
      } else {
        return false
      }
    },
    historyMessage () {
      return this.showFullHistory ? this.received[MSG_CAT.history] : takeRight(this.received[MSG_CAT.history], this.defaultHistoryNum)
    },
    hasMoreHistory () {
      return (this.isHideHistory && this.catHasMessages(MSG_CAT.history)) || (!this.isHideHistory && this.received[MSG_CAT.history].length > this.defaultHistoryNum)
    },
    isHideHistory () {
      return this.catHasMessages(MSG_CAT.offline) && !this.showFullHistory
    },
    offlineMessage () {
      const msg = this.received[MSG_CAT.offline].slice(0)
      if (!this.isHideHistory && msg[0] && this.catHasMessages(MSG_CAT.history)) {
        const hLastDate = this.$moment(this.historyMessage[this.historyMessage.length - 1].created_at).format('YYYY-MM-DD')
        const oFirstDate = msg[0].text === '今天' ? this.$moment().format('YYYY-MM-DD') : msg[0].text
        if (hLastDate === oFirstDate) {
          msg.shift()
        }
      }
      return msg
    },
    tempDateTag () {
      if (this.catHasMessages(MSG_CAT.offline) || !this.catHasMessages(MSG_CAT.history) || this.historyMessage[0].date_tag) {
        return false
      }
      if ((this.hasMoreHistory && this.showPullDownTip) || !this.hasMoreHistory) {
        const date = this.$moment(this.historyMessage[0].created_at).format('YYYY-MM-DD')
        const today = this.$moment().format('YYYY-MM-DD')

        return date === today ? '今天' : date
      }
      return false
    },
    messageCollection () {
      return concat(
        this.isHideHistory ? [] : this.historyMessage,
        this.received[MSG_CAT.welcome],
        this.offlineMessage,
        this.received[MSG_CAT.common],
        this.received[MSG_CAT.error]
      )
    },
    sortedMessages () {
      return map(this.messageCollection, msg => {
        let wrapperClassList = []
        let contentClassList = []
        let isChatMsg = false
        switch (msg.type) {
          case MSG_TYPE.welcome_message:
          case MSG_TYPE.error:
          case MSG_TYPE.review:
          case MSG_TYPE.reviewThank:
            wrapperClassList = ['msg-box']
            contentClassList = ['box', msg.cat]
            if (msg.type === MSG_TYPE.review) {
              contentClassList.push('review')
            }
            break
          case MSG_TYPE.datetag:
          case MSG_TYPE.reviewCancel:
            wrapperClassList = ['msg-badge']
            contentClassList = ['badge']
            if (msg.text === this.$moment().format('YYYY-MM-DD')) {
              msg.text = '今天'
            }
            break
          case MSG_TYPE.normal:
          case MSG_TYPE.image:
          case MSG_TYPE.sticker:
            const className = {
              1: 'normal',
              2: 'image',
              3: 'sticker'
            }
            wrapperClassList = [msg.user && msg.user.username === this.$store.state.user.username ? 'self-sent' : 'other-sent']
            contentClassList = [className[msg.type]]
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
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleSize)
  }
}
</script>

<style>
body {
  overflow-x: hidden;
}
</style>
<style lang="less" scoped>
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
    color: #999;
    margin: 0 3px;
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
  .review-box {
    width: 100%;

    .rating,
    .comment {
      display: block;
    }
    .rating {
      text-align: center;
    }
    .comment {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
      word-break: break-all;
    }
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

  .msg-badge, .msg-box {
    display: flex;
    justify-content: center;
  }
  .badge {
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
    box-sizing: border-box;
  }
  .review {
    width: 250px;
    position: relative;

    .clear {
      display: block;
      position: absolute;
      right: -43px;
      bottom: 0;
      font-size: 12px;
      color: #b0b0b0;
      line-height: 1;

      img {
        vertical-align: middle;
      }
    }
  }
  .error {
    color: #d0021b;
  }
}
.pulldown {
  width: 100%;
  text-align: center;
  .tip {
    font-size: 12px;
    color: #999;
  }
}

 .cube-pulldown-wrapper {
  top: -60px;
  text-align: center;

  .before-trigger {
    height: auto;
    font-size: 30px;
    align-self: flex-end;

    span {
      display: inline-block;
      line-height: 1;
      transition: all 0.3s;
      color: #666;
      padding: 15px 0;

      &.rotate {
        transform: rotate(180deg)
      }
    }
  }
}
.to-bottom {
  box-shadow: 0 0 4px rgba(0, 0, 0, .2);
  background: #fff;
  text-align: center;
  font-family: Arial;
  font-weight: 200;
  display: flex;
  justify-content: center;
  width: 44px;
  height: 44px;
  line-height: 40px;
  border-radius: 50%;
  position: fixed;
  z-index: 2; // higher than .cube-scroll-content
  right: 5px;
  bottom: 55px;
  img {
    path {
      fill: @azul;
    }
    width: 20px;
  }
}
</style>
