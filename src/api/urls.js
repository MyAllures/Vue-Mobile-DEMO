'use strict'
const config = require('../../config')
const env = process.env.NODE_ENV === 'development' ? config.dev.env : config.build.env
const host = env.HOST.replace(/"/g, '')
const prefix = host + '/member'
const apiv2 = host + '/v2'
const v1Member = host + '/v1/member'
const v2Member = host + '/v2/member'
const apiv1 = host + '/v1'
const wsEiderHost = env.eiderHost.replace(/"/g, '')
const eagleHost = env.eagleHost.replace(/"/g, '')
const wsEagleHost = env.wsEagleHost.replace(/"/g, '')
const venomHost = env.venomHost.replace(/"/g, '')
const wsVenomHost = env.venomSocket.replace(/"/g, '')

export default {
  wsEiderHost,
  venomHost,
  wsVenomHost,
  domain: host,
  login: prefix + '/login/',
  register: v2Member + '/register/',
  user: v2Member + 's/',
  password: prefix + '/password/',
  withdraw_password: prefix + '/withdraw_password/',
  refresh_token: prefix + '/login/refresh/',
  chat_token: host + '/get_chat_token/',
  verification: v2Member + '/verification_code/',
  logout: host + '/logout/',
  games: v2Member + '/game/',
  bettrack: v2Member + '/bettrackrecord/',
  new_bettrack: v2Member + '/bettrackrecordv2/',
  bettrack_record: v2Member + '/bettrackrecord_general/',
  category: v2Member + '/game/category/',
  playgroup: v2Member + '/game/playgroup/',
  schedule: v2Member + '/game/schedule/',
  agent_register: v2Member + '/agentapplication/',
  game_result: v2Member + '/result/',
  promotions: v2Member + '/promotion/',
  banner: v2Member + '/banners/',
  homePage: v2Member + '/website/home-page/',
  announcements: v2Member + '/announcements/',
  check_username: v2Member + '/username/',
  payment: v1Member + '/payment/',
  paymentType: v2Member + '/paymenttype/?opt_expand=1&platform=mobile',
  betrecord: v2Member + '/betrecord/',
  betrecord_byday: v2Member + '/betrecord_dates/',
  transaction_record: v2Member + '/transaction/',
  return_amount: v2Member + '/return_amount/',
  personal_report: v2Member + '/personal_report/',
  result: '/result/',
  bank: v2Member + '/bank/',
  withdraw: v2Member + '/withdraw/',
  remitpayee: v2Member + '/remitpayee/',
  remit: v2Member + '/remit_transaction/',
  readMessage: v2Member + '/message/read/',
  unreadMessage: v2Member + '/message/count/',
  messages: v2Member + '/messages/',
  gamehistory: v2Member + '/history/',
  statistic: v2Member + '/statistic/',
  sendImgToChat: apiv1 + '/manage/attachment/',
  playSetting: v2Member + '/game/playset/',
  setCookie: host + '/set_cookie/',
  red_envelope: v2Member + '/red_envelope/',
  envelope_activity: apiv2 + '/red-envelope-activities/',
  take_envelope_activity: apiv2 + '/transactions/snatch-red-envelope/',
  smscode: v2Member + '/sms_verification/',
  onine_heartbeat: v2Member + '/heart_beat/',
  trend_chart: v2Member + '/trend_chart/',
  expert_plan: apiv2 + '/expert_plans/',
  expert_bettrack: host + '/betrecord/expert_plan_bets/',
  win_history: host + '/members_win_histories?limit=20',
  get_jwt_token: host + '/get_jwt_token/',
  service_emoji: venomHost + '/chat/emoji/',
  service_stickers: venomHost + '/chat/stickers/',
  service_unread: venomHost + '/support/has_unread/',
  service_image_attachment: venomHost + '/chat/attachment/',
  service_comment: venomHost + '/support/member_comment/',
  actv2_activity: host + '/v1/member/envelope/activity-v2/',
  actv2_boost_get: host + '/v1/member/envelope/engagement_boost_details/',
  actv2_referral_code: apiv2 + '/member/referral-code/',
  actv2_referral_list: host + '/v1/member/envelope/referral_details/',
  actv2_re_open: host + '/v1/member/envelope/receive-envelope/',
  actv2_re_count: host + '/v2/remain-envelope-count/',
  eagle: {
    host: eagleHost,
    ws_host: wsEagleHost,
    games: eagleHost + '/v1/games/',
    sendImg: eagleHost + '/v1/attachment/',
    stickers: eagleHost + '/v1/stickers/',
    room: eagleHost + '/v1/rooms/',
    room_banned_users: eagleHost + '/v1/room-banned-users/',
    global_data: eagleHost + '/v1/global-data/',
    followee_list: eagleHost + '/v1/users/followee-list/',
    toggle_follow: eagleHost + '/v1/users/toggle-follow/',
    user: eagleHost + '/v1/users/'
  }
}
