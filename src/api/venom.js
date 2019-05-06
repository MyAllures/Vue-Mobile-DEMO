import axios from 'axios'
import urls from './urls'

const axiosVenom = axios.create()

function fetchServiceEmoji () {
  return axiosVenom.get(urls.service_emoji)
}

function fetchServiceStickers () {
  return axiosVenom.get(urls.service_stickers)
}

function fetchServiceUnread () {
  return axiosVenom.get(urls.service_unread)
}

function uploadImgToService (data) {
  return axiosVenom.post(urls.service_image_attachment, data)
}

export {
  axiosVenom,
  fetchServiceEmoji,
  fetchServiceStickers,
  fetchServiceUnread,
  uploadImgToService
}
