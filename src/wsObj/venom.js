import urls from '@/api/urls'
import Vue from 'vue'
import store from '@/store'
import { JWT } from '@/utils/jwtToken'
import { RECEIVED_ACTION, EMITTED_ACTION, MSG_TYPE, MSG_CAT } from '@/utils/CustomerService'

const JWT_TYPE = 'venom'
let wsLivingCount = 0

function VenomSocketObj (token) {
  this.initWs(token)
}

VenomSocketObj.prototype.initWs = function (token) {
  this.ws = new WebSocket(`${urls.wsVenomHost}/ws?token=${token}`)

  this.ws.onopen = e => {
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

  this.ws.onmessage = response => {
    if (typeof response.data !== 'string') return

    try {
      let data = JSON.parse(response.data)

      switch (data.action) {
        case RECEIVED_ACTION.welcome_message:
          data.message.type = MSG_TYPE.welcome_message
          data.message.cat = MSG_CAT.welcome
          store.dispatch('customerService/receiveMessages', {
            category: MSG_CAT.welcome,
            messages: [data.message]
          })
          break
        case RECEIVED_ACTION.offline_message:
          data.message.forEach(msg => {
            msg.cat = MSG_CAT.common
            if (msg.date_tag) {
              msg.type = MSG_TYPE.datetag
            }
          })
          store.dispatch('customerService/receiveMessages', {
            category: MSG_CAT.offline,
            messages: data.message
          })
          this.send({
            action: EMITTED_ACTION.unread,
            parameter: {
              message_id: data.message[data.message.length - 1].id
            }
          })
          break
        case RECEIVED_ACTION.history_message:
          data.message.forEach(msg => {
            msg.cat = MSG_CAT.common
            if (msg.date_tag) {
              msg.type = MSG_TYPE.datetag
            }
          })
          const today = Vue.moment().format('YYYY-MM-DD')
          const lastMsg = data.message[data.message.length - 1]
          const lastDay = lastMsg ? Vue.moment(lastMsg.created_at).format('YYYY-MM-DD') : ''
          if (today !== lastDay) {
            data.message.push({
              date_tag: true,
              text: today,
              type: MSG_TYPE.datetag
            })
          }
          store.dispatch('customerService/receiveMessages', {
            category: MSG_CAT.history,
            messages: data.message
          })
          break
        case RECEIVED_ACTION.normal:
        case RECEIVED_ACTION.image:
        case RECEIVED_ACTION.sticker:
          data.message.cat = MSG_CAT.common
          store.dispatch('customerService/receiveMessages', {
            category: MSG_CAT.common,
            messages: [data.message],
            replace: false
          })
          this.send({
            action: EMITTED_ACTION.unread,
            parameter: {
              message_id: data.message.id
            }
          })
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

VenomSocketObj.prototype.send = function ({ action, parameter }) {
  let request = { action }
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
    type: JWT_TYPE
  })
}

VenomSocketObj.prototype.reconnect = function () {
  clearInterval(this.checkWsLivingInterval)

  let token = Vue.cookie.get(JWT[JWT_TYPE] + '_token')
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
