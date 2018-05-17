import store from '../store'
import config from '../../config'
import {AlertModule} from 'vux'

const DEFAULT_ROOM_ID = 1000000
function WebSocketObj (token, roomId) {
  this.ws = new WebSocket(`${config.chatHost}/chat/stream?username=${store.state.user.username}&token=${token}`)
  this.roomId = roomId
  this.ws.onopen = () => {
    this.ws.send(JSON.stringify({
      'command': 'join',
      'receivers': [roomId]
    }))
  }
  this.ws.onclose = () => {
    store.dispatch('setWs', null)
  }

  this.ws.onerror = () => {
    store.dispatch('setWs', null)
  }
  this.ws.onmessage = (resData) => {
    let data
    if (typeof resData.data === 'string') {
      try {
        data = JSON.parse(resData.data)
        if (data.personal_setting) {
          const bannedTime = data.personal_setting.banned[this.roomId]
          const setting = {
            chatable: data.personal_setting.chat.status === 1,
            banned: !!bannedTime,
            bannedTime: bannedTime,
            blocked: data.personal_setting.blocked.includes(this.roomId)
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
                }
                AlertModule.show({
                  content: data.content
                })
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
                const nickname = data.get_envelope_user === this.user.username ? '你' : data.sender.nickname
                if (data.sender.username === this.user.username) {
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
                content: '您已被聊天室管理员禁言，在' + this.$moment(data.msg).format('YYYY-MM-DD HH:mm:ss') + '后才可以发言。'
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
  if (this.roomId) {
    this.leaveRoom(this.roomId)
  }
  this.roomId = roomId
  this.ws.send(JSON.stringify({
    'command': 'join',
    'receivers': [roomId]
  }))
}

WebSocketObj.prototype.leaveRoom = function () {
  this.ws.send(JSON.stringify({
    'command': 'leave',
    'receivers': [this.roomId]
  }))
  this.roomId = undefined
  store.dispatch('initMessage': [])
  store.dispatch('setAnnounce': [])
}

WebSocketObj.prototype.send = function (data) {
  this.ws.send(JSON.stringify(data))
}

export default WebSocketObj
