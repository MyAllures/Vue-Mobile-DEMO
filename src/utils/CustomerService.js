const RECEIVED_ACTION = {
  member_init_info: 'member_init_info',
  offline_message: 'offline_message',
  history_message: 'history_message',
  normal: 'normal',
  image: 'image',
  sticker: 'sticker',
  archive_session: 'archive_session',
  system: 'system',
  assign: 'assign'
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
  welcome_message: 102,
  error: 103,
  review: 104,
  reviewThank: 105,
  reviewCancel: 106
}

const MSG_CAT = {
  common: 'common',
  welcome: 'welcome',
  history: 'history',
  offline: 'offline',
  error: 'error'
}

const RATINGS = [
  {
    desc: '差评',
    value: 1,
    color: '#eb5d48'
  },
  {
    desc: '中评',
    value: 2,
    color: '#f5ce23'
  },
  {
    desc: '好评',
    value: 3,
    color: '#6bc23a'
  }
]

export {
  RECEIVED_ACTION,
  EMITTED_ACTION,
  MSG_TYPE,
  MSG_CAT,
  RATINGS
}
