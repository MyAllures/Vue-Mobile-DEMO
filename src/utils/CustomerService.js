const RECEIVED_ACTION = {
  welcome_message: 'welcome_message',
  offline_message: 'offline_message',
  history_message: 'history_message',
  normal: 'normal',
  image: 'image',
  sticker: 'sticker'
}

const EMITTED_ACTION = {
  normal: 'normal',
  sticker: 'sticker',
  history_message: 'history_message',
  offline_message: 'offline_message',
  unread: 'unread'
}

const MSG_TYPE = {
  system: 0,
  normal: 1,
  image: 2,
  sticker: 3,
  // custom types
  datetag: 101,
  welcome_message: 102
}

const MSG_CAT = {
  common: 'common',
  welcome: 'welcome',
  history: 'history',
  offline: 'offline'
}

export {
  RECEIVED_ACTION,
  EMITTED_ACTION,
  MSG_TYPE,
  MSG_CAT
}
