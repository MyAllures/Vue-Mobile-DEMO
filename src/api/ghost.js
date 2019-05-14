import axios from 'axios'
import urls from './urls'
import qs from 'qs'
import {JWT} from '@/utils/jwtToken'
const axiosGhost = axios.create()

function login (user) {
  return axiosGhost.post(urls.login, qs.stringify(user))
}
function logout () {
  return axiosGhost.post(urls.logout)
}

function fetchUser () {
  return axiosGhost.get(urls.user)
}

function updateUser (user, id) {
  return axiosGhost.put(`${urls.user}${user.id ? user.id : id}/`, user)
}

function fetchBanner () {
  return axiosGhost.get(`${urls.banner}?platform=mobile`)
}

function fetchAnnouncements () {
  return axiosGhost.get(`${urls.announcements}?platform=0`)
}

function gethomePage () {
  return axiosGhost.get(`${urls.homePage}?platform=mobile`)
}

function fetchGames () {
  return axiosGhost.get(`${urls.games}?platform=1`)
}

function fetchGamesDetail () {
  return axiosGhost.get(`${urls.games}?platform=1&extras=categories,playpositions`)
}

function fetchCategories (gameId) {
  return axiosGhost.get(`${urls.category}?&game=${gameId}&platform=1`)
}

function fetchPlaygroup (categoryId) {
  return axiosGhost.get(`${urls.playgroup}?&category=${categoryId}`)
}

function fetchSchedule (gameId, gameCode) {
  return axiosGhost.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}`)
}

function fetchBetTrackSchedules (gameId, gameCode, trackType, scheduleId) {
  return axiosGhost.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}&track_type=${trackType}&schedule_id=${scheduleId}`)
}

function fetchBetTrackRecord (option) {
  let url = `${urls.bettrack_record}?`
  Object.keys(option).forEach(key => {
    if (key === 'date') {
      url += `&start_date=${option[key]}&end_date=${option[key]}`
      return
    }
    url += `&${key}=${option[key]}`
  })
  return axiosGhost.get(url)
}

function betTrack (data) {
  return axiosGhost.post(`${urls.bettrack}`, data)
}

/**
 * 新版追號
 * @param {Number} data.type 追號期數
 * @param {Number} data.bet_amount 追號下注金額
 * @param {Number} data.play_ids 追號下的play(只能有一個)
 * @param {String} data.stopping_tracking_type 遇贏則止：when_win_stop, 追好追滿：never_stop
 * @param {Number} data.multiple 倍率
 * @param {Number} data.game_schedule 預下注期號的id
 */
function newBetTrack (data) {
  return axiosGhost.post(`${urls.new_bettrack}`, data)
}

function fetchNewBetTrackRecord (option) {
  let params = []
  Object.keys(option).forEach(key => {
    if (key === 'date') {
      params.push(`bet_date=${option[key]}`)
      return
    }
    params.push(`${key}=${option[key]}`)
  })
  return axiosGhost.get(`${urls.new_bettrack}?${params.join('&')}`)
}

function placeBet (data) {
  return axiosGhost.post(urls.betrecord, data, {
    'Content-Type': 'application/json'
  })
}

function getPromotions () {
  return axiosGhost.get(urls.promotions)
}

function getRemitPayees () {
  return axiosGhost.get(urls.remitpayee + '?opt_expand=1&embed=remit_type')
}

function postRemit (remit) {
  return axiosGhost.post(urls.remit, remit)
}

function getCaptcha () {
  return axiosGhost.get(urls.agent_captcha)
}

function fetchTransactionRecord (option) {
  return axiosGhost.get(`${urls.transaction_record}?transaction_type=${option.transaction_type}&limit=${option.limit}&offset=${option.offset}`)
}

function postWithdraw (option) {
  return axiosGhost.post(urls.withdraw, qs.stringify(option))
}

function register (user) {
  return axiosGhost.post(urls.register, qs.stringify(user), {withCredentials: true})
}

function checkUserName (username) {
  return axiosGhost.get(urls.check_username, { params: { username: username } })
}

function fetchCaptcha () {
  return axiosGhost.get(urls.verification).then(data => {
    data.captcha_src = urls.domain + data.captcha_src
    return data
  })
}

function fetchBetHistory (option) {
  let url = `${urls.betrecord}?opt_expand=play`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axiosGhost.get(url)
}

function fetchReturnRecord (option) {
  let url = `${urls.return_amount}?`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      if (key === 'date') {
        url += `&start_date=${option[key]}&end_date=${option[key]}`
      } else {
        url += `&${key}=${option[key]}`
      }
    }
  })
  return axiosGhost.get(url)
}

function fetchPersonalReport (option) {
  let url = `${urls.personal_report}?`
  Object.keys(option).forEach(key => {
    if (key === 'startdate') {
      url += `&created_at_0=${option[key]}`
      return
    }
    if (key === 'enddate') {
      url += `&created_at_1=${option[key]}`
      return
    }

    url += `&${key}=${option[key]}`
  })
  return axiosGhost.get(url)
}

function fetchDateBetRecords (option) {
  return axiosGhost.get(`${urls.betrecord_byday}?limit=${option.limit}&offset=${option.offset}&status=${option.status}`)
}

function fetchBetTotal (date) {
  return axiosGhost.get(`${urls.betrecord_byday}?bet_date=${date}&status=win,lose,tie,ongoing`).then(res => res.results[0])
}

function fetchGameResult (gameId) {
  return axiosGhost.get(`${urls.game_result}?game=${gameId}&opt_expand=next`)
}

function getOnlinepayees () {
  return axiosGhost.get(urls.paymentType)
}

function addUserBank (user, member) {
  return axiosGhost.put(urls.user + user.id + '/', member)
}

function fetchBank (onlyEnabled) {
  if (onlyEnabled) {
    return axiosGhost.get(urls.bank + '?status=1')
  }
  return axiosGhost.get(urls.bank)
}

function changePassword (password) {
  return axiosGhost.post(urls.password, password, {emulateJSON: true})
}

function changeWpassword (password) {
  return axiosGhost.post(urls.withdraw_password, password)
}

function changeUserInformation (id, member) {
  return axiosGhost.put(urls.user + id + '/', member)
}

function fetchMessages (limit, offset) {
  return axiosGhost.get(urls.messages + `?limit=${limit}&offset=${offset}`)
}

function readMessage (messageId) {
  return axiosGhost.post(urls.readMessage, {ids: [messageId]})
}

function onlinepaySuccess (transactionId) {
  return axiosGhost.get(urls.payment + '?transaction_ids=' + transactionId)
}

function getGameHistoryData (option) {
  let url = `${urls.gamehistory}?limit=${option.limit || 30}`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axiosGhost.get(url)
}

function fetchStatistic (code) {
  return axiosGhost.get(`${urls.statistic}?game_code=${code}`)
}

function getToken (oldToken) {
  if (!oldToken) {
    return
  }
  return axiosGhost.post(urls.refresh_token, {
    refresh_token: oldToken
  })
}

function sendImgToChat (data) {
  return axiosGhost.post(urls.sendImgToChat, data)
}

function fetchPlaySetting (id) {
  return axiosGhost.get(`${urls.playSetting}?game=${id}`)
}

function setCookie (cookie) {
  return axiosGhost.post(urls.setCookie, {cookie}, { 'Content-Type': 'application/json', withCredentials: true })
}

function sendRedEnvelope (data) {
  return axiosGhost.post(urls.red_envelope, data, {
    'Content-Type': 'application/json'
  })
}

function takeRedEnvelope (envelopId) {
  return axiosGhost.put(`${urls.red_envelope}${envelopId}/`, {
    'Content-Type': 'application/json'
  })
}

function fetchRedEnvelopeDetail (id) {
  return axiosGhost.get(`${urls.red_envelope}${id}/`)
}

function sendSMSCode (phoneNumber) {
  return axiosGhost.put(urls.smscode, {phone_number: phoneNumber}, {
    'Content-Type': 'application/json'
  })
}

function sendHeartBeat () {
  return axiosGhost.get(urls.onine_heartbeat)
}

function fetchTrendChart (params) {
  return axiosGhost.get(urls.trend_chart, {params})
}

function fetchJWTToken (type) {
  return axiosGhost.post(urls.get_jwt_token, {service_type: JWT[type]}).then((res) => {
    return {
      expire: res.expire,
      token: res[JWT[type] + '_token']
    }
  })
}

function fetchActivityEnvelope (envelopId) {
  return axiosGhost.get(`${urls.envelope_activity}${envelopId}/?platform=mobile`)
}

function takeActivityEnvelope (data) {
  return axiosGhost.post(urls.take_envelope_activity, data, {
    'Content-Type': 'application/json'
  })
}

/**
 * 專家計畫
 * @param {number} params.game - game_code
 * @param {number} params.scheme_type
    - FIVE_NUM_FOR_SINGLE: 單期5碼
    - SIX_NUM_FOR_SINGLE: 單期6碼
    - FIVE_NUM_FOR_TRIPLE: 3期5碼
    - SIX_NUM_FOR_DOUBLE: 2期6碼
 * @param {number} params.position
    - PK10: 1~10 (冠,亞,三,...,十)，預設應為 1
    - 時時彩: 1~5 (萬,千,百,十,個)，預設應為 1
 * @param {String} params.expert - 專家id，如果有傳此參數指定專家，則回傳資料中的cur_expert及cur_plans篩選出的內容會不同; 如未指定則以勝率最高的專家做為條件
 */
function fetchExpertPlan (params) {
  return axiosGhost.get(urls.expert_plan, {params})
}

/**
 * 專家計劃多期下注
 * @param {string} data.game - 下注遊戲game_code ex. bcr
 * @param {number[]} data.issue_numbers - 期號
 * @param {number} data.position - 第n名
 * @param {number[]} data.bet_numbers - 下注號碼
 * @param {number} data.bet_amount - 下注金額
 */
function expertBetTrack (data) {
  return axiosGhost.post(urls.expert_bettrack, data)
}

function fetchWinHistory () {
  return axiosGhost.get(urls.win_history)
}

function fetchUnreadCount () {
  return axiosGhost.get(urls.unreadMessage)
}
export {
  axiosGhost,
  fetchUnreadCount,
  fetchActivityEnvelope,
  takeActivityEnvelope,
  fetchExpertPlan,
  expertBetTrack,
  fetchWinHistory,
  fetchJWTToken,
  fetchTrendChart,
  sendHeartBeat,
  sendSMSCode,
  takeRedEnvelope,
  sendRedEnvelope,
  fetchRedEnvelopeDetail,
  setCookie,
  fetchPlaySetting,
  sendImgToChat,
  getToken,
  fetchStatistic,
  getGameHistoryData,
  onlinepaySuccess,
  readMessage,
  fetchMessages,
  changeUserInformation,
  changeWpassword,
  changePassword,
  fetchBank,
  addUserBank,
  getOnlinepayees,
  fetchGameResult,
  fetchBetTotal,
  fetchDateBetRecords,
  fetchPersonalReport,
  fetchReturnRecord,
  fetchBetHistory,
  fetchCaptcha,
  checkUserName,
  register,
  postWithdraw,
  fetchTransactionRecord,
  getCaptcha,
  postRemit,
  getRemitPayees,
  getPromotions,
  placeBet,
  betTrack,
  newBetTrack,
  fetchNewBetTrackRecord,
  fetchBetTrackRecord,
  fetchBetTrackSchedules,
  fetchSchedule,
  fetchPlaygroup,
  fetchCategories,
  fetchGamesDetail,
  fetchGames,
  gethomePage,
  fetchAnnouncements,
  fetchBanner,
  updateUser,
  fetchUser,
  logout,
  login
}
