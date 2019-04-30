import axios from 'axios'
import urls from './urls'
import qs from 'qs'

export const JWT = {
  venom: 'customer_service',
  eider: 'message_broker',
  eagle: 'chatroom_betting'
}

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

const axiosGhost = axios.create()
const axiosEagle = axios.create()

export {urls, axiosGhost, axiosEagle}

export function login (user) {
  return axiosGhost.post(urls.login, qs.stringify(user))
}
export function logout () {
  return axiosGhost.post(urls.logout)
}

export function fetchUser () {
  return axiosGhost.get(urls.user)
}

export function updateUser (user, id) {
  return axiosGhost.put(`${urls.user}${user.id ? user.id : id}/`, user)
}

export function fetchBanner () {
  return axiosGhost.get(`${urls.banner}?platform=mobile`)
}

export function fetchAnnouncements () {
  return axiosGhost.get(`${urls.announcements}?platform=0`)
}

export function gethomePage () {
  return axiosGhost.get(`${urls.homePage}?platform=mobile`)
}

export function fetchGames () {
  return axiosGhost.get(`${urls.games}?platform=1`)
}

export function fetchGamesDetail () {
  return axiosGhost.get(`${urls.games}?platform=1&extras=categories,playpositions`)
}

export function fetchCategories (gameId) {
  return axiosGhost.get(`${urls.category}?&game=${gameId}&platform=1`)
}

export function fetchPlaygroup (categoryId) {
  return axiosGhost.get(`${urls.playgroup}?&category=${categoryId}`)
}

export function fetchSchedule (gameId, gameCode) {
  return axiosGhost.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}`)
}

export function fetchBetTrackSchedules (gameId, gameCode, trackType, scheduleId) {
  return axiosGhost.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}&track_type=${trackType}&schedule_id=${scheduleId}`)
}

export function fetchBetTrackRecord (option) {
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

export function betTrack (data) {
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
export function newBetTrack (data) {
  return axiosGhost.post(`${urls.new_bettrack}`, data)
}

export function placeBet (data) {
  return axiosGhost.post(urls.betrecord, data, {
    'Content-Type': 'application/json'
  })
}

export function getPromotions () {
  return axiosGhost.get(urls.promotions)
}

export function getRemitPayees () {
  return axiosGhost.get(urls.remitpayee + '?opt_expand=1&embed=remit_type')
}

export function postRemit (remit) {
  return axiosGhost.post(urls.remit, remit)
}

export function getCaptcha () {
  return axiosGhost.get(urls.agent_captcha)
}

export function fetchTransactionRecord (option) {
  return axiosGhost.get(`${urls.transaction_record}?transaction_type=${option.transaction_type}&limit=${option.limit}&offset=${option.offset}`)
}

export function postWithdraw (option) {
  return axiosGhost.post(urls.withdraw, qs.stringify(option))
}

export function register (user) {
  return axiosGhost.post(urls.register, qs.stringify(user), {withCredentials: true})
}

export function checkUserName (username) {
  return axiosGhost.get(urls.check_username, { params: { username: username } })
}

export function fetchCaptcha () {
  return axiosGhost.get(urls.verification).then(data => {
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
  return axiosGhost.get(url)
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
  return axiosGhost.get(url)
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
  return axiosGhost.get(url)
}

export function fetchDateBetRecords (option) {
  return axiosGhost.get(`${urls.betrecord_byday}?limit=${option.limit}&offset=${option.offset}&status=${option.status}`)
}

export function fetchBetTotal (date) {
  return axiosGhost.get(`${urls.betrecord_byday}?bet_date=${date}&status=win,lose,tie,ongoing`).then(res => res.results[0])
}

export function fetchGameResult (gameId) {
  return axiosGhost.get(`${urls.game_result}?game=${gameId}&opt_expand=next`)
}

export function getOnlinepayees () {
  return axiosGhost.get(urls.paymentType)
}

export function addUserBank (user, member) {
  return axiosGhost.put(urls.user + user.id + '/', member)
}

export function fetchBank (onlyEnabled) {
  if (onlyEnabled) {
    return axiosGhost.get(urls.bank + '?status=1')
  }
  return axiosGhost.get(urls.bank)
}

export function changePassword (password) {
  return axiosGhost.post(urls.password, password, {emulateJSON: true})
}

export function changeWpassword (password) {
  return axiosGhost.post(urls.withdraw_password, password)
}

export function changeUserInformation (id, member) {
  return axiosGhost.put(urls.user + id + '/', member)
}

export function fetchUnreadCount () {
  return axiosGhost.get(urls.unreadMessage)
}

export function fetchMessages (limit, offset) {
  return axiosGhost.get(urls.messages + `?limit=${limit}&offset=${offset}`)
}

export function readMessage (messageId) {
  return axiosGhost.post(urls.readMessage, {ids: [messageId]})
}

export function onlinepaySuccess (transactionId) {
  return axiosGhost.get(urls.payment + '?transaction_ids=' + transactionId)
}

export function getGameHistoryData (option) {
  let url = `${urls.gamehistory}?limit=${option.limit || 30}`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axiosGhost.get(url)
}

export function fetchStatistic (code) {
  return axiosGhost.get(`${urls.statistic}?game_code=${code}`)
}

export function getToken (oldToken) {
  if (!oldToken) {
    return
  }
  return axiosGhost.post(urls.refresh_token, {
    refresh_token: oldToken
  }).then(
    res => {
      axiosGhost.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      axiosEagle.defaults.headers.common['Authorization'] = 'Bearer ' + res.access_token
      return res
    })
}

export function fetchChatToken () {
  return axiosGhost.post(urls.chat_token)
}

export function sendImgToChat (data) {
  return axiosGhost.post(urls.sendImgToChat, data)
}

export function fetchPlaySetting (id) {
  return axiosGhost.get(`${urls.playSetting}?game=${id}`)
}

export function setCookie (cookie) {
  return axiosGhost.post(urls.setCookie, {cookie}, { 'Content-Type': 'application/json', withCredentials: true })
}

export function sendEnvelope (data) {
  return axiosGhost.post(urls.envelope, data, {
    'Content-Type': 'application/json'
  })
}

export function takeEnvelope (envelopId, userId) {
  return axiosGhost.put(`${urls.envelope}${envelopId}/`, {
    receiver_id: userId
  }, {
    'Content-Type': 'application/json'
  })
}

export function fetchActivityEnvelope (envelopId) {
  return axiosGhost.get(`${urls.envelope_activity}${envelopId}/?platform=mobile`)
}

export function takeActivityEnvelope (data) {
  return axiosGhost.post(urls.take_envelope_activity, data, {
    'Content-Type': 'application/json'
  })
}

export function sendSMSCode (phoneNumber) {
  return axiosGhost.put(urls.smscode, {phone_number: phoneNumber}, {
    'Content-Type': 'application/json'
  })
}

export function sendHeartBeat () {
  return axiosGhost.get(urls.onine_heartbeat)
}

export function fetchTrendChart (params) {
  return axiosGhost.get(urls.trend_chart, {params})
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
export function expertBetTrack (data) {
  return axiosGhost.post(urls.expert_bettrack, data)
}

export function fetchWinHistory () {
  return axiosGhost.get(urls.win_history)
}

export function fetchJWTToken (type) {
  return axiosGhost.post(urls.get_jwt_token, {service_type: JWT[type]}).then((res) => {
    return res[JWT[type] + '_token']
  })
}

// eagle
export const eagle = {
  sendImg (data) {
    return axiosEagle.post(urls.eagle.sendImg, data)
  },
  fetchStickers (name) {
    return axiosEagle.get(urls.eagle.stickers)
  },
  /**
   * 禁言之設定與取消、管理員之加入與刪除
   * @param {string} data.action - ban, unban, add_manager, remove_manager
   * @param {string} data.username
   * @param {number} data.duration - for action ban
   */
  controlChatMember (rommId, action, data) {
    return axiosEagle.post(`${urls.eagle.room}${rommId}/${action}/`, data)
  },
  /**
   * 禁言名單
   * @param {number} roomId
   */
  fetchBannedList (roomId) {
    return axiosEagle.get(`${urls.eagle.room_banned_users}`, {params: {
      room_id: roomId
    }})
  },
  /**
   * 取得全域資料
   * @returns {array} elements in the array are `room_id`
   */
  fetchGlobalData () {
    return axiosEagle.get(urls.eagle.global_data)
  },
  /**
   * 取得聊天室會員資料
   */
  fetchChatRoomUserInfo (username) {
    return axiosEagle.get(`${urls.eagle.user}${username}/`)
  },
  /**
   * 使用者詳情
   * @param {string} username
   * @param {number} roomId
   */
  fetchUserDetail (username, roomId) {
    return axiosEagle.get(`${urls.eagle.user}${username}/details/?room_id=${roomId}`)
  },
  /**
   * 修改聊天室會員資料
   */
  updateChatRoomUserInfo (username, data) {
    return axiosEagle.patch(`${urls.eagle.user}${username}/`, data)
  },
  /**
   * 顯示關注會員名單
   */
  fetchFolloweeList () {
    return axiosEagle.get(urls.eagle.followee_list)
  },
  /**
   * 關注/取消關注會員
   * @param {*} username
   */
  toggleFollowee (username) {
    return axiosEagle.post(urls.eagle.toggle_follow, {followee: username})
  }
}
