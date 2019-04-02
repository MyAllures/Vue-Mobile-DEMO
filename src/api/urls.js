'use strict'
const config = require('../../config')
const env = process.env.NODE_ENV === 'development' ? config.dev.env : config.build.env
const host = env.HOST.replace(/"/g, '')
const prefix = host + '/member'
const apiv2 = host + '/v2/member'
const apiv1 = host + '/v1/member'
const apiChat = env.chatApi.replace(/"/g, '')
const wsEiderHost = env.eiderHost.replace(/"/g, '')

export default {
  wsEiderHost,
  domain: host,
  login: prefix + '/login/',
  register: apiv2 + '/register/',
  user: apiv2 + 's/',
  password: prefix + '/password/',
  withdraw_password: prefix + '/withdraw_password/',
  refresh_token: prefix + '/login/refresh/',
  chat_token: host + '/get_chat_token/',
  verification: apiv2 + '/verification_code/',
  logout: host + '/logout/',
  games: apiv2 + '/game/',
  bettrack: apiv2 + '/bettrackrecord/',
  category: apiv2 + '/game/category/',
  playgroup: apiv2 + '/game/playgroup/',
  schedule: apiv2 + '/game/schedule/',
  agent_register: apiv2 + '/agentapplication/',
  game_result: apiv2 + '/result/',
  promotions: apiv2 + '/promotion/',
  banner: apiv2 + '/banners/',
  homePage: apiv2 + '/website/home-page/',
  announcements: apiv2 + '/announcements/',
  check_username: apiv2 + '/username/',
  payment: apiv1 + '/payment/',
  paymentType: apiv2 + '/paymenttype/?opt_expand=1&platform=mobile',
  betrecord: apiv2 + '/betrecord/',
  betrecord_byday: apiv2 + '/betrecord_dates/',
  transaction_record: apiv2 + '/transaction/',
  return_amount: apiv2 + '/return_amount/',
  personal_report: apiv2 + '/personal_report/',
  result: '/result/',
  bank: apiv2 + '/bank/',
  withdraw: apiv2 + '/withdraw/',
  remitpayee: apiv2 + '/remitpayee/',
  remit: apiv2 + '/remit_transaction/',
  readMessage: apiv2 + '/message/read/',
  messages: apiv2 + '/messages/',
  gamehistory: apiv2 + '/history/',
  statistic: apiv2 + '/statistic/',
  chatEmoji: apiChat + '/v1/emoji/',
  sendImgToChat: host + '/v1/manage/attachment/',
  chatRoomLogin: apiChat + '/chat/',
  playSetting: apiv2 + '/game/playset/',
  setCookie: host + '/set_cookie/',
  stickers: apiChat + '/v1/stickers/',
  envelope: apiv2 + '/red_envelope/',
  envelope_activity: host + '/v2/red-envelope-activities/',
  take_envelope_activity: host + '/v2/transactions/snatch-red-envelope/',
  chatinfo: apiChat + '/v1/user/',
  roomInfo: apiChat + '/v1/member/room/',
  smscode: apiv2 + '/sms_verification/',
  onine_heartbeat: apiv2 + '/heart_beat/',
  trend_chart: apiv2 + '/trend_chart/',
  win_history: host + '/members_win_histories?limit=20'
}
