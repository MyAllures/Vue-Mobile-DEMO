/**
 * Usage
 *
 * 1. Create
 *
 *      const url = 'wss://echo.websocket.org' --> test url
 *      const ws = new WebSocketBuilder(url)
 *
 * 2. Methods
 *
 *  2.1 subscribe
 *      ws.subscribe({
 *          onopen: function ,
 *          onmessage: function,
 *          onerror: function,
 *          onclose: function
 *      })
 *
 *      Or set a function , will call onmessage
 *      ws.subscribe((e)=>console.log(e.data))
 *
 *      return WebSocketBuilder Object
 *
 *  2.2 retry
 *      When ws state is closed and closed code != 1000 will do reconnect
 *
 *      ws.retry(count: Number,interval: Number)
 *
 *      retry(3, 1000) --> reconnect to server 3 times per second
 *
 *      retry(3) --> reconnect to server 3 times (interval default value is 5 seconds)
 *
 *      retry() --> reconnect to server until server response
 *
 *      return WebSocketBuilder Object
 *
 *  2.3 connect
 *
 *  2.4 disconnect
 *
 *  2.5 reconnect
 *
 *  2.6 send
 *
 *  2.7 readyState
 *      get ws state
 *
 *      const state = ws.readyState
 *
 *  2.8 heartBeat
 *      check ws still connect , if loss connection will call onclose
 *
 *      ws.heartBeat(interval: Number, message)
 *      interval--> default 30 seconds
 *
 *      ws.retry().heartBeat(3000,{
 *          comment: 'heartBeat'                 --> if loss connection , reconnect until server response
 *      })
 *
 *      ws.heartBeat()  --> if loss connection do nothing , readyState = CLOSED
 *
 *      return WebSocketBuilder Object
 */

/*
 *  connection status
 */
const CONNECTING = WebSocket.CONNECTING // 0
const OPEN = WebSocket.OPEN // 1
const CLOSING = WebSocket.CLOSING // 2
const CLOSED = WebSocket.CLOSED // 3

/*
 *  private functions
 */
const initWebsocketEvent = Symbol('initWebsocketEvent')
const clearTimer = Symbol('clearTimer')
const doRetry = Symbol('doRetry')
const doHeartCheck = Symbol('doHeartCheck')
const EMPTY_FUNCTION = () => {}

class WebSocketBuilder {
  constructor (url) {
    this.url = url
    this.ws = null
    this.wsState = CLOSED
    this.timer = null
    this.retryConfig = {
      count: 0,
      interval: 5000,
      tried: 0,
      trying: false
    }
    this.heartBeatConfig = {
      doCheck: false,
      timeout: null,
      message: null,
      timeoutObj: null,
      serverTimeoutObj: null
    }
    this.listener = {
      onopen: EMPTY_FUNCTION,
      onmessage: EMPTY_FUNCTION,
      onerror: EMPTY_FUNCTION,
      onclose: EMPTY_FUNCTION
    }
  }

  [clearTimer] () {
    clearInterval(this.timer)
    this.timer = null
  }

  [initWebsocketEvent] () {
    this.ws.onopen = e => {
      this.retryConfig.tried = 0
      this.retryConfig.count = 0
      this.wsState = OPEN
      this.listener.onopen(e)
      if (this.heartBeatConfig.doCheck) this[doHeartCheck]().start()
    }
    this.ws.onmessage = e => {
      if (typeof e.data === 'string') {
        let data = JSON.parse(e.data)
        this.listener.onmessage(data)
        if (this.heartBeatConfig.doCheck && data.type === 'pong') this[doHeartCheck]().reset().start()
      }
    }

    this.ws.onerror = this.listener.onerror

    this.ws.onclose = e => {
      this.wsState = CLOSED
      this.ws = null
      this.listener.onclose(e)
      if (this.heartBeatConfig.doCheck) this[doHeartCheck]().reset()
      if (this.retryConfig.count !== 0 || e.code !== 1000) this[doRetry]()
    }
  }

  [doRetry] () {
    if (this.retryConfig.trying) {
      return
    }
    this.retryConfig.trying = true
    this.reconnect()
  }

  [doHeartCheck] () {
    const self = this
    const {timeout, message} = this.heartBeatConfig
    return {
      reset: function () {
        clearTimeout(self.heartBeatConfig.timeoutObj)
        clearTimeout(self.heartBeatConfig.serverTimeoutObj)
        return this
      },
      start: function () {
        self.heartBeatConfig.timeoutObj = setTimeout(() => {
          self.send(message)
          self.heartBeatConfig.serverTimeoutObj = setTimeout(() => {
            self.needRetry = true
            self.retry(3)
            self.disconnect(4000, 'Loss connection')
          }, 10000)
        }, timeout)
      }
    }
  }

  subscribe (options) {
    if (typeof options === 'function') {
      this.listener.onmessage = options
    } else {
      this.listener = Object.assign(this.listener, options)
    }
    return this
  }

  connect (isRetry) {
    try {
      if (this.wsState !== CLOSED) {
        console.warn('Connection is busy, please try again later.')
        return
      }
      this.wsState = CONNECTING
      if (isRetry && this.retryUrl) {
        this.ws = new WebSocket(this.retryUrl)
      } else {
        this.ws = new WebSocket(this.url)
      }

      this[initWebsocketEvent]()
      return this
    } catch (e) {
      this.wsState = CLOSED
    }
  }

  disconnect (code = 1000, reason = 'Normal closure') {
    if (this.ws !== null && this.wsState === OPEN) {
      this.wsState = CLOSING
      const wasClean = true
      this.retryConfig.tried = 0
      this.ws.close(code, reason, wasClean)
    } else {
      throw new Error('Connection has already been closed')
    }
  }

  reconnect () {
    let { count, interval, tried } = this.retryConfig
    if (tried >= count) {
      this.retryConfig.trying = false
      return
    }
    this.connect(true)
    this.retryConfig.tried += 1
    this.timer = setTimeout(() => {
      if (this.wsState !== OPEN) {
        this.reconnect()
      } else {
        this.retryConfig.trying = false
      }
    }, interval || 5000)
  }

  retry (count, interval = 5000) {
    if (count < 0) {
      throw new Error('Retry count must not be less than 0')
    }
    this.retryConfig = Object.assign(this.retryConfig, { count, interval })
    return this
  }

  setRetryHint () {
    this.retryUrl = this.url + '&reconnect=true'
  }

  heartBeat (timeout = 30000, message = {command: 'ping'}) {
    this.heartBeatConfig = {
      doCheck: true,
      timeout,
      message
    }
    return this
  }

  send (data) {
    if (this.readyState === CONNECTING) {
      throw new Error('The connection has not been established yet')
    }
    if (this.readyState !== OPEN) {
      return
    }
    if (typeof data === 'object') {
      data = JSON.stringify(data)
    }
    this.ws.send(data)
  }

  get readyState () {
    return this.wsState
  }
}

export default WebSocketBuilder
