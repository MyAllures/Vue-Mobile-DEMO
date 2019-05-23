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
import { getJWTToken } from '@/utils'
const ChatManage = (resolve) => require(['@/screens/ChatManage'], resolve)
function to (scrollTop) {
  document.body.scrollTop = document.documentElement.scrollTop = scrollTop
}
function getScrollTop () {
  return document.body.scrollTop || document.documentElement.scrollTop
}
let scrollTop
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
    ...mapState(['user']),
    ...mapState('chatroom', {
      emojiMap: state => state.emojiMap,
      ws: state => state.ws,
      wsStatus: state => state.status,
      roomList: state => state.roomList,
      roomName: state => state.roomName
    }),
    showing () {
      switch (this.contentType) {
        case 'chatmanage':
          return ChatManage
      }
    }
  },
  created () {
    if (!this.user.followeeList) {
      this.$store.dispatch('fetchChatRoomUserInfo')
    }
    if (this.ws) {
      this.ws.leaveRoom()
    }
    let token = getJWTToken('eagle')
    this.$store.dispatch('chatroom/setWs', new EagleWebSocket(token, this.roomList[0]))
    if (this.emojiMap === null) {
      this.$store.dispatch('chatroom/initEmoji')
    }
    this.$on('showPopup', (type) => {
      this.isGameInfoVisible = true
      this.contentType = type
    })
  },
  watch: {
    isGameInfoVisible: function (visible) {
      if (visible) {
        // 在弹出层显示之前，记录当前的滚动位置
        scrollTop = getScrollTop()

        // 使body脱离文档流
        document.body.classList.add('dialog-open')

        // 把脱离文档流的body拉上去，否则页面会回到顶部
        document.body.style.top = -scrollTop + 'px'
      } else {
        this.contentType = ''

        // body又回到了文档流中
        document.body.classList.remove('dialog-open')

        to(scrollTop)
      }
    },
    roomName: {
      handler (name) {
        this.$store.dispatch('page/updatePageSetting', {
          title: name,
          requiresAuth: true,
          tabbarHidden: true,
          leftCtrl: 'back',
          rightCtrl: 'info',
          backPage: {
            text: '首页',
            path: '/'
          }
        })
      },
      immediate: true
    }
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
