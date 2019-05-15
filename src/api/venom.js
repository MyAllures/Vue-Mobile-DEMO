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
  return axios.post(urls.service_comment, data)
}

function updateServiceReview (id, data) {
  return axios.put(`${urls.service_comment}${id}/`, data)
}

function deleteServiceReview (id) {
  return axios.delete(`${urls.service_comment}${id}/`)
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
