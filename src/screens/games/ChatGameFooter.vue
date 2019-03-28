<template>
<div class="chat-game-footer" id="typing" @click="handTriggerPanel">
  <template v-if="mode==='typing'">
    <div id="switch-btn" class="switch-btn" @click="mode='bet'">
    </div>
    <div class="image-btn"></div>
    <label class="touch-input">
      <textarea
        type="textarea"
        autocomplete="off"
        validateevent="true"
        :class="['el-textarea', noPermission ? 'is-disabled' : '']"
        v-model="msgCnt"
        :disabled="noPermission">
      </textarea>
      <div id="emoji-btn" class="emoji-btn">
      </div>
    </label>
    <div class="send-btn" @click="sendMsg">
      <div class="icon"></div>
    </div>
  </template>
  <template v-else>
    <div id="keyboard-btn" class="keyboard-btn" @click="mode='typing'">
    </div>
    <div class="text-btn" @click="$emit('openBetInterface', 'bet')">下注</div>
    <div class="text-btn" @click="$emit('openBetInterface', 'bettrack')">追号</div>
  </template>
</div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { msgFormatter } from '@/utils'
import { Swiper, SwiperItem } from 'vux'
import { sendImgToChat } from '@/api'
import lrz from 'lrz'
export default {
  name: 'ChatFooter',
  components: {
    Swiper,
    SwiperItem
  },
  data () {
    return {
      isShowControlPanel: false,
      isShowEmojiPanel: false,
      msgCnt: '',
      activeSeries: 'symbol',
      mode: 'typing'
    }
  },
  computed: {
    ...mapState([
      'user', 'systemConfig', 'emojis', 'ws', 'personal_setting', 'roomId'
    ]),
    noPermission () {
      return false
    },
    emojiSeries () {
      if (!this.emojis) {
        return []
      }
      return Object.values(this.emojis).sort((a, b) => a.order - b.order)
    },
    currentEmojisChunk () {
      if (!this.emojis) {
        return []
      }
      const emojis = this.emojis[this.activeSeries]
      if (this.activeSeries === 'symbol') {
        return _.chunk(emojis.stickers, 24)
      }
      return _.chunk(emojis.stickers, 8)
    }
  },
  methods: {
    handTriggerPanel (e) {
      let target = e.target
      let id = target.id
      while (id !== 'typing') {
        if (id === 'switch-btn') {
          this.isShowControlPanel = !this.isShowControlPanel
          this.isShowEmojiPanel = false
          break
        } else if (id === 'emoji-btn') {
          if (!this.user.account_type) {
            return
          }
          if (this.noPermission) {
            return
          }
          this.isShowControlPanel = false
          this.isShowEmojiPanel = !this.isShowEmojiPanel
          break
        }
        target = target.parentNode
        id = target.id
        if (id === 'typing' || target.nodeName === 'BODY') {
          this.hidePanel()
          break
        }
      }
    },
    hidePanel () {
      this.isShowControlPanel = false
      this.isShowEmojiPanel = false
    },
    sendMsgImg (e) {
      if (this.noPermission) { return false }
      let fileInp = this.$refs.fileImgSend
      let file = fileInp.files[0]

      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value)) {
        this.$vux.toast.show({
          text: '文件格式不正确或您目前尚不符合发言条件',
          type: 'warn'
        })
        return false
      }

      lrz(file).then(rst => {
        if (rst.fileLen > 1024 * 1024) {
          this.$vux.toast.show({
            text: '图片尺寸太大，请选择较小尺寸的图片',
            type: 'warn'
          })
          return
        }
        let formData = new FormData()
        formData.append('receivers', this.roomId)
        formData.append('image', rst.file)
        sendImgToChat(formData).then((data) => {
          this.hidePanel()
          fileInp.value = ''
        }).catch((errRes) => {
          this.$vux.toast.show({
            text: msgFormatter(errRes),
            type: 'warn'
          })
          this.hidePanel()
        })
      })
    },
    sendMsg () {
      if (this.noPermission || !this.msgCnt.trim()) { return false }
      this.ws.raven.send({
        'type': 0,
        'content': this.msgCnt
      })
      this.msgCnt = ''
    },
    sendEmojiSymbol (e) {
      let target = e.target
      if (target.nodeName === 'LI') {
        this.msgCnt = this.msgCnt + target.dataset.content
      }
    },
    sendEmojiSticker (e, id) {
      let target = e.target
      while (target.nodeName !== 'UL') {
        if (target.nodeName === 'LI') {
          this.ws.raven.send({
            'type': 7,
            'content': target.dataset.content,
            'sticker': target.dataset.stickerid
          })
          this.hidePanel()
          break
        }
        target = target.parentNode
      }
    },
    clickSendImg (e) {
      if (!this.user.account_type) {
        e.preventDefault()
      }
      if (this.noPermission) {
        e.preventDefault()
      }
    }
  }
}
</script>

<style lang="less" scoped>
.chat-game-footer {
  box-sizing: border-box;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  flex: 0 0 auto;
  background: #fafafa;
  width: 100%;
  .send-btn {
    flex: 0 0 auto;
    box-sizing: border-box;
    height: 100%;
    width: 50px;
    padding: 5px;
    padding-right: 5px;
    .icon {
      height: 100%;
      width: 100%;
      border-radius: 4px;
      background-color: @azul;
      background-image: url('../../assets/icon_paper-plane.svg');
      background-repeat: no-repeat;
      background-size: 70%;
      background-position: center;
      font-size: 14px;
      color: #fff;
    }
  }
  .switch-btn,.keyboard-btn {
    flex: 0 0 auto;
    box-sizing: border-box;
    height: 100%;
    width: 50px;
    border-right: 1px solid #e5e5e5;
    background-size: 60% 60%;
  }
  .keyboard-btn {
    background: url('../../assets/chatGame/keyboard.svg') no-repeat center center;
  }
  .switch-btn {
    background: url('../../assets/chatGame/switch.svg') no-repeat center center;
  }
  .image-btn {
    flex: 0 0 auto;
    height: 100%;
    width: 40px;
    background: url('../../assets/chatGame/picture.svg') no-repeat center center;
    background-size: 60% 60%;
  }
  .emoji-btn {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 40px;
    background: url('../../assets/chatGame/smile.svg') no-repeat center center;
    background-size: 60% auto;
  }

  .touch-input{
    position: relative;
    flex: 1 1 auto;
    height: 100%;
    padding: 5px 0 5px 5px;
    box-sizing: border-box;
  }

  .text-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1 1 auto;
    box-sizing: border-box;
    height: 100%;
    border-right: 1px solid #e5e5e5;
    color: #333;
    &:last-child {
      border-right: none;
    }
  }

  .el-textarea {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0 45px 0 5px;
    line-height: 25px;
    resize: none;
    outline: none;
    display: block;
    font-size: 16px;
    color: #1f2d3d;
    background-color: #fff;
    border: 1px solid #f2f2f2;
    border-radius: 4px;
    transition: border-color .2s cubic-bezier(.645,.045,.355,1);
    box-sizing: border-box;
    background-image: none;
    &.is-disabled {
      color: #bbb;
    }
  }
  .emoji-panel {
    width: 100%;
    height: 230px;
    .select-panel {
      width: 100%;
      height: 180px;
      .sticker-series,.symbol-series {
        height: 100%;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        box-sizing: border-box;
        padding: 10px 10px 20px 10px;
        -webkit-tap-highlight-color: transparent;
        .sticker-item {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      .sticker-series{
        .sticker-item {
          height: 50%;
          width: 25%;
          box-sizing: border-box;
          padding-bottom: 10px;
          .sticker {
            width: 100%;
            height: 100%;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
          }
        }
      }
      .symbol-series{
        .sticker-item {
          height: 33%;
          width: 12.5%;
          font-size: 20px;
        }
      }
    }
    .series-panel {
      width: 100%;
      height: 50px;
      overflow: hidden;
      ul {
        height: 100%;
        display: flex;
        background: #fff;
        li {
          width: 50px;
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          &.active {
            background: #f5f5f5;
          }
          .logo {
            width: 30px;
            height: 30px;
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
          }
        }
      }
    }
  }
  .control-panel {
    display: flex;
    width: 100%;
    height: 90px;
    padding: 5px 0 0 12px;
    box-sizing: border-box;
    .control-btn {
      height: 100%;
      width: 72px;
      padding-right: 12px;
      box-sizing: border-box;
      .icon-bg {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 60px;
        border-radius: 5px;
        background-color: #ffffff;
        border: solid 1px #dfdfdf;
        box-sizing: border-box;
      }
      .picture-icon {
        .icon {
          background: url('../../assets/picture.png') no-repeat center;
          background-size: contain;
          height: 30px;
          width: 38px;
        }
        &:active {
          .icon {
            background-image: url('../../assets/picture_pressed.png');
          }
        }
      }
      .title {
        width: 100%;
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #9b9b9b;
        font-size: 12px;
      }
      .img-upload-input {
        display: none;
      }
    }
  }
}
</style>

