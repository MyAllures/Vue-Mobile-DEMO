<template>
<div class="container">
  <div :class="['footer', isFocus?'isFocus':'']">
    <div id="typing" class="typing" @click="handTriggerPanel">
      <div id="more-btn" class="more-btn"></div>
      <div id="emoji-btn" class="emoji-btn btn">
        <icon scale="1.5" name="smile-o"></icon>
      </div>
      <textarea
        @focus="isFocus = true"
        @blur="isFocus = false"
        ref="realChatpannel"
        type="textarea"
        autocomplete="off"
        validateevent="true"
        :class="['el-textarea', noPermission ? 'is-disabled' : '']"
        v-model="msgCnt"
        :disabled="noPermission">
      </textarea>
      <div class="send-btn btn" @click="sendMsg" >
        <icon scale="1" name="paper-plane"></icon>
      </div>
    </div>
  </div>
  <div :class="['footer', 'fake', isFocus?'isFocus':'']">
    <div id="typing" class="typing" @click="handTriggerPanel">
      <div id="more-btn" class="more-btn"></div>
      <div id="emoji-btn" class="emoji-btn btn">
        <icon scale="1.5" name="smile-o"></icon>
      </div>
      <textarea
        @focus="triggerRealInput"
        ref="chatpannel"
        type="textarea"
        autocomplete="off"
        :placeholder="chatConditionMessage"
        validateevent="true"
        :class="['el-textarea', noPermission ? 'is-disabled' : '']"
        v-model="msgCnt"
        :disabled="noPermission">
      </textarea>
      <div class="send-btn btn" @click="sendMsg" >
        <icon scale="1" name="paper-plane"></icon>
      </div>
    </div>
    <div v-show="isShowEmojiPanel" class="emoji-panel">
      <div class="select-panel">
        <swiper
          height="180px"
          dots-position="center"
          dots-class="emoji">
          <swiper-item
            v-for="(chunk, index) in currentEmojisChunk"
            :key="index">
            <ul
              v-if="activeSeries === 'symbol'" class="symbol-series"
              @click="sendEmojiSymbol">
              <li
                class="sticker-item"
                v-for="(emoji, emojiIndex) in chunk"
                :key="emojiIndex"
                :data-content="emoji.emoji">
                {{emoji.emoji}}
                </li>
            </ul>
            <ul
              v-else class="sticker-series"
              @click="sendEmojiSticker">
              <li
                class="sticker-item"
                v-for="(sticker, stickerIndex) in chunk"
                :key="stickerIndex"
                :data-content="sticker.url"
                :data-stickerid="sticker.id">
                <div class="sticker" :style="{'background-image': `url('${sticker.url}')`}"></div>
                </li>
            </ul>
          </swiper-item>
        </swiper>
      </div>
      <div class="series-panel">
        <ul>
          <li :class="{active: series.name === activeSeries}" v-for="(series, index) in emojiSeries" :key="index" @click="activeSeries = series.id">
            <div v-if="series.logo" class="logo" :style="{'background-image':`url('${series.logo}')`}"></div>
            <span v-else>{{series.display_name}}</span>
          </li>
        </ul>
      </div>
    </div>
    <div v-show="isShowControlPanel" class="control-panel">
      <label v-if="systemConfig.envelopeSettings.enabled === '1' && roomId === user.default_room_id" class="control-btn" @click="openEnvelopeDialog">
        <div class="icon-bg">
          <div class="envelope-icon"></div>
        </div>
        <div class="title">发红包</div>
      </label>
      <label class="control-btn" for="capture" @click="clickSendImg">
        <div class="icon-bg">
          <div class="picture-icon"></div>
        </div>
        <div class="title">图片</div>
        <input @change="sendMsgImg"
          type="file"
          id="capture"
          ref="fileImgSend"
          class="img-upload-input"
          accept="image/*">
      </label>
    </div>
  </div>
</div>
</template>

<script>
import Icon from 'vue-awesome/components/Icon'
import _ from 'lodash'
import { mapState } from 'vuex'
import 'vue-awesome/icons/smile-o'
import 'vue-awesome/icons/paper-plane'
import { Swiper, SwiperItem } from 'vux'
import { sendImgToChat } from '../api'
import lrz from 'lrz'
export default {
  name: 'ChatFooter',
  components: {
    Swiper,
    SwiperItem,
    Icon
  },
  props: {
    roomId: {
      type: Number
    },
    openEnvelopeDialog: {
      type: Function
    },
    ws: {
      type: WebSocket
    },
    personalSetting: {
      type: Object
    }
  },
  data () {
    return {
      isFocus: false,
      isShowControlPanel: false,
      isShowEmojiPanel: false,
      msgCnt: '',
      activeSeries: 'symbol'
    }
  },
  created () {
    document.addEventListener('visibilitychange', this.visibilitychange)
  },
  computed: {
    ...mapState([
      'user', 'systemConfig', 'emojis'
    ]),
    noPermission () {
      return this.personalSetting.chat.status === 0
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
    },
    chatConditionMessage () {
      if (this.personalSetting.chat.status === 0) {
        return this.$store.state.systemConfig.global_preferences.chat_condition_message || ''
      } else {
        return ''
      }
    }
  },
  methods: {
    visibilitychange () {
      this.isFocus = false
      if (this.$refs.chatpannel) {
        this.$refs.chatpannel.blur()
      }
    },
    triggerRealInput () {
      this.$refs.realChatpannel.focus()
    },
    handTriggerPanel (e) {
      let target = e.target
      let id = target.id
      while (id !== 'typing') {
        if (id === 'more-btn') {
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
      if (!this.personalSetting.chat) { return false }
      let fileInp = this.$refs.fileImgSend
      let file = fileInp.files[0]

      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value) || this.noPermission) {
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
        }).catch((e) => {
          this.hidePanel()
        })
      })
    },
    sendMsg () {
      if (!this.msgCnt.trim() || !this.personalSetting.chat) { return false }
      this.ws.send(JSON.stringify({
        'command': 'send',
        'receivers': [this.roomId],
        'type': 0,
        'content': this.msgCnt
      }))
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
          this.ws.send(JSON.stringify({
            'command': 'send',
            'receivers': [this.roomId],
            'type': 7,
            'content': target.dataset.content,
            'sticker': target.dataset.stickerid
          }))
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
  },
  beforeDestroy () {
    document.removeEventListener('visibilitychange', this.visibilitychange)
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  flex: 0 0 auto;
}
.footer {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  background: #f5f5f5;
  &.fake {
    position: absolute;
    bottom: 0;
  }
  &.isFocus {
    &.fake {
      display: none
    }
  }
  .typing {
    height: 50px;
    display: flex;
    box-sizing: border-box;
    padding: 5px;
    width: 100%;
    .more-btn {
      flex: 0 0 auto;
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 4px;
      margin-right: 5px;
      background-color: #dfdfdf;
      &::before,&::after {
        position: absolute;
        left: 19px;
        top: 12px;
        content: ' ';
        height: 16px;
        width: 2px;
        background-color: #9b9b9b;
      }
      &::before {
        transform: rotate(90deg);
      }
    }
    .btn {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 4px;
    }
    .emoji-btn {
      margin-right: 5px;
      background-color: #dfdfdf;
      color: #9b9b9b;
    }

    .send-btn {
      font-size: 14px;
      line-height: 52px;
      background: #4a90e2;
      color: #fff;
    }

    .el-textarea {
      flex: 1 1 auto;
      margin-right: 5px;
      resize: none;
      outline: none;
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      font-size: 14px;
      @media screen and (max-width: 320px) {
        font-size: 13px;
      }
      color: #1f2d3d;
      background-color: #fff;
      border: 1px solid #bfcbd9;
      border-radius: 4px;
      transition: border-color .2s cubic-bezier(.645,.045,.355,1);
      box-sizing: border-box;
      background-image: none;
      &.is-disabled {
        border: solid 1px #b9b9b9;
        color: #bbb;
      }
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
        .envelope-icon {
          background: url('../assets/envelope_btn.png') no-repeat center;
          background-size: contain;
          height: 30px;
          width: 38px;
        }
        .picture-icon {
          background: url('../assets/picture.png') no-repeat center;
          background-size: contain;
          height: 30px;
          width: 38px;
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

