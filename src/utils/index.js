import isEmail from 'validator/lib/isEmail'
import Vue from 'vue'

export class Indicator {
  constructor (onActivate, onInactivate) {
    this.onActivate = onActivate
    this.onInactivate = onInactivate
    this.hidden = 'hidden'
    this.visible = 'visible'
    this.evtMap = {
      focus: this.visible,
      focusin: this.visible,
      pageshow: this.visible,
      blur: this.hidden,
      focusout: this.hidden,
      pagehide: this.hidden
    }

    this.onchange = function (evt) {
      let status = ''
      evt = evt || window.event

      if (evt.type in this.evtMap) {
        status = this.evtMap[evt.type]
      } else {
        status = document[this.hidden] ? 'hidden' : 'visible'
      }

      if (status === this.visible && this.onActivate) {
        this.onActivate()
      } else if (status === this.hidden && this.onInactivate) {
        this.onInactivate()
      }
    }.bind(this)

    // setIndicator
    if (this.hidden in document) {
      document.addEventListener('visibilitychange', this.onchange)
    } else if ((this.hidden = 'mozHidden') in document) {
      document.addEventListener('mozvisibilitychange', this.onchange)
    } else if ((this.hidden = 'webkitHidden') in document) {
      document.addEventListener('webkitvisibilitychange', this.onchange)
    } else if ((this.hidden = 'msHidden') in document) {
      document.addEventListener('msvisibilitychange', this.onchange)
    } else if ('onfocusin' in document) { // IE 9 and lower:
      document.onfocusin = document.onfocusout = this.onchange
    } else { // All others:
      window.onpageshow = window.onpagehide = window.onfocus = window.onblur = this.onchange
    }
    // set the initial state (but only if browser supports the Page Visibility API)
    if (document[this.hidden] !== undefined) {
      this.onchange({ type: document[this.hidden] ? 'blur' : 'focus' })
    }
  }

  destroy () {
    if (this.hidden in document) {
      document.removeEventListener('visibilitychange', this.onchange)
    } else if ((this.hidden === 'mozHidden')) {
      document.removeEventListener('mozvisibilitychange', this.onchange)
    } else if ((this.hidden === 'webkitHidden')) {
      document.removeEventListener('webkitvisibilitychange', this.onchange)
    } else if ((this.hidden === 'msHidden')) {
      document.removeEventListener('msvisibilitychange', this.onchange)
    } else if ('onfocusin' in document) { // IE 9 and lower:
      document.onfocusin = document.onfocusout = null
    } else { // All others:
      window.onpageshow = window.onpagehide = window.onfocus = window.onblur = null
    }
  }
}

export function filtAmount (evt) {
  // prevent key in: + - . e
  if (evt.keyCode === 43 || evt.keyCode === 45 || evt.keyCode === 46 || evt.keyCode === 101) {
    evt.preventDefault()
  }
}

export function msgFormatter (error) {
  let formatMsg
  let msgs = error.msg
  if (Array.isArray(msgs)) {
    let arr = []
    msgs.forEach(msg => {
      if (typeof msg === 'string') {
        arr.push(msg)
      } else {
        Object.keys(msg).forEach(key => {
          arr.push(msg[key])
        })
      }
    })
    formatMsg = arr.join(', ')
  } else {
    if (msgs && msgs.message) {
      formatMsg = msgs.message
      return formatMsg
    }
    formatMsg = msgs
  }
  return formatMsg
}

const pattern = {
  username: /^[a-zA-Z0-9]{6,15}$/,
  password: /^[a-zA-Z0-9]{6,15}$/,
  qq: /^[0-9]{4,}$/,
  phone: /^[1][3-9]\d{9}$/,
  bankAccount: /^[0-9]{10,}$/,
  withdrawPassword: /^[0-9]{6}$/,
  amount: /^([\d]{0,}[ ]*([.][0-9]{0,1})?)$/,
  province: /^[\u4E00-\u9FA5]{0,}$/,
  depositAmount: /^([0-9][0-9]*([.][0-9]{0,2})?)$/,
  lastSixDigits: /^[0-9]{6}$/
}

export function validateUserName (value) {
  return pattern.username.test(value)
}

export function validateProvince (value) {
  return pattern.province.test(value)
}

export function validatePassword (value) {
  return pattern.password.test(value)
}

export function validateQQ (value) {
  return pattern.qq.test(value)
}

export function validatePhone (value) {
  return pattern.phone.test(value)
}

export function validateBankAccount (value) {
  return pattern.bankAccount.test(value)
}

export function validateWithdrawPassword (value) {
  return pattern.withdrawPassword.test(value)
}

export function validateEmail (value) {
  return isEmail(value)
}
export function validateDepositAmount (value) {
  return pattern.depositAmount.test(value)
}

export function validateAmount (value) {
  return pattern.amount.test(value)
}

export function validateLastSixDigits (value) {
  return pattern.lastSixDigits.test(value)
}

export const signOnRequest = {
  crypto: require('crypto-js'),
  mingle: (date) => {
    let raw = signOnRequest.cut(date).split(date.getUTCDay()).reverse().join('')
    return signOnRequest.crypto.MD5(raw).toString()
  },
  cut: (date) => {
    let a = Vue.moment.parseZone(date.toGMTString()).utc().format()
    return a.substr(0, 16)
  }
}

export function getPropByPath (obj, path, strict) {
  let tempObj = obj
  path = path.replace(/\[(\w+)\]/g, '.$1')
  path = path.replace(/^\./, '')

  let keyArr = path.split('.')
  let i = 0
  for (let len = keyArr.length; i < len - 1; ++i) {
    if (!tempObj && !strict) break
    let key = keyArr[i]
    if (key in tempObj) {
      tempObj = tempObj[key]
    } else {
      if (strict) {
        throw new Error('please transfer a valid prop path to form item!')
      }
      break
    }
  }
  return {
    o: tempObj,
    k: keyArr[i],
    v: tempObj ? tempObj[keyArr[i]] : null
  }
};

export function saveLastTrack (gameId, setting) {
  let lastTrackStr = localStorage.getItem('lastTrack')
  let lastTrackObj
  if (lastTrackStr) {
    lastTrackObj = JSON.parse(lastTrackStr)
  }
  if (lastTrackObj) {
    if (lastTrackObj.mobile) {
      lastTrackObj.mobile[gameId] = setting
    } else {
      lastTrackObj.mobile = {[gameId]: setting}
    }
  } else {
    lastTrackObj = {mobile: {[gameId]: setting}}
  }
  localStorage.setItem('lastTrack', JSON.stringify(lastTrackObj))
}

export function loadLastTrack (gameId) {
  let lastTrack = localStorage.getItem('lastTrack')
  if (lastTrack) {
    lastTrack = JSON.parse(lastTrack)
    if (lastTrack.mobile) {
      lastTrack = lastTrack.mobile
      if (lastTrack[gameId]) {
        return lastTrack[gameId]
      }
    }
  }
  return null
}

export function saveLastGameData (lastGameData) {
  let lastGameDataStr = localStorage.getItem('lastGameData')
  let lastGameDataObj
  if (lastGameDataStr) {
    lastGameDataObj = JSON.parse(lastGameDataStr)
  }
  if (lastGameDataObj) {
    lastGameDataObj.mobile = lastGameData
  } else {
    lastGameDataObj = {mobile: lastGameData}
  }
  localStorage.setItem('lastGameData', JSON.stringify(lastGameDataObj))
}

export function getLastGameData () {
  let lastGameDataStr = localStorage.getItem('lastGameData')
  let lastGameData
  if (lastGameDataStr) {
    lastGameData = JSON.parse(lastGameDataStr).mobile
  }
  if (lastGameData) {
    lastGameData = {
      lastGame: lastGameData.lastGame || '',
      lastCategory: lastGameData.lastCategory || {}
    }
  } else {
    let lastGame = localStorage.getItem('lastGame') || ''
    localStorage.removeItem('lastGame')

    let lastCategory = {}
    Object.keys(localStorage).forEach(key => {
      if (key.endsWith('-lastCategory')) {
        let gameId = key.split('-')[0]
        let categoryId = localStorage.getItem(key)
        localStorage.removeItem(key)
        lastCategory[gameId] = categoryId
      }
    })
    lastGameData = {
      lastGame,
      lastCategory
    }
    saveLastGameData(lastGameData)
  }
  return lastGameData
}

export function makeCancelable (promise) {
  let hasCanceled_ = false

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCanceled_ ? reject(new Error({isCanceled: true})) : resolve(val),
      error => hasCanceled_ ? reject(new Error({isCanceled: true})) : reject(error)
    )
  })

  return {
    promise: wrappedPromise,
    cancel () {
      hasCanceled_ = true
    }
  }
}

export function getJWTToken (type) {
  let setting = localStorage.getItem(type + '_setting')
  if (setting) {
    setting = JSON.parse(setting)
    if (new Date().getTime() / 1000 < setting.expire) {
      return setting.token
    }
  }
  return ''
}
