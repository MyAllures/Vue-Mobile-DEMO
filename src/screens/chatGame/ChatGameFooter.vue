<template>
<div class="chat-game-footer">
  <div v-if="isShowEmojiPanel" class="emoji-panel" v-click-outside="hidePanel">
    <div class="select-panel">
      <swiper
        height="180px"
        dots-position="center"
        dots-class="emoji">
        <swiper-item
          v-for="(chunk, index) in currentEmojisChunk"
          :key="index">
          <ul
            class="sticker-series"
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
  <div class="input-panel" v-if="mode==='typing'" id="typing" @click="handTriggerPanel">
    <div id="switch-btn" class="switch-btn" @click="mode='bet'">
    </div>
    <label class="image-btn">
      <input @change="sendImg"
        type="file"
        ref="fileImgSend"
        class="img-upload-input"
        accept="image/*">
    </label>
    <label class="touch-input">
      <textarea
        id="typing"
        type="textarea"
        autocomplete="off"
        validateevent="true"
        :placeholder="chatConditionMessage"
        :class="noPermission ? 'is-disabled' : ''"
        v-model="msgCnt"
        :disabled="noPermission">
      </textarea>
      <div id="emoji-btn" class="emoji-btn">
      </div>
    </label>
    <div class="send-btn" @click="sendMsg">
      <div class="icon"></div>
    </div>
  </div>
  <div class="input-panel" v-else>
    <div id="keyboard-btn" class="keyboard-btn" @click="mode='typing'">
    </div>
    <div class="text-btn" @click="$emit('openBetInterface', 'bet')">下注</div>
    <div class="text-btn" @click="$emit('openBetInterface', 'bettrack')">追号</div>
  </div>
</div>
</template>

<script>
import _ from 'lodash'
import { mapState } from 'vuex'
import { msgFormatter } from '@/utils'
import { Swiper, SwiperItem } from 'vux'
import { eagle } from '@/api'
import lrz from 'lrz'
import vClickOutside from 'v-click-outside'
export default {
  name: 'ChatFooter',
  components: {
    Swiper,
    SwiperItem
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  data () {
    return {
      msgCnt: '',
      activeSeries: '1',
      mode: 'typing',
      isShowEmojiPanel: false
    }
  },
  computed: {
    ...mapState([
      'user', 'systemConfig', 'personal_setting'
    ]),
    ...mapState('eagle', {
      ws: state => state.ws,
      permission: state => state.permission,
      roomId: state => state.roomId,
      emojiMap: state => state.emojiMap
    }),
    noPermission () {
      return !this.permission || !this.permission.eligible
    },
    emojiSeries () {
      if (!this.emojiMap) {
        return []
      }
      return Object.values(this.emojiMap).sort((a, b) => a.order - b.order)
    },
    currentEmojisChunk () {
      if (!this.emojiMap) {
        return []
      }
      const emojiMap = this.emojiMap[this.activeSeries]
      return _.chunk(emojiMap.stickers, 8)
    },
    chatConditionMessage () {
      if (this.noPermission && this.permission) {
        return this.permission.messages
      } else {
        return ''
      }
    }
  },
  methods: {
    handTriggerPanel (e) {
      let target = e.target
      let id = target.id
      while (id !== 'typing') {
        if (id === 'switch-btn') {
          this.isShowEmojiPanel = false
          break
        } else if (id === 'emoji-btn') {
          if (this.noPermission) {
            return
          }
          e.stopPropagation()
          e.preventDefault()
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
      this.isShowEmojiPanel = false
    },
    sendImg (e) {
      if (this.noPermission) {
        return
      }
      let fileInp = this.$refs.fileImgSend
      if (this.noPermission || !fileInp) { return false }
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
        formData.append('receiver', this.ws.roomId)
        formData.append('image', rst.file)
        eagle.sendImg(formData).then((data) => {
          fileInp.value = ''
        }).catch((errRes) => {
          this.$vux.toast.show({
            text: msgFormatter(errRes),
            type: 'warn'
          })
        })
      })
    },
    sendMsg () {
      if (this.noPermission || !this.msgCnt.trim()) { return false }
      this.ws.sendMsg(this.msgCnt)
      this.msgCnt = ''
    },
    sendEmojiSticker (e, id) {
      let target = e.target
      while (target.nodeName !== 'UL') {
        if (target.nodeName === 'LI') {
          this.ws.sendSticker(target.dataset.stickerid)
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
  flex: 0 0 auto;
  background: #fafafa;
  width: 100%;
  .input-panel {
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 50px;
    background: #fafafa;
    width: 100%;
  }
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
      background-image: url("../../assets/icon_paper-plane.svg");
      background-repeat: no-repeat;
      background-size: 70%;
      background-position: center;
      font-size: 14px;
      color: #fff;
    }
  }
  .switch-btn,
  .keyboard-btn {
    flex: 0 0 auto;
    box-sizing: border-box;
    height: 100%;
    width: 50px;
    border-right: 1px solid #e5e5e5;
    background-size: 60% 60%;
  }
  .keyboard-btn {
    background: url("../../assets/chatGame/keyboard.svg") no-repeat center
      center;
  }
  .switch-btn {
    background: url("../../assets/chatGame/switch.svg") no-repeat center center;
  }
  .image-btn {
    flex: 0 0 auto;
    height: 100%;
    width: 40px;
    background: url("../../assets/chatGame/picture.svg") no-repeat center center;
    background-size: 60% 60%;
    .img-upload-input {
      display: none;
    }
  }
  .emoji-btn {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    width: 40px;
    background: url("../../assets/chatGame/smile.svg") no-repeat center center;
    background-size: 60% auto;
  }

  .touch-input {
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

  textarea {
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
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    box-sizing: border-box;
    background-image: none;
    &.is-disabled {
      font-size: 14px;
      line-height: 20px;
      color: #bbb;
    }
  }
  .emoji-panel {
    width: 100%;
    height: 230px;
    .select-panel {
      width: 100%;
      height: 180px;
      .sticker-series {
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
      .sticker-series {
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
}
</style>

