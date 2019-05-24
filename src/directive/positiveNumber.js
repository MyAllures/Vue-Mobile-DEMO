/**
   Usage:
    import positiveNumber from '@/directives/positiveNumber'
    .
    .
    directives: {
      positiveNumber
    }
    <input v-positive-number/> 大於0之正數且可以輸入小數 1.23456 , 0.123456
    <input v-positive-number="{floatLength: 2}"/> 大於0之正數且限制最多小數兩位 1234.56 , 0.12
    <input v-positive-number="{integer: true}"/> 只能為正整數 123456
 */
const vPositiveNumber = {
  bind (el, binding, vnode) {
    el.handler = function () {
      let val = el.value
      let floatLength = null
      let integer = false
      if (binding.value) {
        floatLength = binding.value.floatLength // 小數點後Ｎ位，傳0則當作無上限
        integer = binding.value.integer // 是否只能為整數
      }

      if (integer && val.length === 1) {
        // 不可以0開頭
        val = val.replace(/[^1-9]/, '')
      } else {
        if (!integer && floatLength) {
          val = val
          // 只保留數字和小數點
            .replace(/[^\d.]/g, '')
          // 只保留一個小數點 ex. 22.. --> 22.
            .replace(/\.{2,}/g, '.')
          // 只保留一個小數點 ex. 22.23.2 --> 22.232
          // 先把第一個小數點改成'$#$'，把其他小數點取代掉，再把'$#$'轉回小數點
            .replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
          // 最多輸入小數點後{floatLength}位 預設無上限
          let str = new RegExp('^(-)*(\\d+)\\.(\\d{1,' + floatLength + '}).*$')
          val = val.replace(str, '$1$2.$3')
        } else {
          // 只保留數字
          val = val.replace(/[^\d]/g, '')
        }
      }
      el.value = val
      vnode.elm.dispatchEvent(new CustomEvent('update', {target: {value: val}}))
    }
    el.addEventListener('input', el.handler)
  },
  unbind (el) {
    el.removeEventListener('input', el.handler)
  }
}

export default vPositiveNumber
