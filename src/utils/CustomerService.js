const RECEIVED_ACTION = {
  'system': 'system',
  'normal': 'normal',
  'image': 'image',
  'sticker': 'sticker',
  'history_message': 'history_message',
  'offline_message': 'offline_message',
  'welcome_message': 'welcome_message',
  'has_history_message': 'has_history_message',
  'pulldown': 'pulldown'
}

const EMITTED_ACTION = {
  normal: 'normal',
  sticker: 'sticker',
  history_message: 'history_message',
  offline_message: 'offline_message',
  unread: 'unread'
}

const MSG_TYPE = {
  'system': 0,
  'normal': 1,
  'image': 2,
  'sticker': 3,
  // below is custom for display
  'datetag': 97,
  'welcome': 98,
  'pulldown': 99
}

export {
  RECEIVED_ACTION,
  EMITTED_ACTION,
  MSG_TYPE
}
