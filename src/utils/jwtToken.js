
import Vue from 'vue'

export const JWT = {
  venom: 'customer_service',
  raven: 'chat',
  eider: 'message_broker'
}

// type: customer_service_token for venom, chat_token for raven

export const checkJWTTokenAlive = (tokenType, checkFunc, fetchTokenFunc) => {
  const token = Vue.cookie.get(tokenType)
  if (token) {
    console.log('has token in checkJWTTokenAlive')
    checkFunc().then(() => {
      console.log('check token in checkJWTTokenAlive')
      return Promise.resolve()
    }).catch(() => {
      console.log('no token in checkJWTTokenAlive inside')
      fetchTokenFunc()
    })
  } else {
    console.log('no token in checkJWTTokenAlive')
    fetchTokenFunc()
  }
}
