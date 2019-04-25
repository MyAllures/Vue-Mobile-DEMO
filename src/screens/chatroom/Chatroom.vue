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
import GameInfo from '@/screens/games/GameInfo'
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
      isGameInfoVisible: false
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
    if (!this.$store.state.jwt_token.eagle) {
      tokenPromise = this.$store.dispatch('fetchJWTToken', 'eagle')
    } else {
      tokenPromise = Promise.resolve(this.$store.state.jwt_token.eagle)
    }
    tokenPromise.then(token => {
      this.$store.dispatch('chatroom/setWs', new EagleWebSocket(token, this.roomList[0]))
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
    this.ws.leaveRoom()
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
