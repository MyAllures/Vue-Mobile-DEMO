import axios from 'axios'
import urls from './urls'
import qs from 'qs'
import Vue from 'vue'
import {JWT} from '@/utils/jwtToken'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

function login (user) {
  return axios.post(urls.login, qs.stringify(user))
}
function logout () {
  return axios.post(urls.logout)
}

function fetchUser () {
  return axios.get(urls.user)
}

function updateUser (user, id) {
  return axios.put(`${urls.user}${user.id ? user.id : id}/`, user)
}

function fetchBanner () {
  return axios.get(`${urls.banner}?platform=mobile`)
}

function fetchAnnouncements () {
  return axios.get(`${urls.announcements}?platform=0`)
}

function gethomePage () {
  return axios.get(urls.homePage)
}

function fetchGames () {
  return axios.get(`${urls.games}?platform=1`)
}

function fetchGamesDetail () {
  return axios.get(`${urls.games}?platform=1&extras=categories,playpositions`)
}

function fetchCategories (gameId) {
  return axios.get(`${urls.category}?&game=${gameId}&platform=1`)
}

function fetchPlaygroup (categoryId) {
  return axios.get(`${urls.playgroup}?&category=${categoryId}`)
}

function fetchSchedule (gameId, gameCode) {
  return axios.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}`)
}

function fetchBetTrackSchedules (gameId, gameCode, trackType, scheduleId) {
  return axios.get(`${urls.schedule}?&game=${gameId}&game_code=${gameCode}&track_type=${trackType}&schedule_id=${scheduleId}`)
}

function fetchBetTrackRecord (option) {
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

function betTrack (data) {
  return axios.post(`${urls.bettrack}`, data)
}

function placeBet (data) {
  return axios.post(urls.betrecord, data, {
    'Content-Type': 'application/json'
  })
}

function getPromotions () {
  return axios.get(urls.promotions)
}

function getRemitPayees () {
  return axios.get(urls.remitpayee + '?opt_expand=1&embed=remit_type')
}

function postRemit (remit) {
  return axios.post(urls.remit, remit)
}

function getCaptcha () {
  return axios.get(urls.agent_captcha)
}

function fetchTransactionRecord (option) {
  return axios.get(`${urls.transaction_record}?transaction_type=${option.transaction_type}&limit=${option.limit}&offset=${option.offset}`)
}

function postWithdraw (option) {
  return axios.post(urls.withdraw, qs.stringify(option))
}

function register (user) {
  return axios.post(urls.register, qs.stringify(user), {withCredentials: true})
}

function checkUserName (username) {
  return axios.get(urls.check_username, { params: { username: username } })
}

function fetchCaptcha () {
  return axios.get(urls.verification).then(data => {
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
  return axios.get(url)
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
  return axios.get(url)
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
  return axios.get(url)
}

function fetchDateBetRecords (option) {
  return axios.get(`${urls.betrecord_byday}?limit=${option.limit}&offset=${option.offset}&status=${option.status}`)
}

function fetchBetTotal (date) {
  return axios.get(`${urls.betrecord_byday}?bet_date=${date}&status=win,lose,tie,ongoing`).then(res => res.results[0])
}

function fetchGameResult (gameId) {
  return axios.get(`${urls.game_result}?game=${gameId}&opt_expand=next`)
}

function getOnlinepayees () {
  return axios.get(urls.paymentType)
}

function addUserBank (user, member) {
  return axios.put(urls.user + user.id + '/', member)
}

function fetchBank (onlyEnabled) {
  if (onlyEnabled) {
    return axios.get(urls.bank + '?status=1')
  }
  return axios.get(urls.bank)
}

function changePassword (password) {
  return axios.post(urls.password, password, {emulateJSON: true})
}

function changeWpassword (password) {
  return axios.post(urls.withdraw_password, password)
}

function changeUserInformation (id, member) {
  return axios.put(urls.user + id + '/', member)
}

function fetchMessages (limit, offset) {
  return axios.get(urls.messages + `?limit=${limit}&offset=${offset}`)
}

function readMessage (messageId) {
  return axios.post(urls.readMessage, {ids: [messageId]})
}

function onlinepaySuccess (transactionId) {
  return axios.get(urls.payment + '?transaction_ids=' + transactionId)
}

function getGameHistoryData (option) {
  let url = `${urls.gamehistory}?limit=30`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axios.get(url)
}

function fetchStatistic (code) {
  return axios.get(`${urls.statistic}?game_code=${code}`)
}

function getToken (oldToken) {
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

function sendImgToChat (data) {
  return axios.post(urls.sendImgToChat, data)
}

function fetchPlaySetting (id) {
  return axios.get(`${urls.playSetting}?game=${id}`)
}

function setCookie (cookie) {
  return axios.post(urls.setCookie, {cookie}, { 'Content-Type': 'application/json', withCredentials: true })
}

function sendEnvelope (data) {
  return axios.post(urls.envelope, data, {
    'Content-Type': 'application/json'
  })
}

function takeEnvelope (envelopId, userId) {
  return axios.put(`${urls.envelope}${envelopId}/`, {
    receiver_id: userId
  }, {
    'Content-Type': 'application/json'
  })
}

function sendSMSCode (phoneNumber) {
  return axios.put(urls.smscode, {phone_number: phoneNumber}, {
    'Content-Type': 'application/json'
  })
}

function sendHeartBeat () {
  return axios.get(urls.onine_heartbeat)
}

function fetchTrendChart (params) {
  return axios.get(urls.trend_chart, {params})
}

function fetchRavenJWTToken () {
  return axios.post(urls.get_jwt_token, {service_type: JWT.raven}).then((res) => {
    Vue.cookie.set(JWT.raven + '_token', res[JWT.raven + '_token'])
    return res
  })
}

function fetchVenomJWTToken () {
  return axios.post(urls.get_jwt_token, {service_type: JWT.venom}).then((res) => {
    Vue.cookie.set(JWT.venom + '_token', res[JWT.venom + '_token'])
    return res
  })
}

export {
  fetchVenomJWTToken,
  fetchRavenJWTToken,
  fetchTrendChart,
  sendHeartBeat,
  sendSMSCode,
  takeEnvelope,
  sendEnvelope,
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
