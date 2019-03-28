import axios from 'axios'
import urls from './urls'
import qs from 'qs'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
let axiosChat = axios.create()

export function login (user) {
  return axios.post(urls.login, qs.stringify(user))
}
export function logout () {
  return axios.post(urls.logout)
}

export function fetchUser () {
  return axios.get(urls.user)
}

export function updateUser (user, id) {
  return axios.put(`${urls.user}${user.id ? user.id : id}/`, user)
}

export function fetchBanner () {
  return axios.get(`${urls.banner}?platform=mobile`)
}

export function fetchAnnouncements () {
  return axios.get(`${urls.announcements}?platform=0`)
}

export function gethomePage () {
  return axios.get(`${urls.homePage}?platform=mobile`)
}

export function fetchGames () {
  return axios.get(`${urls.games}?platform=1`)
}

export function fetchGamesDetail () {
  return axios.get(`${urls.games}?platform=1&extras=categories,playpositions`)
}

export function fetchCategories (gameId) {
  return axios.get(`${urls.category}?&game=${gameId}&platform=1`)
}

export function fetchPlaygroup (categoryId) {
  return axios.get(`${urls.playgroup}?&category=${categoryId}`)
}

export function fetchSchedule (gameId, gameCode) {
  return axios.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}`)
}

export function fetchBetTrackSchedules (gameId, gameCode, trackType, scheduleId) {
  return axios.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}&track_type=${trackType}&schedule_id=${scheduleId}`)
}

export function fetchBetTrackRecord (option) {
  let url = `${urls.bettrack}?`
  Object.keys(option).forEach(key => {
    if (key === 'date') {
      url += `&bet_date=${option[key]}`
      return
    }
    url += `&${key}=${option[key]}`
  })
  return axios.get(url)
}

export function betTrack (data) {
  return axios.post(`${urls.bettrack}`, data)
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
export function betTrackNew (data) {
  return axios.post(`${urls.bettrack_new}`, data)
}

export function placeBet (data) {
  return axios.post(urls.betrecord, data, {
    'Content-Type': 'application/json'
  })
}

export function getPromotions () {
  return axios.get(urls.promotions)
}

export function getRemitPayees () {
  return axios.get(urls.remitpayee + '?opt_expand=1&embed=remit_type')
}

export function postRemit (remit) {
  return axios.post(urls.remit, remit)
}

export function getCaptcha () {
  return axios.get(urls.agent_captcha)
}

export function fetchTransactionRecord (option) {
  return axios.get(`${urls.transaction_record}?transaction_type=${option.transaction_type}&limit=${option.limit}&offset=${option.offset}`)
}

export function postWithdraw (option) {
  return axios.post(urls.withdraw, qs.stringify(option))
}

export function register (user) {
  return axios.post(urls.register, qs.stringify(user), {withCredentials: true})
}

export function checkUserName (username) {
  return axios.get(urls.check_username, { params: { username: username } })
}

export function fetchCaptcha () {
  return axios.get(urls.verification).then(data => {
    data.captcha_src = urls.domain + data.captcha_src
    return data
  })
}

export function fetchBetHistory (option) {
  let url = `${urls.betrecord}?opt_expand=play`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axios.get(url)
}

export function fetchReturnRecord (option) {
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
  return axios.get(url)
}

export function fetchPersonalReport (option) {
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
  return axios.get(url)
}

export function fetchDateBetRecords (option) {
  return axios.get(`${urls.betrecord_byday}?limit=${option.limit}&offset=${option.offset}&status=${option.status}`)
}

export function fetchBetTotal (date) {
  return axios.get(`${urls.betrecord_byday}?bet_date=${date}&status=win,lose,tie,ongoing`).then(res => res.results[0])
}

export function fetchGameResult (gameId) {
  return axios.get(`${urls.game_result}?game=${gameId}&opt_expand=next`)
}

export function getOnlinepayees () {
  return axios.get(urls.paymentType)
}

export function addUserBank (user, member) {
  return axios.put(urls.user + user.id + '/', member)
}

export function fetchBank (onlyEnabled) {
  if (onlyEnabled) {
    return axios.get(urls.bank + '?status=1')
  }
  return axios.get(urls.bank)
}

export function changePassword (password) {
  return axios.post(urls.password, password, {emulateJSON: true})
}

export function changeWpassword (password) {
  return axios.post(urls.withdraw_password, password)
}

export function changeUserInformation (id, member) {
  return axios.put(urls.user + id + '/', member)
}

export function fetchMessages (limit, offset) {
  return axios.get(urls.messages + `?limit=${limit}&offset=${offset}`)
}

export function readMessage (messageId) {
  return axios.post(urls.readMessage, {ids: [messageId]})
}

export function onlinepaySuccess (transactionId) {
  return axios.get(urls.payment + '?transaction_ids=' + transactionId)
}

export function getGameHistoryData (option) {
  let url = `${urls.gamehistory}?limit=30`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axios.get(url)
}

export function fetchStatistic (code) {
  return axios.get(`${urls.statistic}?game_code=${code}`)
}

export function getToken (oldToken) {
  if (!oldToken) {
    return
  }
  return axios.post(urls.refresh_token, {
    refresh_token: oldToken
  }).then(
    res => {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      return res
    })
}

export function fetchChatToken () {
  return axios.post(urls.chat_token)
}

export function sendImgToChat (data) {
  return axios.post(urls.sendImgToChat, data)
}

export function fetchPlaySetting (id) {
  return axios.get(`${urls.playSetting}?game=${id}`)
}

export function setCookie (cookie) {
  return axios.post(urls.setCookie, {cookie}, { 'Content-Type': 'application/json', withCredentials: true })
}

export function fetchStickers (name) {
  return axios.get(urls.stickers)
}

export function fetchChatEmoji () {
  return axios.get(urls.chatEmoji)
}

export function sendEnvelope (data) {
  return axios.post(urls.envelope, data, {
    'Content-Type': 'application/json'
  })
}

export function takeEnvelope (envelopId, userId) {
  return axios.put(`${urls.envelope}${envelopId}/`, {
    receiver_id: userId
  }, {
    'Content-Type': 'application/json'
  })
}

export function fetchActivityEnvelope (envelopId) {
  return axios.get(`${urls.envelope_activity}${envelopId}/?platform=mobile`)
}

export function takeActivityEnvelope (data) {
  return axios.post(urls.take_envelope_activity, data, {
    'Content-Type': 'application/json'
  })
}

export function fetchChatUserInfo (username) {
  return axiosChat.get(`${urls.chatinfo}${username}/`)
}

export function fetchRoomInfo () {
  return axios.get(urls.roomInfo)
}

export function sendSMSCode (phoneNumber) {
  return axios.put(urls.smscode, {phone_number: phoneNumber}, {
    'Content-Type': 'application/json'
  })
}

export function sendHeartBeat () {
  return axios.get(urls.onine_heartbeat)
}

export function fetchTrendChart (params) {
  return axios.get(urls.trend_chart, {params})
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
export function fetchExpertPlan (params) {
  return axios.get(urls.expert_plan, {params})
}

/**
 * 專家計劃多期下注
 * @param {string} data.game - 下注遊戲game_code ex. bcr
 * @param {number[]} data.issue_numbers - 期號
 * @param {number} data.position - 第n名
 * @param {number[]} data.bet_numbers - 下注號碼
 * @param {number} data.bet_amount - 下注金額
 */
export function betExperPlan (data) {
  return axios.post(urls.expert_bet, data)
}
