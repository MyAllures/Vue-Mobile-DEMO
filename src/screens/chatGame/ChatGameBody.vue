<template>
  <div class="chat-game-body" ref="view" v-fix-scroll>
    <ul class="message-group">
      <li
        v-for="(msg, index) in messages"
        :key="index"
        class="message-group-item">
        <div v-if="msg.type==='system'" class="system-message">{{msg.content}}</div>
        <div v-else-if="user.username !== msg.sender.username" :class="['other-message', chatContentType(msg.type)]">
          <div class="avatar" :style="{'background-image': msg.sender.avatar_url?`url('${msg.sender.avatar_url}')`:`url('${defaultAvatar}')`}"></div>
          <div class="right">
            <div class="nickname">{{msg.sender.nickname||msg.sender.username}}</div>
            <div class="content-wrapper">
              <bet-info v-if="msg.type==='betrecord-sharing'" :info="msg.bet_info"></bet-info>
              <div v-else-if="msg.type==='image'" class="image" :style="{'background-image': `url('${msg.content}')`}"></div>
              <div v-else class="text">{{msg.content}}</div>
            </div>
          </div>
        </div>
        <div v-else :class="['self-message', chatContentType(msg.type)]">
          <div class="content-wrapper">
            <bet-info v-if="msg.type==='betrecord-sharing'" :info="msg.bet_info"></bet-info>
            <div v-else-if="msg.type==='image'" class="img" :style="{'background-image': `url('${msg.content}')`}"></div>
            <div v-else class="text">{{msg.content}}</div>
          </div>
        </div>
      </li>
    </ul>
    <div :class="['to-bottom-btn', {visible: isToBottomBtnVisible}]" @click="toBottom"></div>
    <div :class="['helper-btn-group', {visible: isHelperVisible}]">
      <div
        v-for="(item, index) in helperGroup"
        :key="index"
        :class="['helper-btn', item.key, `order${helperGroup.length - index}`]" @click="dispatch('ChatGameHall', 'gameHall.showGameInfo', item.key)" v-html="item.content"></div>
    </div>
    <div :class="['helper-btn fold', {visible: isHelperVisible}]" @click="isHelperVisible = !isHelperVisible">
      <template v-if="!isHelperVisible">
        展开
      </template>
      <div v-else class="close-btn"></div>
    </div>
  </div>
</template>
<script>
import BetInfo from '@/screens/chatGame/BetInfo'
import { mapState } from 'vuex'
import { hasExpertPlan } from '@/utils/expertPlanSetting'
import { hasRoadBead } from '@/utils/roadBeadSetting'
import emitter from '@/mixins/emitter.js'
import throttle from 'lodash/throttle'
import FixScroll from '@/directive/fixscroll'

export default {
  name: 'ChatGameBody',
  props: {
    game: {
      required: true,
      type: Object
    }
  },
  components: {
    BetInfo
  },
  directives: {
    FixScroll
  },
  mixins: [emitter],
  data () {
    const defaultAvatar = require('../../assets/avatar.png')
    return {
      notNeedScroll: false,
      defaultAvatar,
      isHelperVisible: false,
      isToBottomBtnVisible: false
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('eagle', {
      messages: state => state.messages
    }),
    hasExpertPlan () {
      if (!this.game) {
        return false
      }
      return hasExpertPlan(this.game.code)
    },
    helperGroup () {
      const expertConfig = { key: 'expertplan', content: '<p>专家</p><p>计划</p>' }
      const roadBeadConfig = { key: 'roadbeads', content: '路珠' }
      const leaderBoardConfig = { key: 'leaderboard', content: '长龙' }
      const group = []
      if (!this.game) {
        return []
      }
      let code = this.game.code
      group.push(leaderBoardConfig)
      if (hasRoadBead(code)) {
        group.push(roadBeadConfig)
      }
      if (hasExpertPlan(code)) {
        group.push(expertConfig)
      }
      return group
    }
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
    view.addEventListener('scroll', this.showToBottomBtn)
  },
  methods: {
    toBottom () {
      const view = this.$refs.view
      if (view) {
        view.scrollTop = view.scrollHeight
      }
    },
    chatContentType (type) {
      switch (type) {
        case 'betrecord-sharing':
          return 'bet-info'
        case 'image':
          return 'image'
        default:
          return 'text'
      }
    },
    showToBottomBtn: throttle(function () {
      const view = this.$refs.view
      if (view.scrollTop + view.clientHeight + 60 < view.scrollHeight) {
        this.isToBottomBtnVisible = true
      } else {
        this.isToBottomBtnVisible = false
      }
    }, 500)
  },
  beforeDestroy () {
    this.$refs.view.removeEventListener('scroll', this.showToBottomBtn)
  }
}
</script>

<style lang="less" scoped>
.chat-game-body {
  box-sizing: border-box;
  position: relative;
  flex: 1 1 auto;
  padding: 10px 12px;
  background: #eee;
  overflow-y: auto;
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

      .other-message,
      .self-message {
        &.bet-info,&.image {
          width: 90%;
          .content-wrapper {
            padding: 5px 10px;
          }
          .right {
            width: 100%;
            .content-wrapper {
              width: 100%;
            }
          }
        }
        &.image {
          .img {
            background-repeat: no-repeat;
            background-size: contain;
            width: 100%;
            height: 100px;
          }
        }
        &.text{
          font-size: 14px;
        }
      }
      .other-message {
        &.text, &.bet-info {
          .content-wrapper {
            background: #fff;
          }
        }
      }
      .self-message {
        &.text, &.bet-info {
          .content-wrapper {
            background: @azul;
            color: #fff;
          }
        }
        .img {
          background-position: right center;
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
          position: relative;
          border-radius: 10px;
          border-top-left-radius: 0;
        }
      }
      .self-message {
        max-width: calc(~"90%" - 41px);
        margin-left: auto;
        .content-wrapper {
          position: relative;
          border-radius: 10px;
          border-top-right-radius: 0;
          padding: 5px 10px;
        }
      }
    }
  }
}
.close-btn {
  position: absolute;
  right: -1px;
  top: -1px;
  &::before,
  &::after {
    height: 15px;
  }
}
.to-bottom-btn {
  box-sizing: border-box;
  position: fixed;
  left: 10px;
  bottom: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  background: url('../../assets/to_bottom.svg') no-repeat center;
  background-color: #fff;
  font-size: 12px;
  transition-duration: 0.2s;
  opacity: 0;
  visibility: hidden;
  &.visible {
    opacity: 1;
    visibility: visible;
  }
}
.helper-btn {
  box-sizing: border-box;
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  transition-duration: 0.2s;
  .close-btn {
    top: 8px;
    left: 6px;
  }
  &.fold {
    bottom: 62px;
    right: 10px;
    position: fixed;
    background-color: #bfbfbf;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  }
  &.leaderboard {
    border: 2px solid #3bb99c;
    background: #60d1b8;
  }
  &.roadbead {
    border: 2px solid #a442b8;
    background: #c252d9;
  }
  &.expert {
    border: 2px solid #b43a49;
    background: #d54052;
  }
}
.helper-btn-group {
  visibility: visible;
  position: fixed;
  bottom: 62px;
  right: 10px;
  &.visible {
    visibility: visible;
    .helper-btn {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    }
    .order1 {
      bottom: 50px;
    }
    .order2 {
      bottom: 100px;
    }
    .order3 {
      bottom: 150px;
    }
    .leaderboard {
      border: 2px solid #3bb99c;
      background: #60d1b8;
    }
    .roadbeads {
      border: 2px solid #a442b8;
      background: #c252d9;
    }
    .expertplan {
      border: 2px solid #b43a49;
      background: #d54052;
    }
  }
}
</style>
