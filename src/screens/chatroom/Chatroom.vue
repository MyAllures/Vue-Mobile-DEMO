<template>
  <div class="chatroom-container">
    <chatroom-body></chatroom-body>
    <chatroom-footer></chatroom-footer>
    <game-info :type="contentType" :visible.sync="isGameInfoVisible"/>
  </div>
</template>

<script>
import ChatroomBody from './ChatroomBody'
import ChatroomFooter from './ChatroomFooter'
import { mapState } from 'vuex'
import { EagleWebSocket } from '@/wsObj/eagle'
import {fetchJWTToken} from '@/api'
import GameInfo from '@/screens/games/GameInfo'
import {makeCancelable} from '@/utils'
const ChatManage = (resolve) => require(['@/screens/ChatManage'], resolve)
export default {
  name: 'Chatroom',
  componentName: 'Chatroom',
  components: {
    ChatroomBody,
    ChatroomFooter,
    GameInfo
  },
  data () {
    return {
      contentType: '',
      isGameInfoVisible: false,
      tokenCancelablePromise: null
    }
  },
  computed: {
    ...mapState('chatroom', {
      emojiMap: state => state.emojiMap,
      ws: state => state.ws,
      wsStatus: state => state.status,
      roomList: state => state.roomList
    }),
    showing () {
      switch (this.contentType) {
        case 'chatmanage':
          return ChatManage
      }
    }
  },
  created () {
    let tokenPromise
    // let token = localStorage.getItem('eagle_token')
    let token = '' // TODO 後端尚在調整
    if (!token) {
      tokenPromise = fetchJWTToken('eagle')
    } else {
      tokenPromise = Promise.resolve(token)
    }
    const tokenCancelablePromise = makeCancelable(tokenPromise)
    this.tokenCancelablePromise = tokenCancelablePromise
    tokenCancelablePromise.promise.then(token => {
      localStorage.setItem('eagle_token', token)
      this.$store.dispatch('chatroom/setWs', new EagleWebSocket(token, this.roomList[0]))
    }).catch(() => {

    })
    if (this.emojiMap === null) {
      this.$store.dispatch('chatroom/initEmoji')
    }
    this.$on('showPopup', (type) => {
      this.isGameInfoVisible = true
      this.contentType = type
    })
  },
  beforeDestroy () {
    if (this.tokenCancelablePromise) {
      // 避免組件銷毀後異步建立連線
      this.tokenCancelablePromise.cancel()
    }
    if (this.ws) {
      this.ws.leaveRoom()
    }
  }
}
</script>

<style lang="scss" scoped>
.chatroom-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
