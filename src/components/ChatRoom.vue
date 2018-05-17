<template>
  <div class="chat-box" id="chatBox">
    <div class="chat-announce" v-if="announce">
      <div class="annouce-info clearfix">
        <icon class="volume-up" name="volume-up"></icon>
        公告
      </div>
      <div class="scroll">
        <MarqueeTips :content="announce[announceIndex]" :speed="10"></MarqueeTips>
      </div>
    </div>
    <!-- <p class="login-info" v-if="ws.status!=='connect'">聊天室登录中...</p> -->
    <div class="chat-container" v-else>
      <chat-body :roomId="RECEIVER" @click.native="hidePanel"/>
      <chat-footer ref="chatFooter" :roomId="RECEIVER"/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/picture-o'
import 'vue-awesome/icons/volume-up'
import MarqueeTips from 'vue-marquee-tips'
import { mapState } from 'vuex'
import { fetchChatEmoji, fetchStickers } from '../api'
import { TransferDom, Tab, TabItem, AlertModule, Popup } from 'vux'
import ChatBody from './ChatBody'
import ChatFooter from './ChatFooter'
import WebSocketObj from '../webSocketObj'
const RECEIVER = 100000

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
      msgCnt: '',
      showNickNameBox: false,
      announceIndex: 0,
      marqueeInterval: null,
      nickname: this.$store.state.user.nickname,
      showCheckUser: false,
      checkUser: {},
      chatLoading: true,
      routeHasChange: this.routeChanged,
      RECEIVER: RECEIVER
    }
  },
  watch: {
    '$route': 'leaveRoom',
    'announce': function (announce) {
      if (announce && announce.length > 0) {

      }
      this.marqueeInterval = setInterval(() => {
        this.announceIndex = (this.announceIndex + 1) % this.announce.length
      }, 10000)
    }
  },
  computed: {
    ...mapState([
      'user', 'ws', 'announce'
    ])
  },
  created () {
    if (this.ws) {
      this.ws.joinRoom(this.$route.params.gameId)
    } else {
      let token = Vue.cookie.get('access_token')
      if (!token) {
        this.$store.commit('CLEAR_MEMBER')
        return this.$router.push('/login?next=' + this.$route.path)
      }
      this.$store.dispatch('setWs', new WebSocketObj(token, this.$route.params.gameId))
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
