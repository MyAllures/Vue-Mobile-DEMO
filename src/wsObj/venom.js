// import store from '../store'
import urls from '../api/urls'
import Vue from 'vue'
import store from '../store'
import {JWT} from '@/utils/jwtToken'
import { RECEIVED_ACTION, EMITTED_ACTION } from '../utils/CustomerService'
const TYPE = 'venom'
let wsLivingCount = 0
function VenomSocketObj (token) {
  this.initWs(token)
}

VenomSocketObj.prototype.initWs = function () {
  this.ws = new WebSocket(`${urls.wsVenomHost}/ws?token=${Vue.cookie.get(JWT[TYPE] + '_token')}`)

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

  this.ws.onmessage = (response) => {
    let data
    if (typeof response.data === 'string') {
      try {
        data = JSON.parse(response.data)
        if (data.message) {
          data.message.action = data.action || ''
        }

        switch (data.action) {
          case RECEIVED_ACTION.welcome_message:
            data.message.type = 98
            store.dispatch('customerService/addMessages', [data.message])
            break
          case RECEIVED_ACTION.has_history_message:
            store.dispatch('customerService/addMessages', [{'id': 999, 'action': RECEIVED_ACTION.pulldown, 'text': '上滑阅读过往聊天记录 ↓', type: 99}])
            store.dispatch('customerService/updateIsHasHistory', data.message.has_history_message)
            break
          case RECEIVED_ACTION.offline_message:
            data.message.forEach((msg) => { if (msg.date_tag) { msg.type = 97 } })
            this.send({action: EMITTED_ACTION.unread, parameter: {message_id: data.message[data.message.length].id}})
            store.dispatch('customerService/addMessages', [...data.message])
            break
          case RECEIVED_ACTION.history_message:
            store.dispatch('customerService/updateIsHasHistory', false)

            data.message.forEach((msg) => { if (msg.date_tag) { msg.type = 97 } })
            store.dispatch('customerService/insertHistoryMessages', [...data.message])
            break
          case RECEIVED_ACTION.image:
            store.dispatch('customerService/addMessages', [data.message])
            this.send({action: EMITTED_ACTION.unread, parameter: {message_id: data.message.id}})
            break
          case RECEIVED_ACTION.sticker:
            store.dispatch('customerService/addMessages', [data.message])
            this.send({action: EMITTED_ACTION.unread, parameter: {message_id: data.message.id}})
            break
          case RECEIVED_ACTION.normal:
            store.dispatch('customerService/addMessages', [data.message])
            this.send({action: EMITTED_ACTION.unread, parameter: {message_id: data.message.id}})
            break
          default:
            break
        }

        if (data['ping']) {
          this.ws.send(JSON.stringify({
            'action': 'pong'
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

VenomSocketObj.prototype.send = function ({action, parameter}) {
  let request = {action}
  if (parameter) { request.parameter = parameter }
  this.ws.send(JSON.stringify(request))
}

VenomSocketObj.prototype.closeConnect = function () {
  if (this.ws) {
    if (this.ws.readyState === 1) { // 若連線已建立才返回訊息
      this.ws.send(JSON.stringify({
        'action': 'close'
      }))
    }
    this.ws.close()
  }

  clearInterval(this.checkWsLivingInterval)
  store.dispatch('setWs', {
    ws: null,
    type: TYPE
  })
}

VenomSocketObj.prototype.reconnect = function () {
  clearInterval(this.checkWsLivingInterval)

  let token = Vue.cookie.get(JWT[TYPE] + '_token')
  if (token) this.initWs(token)
}

VenomSocketObj.prototype.checkLiving = function () {
  if (this.lastCheckTime && Vue.moment(this.lastCheckTime).diff(Vue.moment(), 'seconds') > 9) {
    this.reconnect()
    return
  }
  if (this.ws.readyState !== 1) {
    this.reconnect()
    return
  }
  this.ws.send(JSON.stringify({
    'action': 'ping'
  }))
}

export default VenomSocketObj
