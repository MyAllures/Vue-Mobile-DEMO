import {msgFormatter, getLastGameData, saveLastGameData} from '@/utils'

const errorResponse = {'code': 9011, 'msg': ['格式不符规定: 下注失败，北京赛车车 定位玩法，单个名次不允许下注8码或8码以上! 如有疑问请咨询客服!'], 'data': null}
const errorResponse2 = {'code': 9011, 'msg': '格式不符规定: 下注失败，北京赛车车 定位玩法，单个名次不允许下注8码或8码以上! 如有疑问请咨询客服!', 'data': null}
describe('utils', () => {
  it('格式化錯誤訊息', () => {
    expect(msgFormatter(errorResponse)).toBe('格式不符规定: 下注失败，北京赛车车 定位玩法，单个名次不允许下注8码或8码以上! 如有疑问请咨询客服!')
    expect(msgFormatter(errorResponse2)).toBe('格式不符规定: 下注失败，北京赛车车 定位玩法，单个名次不允许下注8码或8码以上! 如有疑问请咨询客服!')
  })
  it('復用方法改寫前資料', () => {
    global.localStorage.setItem('lastGame', 10)
    global.localStorage.setItem('10-lastCategory', 122)
    global.localStorage.setItem('21-lastCategory', 323)
    global.localStorage.setItem('32-lastCategory', 424)
    expect(getLastGameData()).toEqual({'lastGame': '10',
      'lastCategory': {
        '10': '122',
        '21': '323',
        '32': '424'
      }})
  })
  it('儲存最後一次遊戲', () => {
    saveLastGameData({'lastGame': '1', 'lastCategory': {'1': '9'}})
    expect(global.localStorage.getItem('lastGameData')).toBe('{"mobile":{"lastGame":"1","lastCategory":{"1":"9"}}}')
  })
})
