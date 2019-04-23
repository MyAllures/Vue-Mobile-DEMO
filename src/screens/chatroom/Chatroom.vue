<template>
  <div class="chatroom-container">
    <chatroom-body></chatroom-body>
    <chatroom-footer></chatroom-footer>
  </div>
</template>

<script>
import ChatroomBody from './ChatroomBody'
import ChatroomFooter from './ChatroomFooter'
import { mapState } from 'vuex'
import { EagleWebSocket } from '@/wsObj/eagle'
import { eagle } from '@/api'
export default {
  name: 'Chatroom',
  components: {
    ChatroomBody,
    ChatroomFooter
  },
  computed: {
    ...mapState('chatroom', {
      emojiMap: state => state.emojiMap,
      ws: state => state.ws,
      wsStatus: state => state.status,
      roomList: state => state.roomList
    })
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
      eagle.fetchStickers().then(res => {
        const emojiMap = {}
        res.forEach((series, index) => {
          emojiMap[series.id] = { ...series, order: index }
        })
        this.$store.dispatch('chatroom/initEmoji', emojiMap)
      }).catch(() => {

      })
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
