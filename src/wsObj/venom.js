import Vue from 'vue'
import store from '@/store'
import router from '@/router'
import urls from '@/api/urls'
import { fetchJWTToken } from '@/api'
import { RECEIVED_ACTION, EMITTED_ACTION, MSG_TYPE, MSG_CAT } from '@/utils/CustomerService'

const DEBUG = false
const JWT_TYPE = 'venom'
const RETRY_COUNT = 3

function wsDebug (...args) {
  if (process.env.NODE_ENV !== 'development' || !DEBUG) return
  console.warn('[Venom]', ...args)
}

function VenomSocketObj (token) {
  wsDebug('init venom instance')
  this.ws = null
  this.wsConnCheckInterval = null
  this.wsConnTryCount = 0
  this.wsConnCheckTime = 0
  this.pingPongContainer = {}

  this.initWs(token)
}

VenomSocketObj.prototype.initWs = function (token) {
  this.ws = new WebSocket(`${urls.wsVenomHost}/ws?token=${token}`)

  this.ws.onclose = e => {
    if (e.code === 1006) {
      localStorage.removeItem(JWT_TYPE + '_token')
      fetchJWTToken(JWT_TYPE).then(token => {
        localStorage.setItem(JWT_TYPE + '_token', token)
        store.dispatch('setWs', { ws: new VenomSocketObj(token), type: JWT_TYPE })
      }).catch(() => {

      })
    }
  }

  this.ws.onopen = e => {
    wsDebug('ws onopen')
    clearInterval(this.wsConnCheckInterval)
    this.wsConnCheckTime = 0
    this.pingPongContainer = { ping: 0, pong: 0 }

    this.wsConnCheckInterval = setInterval(() => {
      if (!this.wsConnCheck()) {
        wsDebug('ws check failed')
        this.wsConnRetry()
      }
    }, 3000)
  }

  this.ws.onmessage = response => {
    if (typeof response.data !== 'string') return

    try {
      let data = JSON.parse(response.data)
      switch (data.action) {
        case RECEIVED_ACTION.welcome_message:
          if (!data.message) {
            return
          }
          const welcomeMsg = {
            type: MSG_TYPE.welcome_message,
            cat: MSG_CAT.welcome,
            text: data.message['default-welcome-message']
          }
          store.dispatch('customerService/receiveMessages', {
            category: MSG_CAT.welcome,
            messages: [welcomeMsg]
          })
          store.dispatch('customerService/setEnableReview', data.message['enable-member-comment'] === 'true')
          store.dispatch('customerService/setThankMessage', data.message['thanks-comment-words'])
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
          if (router.history.current.name === 'CustomerSerivce') {
            this.send({
              action: EMITTED_ACTION.unread,
              parameter: {
                message_id: data.message[data.message.length - 1].id
              }
            })
          }
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
            once: false
          })
          if (router.history.current.name === 'CustomerSerivce') {
            this.send({
              action: EMITTED_ACTION.unread,
              parameter: {
                message_id: data.message.id
              }
            })
          }
          break
        case RECEIVED_ACTION.archive_session:
          if (data.message.session_achieved === 'solved') {
            store.dispatch('customerService/archiveSession')
          }
          break
        case RECEIVED_ACTION.assign:
          store.dispatch('customerService/setSessionAssigned', true)
          break
        case RECEIVED_ACTION.system:
          if (process.env.NODE_ENV !== 'development') {
            return
          }
          data.message.type = MSG_TYPE.system
          store.dispatch('customerService/receiveMessages', {
            category: MSG_CAT.common,
            messages: [data.message],
            once: false
          })
          break
        case 'ping':
          this.ws.send(JSON.stringify({
            'action': 'pong'
          }))
          break
        case 'pong':
          this.wsConnCheckTime = Vue.moment()
          this.pingPongContainer.pong++
          break
        default:
          break
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

VenomSocketObj.prototype.closeConnect = function (clearStore = true) {
  clearInterval(this.wsConnCheckInterval)
  if (clearStore) {
    store.dispatch('setWs', {
      ws: null,
      type: JWT_TYPE
    })
  }
  if (this.ws) {
    if (this.ws.readyState === 1) { // 若連線已建立才返回訊息
      this.ws.send(JSON.stringify({
        'action': 'close'
      }))
    }
    this.ws.close()
    this.ws = null
  }
}

VenomSocketObj.prototype.reconnect = function () {
  let token = localStorage.getItem(JWT_TYPE + '_token')
  if (token) {
    this.closeConnect(false)
    this.initWs(token)
  }
}

VenomSocketObj.prototype.wsConnCheck = function () {
  wsDebug(`check ws connection`)
  if (this.ws.readyState !== 1) {
    wsDebug(`check readyState error:`, this.ws.readyState)
    return false
  }
  if (this.wsConnCheckTime && Vue.moment(this.wsConnCheckTime).diff(Vue.moment(), 'seconds') > 9) {
    wsDebug(`check time error`)
    return false
  }
  if (this.pingPongContainer.ping !== this.pingPongContainer.pong) {
    wsDebug('check ping pong error:', this.pingPongContainer)
    return false
  }
  wsDebug(`ws connection pass`)
  this.ws.send(JSON.stringify({
    'action': 'ping'
  }))
  this.pingPongContainer.ping++
  this.wsConnTryCount = 0
  return true
}

VenomSocketObj.prototype.wsConnRetry = function () {
  if (this.wsConnTryCount >= RETRY_COUNT) {
    this.wsConnError()
    return
  }
  wsDebug(`reconnecting...`)
  setTimeout(() => {
    this.reconnect()
    this.wsConnTryCount++
    wsDebug(`wsConnTryCount: ${this.wsConnTryCount}`)
  }, 1000)
}

VenomSocketObj.prototype.wsConnError = function () {
  wsDebug('ws connect error... STOP!')
  this.closeConnect()
  store.dispatch('customerService/receiveMessages', {
    category: MSG_CAT.error,
    messages: [{
      text: '目前连线有问题，请重整网页',
      type: MSG_TYPE.error,
      cat: MSG_CAT.error
    }]
  })
}

export default VenomSocketObj
