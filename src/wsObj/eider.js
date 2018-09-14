import store from '../store'
import urls from '../api/urls'
import Vue from 'vue'

let wsLivingCount = 0
function GhostSocketObj (token) {
  this.ws = new WebSocket(`${urls.wsEiderHost}/ws?token=${token}`)

  this.ws.onopen = (e) => {
    this.checkWsLivingInterval = setInterval(() => {
      if (wsLivingCount > 3) {
        clearInterval(this.checkWsLivingInterval)
      } else {
        try {
          this.checkLiving()
          wsLivingCount = 0
        } catch (err) {
          wsLivingCount += 1
        }
      }
    }, 3000)
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

        if (data['ping']) {
          this.ws.send(JSON.stringify({
            'command': 'pong',
            'key': data['ping']
          }))
        }

        if (data['pong']) {
          this.lastCheckTime = Vue.moment()
        }
      } catch (e) {
        console.log(e, 'error')
      }
    }
  }
}

GhostSocketObj.prototype.closeConnect = function () {
  store.commit('CLEAR_WINNOTIFICATION')
  if (this.ws) {
    this.ws.send(JSON.stringify({
      'command': 'close'
    }))
    this.ws.close()
  }
  clearInterval(this.checkWsLivingInterval)
  store.dispatch('setWs', {
    ws: null,
    type: 'eider'
  })
}

const reconnect = (socketObj) => {
  let token = Vue.cookie.get('access_token')
  socketObj.ws = new WebSocket(`${urls.wsEiderHost}/ws?token=${token}`)
}

GhostSocketObj.prototype.checkLiving = function () {
  // backend has no response too long
  if (this.lastCheckTime && Vue.moment(this.lastCheckTime).diff(Vue.moment(), 'seconds') > 9) {
    reconnect(this)
    return
  }
  if (this.ws.readyState !== 1) {
    reconnect(this)
    return
  }
  this.ws.send(JSON.stringify({
    'command': 'ping'
  }))
}

export default GhostSocketObj
