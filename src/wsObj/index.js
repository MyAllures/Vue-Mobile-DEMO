import store from '../store'
import config from '../../config'
import {AlertModule} from 'vux'
import Vue from 'vue'

const DEFAULT_ROOM_ID = 100000
function WebSocketObj (token, roomId) {
  this.ws = new WebSocket(`${config.chatHost}/chat/stream?username=${store.state.user.username}&token=${token}`)
  this.ws.onopen = () => {
    this.joinRoom(roomId)
  }
  this.ws.onclose = (e) => {
    store.dispatch('setWs', {
      ws: null,
      type: 'raven'
    })
  }

  this.ws.onerror = (e) => {
    store.dispatch('setWs', {
      ws: null,
      type: 'raven'
    })
  }
  this.ws.onmessage = (resData) => {
    let data
    if (typeof resData.data === 'string') {
      try {
        data = JSON.parse(resData.data)
        if (data.personal_setting) {
          const bannedTime = data.personal_setting.banned[store.state.roomId]
          const setting = {
            chatable: data.personal_setting.chat.status === 1,
            banned: !!bannedTime,
            bannedTime: bannedTime,
            blocked: data.personal_setting.blocked.includes(store.state.roomId)
          }
          store.dispatch('initPersonalSetting', setting)
        } else if (!data.error_type) {
          if (data.latest_message) {
            if (data.bulletin) {
              store.dispatch('setAnnounce', data.bulletin)
            }
            store.dispatch('initMessage', data.latest_message.reverse())
            return
          } else {
            switch (data.type) {
              case 2:
                const command = data.command
                if (command === 'unbanned' || command === 'unblock') {
                  this.$store.dispatch('updatePersonalSetting', command)
                  AlertModule.show({
                    content: data.content
                  })
                }
                break
              case 3:
                this.announcement = data.content
                break
              case 5:
                store.dispatch('addMessage', data)
                break
              case 6:
                const envelopeStatue = data.envelope_status
                const setting = {users: envelopeStatue.users, total: envelopeStatue.total}
                if (envelopeStatue.total === envelopeStatue.users.length) {
                  setting.status = 3
                }
                store.dispatch('updateEnvelope', {id: envelopeStatue.id, data: setting})
                const nickname = data.get_envelope_user.username === store.state.user.username ? '你' : data.get_envelope_user.nickname
                if (data.sender.username === store.state.user.username) {
                  store.dispatch('addMessage', {type: -1, content: nickname + '领取了你的红包'})
                }
                break
              default:
                store.dispatch('addMessage', data)
            }
          }
        } else {
          switch (data.error_type) {
            case 4:
              AlertModule.show({
                content: '您已被聊天室管理员禁言，在' + Vue.moment(data.msg).format('YYYY-MM-DD HH:mm:ss') + '后才可以发言。'
              })
              store.dispatch('updatePersonalSetting', 'banned')
              break
            case 5:
              store.dispatch('initMessage', [])
              store.dispatch('updatePersonalSetting', 'blocked')
              AlertModule.show({
                content: data.msg
              })
              break
            case 6:
              if (store.state.roomId === DEFAULT_ROOM_ID) {
                break
              }
              store.commit('SET_ROOM_ID', undefined)
              this.joinRoom(DEFAULT_ROOM_ID)
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
}

WebSocketObj.prototype.joinRoom = function (roomId) {
  if (store.state.roomId) {
    this.leaveRoom(store.state.roomId)
  }
  if (store.state.roomInfo && !store.state.roomInfo[roomId].status) {
    store.commit('SET_ROOM_ID', DEFAULT_ROOM_ID)
  } else {
    store.commit('SET_ROOM_ID', roomId)
  }
  this.ws.send(JSON.stringify({
    'command': 'join',
    'receivers': [store.state.roomId]
  }))
}

WebSocketObj.prototype.leaveRoom = function () {
  this.ws.send(JSON.stringify({
    'command': 'leave',
    'receivers': [store.state.roomId]
  }))
  store.commit('SET_ROOM_ID', undefined)
  store.dispatch('initMessage', [])
  store.dispatch('setAnnounce', [])
}

WebSocketObj.prototype.send = function (data) {
  data.command = 'send'
  data.receivers = [store.state.roomId]
  this.ws.send(JSON.stringify(data))
}

WebSocketObj.prototype.disconnect = function (data) {
  this.ws.close()
}

export default WebSocketObj
