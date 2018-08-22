import store from '../store'
import urls from '../api/urls'

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

export default GhostSocketObj
