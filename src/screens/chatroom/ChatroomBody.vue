<template>
  <div class="chatroom-body-wrapper">
    <div class="chatroom-body" v-fix-scroll ref="view">
      <div v-if="!isRoomExist" class="room-disable">
        <div class="image"></div>
        <div class="text">聊天室暂不开放，推荐你去下注或追号吧！</div>
      </div>
      <ul class="message-group">
        <li
          v-for="(msg, index) in messagesForDisplay"
          :key="index"
          class="message-group-item">
          <div v-if="msg.type==='system'" class="system-message">{{msg.content}}</div>
          <div v-else-if="user.username !== msg.sender.username" :class="['other-message', chatContentType(msg.type)]">
            <div
              class="avatar"
              :style="{'background-image': msg.sender.avatar_url?`url('${msg.sender.avatar_url}')`:`url('${defaultAvatar}')`}"
              @click="handleMember(msg.sender)"></div>
            <div class="right">
              <div class="nickname">{{msg.sender.nickname}}</div>
              <red-envelope
                v-if="msg.type==='red-envelope'"
                :red-envelope-str="msg.content"
                @take-envelope="handleEnvelope"/>
              <img-wrapper
                class="image"
                v-else-if="msg.type==='image'||msg.type==='sticker'"
                :src="msg.content"
                :type="msg.type"
                @imgStart="imgLoadCount++"
                @imgLoad="imgLoadCount--"
                @click.native="previewImg(msg.content)"/>
              <div v-else class="content-wrapper">
                <bet-info
                  :is-self="user.username === msg.sender.username"
                  v-if="msg.type==='betrecord-sharing'"
                  :info-str="msg.content"></bet-info>
                <div v-else class="text">{{msg.content}}</div>
              </div>
            </div>
          </div>
          <div v-else :class="['self-message', chatContentType(msg.type)]">
            <red-envelope
              v-if="msg.type==='red-envelope'"
              :red-envelope-str="msg.content"
              @take-envelope="handleEnvelope"/>
            <img-wrapper
              class="image"
              v-else-if="msg.type==='image'||msg.type==='sticker'"
              :src="msg.content"
              :type="msg.type"
              @imgStart="imgLoadCount++"
              @imgLoad="imgLoadCount--"
              @click.native="previewImg(msg.content)"/>
            <div v-else class="content-wrapper">
              <bet-info
                :is-self="user.username === msg.sender.username"
                v-if="msg.type==='betrecord-sharing'"
                :info-str="msg.content"></bet-info>
              <div v-else class="text">{{msg.content}}</div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="loading&&isRoomExist" class="room-loading">
      <inline-loading></inline-loading>加载中
    </div>
    <template v-if="!loading">
      <div class="followee-filter filter">
        <div :class="['followee-filter-item', {active: !followeeOnly}]" @click="followeeOnly=false">全部</div>
        <div :class="['followee-filter-item', {active: followeeOnly}]" @click="followeeOnly=true">关注</div>
      </div>
      <div :class="['bet-filter filter', {active: withoutBet}]" @click="withoutBet = !withoutBet">
        <filter-icon/>不看投注
      </div>
    </template>
    <div :class="['to-bottom-btn', {visible: isToBottomBtnVisible}]" @click="toBottom"></div>
      <div v-if="isManager" class="manage-btn" @click="dispatch('Chatroom', 'showPopup', 'chatmanage')">
        <p>禁言</p>
        <p>管理</p>
      </div>
      <cube-popup
        v-transfer-dom
        class="preview-image-popup"
        type="extend-popup"
        ref="image-popup"
        :maskClosable="true"
        :z-index="1000">
        <div class="preview-image-popup-content" @click="hidePreviewImg">
          <div class="close-btn"></div>
          <div class="preview-image" :style="{'background-image': `url('${selectedImage}')`}"></div>
        </div>
      </cube-popup>
      <div v-transfer-dom>
        <x-dialog
          :show.sync="chatManageDialogVisible"
          :hide-on-blur="true"
          :dialog-style="{
            width: '100%'
          }"
          @touchmove.native.prevent>
          <div class="chat-manage-dialog-wrapper">
            <div class="header">
              <div class="title">会员</div>
            </div>
            <div class="content">
              <div
                class="avatar"
                :style="{'background-image': selectedMember.avatar_url?`url('${selectedMember.avatar_url}')`:`url('${defaultAvatar}')`}"></div>
              <div class="nickname">{{selectedMember.nickname}}</div>
            </div>
            <div class="buttons single">
              <div v-if="!selectedMember.username||!user.followeeList||followLoading" class="loading">
                <inline-loading></inline-loading>加载中
              </div>
              <x-button v-else-if="!selectedMember.followable" type="default" disabled>未开放关注</x-button>
              <x-button v-else-if="user.followeeList.find(followee => followee.username === selectedMember.username)" type="default" @click.native="toggleFollowee">取消关注</x-button>
              <x-button v-else type="primary" @click.native="toggleFollowee">关注</x-button>
            </div>
            <div v-if="selectedMember.username&&isManager&&selectedMember.bannable" class="buttons">
              <div v-if="banLoading" class="loading">
                <inline-loading></inline-loading>加载中
              </div>
              <template v-else>
                <x-button type="default" :disabled="selectedMember.banned" @click.native="banMember(15)">禁言15分钟</x-button>
                <x-button type="default" :disabled="selectedMember.banned" @click.native="banMember(30)">禁言30分钟</x-button>
              </template>
            </div>
          </div>
        </x-dialog>
      </div>
      <div v-transfer-dom>
        <x-dialog
          :show.sync="takingRedEnvelopeDialogVisible"
          :hide-on-blur="true"
          :dialog-style="{
            width: '220px',
            height: '395px',
            background: 'rgba(0, 0, 0, 0)'
          }"
          @touchmove.native.prevent>
          <div class="taking-envelope-dialog-wrapper">
            <div class="paper" v-if="selectedRedEnvelope.status==='success'">
              <div class="text">领取成功</div>
              <div class="amount">{{selectedRedEnvelope.amount|currency('￥')}}</div>
            </div>
            <div class="paper" v-else-if="selectedRedEnvelope.status==='error'">
              <div class="text">领取失败</div>
            </div>
            <div :class="['status-icon', selectedRedEnvelope.status]"></div>
            <div class="msg">{{selectedRedEnvelope.message}}</div>
            <div class="detail-button">
              <x-button
                v-if="selectedRedEnvelope.status==='error'"
                type="primary"
                action-type="button"
                :disabled="false"
                @click.native="takingRedEnvelopeDialogVisible=false">确认
            </x-button>
            <x-button
                v-else
                type="primary"
                action-type="button"
                :disabled="false"
                @click.native="$router.push({path: `/red_envelope/${selectedRedEnvelope.id}`})">查看领取详情
            </x-button>
            </div>
          </div>
          <div class="close-area" @click="takingRedEnvelopeDialogVisible = false">
            <div class="icon">
              <cross-icon></cross-icon>
            </div>
          </div>
        </x-dialog>
      </div>
  </div>
</template>
<script>
import BetInfo from './BetInfo'
import { mapState } from 'vuex'
import { TransferDom, XDialog, XButton, InlineLoading } from 'vux'
import emitter from '@/mixins/emitter.js'
import throttle from 'lodash/throttle'
import FixScroll from '@/directive/fixscroll'
import ImgWrapper from './ImgWrapper'
import FilterIcon from '@/components/icon/Filter'
import RedEnvelope from '@/screens/chatroom/RedEnvelope'
import {eagle} from '@/api'
import CrossIcon from '@/components/icon/Cross'

export default {
  name: 'ChatroomBody',
  props: {
    game: {
      required: true,
      type: Object
    }
  },
  components: {
    BetInfo,
    ImgWrapper,
    XDialog,
    XButton,
    InlineLoading,
    FilterIcon,
    RedEnvelope,
    CrossIcon
  },
  directives: {
    FixScroll,
    TransferDom
  },
  mixins: [emitter],
  data () {
    const defaultAvatar = require('../../assets/avatar.png')
    return {
      notNeedScroll: false,
      defaultAvatar,
      isHelperVisible: true,
      isToBottomBtnVisible: false,
      imgLoadCount: 0,
      selectedImage: '',
      previewImgVisible: false,
      chatManageDialogVisible: false,
      takingRedEnvelopeDialogVisible: false,
      selectedMember: {},
      selectedRedEnvelope: {},
      bannedList: [],
      banLoading: false,
      followLoading: false,
      followeeOnly: false,
      withoutBet: false
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('chatroom', {
      messages: state => state.messages,
      isManager: state => state.isManager,
      ws: state => state.ws,
      loading: state => state.loading,
      isRoomExist: state => state.isRoomExist
    }),
    messagesForDisplay () {
      let result = this.messages
      if (this.followeeOnly === true) {
        const hash = {}
        this.user.followeeList.forEach(followee => {
          hash[followee.username] = true
        })
        result = result.filter(msg => !!msg.sender && !!msg.sender.username && hash[msg.sender.username])
      }
      if (this.withoutBet) {
        result = result.filter(msg => msg.type !== 'betrecord-sharing')
      }
      return result
    }
  },
  watch: {
    'messagesForDisplay.length': function (newCount, oldCount) {
      if (newCount === 0) {
        return
      }
      this.notNeedScroll = false
      let view = this.$refs.view
      if (oldCount === 0) { // 初始
        this.$nextTick(() => {
          view.scrollTop = view.scrollHeight
        })
      } else if ( // 1. user正在閱讀之前訊息 2. 是否為自己發的訊息
        view.scrollTop + view.clientHeight + 100 > view.scrollHeight ||
        (this.messagesForDisplay[newCount - 1].sender && this.messagesForDisplay[newCount - 1].sender.username === this.user.username)) {
        this.$nextTick(() => {
          view.scrollTop = view.scrollHeight
        })
      } else {
        this.notNeedScroll = true
      }
    },
    'imgLoadCount': function (count) {
      if (count === 0) {
        if (!this.notNeedScroll) {
          this.$nextTick(() => {
            const view = this.$refs.view
            view.scrollTop = view.scrollHeight
          })
        }
      }
    }
  },
  mounted () {
    this.notNeedScroll = false
    const view = this.$refs.view
    this.$nextTick(() => {
      view.scrollTop = view.scrollHeight
    })
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
    }, 500),
    previewImg (src) {
      this.selectedImage = src
      this.$refs['image-popup'].show()
    },
    hidePreviewImg () {
      this.$refs['image-popup'].hide()
    },
    handleMember (member) {
      this.chatManageDialogVisible = true
      this.selectedMember = {}
      eagle.fetchUserDetail(member.username, this.ws.roomId).then((res) => {
        this.selectedMember = {...member, ...res}
      }).catch(() => {

      })
    },
    banMember (duration) {
      this.banLoading = true
      this.ws.banMember(this.selectedMember.username, duration).then(res => {
        this.selectedMember.banned = true
        this.$vux.toast.show({
          text: res.status,
          type: 'success'
        })
      }).catch(() => {

      }).finally(() => {
        this.banLoading = false
      })
    },
    toggleFollowee () {
      this.followLoading = true
      this.$store.dispatch('toggleFollowee', this.selectedMember).then(res => {
        this.$vux.toast.show({
          text: res.messages[0],
          type: 'success'
        })
      }).catch(errRes => {
        this.$vux.toast.show({
          text: errRes.data.messages[0],
          type: 'warn'
        })
      }).finally(() => {
        this.followLoading = false
      })
    },
    handleEnvelope (data) {
      this.selectedRedEnvelope = data
      this.takingRedEnvelopeDialogVisible = true
    }
  },
  beforeDestroy () {
    this.$refs.view.removeEventListener('scroll', this.showToBottomBtn)
  }
}
</script>

<style lang="less" scoped>
.chatroom-body-wrapper {
  position: relative;
  height: calc(~"100%" - 50px);
  flex-direction: column;
  box-sizing: border-box;
  padding-top: 40px;
}

.room-loading {
  position: absolute;
  top: 0;
  width: 100%;
  height: 50px;
  line-height: 50px;
  font-size: 18px;
  text-align: center;
  .weui-loading {
    height: 30px;
    width: 30px;
  }
}

.chatroom-body {
  box-sizing: border-box;
  position: relative;
  padding: 0 12px 10px 12px;
  background: #eee;
  overflow-y: auto;
  height: 100%;
  width: 100%;
  .room-disable {
    padding-top: 20px;
    .image {
      height: 200px;
      background: url('../../assets/chatroom/room_disabled.png') no-repeat center;
      background-size: contain;
    }
    .text {
      font-size: 14px;
      color: #666;
      text-align: center;
    }
  }
  .message-group {
    padding-bottom: 40px;
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
        &.text {
          font-size: 14px;
          word-wrap: break-word;
          word-break: break-all;
        }
      }
      .content-wrapper {
        position: relative;
        border-radius: 10px;
        padding: 5px 10px;
      }
      .other-message {
        display: flex;
        color: #333;
        .avatar {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          margin-right: 5px;
          background-size: contain;
          background-repeat: no-repeat;
        }
        .nickname {
          font-size: 12px;
        }
        .content-wrapper {
          border-top-left-radius: 0;
        }
        &.text {
          max-width: 90%;
        }
        &.text,
        &.bet-info {
          .content-wrapper {
            background: #fff;
          }
        }
        .image {
          border-radius: 10px;
          border-top-left-radius: 0;
        }
        .sticker {
          width: 120px;
          height: 120px;
        }
      }
      .self-message {
        margin-left: auto;
        .content-wrapper {
          border-top-right-radius: 0;
        }
        &.text {
          max-width: calc(~"90%" - 36px);
        }
        &.text,
        &.bet-info {
          .content-wrapper {
            background: @azul;
            color: #fff;
          }
        }
        .image {
          border-radius: 10px;
          border-top-right-radius: 0;
        }
      }
    }
  }
}
.filter {
  box-sizing: border-box;
  position: absolute;
  top: 10px;
  display: flex;
  height: 20px;
  background: #ddd;
  border-radius: 4px;
  padding: 2px;
  color: #666;
  font-size: 12px;
}
.followee-filter {
  left: 10px;
  .followee-filter-item {
    border-radius: 4px;
    width: 45px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    &.active {
      color: #333;
      background: #fff;
    }
  }
}
.bet-filter {
  right: 10px;
  &.active {
    background: @azul;
    color: #fff;
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
.manage-btn {
  box-sizing: border-box;
  position: fixed;
  right: 10px;
  bottom: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  line-height: 14px;
  border-radius: 50%;
  color: #fff;
  font-size: 12px;
  border: 2px solid #e29348;
  background: #f5a623;
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
  background: url("../../assets/to_bottom.svg") no-repeat center;
  background-color: #fff;
  font-size: 12px;
  transition-duration: 0.2s;
  opacity: 0;
  visibility: hidden;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
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
  line-height: 14px;
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
  &.chatmanage {
    border: 2px solid #e29348;
    background: #f5a623;
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
    .order4 {
      bottom: 200px;
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
.preview-image-popup {
  .preview-image-popup-content {
    box-sizing: border-box;
    height: 80vh;
    width: 100vw;
    padding: 30px 0;
    display: flex;
    align-items: center;
  }
  .close-btn {
    top: 0;
    right: 0;
  }
  .preview-image {
    height: calc(~"100%" - 60px);
    width: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }
}

.chat-manage-dialog-wrapper {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  text-align: left;
  background-color: #fff;
  overflow: hidden;
  color: #333;
  .header {
    height: 40px;
    line-height: 40px;
    text-align: center;
    border-bottom: 1px solid #eee;
  }

  .title {
    font-size: 18px;
    color: #333;
  }

  .content {
    padding: 10px 0;
    border-bottom: 1px solid #eee;
    margin-bottom: 10px;
    .avatar {
      width: 100%;
      height: 80px;
      border-radius: 12px;
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      margin-bottom: 10px;
    }
    .nickname {
      font-size: 16px;
      text-align: center;
    }
  }

  .loading {
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 18px;
    text-align: center;
    .weui-loading {
      height: 30px;
      width: 30px;
    }
  }

  .buttons {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    padding: 0 15px 15px 15px;
    &.single {
      justify-content: center;
    }
    height: 55px;
    width: 300px;
    /deep/ .weui-btn {
      margin: 0;
      width: 130px;
    }
    /deep/ .weui-btn + .weui-btn {
      margin: 0;
    }
  }
}

.taking-envelope-dialog-wrapper {
  box-sizing: border-box;
  position: relative;
  width: 220px;
  height: 315px;
  padding-top: 120px;
  background: url('../../assets/envelope/dialog.png') no-repeat center 11px;
  background-size: contain;
  .paper {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    height: 89px;
    padding-top: 8px;
    margin: 0 auto;
    background: #fff4df;
    border-top-right-radius: 4px;
    border-top-left-radius: 4px;
    clip-path: polygon(100% 0%, 100% 84%, 50% 100%, 50% 100%, 0% 84%, 0 0);
    .text {
      width: 160px;
      background-image: radial-gradient(circle at 50% 50%, #e66551, rgba(239, 108, 85, 0.92) 15%, rgba(255, 244, 223, 0.5) 80%, rgba(255, 244, 223, 0.5));
      color: #fff4df;
    }
    .amount {
      font-size: 32px;
      color: #e66551;
    }
  }
  .status-icon {
    width: 50px;
    height: 50px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    margin: 0 auto;
    &.success {
      background-image: url('../../assets/envelope/success.svg');
    }
    &.fail {
      background-image: url('../../assets/envelope/fail.svg');
    }
    &.error {
      background-image: url('../../assets/envelope/error.svg');
    }
  }
  .msg {
    padding-top: 13px;
    font-size: 14px;
    color: #fdebc5;
    line-height: 20px;
    width: 140px;
    word-wrap: break-word;
    margin: 0 auto;
  }

  .detail-button {
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%);
    width: 190px;
    height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    background: transparent;
    margin: 0 auto;
    & /deep/ .weui-btn.weui-btn_primary {
      color: #e76953;
      background: #ffd264;
    }
  }
}
.close-area {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 56px;
  height: 80px;
  width: 100%;
  text-align: center;
  color: #fff;
  .icon {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #fff;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    padding: 2px;
  }
}
</style>
