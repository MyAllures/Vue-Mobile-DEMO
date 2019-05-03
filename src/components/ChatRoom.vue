<template>
  <div class="chat-box" id="chatBox">
    <div class="chat-announce" v-if="ws.raven&&announce&&announce.length>0">
      <div class="annouce-info">
        <img src="../assets/icon_volume-up.svg" alt="volume-up" class="volume-up">
        {{$t('home.announcement')}}：
      </div>
      <div class="scroll">
        <marquee :messages="announce"></marquee>
      </div>
    </div>
    <p class="login-info" v-if="!ws.raven">聊天室登录中...</p>
    <div class="chat-container" v-else>
      <chat-body @click.native="hidePanel"/>
      <chat-footer ref="chatFooter"/>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { fetchChatEmoji, fetchStickers, fetchJWTToken } from '../api'
import { TransferDom, Tab, TabItem, AlertModule, Popup } from 'vux'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import Marquee from './Marquee'
import WebSocketObj from '../wsObj'
import {getJWTToken} from '@/utils'

export default {
  components: {
    Popup,
    Tab,
    TabItem,
    AlertModule,
    Marquee,
    ChatBody,
    ChatFooter
  },
  directives: {
    TransferDom
  },
  data () {
    return {
      msgCnt: '',
      showNickNameBox: false,
      marqueeInterval: null,
      nickname: this.$store.state.user.nickname,
      showCheckUser: false,
      checkUser: {},
      chatLoading: true,
      RECEIVER: parseInt(this.$route.params.gameId) || 100000
    }
  },
  watch: {
    '$route': 'leaveRoom'
  },
  computed: {
    ...mapState([
      'user', 'ws', 'announce'
    ])
  },
  created () {
    if (this.ws.raven) {
      this.ws.raven.joinRoom(this.RECEIVER)
    } else {
      let ravenTokenPromise
      let ravenToken = getJWTToken('raven_token')
      if (ravenToken) {
        ravenTokenPromise = Promise.resolve(ravenToken)
      } else {
        ravenTokenPromise = fetchJWTToken('raven').catch(() => {})
      }
      ravenTokenPromise.then(setting => {
        localStorage.setItem('raven_setting', JSON.stringify(setting))
        this.$store.dispatch('setWs', { ws: new WebSocketObj(setting.token, this.RECEIVER), type: 'raven' })
      })
    }
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
    hidePanel () {
      this.$refs.chatFooter.hidePanel()
    }
  }
}
</script>

<style lang="less" scoped>
.chat-box {
  position: relative;
  width: 100%;
  height: 100%;
  background-color:#f2f2f2;
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
  display: flex;
  width: 100%;
  height: 32px;
  padding: 0 6px;
  box-sizing: border-box;
  overflow: hidden;
  z-index: 1;
  .annouce-info {
    flex: 0 0 auto;
    display: flex;
    height: 32px;
    align-items: center;
    color: @red;
    padding-left: 11px;
    font-size: 14px;
    .volume-up {
      margin-right: 4px;
    }
  }
  .scroll {
    flex: 1 1 auto;
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    color: #999999;
  }
}
.chat-container {
  display: flex;
  height: 100%;
  box-sizing: border-box;
  padding-top: 32px;
  flex-direction: column;
}
</style>
