import store from '@/store'
import VueCookie from 'vue-cookie'
import Vue from 'vue'
Vue.use(VueCookie)

jest.mock('@/api', () => {
  return {
    login: () => Promise.resolve({'access_token': '8d3f5a64dbaaaeb4d71e63bdc075bd00', 'token_type': 'Bearer', 'expires_in': '2018-08-21 11:44:07', 'refresh_token': '62e98c8196a80a5db5ef1e6cfb88a5f3', 'type': 'member'}),
    logout: () => Promise.resolve(),
    fetchUser: () => Promise.resolve([{'id': 7620, 'avatar': null, 'username': 'eeeeee', 'real_name': '袁鴻升', 'nickname': null, 'phone': '13255984398', 'gender': null, 'email': null, 'birthday': null, 'wechat': null, 'qq': '132984', 'memo': null, 'logout_time': '2018-08-20T11:44:03.751147+08:00', 'account_type': 1, 'platform_registered': 'pc', 'is_reg_present_sent': false, 'level': {'name': '一般会员', 'remit_limit': {'lower': '10'}, 'online_limit': {'upper': null, 'lower': '10'}, 'withdraw_fee': '0', 'withdraw_limit': {'upper': null, 'lower': '10'}}, 'bank': null, 'balance': 0.0, 'envelopes': [], 'unsettled': 0}]),
    fetchChatInfo: () => Promise.resolve({'plan_maker_rooms': []}),
    fetchRoomInfo: () => Promise.resolve([{'id': 100000, 'title': '聊天室', 'status': 1}, {'id': 7, 'title': '香港六合彩聊天室', 'status': 0}, {'id': 19, 'title': '幸运六合彩聊天室', 'status': 0}, {'id': 2, 'title': '北京快乐8聊天室', 'status': 0}, {'id': 12, 'title': 'pc蛋蛋聊天室', 'status': 0}, {'id': 17, 'title': '加拿大28聊天室', 'status': 0}, {'id': 20, 'title': '幸运蛋蛋聊天室', 'status': 0}, {'id': 16, 'title': '幸运快乐8聊天室', 'status': 0}, {'id': 3, 'title': '重庆幸运农场聊天室', 'status': 0}, {'id': 8, 'title': '江苏骰宝(快3)聊天室', 'status': 0}, {'id': 5, 'title': '广东11选5聊天室', 'status': 0}, {'id': 6, 'title': '广东快乐十分聊天室', 'status': 0}, {'id': 18, 'title': '福彩3D聊天室', 'status': 0}, {'id': 1, 'title': '北京赛车聊天室', 'status': 0}, {'id': 15, 'title': '秒速飞艇聊天室', 'status': 0}, {'id': 9, 'title': '秒速时时彩聊天室', 'status': 0}, {'id': 11, 'title': '幸运飞艇聊天室', 'status': 0}, {'id': 4, 'title': '重庆时时彩聊天室', 'status': 0}, {'id': 14, 'title': '新疆时时彩聊天室', 'status': 0}, {'id': 13, 'title': '天津时时彩聊天室', 'status': 0}, {'id': 10, 'title': '秒速赛车聊天室', 'status': 0}, {'id': 55, 'title': '分分彩聊天室', 'status': 0}, {'id': 57, 'title': 'pk10牛牛聊天室', 'status': 0}, {'id': 58, 'title': '秒速牛牛聊天室', 'status': 0}])
  }
})

describe('store', () => {
  it('login', async () => {
    await store.dispatch('login', {user: {username: 'eeeeee', password: '111111'}})
    expect(store.state.user.logined).toBe(true)
  })

  it('fetchUser', async () => {
    await store.dispatch('fetchUser')
    expect(store.state.user.account_type).toBe(1)
    expect(store.state.user.planMakerRoom.length).toBe(0)
    expect(store.state.roomInfo[7].name).toBe('香港六合彩聊天室')
  })

  it('logout', async () => {
    await store.dispatch('logout')
    expect(store.state.user.logined).toBe(false)
  })
})
