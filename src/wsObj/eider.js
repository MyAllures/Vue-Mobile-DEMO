import store from '../store'
import urls from '../api/urls'
import Vue from 'vue'

function GhostSocketObj (token, callback) {
  this.ws = new WebSocket(`${urls.wsEiderHost}/ws?token=${token}`)

  this.ws.onclose = (e) => {
    store.dispatch('setWs', {
      ws: null,
      type: 'eider'
    })
  }

  this.ws.onerror = (e) => {
    store.dispatch('setWs', {
      ws: null,
      type: 'eider'
    })
  }

  this.ws.onmessage = (response) => {
    let data
    if (typeof response.data === 'string') {
      try {
        data = JSON.parse(response.data)
        let winNotificationVisible = store.state.winNotificationVisible

        switch (data.type) {
          case 'win-notification':
            store.dispatch('addWinNotification', data)
            break

          case 'win-notification-batch':
            store.dispatch('addWinNotification', data)

            if (!winNotificationVisible) {
              store.commit('SHOW_WINNOTIFICATION')
            }
            break
          case 'balance-updated':
            store.dispatch('setUser', {
              balance: data.balance
            })
            Vue.$vux.toast.show({
              text: '余额已更新',
              type: 'sucess'
            })
            break
          case 'message-count-initial':
            store.dispatch('setUnread', data.count)
            break
          case 'message-count-delta':
            store.dispatch('addUnread', data.delta)

            break
        }
      } catch (e) {
        console.log(e, 'error')
      }
    }
  }
}

GhostSocketObj.prototype.closeConnect = function () {
  this.ws.send(JSON.stringify({
    'command': 'close'
  }))
  store.commit('CLEAR_WINNOTIFICATION')
  this.ws.close()
  store.dispatch('setWs', {
    ws: null,
    type: 'eider'
  })
}

GhostSocketObj.prototype.checkLiving = function () {
  this.ws.send(JSON.stringify({
    'command': 'ping'
  }))
  if (this.ws.readyState !== 1) {
    store.dispatch('setWs', {
      ws: null,
      type: 'eider'
    })
  }
}

export default GhostSocketObj
