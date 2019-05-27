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

function sendServiceReview (data) {
  return axiosVenom.post(urls.service_comment, data)
}

function updateServiceReview (id, data) {
  return axiosVenom.put(`${urls.service_comment}${id}/`, data)
}

function deleteServiceReview (id) {
  return axiosVenom.delete(`${urls.service_comment}${id}/`)
}

export {
  axiosVenom,
  fetchServiceEmoji,
  fetchServiceStickers,
  fetchServiceUnread,
  uploadImgToService,
  sendServiceReview,
  updateServiceReview,
  deleteServiceReview
}
