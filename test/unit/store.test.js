import store from '@/store'
import VueCookie from 'vue-cookie'
import Vue from 'vue'
Vue.use(VueCookie)

jest.mock('@/api', () => {
  return {
    login: () => Promise.resolve({'access_token': '8d3f5a64dbaaaeb4d71e63bdc075bd00', 'token_type': 'Bearer', 'expires_in': '2018-08-21 11:44:07', 'refresh_token': '62e98c8196a80a5db5ef1e6cfb88a5f3', 'type': 'member'}),
    logout: () => Promise.resolve(),
    fetchUser: () => Promise.resolve([{'id': 7620, 'avatar': null, 'username': 'eeeeee', 'real_name': '袁鴻升', 'nickname': null, 'phone': '13255984398', 'gender': null, 'email': null, 'birthday': null, 'wechat': null, 'qq': '132984', 'memo': null, 'logout_time': '2018-08-20T11:44:03.751147+08:00', 'account_type': 1, 'platform_registered': 'pc', 'is_reg_present_sent': false, 'level': {'name': '一般会员', 'remit_limit': {'lower': '10'}, 'online_limit': {'upper': null, 'lower': '10'}, 'withdraw_fee': '0', 'withdraw_limit': {'upper': null, 'lower': '10'}}, 'bank': null, 'balance': 0.0, 'envelopes': [], 'unsettled': 0}]),
    fetchGames: () => Promise.resolve([{"id":1,"code":"bcr","display_name":"北京赛车","remarks":null,"icon":"https://img1.clzud.com/staging//uploads/gameicons/%E5%8C%97%E4%BA%AC%E8%B3%BD%E8%BB%8A_VMJEBb0.png","bg_icon":null,"rank":1,"tag":["热门游戏"]},{"id":10,"code":"jspk10","display_name":"秒速赛车","remarks":null,"icon":"https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E8%B3%BD%E8%BB%8A_fnU4c5Z.png","bg_icon":null,"rank":2,"tag":["热门游戏","极速彩"]},{"id":9,"code":"jsssc","display_name":"秒速时时彩","remarks":null,"icon":"https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E6%99%82%E6%99%82%E5%BD%A9_j1gBt3W.png","bg_icon":null,"rank":3,"tag":["热门游戏","极速彩","时时彩"]},{"id":15,"code":"er75ft","display_name":"秒速飞艇","remarks":null,"icon":"https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E9%A3%9B%E8%89%87_LQvKXcJ.png","bg_icon":null,"rank":3,"tag":["热门游戏","极速彩"]}]),
    fetchGamesDetail: () => Promise.resolve([{"categories":[],"id":1,"code":"bcr","display_name":"北京赛车","remarks":null,"icon":"https://img1.clzud.com/staging//uploads/gameicons/%E5%8C%97%E4%BA%AC%E8%B3%BD%E8%BB%8A_VMJEBb0.png","bg_icon":null,"rank":1,"tag":["热门游戏"]},{"categories":[],"id":10,"code":"jspk10","display_name":"秒速赛车","remarks":null,"icon":"https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E8%B3%BD%E8%BB%8A_fnU4c5Z.png","bg_icon":null,"rank":2,"tag":["热门游戏","极速彩"]},{"categories":[],"id":9,"code":"jsssc","display_name":"秒速时时彩","remarks":null,"icon":"https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E6%99%82%E6%99%82%E5%BD%A9_j1gBt3W.png","bg_icon":null,"rank":3,"tag":["热门游戏","极速彩","时时彩"]},{"categories":[],"id":15,"code":"er75ft","display_name":"秒速飞艇","remarks":null,"icon":"https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E9%A3%9B%E8%89%87_LQvKXcJ.png","bg_icon":null,"rank":3,"tag":["热门游戏","极速彩"]}]),
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
  })

  it('resetUser', async () => {
    await store.dispatch('resetUser')
    expect(store.state.user.logined).toBe(false)
  })

  it('setUser', async () => {
    await store.dispatch('setUser', {planMakerRoom: [], logined: true})
    expect(store.state.user.planMakerRoom.length).toBe(0)
    expect(store.state.user.logined).toBe(true)
  })

  it('logout', async () => {
    await store.dispatch('logout')
    expect(store.state.user.logined).toBe(false)
  })

  it('fetchGames', async () => {
    await store.dispatch('fetchGames')
    expect(store.state.games.length).toBe(4)
    expect(store.state.tagTable['热门游戏'].length).toBe(4)
    expect(store.state.tagTable['极速彩'].length).toBe(3)
    expect(store.state.tagTable['时时彩'].length).toBe(1)
    expect(store.state.categories).toEqual(expect.objectContaining({
      1: expect.any(Array),
      10: expect.any(Array),
      9: expect.any(Array),
      15: expect.any(Array)
    }))
  })
})
