import axios from 'axios'
import urls from './urls'

function fetchServiceEmoji () {
  return axios.get(urls.service_emoji)
}

function fetchServiceStickers () {
  return axios.get(urls.service_stickers)
}

function fetchServiceUnread () {
  return axios.get(urls.service_unread)
}

function uploadImgToService (data) {
  return axios.post(urls.service_image_attachment, data)
}

export {
  fetchServiceEmoji,
  fetchServiceStickers,
  fetchServiceUnread,
  uploadImgToService
}
