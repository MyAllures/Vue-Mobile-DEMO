import store from '@/store'
import VueCookie from 'vue-cookie'
import Vue from 'vue'
Vue.use(VueCookie)

jest.mock('@/api', () => {
  return {
    login: () => Promise.resolve({'access_token': '8d3f5a64dbaaaeb4d71e63bdc075bd00', 'token_type': 'Bearer', 'expires_in': '2018-08-21 11:44:07', 'refresh_token': '62e98c8196a80a5db5ef1e6cfb88a5f3', 'type': 'member'}),
    logout: () => Promise.resolve(),
    fetchUser: () => Promise.resolve([{'id': 7620, 'avatar': null, 'username': 'eeeeee', 'real_name': '袁鴻升', 'nickname': null, 'phone': '13255984398', 'gender': null, 'email': null, 'birthday': null, 'wechat': null, 'qq': '132984', 'memo': null, 'logout_time': '2018-08-20T11:44:03.751147+08:00', 'account_type': 1, 'platform_registered': 'pc', 'is_reg_present_sent': false, 'level': {'name': '一般会员', 'remit_limit': {'lower': '10'}, 'online_limit': {'upper': null, 'lower': '10'}, 'withdraw_fee': '0', 'withdraw_limit': {'upper': null, 'lower': '10'}}, 'bank': null, 'balance': 0.0, 'envelopes': [], 'unsettled': 0}]),
    fetchGames: () => Promise.resolve([{'id': 86, 'code': 'bcr', 'display_name': '北京赛车', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%8C%97%E4%BA%AC%E8%B3%BD%E8%BB%8A.png', 'bg_icon': null, 'rank': 1, 'label': '', 'custom_tags': '高频彩', 'is_prompt': true, 'period_descroption': '20分钟一期', 'tag': ['热门游戏'], 'group_tag': {'name': 'PK10', 'rank': 1, 'recommendatory': ['cs60cr', 'cs600cr'], 'classic': ['jspk10', 'er75ft', 'mlaft', 'bcr'], 'default': ['cs60cr', 'cs600cr', 'jspk10', 'er75ft', 'mlaft', 'bcr']}}, {'id': 123, 'code': 'cs60cr', 'display_name': '60秒赛车', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/60%E7%A7%92%E8%B5%9B%E8%BD%A6.png', 'bg_icon': null, 'rank': 2, 'label': '', 'custom_tags': '极速彩', 'is_prompt': false, 'period_descroption': '1分钟一期', 'tag': ['热门游戏', '极速彩'], 'group_tag': {'name': 'PK10', 'rank': 1, 'recommendatory': ['cs60cr', 'cs600cr'], 'classic': ['jspk10', 'er75ft', 'mlaft', 'bcr'], 'default': ['cs60cr', 'cs600cr', 'jspk10', 'er75ft', 'mlaft', 'bcr']}}, {'id': 100, 'code': 'jspk10', 'display_name': '秒速赛车', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E7%A7%92%E9%80%9F%E8%B3%BD%E8%BB%8A.png', 'bg_icon': null, 'rank': 2, 'label': '', 'custom_tags': '极速彩', 'is_prompt': false, 'period_descroption': '75秒一期', 'tag': ['热门游戏', '极速彩'], 'group_tag': {'name': 'PK10', 'rank': 1, 'recommendatory': ['cs60cr', 'cs600cr'], 'classic': ['jspk10', 'er75ft', 'mlaft', 'bcr'], 'default': ['cs60cr', 'cs600cr', 'jspk10', 'er75ft', 'mlaft', 'bcr']}}, {'id': 98, 'code': 'jsssc', 'display_name': '秒速时时彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E7%A7%92%E9%80%9F%E6%99%82%E6%99%82%E5%BD%A9.png', 'bg_icon': null, 'rank': 3, 'label': '', 'custom_tags': '时时彩', 'is_prompt': false, 'period_descroption': '75秒一期', 'tag': ['热门游戏', '极速彩', '时时彩'], 'group_tag': {'name': '时时彩', 'rank': 2, 'recommendatory': ['csffc', 'cs5fc', 'cs10fc'], 'classic': ['jsssc', 'cqssc', 'xjssc', 'tjssc'], 'default': ['csffc', 'cs5fc', 'cs10fc', 'jsssc', 'cqssc', 'xjssc', 'tjssc']}}, {'id': 108, 'code': 'er75ft', 'display_name': '秒速飞艇', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E7%A7%92%E9%80%9F%E9%A3%9B%E8%89%87.png', 'bg_icon': null, 'rank': 3, 'label': '', 'custom_tags': '极速彩', 'is_prompt': false, 'period_descroption': '75秒一期', 'tag': ['热门游戏', '极速彩'], 'group_tag': {'name': 'PK10', 'rank': 1, 'recommendatory': ['cs60cr', 'cs600cr'], 'classic': ['jspk10', 'er75ft', 'mlaft', 'bcr'], 'default': ['cs60cr', 'cs600cr', 'jspk10', 'er75ft', 'mlaft', 'bcr']}}, {'id': 90, 'code': 'cqssc', 'display_name': '重庆时时彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E9%87%8D%E6%85%B6%E6%99%82%E6%99%82%E5%BD%A9.png', 'bg_icon': null, 'rank': 5, 'label': '', 'custom_tags': '时时彩', 'is_prompt': true, 'period_descroption': '20分钟一期', 'tag': ['热门游戏', '时时彩'], 'group_tag': {'name': '时时彩', 'rank': 2, 'recommendatory': ['csffc', 'cs5fc', 'cs10fc'], 'classic': ['jsssc', 'cqssc', 'xjssc', 'tjssc'], 'default': ['csffc', 'cs5fc', 'cs10fc', 'jsssc', 'cqssc', 'xjssc', 'tjssc']}}, {'id': 101, 'code': 'mlaft', 'display_name': '幸运飞艇', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%B9%B8%E9%81%8B%E9%A3%9B%E8%89%87.png', 'bg_icon': null, 'rank': 5, 'label': '', 'custom_tags': '高频彩', 'is_prompt': false, 'period_descroption': '5分钟一期', 'tag': ['热门游戏'], 'group_tag': {'name': 'PK10', 'rank': 1, 'recommendatory': ['cs60cr', 'cs600cr'], 'classic': ['jspk10', 'er75ft', 'mlaft', 'bcr'], 'default': ['cs60cr', 'cs600cr', 'jspk10', 'er75ft', 'mlaft', 'bcr']}}, {'id': 94, 'code': 'hkl', 'display_name': '香港六合彩', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E9%A6%99%E6%B8%AF%E5%85%AD%E5%90%88%E5%BD%A9.png', 'bg_icon': null, 'rank': 6, 'label': null, 'custom_tags': '', 'is_prompt': true, 'period_descroption': '一周3期', 'tag': [], 'group_tag': {'name': '六合彩', 'rank': 3, 'recommendatory': ['cshkl', 'csjndhkl', 'cs600hkl'], 'classic': ['luckl', 'hkl'], 'default': ['cshkl', 'csjndhkl', 'cs600hkl', 'luckl', 'hkl']}}, {'id': 115, 'code': 'luckl', 'display_name': '幸运六合彩', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%B9%B8%E9%81%8B%E5%85%AD%E5%90%88%E5%BD%A9.png', 'bg_icon': null, 'rank': 7, 'label': null, 'custom_tags': '高频彩', 'is_prompt': false, 'period_descroption': '5分钟一期', 'tag': ['热门游戏'], 'group_tag': {'name': '六合彩', 'rank': 3, 'recommendatory': ['cshkl', 'csjndhkl', 'cs600hkl'], 'classic': ['luckl', 'hkl'], 'default': ['cshkl', 'csjndhkl', 'cs600hkl', 'luckl', 'hkl']}}, {'id': 87, 'code': 'bjkl8', 'display_name': '北京快乐8', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%8C%97%E4%BA%AC%E5%BF%AB%E6%A8%828.png', 'bg_icon': null, 'rank': 8, 'label': null, 'custom_tags': '高频彩', 'is_prompt': false, 'period_descroption': '5分钟一期', 'tag': [], 'group_tag': {'name': '快乐8', 'rank': 4, 'recommendatory': [], 'classic': ['auluck8', 'bjkl8'], 'default': ['auluck8', 'bjkl8']}}, {'id': 102, 'code': 'pcdd', 'display_name': 'pc蛋蛋', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/PC%E8%9B%8B%E8%9B%8B.png', 'bg_icon': null, 'rank': 9, 'label': null, 'custom_tags': '高频彩', 'is_prompt': false, 'period_descroption': '5分钟一期', 'tag': ['热门游戏'], 'group_tag': {'name': '蛋蛋', 'rank': 6, 'recommendatory': [], 'classic': ['jnd28', 'luckdd', 'pcdd'], 'default': ['jnd28', 'luckdd', 'pcdd']}}, {'id': 111, 'code': 'jnd28', 'display_name': '加拿大28', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%8A%A0%E6%8B%BF%E5%A4%A728.png', 'bg_icon': null, 'rank': 10, 'label': null, 'custom_tags': '境外彩', 'is_prompt': false, 'period_descroption': '3分半一期', 'tag': [], 'group_tag': {'name': '蛋蛋', 'rank': 6, 'recommendatory': [], 'classic': ['jnd28', 'luckdd', 'pcdd'], 'default': ['jnd28', 'luckdd', 'pcdd']}}, {'id': 117, 'code': 'luckdd', 'display_name': '幸运蛋蛋', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%B9%B8%E9%81%8B%E8%9B%8B%E8%9B%8B.png', 'bg_icon': null, 'rank': 11, 'label': null, 'custom_tags': '境外彩', 'is_prompt': false, 'period_descroption': '5分钟一期', 'tag': [], 'group_tag': {'name': '蛋蛋', 'rank': 6, 'recommendatory': [], 'classic': ['jnd28', 'luckdd', 'pcdd'], 'default': ['jnd28', 'luckdd', 'pcdd']}}, {'id': 109, 'code': 'auluck8', 'display_name': '幸运快乐8', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%B9%B8%E9%81%8B%E5%BF%AB%E6%A8%828.png', 'bg_icon': null, 'rank': 12, 'label': null, 'custom_tags': '境外彩', 'is_prompt': false, 'period_descroption': '5分钟一期', 'tag': [], 'group_tag': {'name': '快乐8', 'rank': 4, 'recommendatory': [], 'classic': ['auluck8', 'bjkl8'], 'default': ['auluck8', 'bjkl8']}}, {'id': 89, 'code': 'cqlf', 'display_name': '重庆幸运农场', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E9%87%8D%E6%85%B6%E5%B9%B8%E9%81%8B%E8%BE%B2%E5%A0%B4.png', 'bg_icon': null, 'rank': 13, 'label': null, 'custom_tags': '高频彩', 'is_prompt': false, 'period_descroption': '10分钟一期', 'tag': [], 'group_tag': {'name': '其他', 'rank': 8, 'recommendatory': [], 'classic': ['cqlf', 'gd11x5', 'gdklsf', 'fc3d'], 'default': ['cqlf', 'gd11x5', 'gdklsf', 'fc3d']}}, {'id': 106, 'code': 'xjssc', 'display_name': '新疆时时彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E6%96%B0%E7%96%86%E6%99%82%E6%99%82%E5%BD%A9.png', 'bg_icon': null, 'rank': 14, 'label': '', 'custom_tags': '时时彩', 'is_prompt': true, 'period_descroption': '20分钟一期', 'tag': ['时时彩'], 'group_tag': {'name': '时时彩', 'rank': 2, 'recommendatory': ['csffc', 'cs5fc', 'cs10fc'], 'classic': ['jsssc', 'cqssc', 'xjssc', 'tjssc'], 'default': ['csffc', 'cs5fc', 'cs10fc', 'jsssc', 'cqssc', 'xjssc', 'tjssc']}}, {'id': 96, 'code': 'jsk3', 'display_name': '江苏骰宝(快3)', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E6%B1%9F%E8%98%87%E9%AA%B0%E5%AF%B6.png', 'bg_icon': null, 'rank': 14, 'label': null, 'custom_tags': '高频彩', 'is_prompt': true, 'period_descroption': '20分钟一期', 'tag': [], 'group_tag': {'name': '快3', 'rank': 7, 'recommendatory': ['msk3'], 'classic': ['jsk3', 'bjk3'], 'default': ['msk3', 'jsk3', 'bjk3']}}, {'id': 92, 'code': 'gd11x5', 'display_name': '广东11选5', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%BB%A3%E6%9D%B111%E9%81%B85.png', 'bg_icon': null, 'rank': 15, 'label': null, 'custom_tags': '高频彩', 'is_prompt': false, 'period_descroption': '20分钟一期', 'tag': ['热门游戏'], 'group_tag': {'name': '其他', 'rank': 8, 'recommendatory': [], 'classic': ['cqlf', 'gd11x5', 'gdklsf', 'fc3d'], 'default': ['cqlf', 'gd11x5', 'gdklsf', 'fc3d']}}, {'id': 104, 'code': 'tjssc', 'display_name': '天津时时彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%A4%A9%E6%B4%A5%E6%99%82%E6%99%82%E5%BD%A9.png', 'bg_icon': null, 'rank': 15, 'label': '', 'custom_tags': '时时彩', 'is_prompt': true, 'period_descroption': '20分钟一期', 'tag': ['时时彩'], 'group_tag': {'name': '时时彩', 'rank': 2, 'recommendatory': ['csffc', 'cs5fc', 'cs10fc'], 'classic': ['jsssc', 'cqssc', 'xjssc', 'tjssc'], 'default': ['csffc', 'cs5fc', 'cs10fc', 'jsssc', 'cqssc', 'xjssc', 'tjssc']}}, {'id': 93, 'code': 'gdklsf', 'display_name': '广东快乐十分', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%BB%A3%E6%9D%B1%E5%BF%AB%E6%A8%82%E5%8D%81%E5%88%86.png', 'bg_icon': null, 'rank': 16, 'label': null, 'custom_tags': '高频彩', 'is_prompt': false, 'period_descroption': '20分钟一期', 'tag': [], 'group_tag': {'name': '其他', 'rank': 8, 'recommendatory': [], 'classic': ['cqlf', 'gd11x5', 'gdklsf', 'fc3d'], 'default': ['cqlf', 'gd11x5', 'gdklsf', 'fc3d']}}, {'id': 113, 'code': 'fc3d', 'display_name': '福彩3D', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E7%A6%8F%E5%BD%A93D.png', 'bg_icon': null, 'rank': 20, 'label': null, 'custom_tags': '', 'is_prompt': false, 'period_descroption': '1天一期', 'tag': ['热门游戏'], 'group_tag': {'name': '其他', 'rank': 8, 'recommendatory': [], 'classic': ['cqlf', 'gd11x5', 'gdklsf', 'fc3d'], 'default': ['cqlf', 'gd11x5', 'gdklsf', 'fc3d']}}, {'id': 119, 'code': 'csffc', 'display_name': '分分彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%88%86%E5%88%86%E5%BD%A9.png', 'bg_icon': null, 'rank': 21, 'label': '', 'custom_tags': '极速彩', 'is_prompt': false, 'period_descroption': '1分钟一期', 'tag': ['热门游戏', '极速彩', '时时彩'], 'group_tag': {'name': '时时彩', 'rank': 2, 'recommendatory': ['csffc', 'cs5fc', 'cs10fc'], 'classic': ['jsssc', 'cqssc', 'xjssc', 'tjssc'], 'default': ['csffc', 'cs5fc', 'cs10fc', 'jsssc', 'cqssc', 'xjssc', 'tjssc']}}, {'id': 124, 'code': 'cshkl', 'display_name': '极速六合彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E6%9E%81%E9%80%9F%E5%85%AD%E5%90%88%E5%BD%A9.png', 'bg_icon': null, 'rank': 23, 'label': '', 'custom_tags': '极速彩', 'is_prompt': false, 'period_descroption': '1分钟一期', 'tag': ['极速彩'], 'group_tag': {'name': '六合彩', 'rank': 3, 'recommendatory': ['cshkl', 'csjndhkl', 'cs600hkl'], 'classic': ['luckl', 'hkl'], 'default': ['cshkl', 'csjndhkl', 'cs600hkl', 'luckl', 'hkl']}}, {'id': 126, 'code': 'msk3', 'display_name': '秒速快3', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E7%A7%92%E9%80%9F%E5%BF%AB%E4%B8%89.png', 'bg_icon': null, 'rank': 24, 'label': null, 'custom_tags': null, 'is_prompt': false, 'period_descroption': '75秒一期', 'tag': [], 'group_tag': {'name': '快3', 'rank': 7, 'recommendatory': ['msk3'], 'classic': ['jsk3', 'bjk3'], 'default': ['msk3', 'jsk3', 'bjk3']}}, {'id': 128, 'code': 'bjk3', 'display_name': '北京快3', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/bjk3.png', 'bg_icon': null, 'rank': 24, 'label': null, 'custom_tags': null, 'is_prompt': true, 'period_descroption': '20分钟一期', 'tag': [], 'group_tag': {'name': '快3', 'rank': 7, 'recommendatory': ['msk3'], 'classic': ['jsk3', 'bjk3'], 'default': ['msk3', 'jsk3', 'bjk3']}}, {'id': 131, 'code': 'cs5fc', 'display_name': '幸运时时彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%B9%B8%E9%81%8B%E6%99%82%E6%99%82%E5%BD%A9.png', 'bg_icon': null, 'rank': 26, 'label': '', 'custom_tags': '时时彩', 'is_prompt': false, 'period_descroption': '5分钟一期', 'tag': ['时时彩'], 'group_tag': {'name': '时时彩', 'rank': 2, 'recommendatory': ['csffc', 'cs5fc', 'cs10fc'], 'classic': ['jsssc', 'cqssc', 'xjssc', 'tjssc'], 'default': ['csffc', 'cs5fc', 'cs10fc', 'jsssc', 'cqssc', 'xjssc', 'tjssc']}}, {'id': 130, 'code': 'cs600cr', 'display_name': '十分赛车', 'remarks': null, 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%8D%81%E5%88%86%E8%B3%BD%E8%BB%8A.png', 'bg_icon': null, 'rank': 27, 'label': null, 'custom_tags': null, 'is_prompt': false, 'period_descroption': '10分钟一期', 'tag': [], 'group_tag': {'name': 'PK10', 'rank': 1, 'recommendatory': ['cs60cr', 'cs600cr'], 'classic': ['jspk10', 'er75ft', 'mlaft', 'bcr'], 'default': ['cs60cr', 'cs600cr', 'jspk10', 'er75ft', 'mlaft', 'bcr']}}, {'id': 134, 'code': 'cs10fc', 'display_name': '十分时时彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%8D%81%E5%88%86%E6%99%82%E6%99%82%E5%BD%A9.png', 'bg_icon': null, 'rank': 28, 'label': '', 'custom_tags': '时时彩', 'is_prompt': false, 'period_descroption': '10分钟一期', 'tag': ['时时彩'], 'group_tag': {'name': '时时彩', 'rank': 2, 'recommendatory': ['csffc', 'cs5fc', 'cs10fc'], 'classic': ['jsssc', 'cqssc', 'xjssc', 'tjssc'], 'default': ['csffc', 'cs5fc', 'cs10fc', 'jsssc', 'cqssc', 'xjssc', 'tjssc']}}, {'id': 135, 'code': 'cs600hkl', 'display_name': '十分六合彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%8D%81%E5%88%86%E5%85%AD%E5%90%88%E5%BD%A9.png', 'bg_icon': null, 'rank': 29, 'label': '', 'custom_tags': null, 'is_prompt': false, 'period_descroption': '10分钟一期', 'tag': ['热门游戏'], 'group_tag': {'name': '六合彩', 'rank': 3, 'recommendatory': ['cshkl', 'csjndhkl', 'cs600hkl'], 'classic': ['luckl', 'hkl'], 'default': ['cshkl', 'csjndhkl', 'cs600hkl', 'luckl', 'hkl']}}, {'id': 140, 'code': 'csjndhkl', 'display_name': '加拿大六合彩', 'remarks': '', 'icon': 'https://static.h9339.com/staging/Z2hvc3Q%3D/uploads/gameicons/%E5%8A%A0%E6%8B%BF%E5%A4%A7%E5%85%AD%E5%90%88%E5%BD%A9.png', 'bg_icon': null, 'rank': 32, 'label': '', 'custom_tags': null, 'is_prompt': false, 'period_descroption': '3分钟一期', 'tag': ['热门游戏'], 'group_tag': {'name': '六合彩', 'rank': 3, 'recommendatory': ['cshkl', 'csjndhkl', 'cs600hkl'], 'classic': ['luckl', 'hkl'], 'default': ['cshkl', 'csjndhkl', 'cs600hkl', 'luckl', 'hkl']}}]),
    fetchGamesDetail: () => Promise.resolve([{'categories': [], 'id': 1, 'code': 'bcr', 'display_name': '北京赛车', 'remarks': null, 'icon': 'https://img1.clzud.com/staging//uploads/gameicons/%E5%8C%97%E4%BA%AC%E8%B3%BD%E8%BB%8A_VMJEBb0.png', 'bg_icon': null, 'rank': 1, 'tag': ['热门游戏']}, {'categories': [], 'id': 10, 'code': 'jspk10', 'display_name': '秒速赛车', 'remarks': null, 'icon': 'https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E8%B3%BD%E8%BB%8A_fnU4c5Z.png', 'bg_icon': null, 'rank': 2, 'tag': ['热门游戏', '极速彩']}, {'categories': [], 'id': 9, 'code': 'jsssc', 'display_name': '秒速时时彩', 'remarks': null, 'icon': 'https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E6%99%82%E6%99%82%E5%BD%A9_j1gBt3W.png', 'bg_icon': null, 'rank': 3, 'tag': ['热门游戏', '极速彩', '时时彩']}, {'categories': [], 'id': 15, 'code': 'er75ft', 'display_name': '秒速飞艇', 'remarks': null, 'icon': 'https://img1.clzud.com/staging//uploads/gameicons/%E7%A7%92%E9%80%9F%E9%A3%9B%E8%89%87_LQvKXcJ.png', 'bg_icon': null, 'rank': 3, 'tag': ['热门游戏', '极速彩']}]),
    fetchVenomJWTToken: () => Promise.resolve()
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
    expect(store.state.games.length).toBe(30)
    expect(store.state.tagTable['热门游戏'].length).toBe(14)
    expect(store.state.tagTable['PK10'].length).toBe(6)
    expect(store.state.tagTable['时时彩'].length).toBe(7)
    expect(store.state.categories).toEqual(expect.objectContaining({
      1: expect.any(Array),
      10: expect.any(Array),
      9: expect.any(Array),
      15: expect.any(Array)
    }))
  })
})
