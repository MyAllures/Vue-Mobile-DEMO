import axios from 'axios'
import urls from './urls'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
let axiosChat = axios.create()

function fetchRoomInfo () {
  return axios.get(urls.roomInfo)
}

function fetchChatUserInfo (username) {
  return axiosChat.get(`${urls.chatinfo}${username}/`)
}

function fetchStickers (name) {
  return axios.get(urls.stickers)
}

function fetchChatEmoji () {
  return axios.get(urls.chatEmoji)
}

export {
  fetchChatEmoji,
  fetchStickers,
  fetchChatUserInfo,
  fetchRoomInfo
}
