import store from '../store'
import urls from '../api/urls'
import Vue from 'vue'
import { fetchJWTToken } from '@/api'

const JWT_TYPE = 'eider'
let wsLivingCount = 0
function GhostSocketObj (token) {
  this.initWs(token)
}

GhostSocketObj.prototype.initWs = function (token) {
  this.ws = new WebSocket(`${urls.wsEiderHost}/ws?token=${token}`)

  this.ws.onopen = (e) => {
    clearInterval(this.checkWsLivingInterval)
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

  this.ws.onclose = e => {
    if (e.code === 1006) {
      localStorage.removeItem(JWT_TYPE + '_token')
      fetchJWTToken(JWT_TYPE).then(token => {
        localStorage.setItem(JWT_TYPE + '_token', token)
        store.dispatch('setWs', { ws: new GhostSocketObj(token), type: JWT_TYPE })
      }).catch(() => {

      })
    }
  }

  this.ws.onmessage = (response) => {
    let data
    if (typeof response.data === 'string') {
      try {
        data = JSON.parse(response.data)
        let notificationVisible = store.state.notificationVisible

        switch (data.type) {
          case 'win-notification':
            store.dispatch('addNotification', data)
            break

          case 'bet-track-record':
            store.dispatch('addNotification', data)
            break

          case 'win-notification-batch':
            store.dispatch('addNotification', data)

            if (!notificationVisible) {
              store.commit('SHOW_NOTIFICATION')
            }
            break

          case 'bet-track-record-batch':
            store.dispatch('addNotification', data)

            if (!notificationVisible) {
              store.commit('SHOW_NOTIFICATION')
            }
            break

          case 'balance-updated':
            store.dispatch('setUser', {
              balance: data.balance
            })

            if (data.to_display) {
              Vue.$vux.toast.show({
                text: '余额已更新',
                type: 'sucess'
              })
            }
            break
          case 'message-count-initial':
            store.dispatch('setUnread', data.count)
            break

          case 'message-count-delta':
            store.dispatch('addUnread', data.delta)
            break
          case 'unsettled-updated':
            store.dispatch('setUser', {
              unsettled: data.unsettled
            })
            break
          case 'game-result-initial':
            store.dispatch('initLatestResultMap', data.latest_result_map)

            break
          case 'game-result':
            const latestResult = data.latest_result
            const gameCode = data.latest_result.game_code
            latestResult.loading = true
            store.dispatch('updateLatestResultMap', {gameCode, latestResult})
            setTimeout(() => {
              latestResult.loading = false
              store.dispatch('updateLatestResultMap', {gameCode, latestResult})
            }, 2000)
            break
          case 'close-time-update':
            store.dispatch('urgencySwitchGame', {
              gameCode: data.game_code,
              issueNumber: data.issue_number,
              closeLeft: data.close_left
            })
            break
          case 'engagement-boost-envelope':
            store.dispatch('actv2/setCount', {
              type: 'boost',
              count: data.remain_count
            })
            break
          case 'referral-envelope':
            store.dispatch('actv2/setCount', {
              type: 'referral',
              count: data.remain_count
            })
            store.dispatch('actv2/setRefRemainCount', {
              id: data.detail_id,
              count: data.detail_count
            })
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
  store.commit('CLEAR_NOTIFICATION')
  if (this.ws) {
    if (this.ws.readyState === 1) { // 若連線已建立才返回訊息
      this.ws.send(JSON.stringify({
        'command': 'close'
      }))
    }
    this.ws.close()
  }
  clearInterval(this.checkWsLivingInterval)
  store.dispatch('setWs', {
    ws: null,
    type: JWT_TYPE
  })
}

GhostSocketObj.prototype.reconnect = function () {
  clearInterval(this.checkWsLivingInterval)

  let token = localStorage.getItem(JWT_TYPE + '_token')
  if (token) this.initWs(token)
}

GhostSocketObj.prototype.checkLiving = function () {
  // backend has no response too long
  if (this.lastCheckTime && Vue.moment(this.lastCheckTime).diff(Vue.moment(), 'seconds') > 9) {
    this.reconnect()
    return
  }
  if (this.ws.readyState !== 1) {
    this.reconnect()
    return
  }
  this.ws.send(JSON.stringify({
    'command': 'ping'
  }))
}

export default GhostSocketObj
