import {msgFormatter} from '@/utils'

const errorResponse = {'code': 9011, 'msg': ['格式不符规定: 下注失败，北京赛车车 定位玩法，单个名次不允许下注8码或8码以上! 如有疑问请咨询客服!'], 'data': null}
const errorResponse2 = {'code': 9011, 'msg': '格式不符规定: 下注失败，北京赛车车 定位玩法，单个名次不允许下注8码或8码以上! 如有疑问请咨询客服!', 'data': null}
describe('utils', () => {
  it('格式化錯誤訊息', () => {
    expect(msgFormatter(errorResponse)).toBe('格式不符规定: 下注失败，北京赛车车 定位玩法，单个名次不允许下注8码或8码以上! 如有疑问请咨询客服!')
    expect(msgFormatter(errorResponse2)).toBe('格式不符规定: 下注失败，北京赛车车 定位玩法，单个名次不允许下注8码或8码以上! 如有疑问请咨询客服!')
  })
})
