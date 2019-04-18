import store from '@/store'
import WebSocketBuilder from './builder'
import {urls, eagle} from '@/api'

function onmessage (response) {
  if (typeof response.data === 'string') {
    let data = JSON.parse(response.data)
    switch (data.type) {
      case 'initial-data':
        store.dispatch('eagle/init', data)
        break
      case 'message':
      case 'image':
      case 'sticker':
      case 'system':
        store.dispatch('eagle/receiveMsg', data)
        break
      case 'betrecord-sharing':
        store.dispatch('eagle/receiveMsg', data)
        break
    }
  }
}

export class EagleWebSocket {
  constructor (token, roomId) {
    let url = `${urls.eagle.ws_host}/chat/?token=${token}&room_id=${roomId}`
    this.ws = new WebSocketBuilder(url)
    this.ws.subscribe({
      onmessage
    })
    this.ws.connect()
    this.roomId = roomId
  }

  sendMsg (message) {
    this.ws.send(
      {'command': 'send',
        'type': 'message',
        'receiver': this.roomId,
        'content': message
      }
    )
  }

  sendSticker (message) {
    this.ws.send(
      {'command': 'send',
        'type': 'sticker',
        'receiver': this.roomId,
        'content': message
      }
    )
  }

  fetchBannedList () {
    return eagle.fetchBannedList(this.roomId)
  }

  banMember (username, duration) {
    return eagle.controlChatMember(this.roomId, 'ban_user', {
      username,
      duration
    })
  }

  unbanMember (username, duration) {
    return eagle.controlChatMember(this.roomId, 'unban_user', {
      username
    })
  }

  joinRoom (roomId) {
    store.dispatch('eagle/initMsg', [])
    this.roomId = roomId
    this.ws.send(
      {'command': 'join',
        'receiver': this.roomId
      }
    )
  }

  leaveRoom () {
    this.ws.send(
      {'command': 'leave',
        'receiver': this.roomId
      }
    )
    this.ws.disconnect()
    store.dispatch('eagle/initMsg', [])
    store.dispatch('eagle/setWs', null)
  }
}
