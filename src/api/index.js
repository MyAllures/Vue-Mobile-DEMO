import axios from 'axios'
import urls from './urls'
import qs from 'qs'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

export function login (user) {
  return axios.post(urls.login, qs.stringify(user))
}
export function logout () {
  return axios.post(urls.logout)
}

export function fetchUser () {
  return axios.get(urls.user)
}

export function fetchBanner () {
  return axios.get(urls.banner)
}

export function fetchAnnouncements () {
  return axios.get(urls.announcements)
}

export function gethomePage () {
  return axios.get(urls.homePage)
}

export function getGameCategory () {
  return axios.get(urls.games)
}

export function getPromotions () {
  return axios.get(urls.promotions)
}

export function getCaptcha () {
  return axios.get(urls.agent_captcha)
}

export function fetchTransactionRecord (option) {
  return axios.get(`${urls.transaction_record}?transaction_type=${option.transaction_type}&limit=${option.limit}&offset=${option.offset}`)
}

export function register (user) {
  return axios.post(urls.register, qs.stringify(user))
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
  let url = `${urls.betrecord}?opt_expand=play&limit=${option.limit}`
  Object.keys(option).forEach(key => {
    if (option[key]) {
      url += `&${key}=${option[key]}`
    }
  })
  return axios.get(url)
}

export function fetchDateBetRecords (option) {
  return axios.get(`${urls.betrecord_byday}?limit=${option.limit}&offset=${option.offset}`)
}

export function fetchGames () {
  return axios.get(urls.games)
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

export function fetchBank () {
  return axios.get(urls.bank)
}

export function changePassword (password) {
  return axios.post(urls.password, password, {emulateJSON: true})
}

export function changeWpassword (password) {
  return axios.post(urls.withdraw_password, password)
}

export function changeUserInformation (id, member) {
  return axios.put(urls.user + member.id + '/', member)
}

export function noMessages (message) {
  return axios.put(urls.messages + '' + message.id + '/')
}

export function unRead () {
  return axios.get(urls.messageCount)
}

export function onlinepaySuccess (transactionId) {
  return axios.get(urls.payment + '?transaction_ids=' + transactionId)
}
