<template>
  <div class="v-input-group">
    <template v-if="type!=='textarea'">
      <div class="weui-cell__bd weui-cell__primary">
        <input
          :class="type==='textarea'?'weui-textarea':'weui-input'"
          :maxlength="max"
          :autocomplete="autocomplete"
          :autocapitalize="autocapitalize"
          :autocorrect="autocorrect"
          :spellcheck="spellcheck"
          :type="type"
          :name="name"
          :placeholder="placeholder"
          :readonly="readonly"
          :disabled="disabled"
          :value="currentValue"
          @compositionstart="handleComposition"
          @compositionupdate="handleComposition"
          @compositionend="handleComposition"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          ref="input"/>
      </div>
      <div class="weui-cell__ft">
        <icon type="clear" v-show="showClear && currentValue !== '' && !readonly && !disabled && focused" @click.native="clear"></icon>
      </div>
      <div v-if="$slots.right" class="right">
        <slot name="right"></slot>
      </div>
    </template>
    <div v-else class="weui-cell__bd">
      <textarea
        class="weui-textarea"
        :autocomplete="autocomplete"
        :autocapitalize="autocapitalize"
        :autocorrect="autocorrect"
        :spellcheck="spellcheck"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="disabled"
        :name="name"
        :rows="rows"
        :cols="cols"
        @compositionstart="handleComposition"
        @compositionupdate="handleComposition"
        @compositionend="handleComposition"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        ref="textarea"
        :value="currentValue"></textarea>
      <div class="weui-textarea-counter" v-show="showCounter && max" @click="handleFocus">
        <span>{{count}}</span>/{{max}}
      </div>
    </div>
  </div>
</template>
<script>
import {Icon} from 'vux'
import emitter from '../mixins/emitter.js'
export default {
  name: 'VInput',
  mixins: [emitter],
  components: {
    Icon
  },
  props: {
    type: {
      type: String,
      default: 'text'
    },
    placeholder: String,
    value: [String, Number],
    name: String,
    readonly: Boolean,
    disabled: Boolean,
    min: Number,
    max: Number,
    showCounter: {
      type: Boolean,
      default: true
    },
    rows: {
      type: Number,
      default: 3
    },
    cols: {
      type: Number,
      default: 30
    },
    showClear: {
      type: Boolean,
      default: true
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    autocapitalize: {
      type: String,
      default: 'off'
    },
    autocorrect: {
      type: String,
      default: 'off'
    },
    spellcheck: {
      type: String,
      default: 'false'
    },
    validateEvent: {
      type: Boolean,
      default: false
    },
    filter: RegExp
  },
  data () {
    return {
      currentValue: '',
      focused: false,
      isOnComposition: false,
      valueBeforeComposition: null
    }
  },
  watch: {
    'value' (val, oldValue) {
      this.setCurrentValue(val)
    }
  },
  computed: {
    count () {
      let len = 0
      if (this.currentValue) {
        len = this.currentValue.replace(/\n/g, 'aa').length
      }
      return len > this.max ? this.max : len
    }
  },
  mounted () {
    window.addEventListener('resize', this.scrollIntoView)
  },
  created () {
    this.currentValue = (this.value === undefined || this.value === null) ? '' : this.value
  },
  methods: {
    scrollIntoView (time = 0) {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        setTimeout(() => {
          (this.$refs.input || this.$refs.textarea).scrollIntoViewIfNeeded(true)
        }, time)
      }
    },
    clear () {
      this.$emit('input', '')
      this.$emit('change', '')
      this.$emit('clear')
      this.setCurrentValue('')
      this.focus()
    },
    focus () {
      (this.$refs.input || this.$refs.textarea).focus()
    },
    blur () {
      (this.$refs.input || this.$refs.textarea).blur()
    },
    handleComposition (event) {
      if (event.type === 'compositionend') {
        this.isOnComposition = false
        this.currentValue = this.valueBeforeComposition
        this.valueBeforeComposition = null
        this.handleInput(event)
      } else {
        const text = event.target.value
        if (event.type === 'compositionstart') {
          this.valueBeforeComposition = text
        }
      }
    },
    handleInput (event) {
      let value = event.target.value
      this.setCurrentValue(value)
      if (this.isOnComposition) return
      this.$emit('input', value)
      if (this.filter) {
        value = !value ? '' : value.replace(this.filter, '')
        this.$nextTick(() => {
          this.setCurrentValue(value)
          this.$emit('input', value)
        })
      }
    },
    setCurrentValue (value) {
      if (this.isOnComposition && value === this.valueBeforeComposition) return
      this.currentValue = value
      if (this.isOnComposition) return
      if (this.validateEvent) {
        this.dispatch('VFormItem', 'form.change', [value])
      }
    },
    handleFocus ($event) {
      this.$emit('focus', $event)
      this.dispatch('VFormItem', 'form.focus')
      this.focused = true
      setTimeout(() => {
        (this.$refs.input || this.$refs.textarea).scrollIntoViewIfNeeded(false)
      }, 1000)
    },
    handleBlur ($event) {
      this.focused = false
      this.$emit('blur', $event)
      if (this.validateEvent) {
        this.dispatch('VFormItem', 'form.blur', [this.currentValue])
      }
    },
    handleChange (event) {
      this.$emit('change', event.target.value)
    }
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.scrollIntoView)
  }
}
</script>

<style lang="less" scoped>
.v-input-group{
  display: flex;
  flex: 1 0 auto;
  align-items: center;
  height: 100%;
  input::-webkit-input-placeholder {
    color: #bfbfbf;
    font-size: 16px;
  }
  textarea::-webkit-input-placeholder {
    color: #bfbfbf;
    font-size: 16px;
  }
  .right {
    display: flex;
    align-items: center;
    height: 100%;
  }
}
</style>

