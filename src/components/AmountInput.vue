<template>
  <input
    class="input"
    type="number"
    :maxlength="maxlength"
    v-model="currentValue"
    :placeholder="placeholder"
    @focus="focusHandler"
    @blur="blurHandler"
    ref="input">
</template>

<script>
export default {
  name: 'AmountInput',
  props: {
    maxlength: Number,
    placeholder: String,
    value: [String, Number],
    match: {
      type: RegExp,
      default: /^([1-9]\d*(\.[\d]{0,1})?|0(\.[\d]{0,1})?)[\d.]*/
    }
  },
  data () {
    return {
      currentValue: this.value
    }
  },
  watch: {
    currentValue: function (val, oldVal) {
      // 調用filter過濾數據
      let formattedValue = this.filter(val)
      formattedValue = this.typeNumberFilter(formattedValue, oldVal)
      if (val !== formattedValue || val === '') {
        setTimeout(() => {
          this.currentValue = formattedValue
        }, 0)
      }
      this.$emit('input', formattedValue)
    },
    value: function (value) {
      this.currentValue = value
    }
  },
  methods: {
    blur () {
      this.$refs.input.blur()
    },
    focus () {
      this.$refs.input.focus()
    },
    focusHandler ($event) {
      this.$emit('on-focus', this.currentValue, $event)
    },
    blurHandler ($event) {
      this.$emit('on-blur', this.currentValue, $event)
    },
    filter (value) {
      let formattedValue = ''
      const match = value.match(this.match)
      if (match) {
        formattedValue = match[1]
      }
      return formattedValue
    },
    typeNumberFilter (val, oldVal) {
      const inputEle = this.$refs.input
      let formattedValue = val
      // 由於type=number不支持maxlength，用slice模擬
      if (this.maxlength && formattedValue.length > this.maxlength) {
        formattedValue = formattedValue.slice(0, this.maxlength)
      }
      // Android處理連續輸入..後，type=number的input框會把值修改為''，這裏手動替換為上次的currentValue
      if (formattedValue === '' && inputEle.value === '' && oldVal && oldVal.match(/^(\d)[\d.]+/)) {
        formattedValue = oldVal
      }
      setTimeout(() => {
        inputEle.value = formattedValue
      }, 0)
      return formattedValue
    },
    isBackspace (keyCode) {
      return keyCode === 8
    },
    isDot (keyCode) {
      return keyCode === 46 || keyCode === 110 || keyCode === 190
    },
    isNumber (keyCode) {
      return (keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)
    }
  },
  mounted () {
    const inputEle = this.$refs.input
    // eslint-disable-next-line
      inputEle.onkeydown = (e) => {
      const keyCode = e.keyCode
      if (!this.isBackspace(keyCode) && !this.isDot(keyCode) && !this.isNumber(keyCode)) {
        // 其他按鍵
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.input {
  width: 100%;
  border: 0;
  outline: 0;
  -webkit-appearance: none;
  background-color: transparent;
  font-size: inherit;
  padding: 0 5px;
  color: inherit;
  box-sizing: border-box;
}
</style>
