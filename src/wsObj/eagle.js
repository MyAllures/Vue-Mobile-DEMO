import store from '@/store'
import WebSocketBuilder from './builder'
import {
  urls,
  eagle
} from '@/api'

function onopen () {
  if (!this.originRoomId || this.originRoomId !== this.roomId) {
    this.joinRoom(this.roomId)
  }
  store.dispatch('chatroom/setStatus', 'open')
}

function onerror () {
  store.dispatch('chatroom/setStatus', 'closed')
}

function onclose () {
  store.dispatch('chatroom/setStatus', 'closed')
}

function onmessage (response) {
  if (typeof response.data === 'string') {
    let data = JSON.parse(response.data)
    switch (data.type) {
      case 'initial-data':
        store.dispatch('chatroom/init', data)
        break
      case 'message':
      case 'image':
      case 'sticker':
      case 'system':
        store.dispatch('chatroom/receiveMsg', data)
        break
      case 'betrecord-sharing':
        store.dispatch('chatroom/receiveMsg', data)
        break
    }
  }
}

export class EagleWebSocket {
  constructor (token, roomId) {
    let url = `${urls.eagle.ws_host}/chat/?token=${token}`
    if (roomId) {
      url += `&room_id=${roomId}`
    }
    this.originRoomId = roomId
    this.ws = new WebSocketBuilder(url)
    this.ws.subscribe({
      onmessage,
      onopen: onopen.bind(this),
      onerror,
      onclose
    })
    this.ws.connect()
  }

  sendMsg (message) {
    this.ws.send({
      'command': 'send',
      'type': 'message',
      'receiver': this.roomId,
      'content': message
    })
  }

  sendSticker (message) {
    this.ws.send({
      'command': 'send',
      'type': 'sticker',
      'receiver': this.roomId,
      'content': message
    })
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
    if (this.roomId === roomId) {
      return
    }
    this.roomId = roomId
    if (this.ws.wsState === WebSocket.OPEN) {
      store.dispatch('chatroom/initMsg', [])
      this.ws.send({
        'command': 'join',
        'receiver': this.roomId
      })
    }
  }

  leaveRoom () {
    this.ws.send({
      'command': 'leave',
      'receiver': this.roomId
    })
    this.ws.disconnect()
    store.dispatch('chatroom/initMsg', [])
    store.dispatch('chatroom/setWs', null)
  }
}
