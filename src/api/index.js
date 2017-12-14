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

export function getCaptcha () {
  return axios.get(urls.agent_captcha)
}
