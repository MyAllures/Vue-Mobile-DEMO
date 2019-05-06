
import Vue from 'vue'

export const JWT = {
  venom: 'customer_service',
  eagle: 'chatroom_betting',
  eider: 'message_broker'
}
function wsDebug (...args) {
  if (process.env.NODE_ENV !== 'development') return
  console.warn('[Venom]', ...args)
}
// type: customer_service_token for venom, chat_token for raven

export const checkJWTTokenAlive = (tokenType, checkFunc, fetchTokenFunc) => {
  const token = Vue.cookie.get(tokenType)
  if (token) {
    wsDebug('has token in checkJWTTokenAlive')
    checkFunc().then(() => {
      wsDebug('check token in checkJWTTokenAlive')
      return Promise.resolve()
    }).catch(() => {
      wsDebug('no token in checkJWTTokenAlive inside')
      fetchTokenFunc()
    })
  } else {
    wsDebug('no token in checkJWTTokenAlive')
    fetchTokenFunc()
  }
}
