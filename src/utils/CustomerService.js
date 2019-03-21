const RECEIVED_ACTION = {
  'normal': 'normal',
  'system': 'system',
  'image': 'image',
  'history_message': 'history_message',
  'offline_message': 'offline_message',
  'welcome_message': 'welcome_message',
  // functional
  'pulldown': 'pulldown'
}

const EMITTED_ACTION = {
  normal: 'normal',
  history_message: 'history_message',
  offline_message: 'offline_message',
  unread: 'unread'
}

const MSG_TYPE = {
  0: 'system',
  1: 'normal',
  2: 'image',
  3: 'sticker',
  // custom for display
  97: 'datetag',
  98: 'welcome',
  99: 'pulldown'
}

export {
  RECEIVED_ACTION,
  EMITTED_ACTION,
  MSG_TYPE
}
