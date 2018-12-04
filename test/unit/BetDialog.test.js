import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import BetDialog from '@/components/BetDialog.vue'
jest.mock('vux', () => {
  return {
    Flexbox: () => 'Flexbox',
    FlexboxItem: () => 'FlexboxItem',
    XDialog: () => 'XDialog',
    XInput: () => 'XInput',
    CheckIcon: () => 'CheckIcon',
    XButton: () => 'XButton',
    TransferDom: () => 'TransferDom',
    InlineLoading: () => 'InlineLoading'
  }
})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.filter('currency', () => 0)

const $route = {
  'path': '/game/1/10',
  'query': {},
  'params': {
    'gameId': '1',
    'categoryId': '10'
  },
  'fullPath': '/game/1/10',
  'name': 'GameDetail',
  'meta': { 'tabbarHidden': true }
}
const $t = () => {
  return 'xxx'
}
describe('BetDialog.vue', () => {
  let store
  let wrapper
  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        user: {
          balance: 100
        },
        dialog: {
          bet: {
            'visible': false,
            'bets': [
              {
                'game_schedule': 502585,
                'display_name': '冠、亚军和 - 冠亚大',
                'bet_amount': 10,
                'odds': 2.19,
                'play': 520,
                'bet_options': {},
                'opts_combos_count': 1,
                'optionDisplayNames': ''
              }, {
                'game_schedule': 502585,
                'display_name': '冠、亚军和 - 冠亚单',
                'bet_amount': 10,
                'odds': 1.78,
                'play': 522,
                'bet_options': {},
                'opts_combos_count': 1,
                'optionDisplayNames': ''
              }, {
                'game_schedule': 502585,
                'display_name': '冠军 - 大',
                'bet_amount': 10,
                'odds': 1.995,
                'play': 641,
                'bet_options': {},
                'opts_combos_count': 1,
                'optionDisplayNames': ''
              }],
            'isSuccess': false
          }
        },
        systemConfig: {
          chatroomEnabled: false
        }
      }
    })
    wrapper = shallowMount(BetDialog, {
      store,
      localVue,
      mocks: {
        $route,
        $t
      },
      data () {
        return {
          dialogVisible: true,
          loading: false,
          hasPlan: true,
          betAmounts: [],
          currentFocusInput: null
        }
      }
    })
    store.state.dialog.bet.visible = true
  })
  it('計算共幾組', () => {
    expect(wrapper.vm.totalCount).toEqual(3)
  })
  it('計算總金額', () => {
    wrapper.vm.$set(wrapper.vm.betAmounts, 0, 11)
    wrapper.vm.$set(wrapper.vm.betAmounts, 1, 12)
    wrapper.vm.$set(wrapper.vm.betAmounts, 2, 13)
    expect(wrapper.vm.totalAmount).toEqual(36)
  })
})
