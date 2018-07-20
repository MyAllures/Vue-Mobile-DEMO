import isEmail from 'validator/lib/isEmail'
import Vue from 'vue'
const CryptoJS = require('crypto-js')

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
    console.log('destroy')
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

export function msgFormatter (msgs) {
  let formatMsg
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
    if (msgs.msg) {
      formatMsg = msgs.msg
      if (Array.isArray(formatMsg)) {
        formatMsg = formatMsg[0]
      }
      return formatMsg
    } else if (typeof msgs === 'string') {
      formatMsg = msgs
    } else {
      formatMsg = '系统发生了错误, 请联系客服'
    }
  }
  return formatMsg
}

const pattern = {
  username: /^[a-zA-Z0-9]{6,15}$/,
  password: /^[a-zA-Z0-9]{6,15}$/,
  qq: /^[0-9]{4,}$/,
  phone: /^[1][3-8]\d{9}$/,
  bankAccount: /^[0-9]{10,}$/,
  withdrawPassword: /^[0-9]{6}$/
}

export function validateUserName (value) {
  return pattern.username.test(value)
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

export function _getwidth (date, o) {
  let raw = _getpaths(date, o).split(date.getUTCDay()).reverse().join('')
  return CryptoJS.MD5(raw).toString()
}

export function _getpaths (date, o) {
  let a = Vue.moment.parseZone(date.toGMTString()).utc().format()
  return a.substr(o.s, o.e)
}

export function _getheight (height) {
  let str = String(height)
  let obj = {
    s: parseInt(str[1]),
    e: parseInt(str.substr(2))
  }
  return obj
}

export default {
  _getwidth,
  _getpaths,
  _getheight
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
