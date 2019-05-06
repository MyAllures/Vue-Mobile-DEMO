import axios from 'axios'
import urls from './urls'

const axiosEagle = axios.create()

const eagle = {
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
export {
  eagle,
  axiosEagle
}
