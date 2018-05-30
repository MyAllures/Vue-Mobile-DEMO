'use strict'
const config = require('../../config')
const env = process.env.NODE_ENV === 'development' ? config.dev.env : config.build.env
const host = env.HOST.replace(/"/g, '')
const prefix = host + '/member'
const apiv1 = host + '/v1/member'
const apiChat = env.chatApi.replace(/"/g, '')

export default {
  domain: host,
  login: prefix + '/login/',
  register: apiv1 + '/register/',
  user: apiv1 + '/profile/',
  password: prefix + '/password/',
  withdraw_password: prefix + '/withdraw_password/',
  refresh_token: prefix + '/login/refresh/',
  verification: apiv1 + '/verification_code/',
  logout: host + '/logout/',
  games: apiv1 + '/game/',
  category: apiv1 + '/game/category/',
  playgroup: apiv1 + '/game/playgroup/',
  schedule: apiv1 + '/game/schedule/',
  agent_register: apiv1 + '/agentapplication/',
  game_result: apiv1 + '/result/',
  promotions: apiv1 + '/promotion/',
  banner: apiv1 + '/banners/',
  homePage: apiv1 + '/website/home-page/',
  announcements: apiv1 + '/announcements/',
  check_username: apiv1 + '/username/',
  payment: apiv1 + '/payment/',
  paymentType: apiv1 + '/paymenttype/?opt_expand=1&platform=mobile',
  betrecord: apiv1 + '/betrecord/',
  betrecord_byday: apiv1 + '/betrecord_dates/',
  transaction_record: apiv1 + '/transaction/',
  result: '/result/',
  bank: apiv1 + '/bank/',
  withdraw: apiv1 + '/withdraw/',
  remitpayee: apiv1 + '/remitpayee/',
  remit: apiv1 + '/remit_transaction/',
  readMessage: apiv1 + '/message/read/',
  messages: apiv1 + '/messages/',
  unread: apiv1 + '/message/count/',
  gamehistory: apiv1 + /history/,
  statistic: apiv1 + '/statistic/',
  chatEmoji: apiChat + '/v1/emoji/',
  banUser: apiChat + '/v1/room/',
  sendImgToChat: host + '/v1/manage/attachment/',
  getRoomManagers: apiChat + '/v1/room/',
  chatRoomLogin: apiChat + '/chat/',
  playSetting: apiv1 + '/game/playset/',
  setCookie: host + '/set_cookie/',
  stickers: apiChat + '/v1/stickers/',
  envelope: apiv1 + '/red_envelope/',
  chatinfo: apiChat + '/v1/user/',
  roomInfo: apiChat + '/v1/member/room/',
  smscode: apiv1 + '/sms_verification/'
}
