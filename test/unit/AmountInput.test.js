import { shallowMount } from '@vue/test-utils'
import AmountInput from '@/components/AmountInput.vue'

describe('AmountInput.vue', () => {
  let wrapper
  beforeEach(() => {
    wrapper = shallowMount(AmountInput, {
      propsData: {
        value: '10'
      }
    })
  })
  it('阻擋格式不符之輸入金額', () => {
    wrapper.currentValue = '10.22'
    setTimeout(() => {
      expect(wrapper.currentValue).toEqual('10.2')
    }, 0)
  })
})
