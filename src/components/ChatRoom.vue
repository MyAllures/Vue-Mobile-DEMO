<template>
  <div class="chat-box" id="chatBox">
    <div class="chat-announce" v-if="chatAnnounce">
      <div class="annouce-info clearfix">
        <icon class="volume-up" name="volume-up"></icon>
        公告
      </div>
      <div class="scroll">
        <MarqueeTips :content="chatAnnounce" :speed="10"></MarqueeTips>
      </div>
    </div>
    <p class="login-info" v-if="chatLoading">聊天室登录中...</p>
    <div class="chat-container" v-else>
      <chat-body :messages="messages" :roomId="RECEIVER" @click.native="hidePanel" :personalSetting="personal_setting"/>
      <chat-footer ref="chatFooter" :roomId="RECEIVER" :openEnvelopeDialog="openEnvelopeDialog" :ws="ws" :personalSetting="personal_setting"/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/picture-o'
import 'vue-awesome/icons/volume-up'
import MarqueeTips from 'vue-marquee-tips'
import { mapGetters } from 'vuex'
import { fetchChatEmoji, fetchStickers } from '../api'
import { TransferDom, Tab, TabItem, AlertModule, Popup } from 'vux'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import config from '../../config'
const WSHOST = config.chatHost
const RECEIVER = 1

export default {
  components: {
    Popup,
    Tab,
    TabItem,
    AlertModule,
    Icon,
    MarqueeTips,
    ChatBody,
    ChatFooter
  },
  directives: {
    TransferDom
  },
  props: {
    routeChanged: {
      default: false
    }
  },
  data () {
    return {
      ws: null,
      chatAnnounce: '',
      messages: [],
      msgCnt: '',
      showNickNameBox: false,
      nickname: this.$store.state.user.nickname,
      announcement: '',
      personal_setting: {
        chat: {
          status: 1
        },
        manager: true
      },
      showCheckUser: false,
      checkUser: {},
      chatLoading: true,
      routeHasChange: this.routeChanged,
      RECEIVER: RECEIVER
    }
  },
  watch: {
    '$route': 'leaveRoom'
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  created () {
    this.joinChatRoom()
    if (!this.$store.state.emojis) {
      Promise.all([fetchChatEmoji(), fetchStickers()]).then(resArr => {
        const emojis = {}
        emojis.symbol = {id: 'symbol', order: 0, stickers: resArr[0].people.slice(0, 42), display_name: resArr[0].people[0].emoji}
        resArr[1].forEach((series, index) => {
          emojis[series.id] = {...series, order: index + 1}
        })
        this.$store.dispatch('initEmoji', emojis)
      }).catch(() => {})
    }
  },
  methods: {
    leaveRoom () {
      if (this.$route.name === 'GameDetail') { return }
      this.messages = []
      this.ws && this.ws.send(JSON.stringify({
        'command': 'leave',
        'receivers': [RECEIVER]
      }))
      if (this.ws) {
        this.ws.close()
      }
    },
    joinChatRoom () {
      let token = Vue.cookie.get('access_token')
      if ((this.ws && this.ws.readyState === 1 && this.messages.length)) {
        return false
      }
      if (!token) {
        this.$store.commit('CLEAR_MEMBER')
        return this.$router.push('/login?next=' + this.$route.path)
      }
      this.chatLoading = true
      this.ws = new WebSocket(`${WSHOST}/chat/stream?username=${this.$store.state.user.username}&token=${token}`)
      this.ws.onopen = () => {
        this.handleMsg()
      }
      this.ws.onclose = () => {
        this.$emit('closeChatRoom')
      }
      this.ws.error = () => {
        this.$emit('closeChatRoom')
      }
    },
    handleMsg () {
      this.chatLoading = false
      this.ws.send(JSON.stringify({
        'command': 'join',
        'receivers': [RECEIVER]
      }))
      this.ws.onmessage = (resData) => {
        let data
        if (typeof resData.data === 'string') {
          try {
            data = JSON.parse(resData.data)
            if (data.personal_setting) {
              this.personal_setting = data.personal_setting
            } else if (!data.error_type) {
              if (data.latest_message) {
                if (data.latest_message[data.latest_message.length - 1].type === 3) {
                  let annouce = data.latest_message.pop()
                  this.chatAnnounce = annouce.content
                }
                this.messages = this.messages.concat(data.latest_message.reverse())
                return
              } else {
                switch (data.type) {
                  case 2:
                    if (data.command === 'unblock') {
                      this.personal_setting.blocked = false
                      this.joinChatRoom()
                      AlertModule.show({
                        content: data.content
                      })
                    } else if (data.command === 'unbanned') {
                      this.personal_setting.chat.status = 1
                      AlertModule.show({
                        content: data.content
                      })
                    }
                    break
                  case 3:
                    this.announcement = data.content
                    break
                  case 5:
                    this.messages.push(data)
                    break
                  case 6:
                    const envelopeStatue = data.envelope_status
                    const setting = {users: envelopeStatue.users, total: envelopeStatue.total}
                    if (envelopeStatue.total === envelopeStatue.users.length) {
                      setting.status = 3
                    }
                    this.$store.dispatch('updateEnvelope', {id: envelopeStatue.id, data: setting})
                    const nickname = data.get_envelope_user.username === this.user.username ? '你' : data.get_envelope_user.nickname
                    if (data.sender.username === this.user.username) {
                      this.$store.dispatch('addMessage', {roomId: RECEIVER, message: {type: -1, content: nickname + '领取了你的红包'}})
                    }
                    break
                  default:
                    this.messages.push(data)
                }
              }
            } else {
              switch (data.error_type) {
                case 4:
                  AlertModule.show({
                    content: '您已被聊天室管理员禁言，在' + this.$moment(data.msg).format('YYYY-MM-DD HH:mm:ss') + '后才可以发言。'
                  })
                  this.personal_setting.banned = true
                  this.personal_setting.chat.status = 0
                  break
                case 5:
                  this.messages = []
                  this.personal_setting.blocked = true
                  this.personal_setting.chat.status = 0
                  AlertModule.show({
                    content: data.msg
                  })
                  break
                default:
                  if (data.error_type !== 3 && data.error_type !== 2) {
                    AlertModule.show({
                      content: data.msg
                    })
                  }
              }
            }
          } catch (e) {
            console.log(e)
          }
        }
      }
      setTimeout(() => {
        this.$refs.msgEnd && this.$refs.msgEnd.scrollIntoView()
      }, 1000)
    },
    openEnvelopeDialog () {

    },
    hidePanel () {
      this.$refs.chatFooter.hidePanel()
    }
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';

.chat-box {
  position: relative;
  width: 100%;
  height: 100%;
  background: url('../assets/chatbg.jpg') no-repeat right bottom;
  background-attachment: fixed;
  background-size: cover;
  .login-info {
    color: red;
    border-top-color: rgb(204, 204, 204);
    display: inline;
    padding: 2px 10px;
    border-radius: 3px;
    font-size: 14px;
    margin: 60px auto;
  }
}
.chat-announce {
  position: absolute;
  top: 5px;
  margin: 0 5px;
  width: calc(~"100%" - 12px);
  background: rgba(237,244,254,.9);
  border: 1px solid #c2cfe2;
  border-radius: 5px;
  height: 29px;
  overflow: hidden;
  z-index: 1;
  .annouce-info {
    display: flex;
    align-items: center;
    float: left;
    background: #e1edfd;
    color: @red;
    padding: 0 8px;
    line-height: 29px;
    font-size: 14px;
    .volume-up {
      margin-right: 4px;
    }
  }
  .scroll {
    line-height: 30px;
    font-size: 14px;
    display: block;
    margin-left: 72px;
  }
}
.chat-container {
  display: flex;
  height: 100%;
  flex-direction: column;
}
</style>
