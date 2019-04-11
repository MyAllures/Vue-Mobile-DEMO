import store from '@/store'
import WebSocketBuilder from './builder'
import {urls} from '@/api'

function onmessage (response) {
  if (typeof response.data === 'string') {
    let data = JSON.parse(response.data)
    switch (data.type) {
      case 'initial-data':
        store.dispatch('eagle/initMsg', data.recent_messages)
        break
      case 'message':
      case 'image':
      case 'system':
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
    store.dispatch('eagle/setWs', this)
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
