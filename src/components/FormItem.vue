<template>
  <div :class="['v-form-item weui-cell', {
      'is-error': validateState === 'error'
    }]">
    <label :for="labelFor" :class="['v-form-item__label weui-label', {required}]">
      {{label}}
    </label>
    <div class="v-form-item__content">
      <slot></slot>
    </div>
    <div v-if="validateState === 'error'" class="v-form-item__error">
      {{validateMessage}}
    </div>
  </div>
</template>

<script>
import {getPropByPath} from '../utils'
import emitter from '../mixins/emitter.js'
import AsyncValidator from 'async-validator'
const noop = () => {}
export default {
  name: 'VFormItem',
  componentName: 'VFormItem',
  mixins: [emitter],
  props: {
    label: String,
    prop: String,
    required: {
      type: Boolean,
      default: undefined
    },
    validateStatus: String,
    for: String
  },
  data () {
    return {
      validateState: '',
      validateMessage: '',
      validateDisabled: false,
      validator: {}
    }
  },
  watch: {
    error: {
      immediate: true,
      handler (value) {
        this.validateMessage = value
        this.validateState = value ? 'error' : ''
      }
    },
    validateStatus (value) {
      this.validateState = value
    }
  },
  computed: {
    labelFor () {
      return this.for || this.prop
    },
    form () {
      return this.$parent
    },
    fieldValue: {
      cache: false,
      get () {
        const model = this.form.model
        if (!model || !this.prop) { return }
        let path = this.prop
        if (path.indexOf(':') !== -1) {
          path = path.replace(/:/, '.')
        }
        return getPropByPath(model, path, true).v
      }
    }
  },
  mounted () {
    if (this.prop) {
      this.dispatch('VForm', 'form.addField', [this])
      let initialValue = this.fieldValue
      if (Array.isArray(initialValue)) {
        initialValue = [].concat(initialValue)
      }
      Object.defineProperty(this, 'initialValue', {
        value: initialValue
      })

      let rules = this.getRules()
      if (rules.length) {
        this.$on('form.blur', this.onFieldBlur)
        this.$on('form.change', this.onFieldChange)
        this.$on('form.focus', this.clearValidate)
      }
    }
  },
  methods: {
    validate (trigger, callback = noop) {
      this.validateDisabled = false
      const rules = this.getRules()
      if ((!rules || rules.length === 0)) {
        callback()
        return true
      }
      this.validateState = 'validating'
      const descriptor = {}
      if (rules && rules.length > 0) {
        rules.forEach(rule => {
          delete rule.trigger
        })
      }
      descriptor[this.prop] = rules
      const validator = new AsyncValidator(descriptor)
      const model = {}
      model[this.prop] = this.fieldValue
      validator.validate(model, { firstFields: true }, (errors, invalidFields) => {
        this.validateState = !errors ? 'success' : 'error'
        this.validateMessage = errors ? errors[0].message : ''
        callback(this.validateMessage, invalidFields)
        this.elForm && this.elForm.$emit('validate', this.prop, !errors)
      })
    },
    clearValidate () {
      this.validateState = ''
      this.validateMessage = ''
      this.validateDisabled = false
    },
    resetField () {
      this.validateState = ''
      this.validateMessage = ''
      let model = this.form.model
      let value = this.fieldValue
      let path = this.prop
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.')
      }
      let prop = getPropByPath(model, path, true)
      this.validateDisabled = true
      if (Array.isArray(value)) {
        prop.o[prop.k] = [].concat(this.initialValue)
      } else {
        prop.o[prop.k] = this.initialValue
      }
    },
    getRules () {
      let formRules = this.form.rules
      const prop = getPropByPath(formRules, this.prop || '')
      formRules = formRules ? (prop.o[this.prop || ''] || prop.v) : []
      return [].concat(formRules || [])
    },
    onFieldBlur () {
      this.validate('blur')
    },
    onFieldChange () {
      if (this.validateDisabled) {
        this.validateDisabled = false
        return
      }
      this.validate('change')
    }
  },
  beforeDestroy () {
    this.dispatch('VForm', 'form.removeField', [this])
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';
.v-form-item {
  display: flex;
  align-items: center;
  height: 45px;
  &.weui-cell {
    padding: 0 15px;
  }
  &.is-error {
    background: rgba(208, 2, 27, 0.05);
    &::before{
      display: block;
      color: @red;
      border-color: @red;
      left: 0;
    }
    + .v-form-item {
      &::before {
        color: @red;
        border-color: @red;
        left: 0;
      }
    }
    &:last-child {
      &::after {
        color: @red;
        border-color: @red;
        margin-left: -15px;
        content: " ";
        position: absolute;
        left: 0;
        bottom: 0;
        right: 0;
        height: 1px;
        border-top: 1px solid @red;
        color: @red;
        transform-origin: 0 0;
        transform: scaleY(0.5);
      }
    }
  }

  box-sizing: border-box;
  .v-form-item__label {
    position: relative;
    flex: 0 0 auto;
    color: #666;
    font-size: 14px;
    &.required{
      padding-left: 8px;
      &::before {
        position: absolute;
        left: 0px;
        font-size: 16px;
        content: '*';
        color: @red;
      }
    }
  }
  .v-form-item__content {
    width: 0%;
    height: 100%;
    flex: 1 0 auto;
  }
  .v-form-item__error {
    flex: 0 0 auto;
    font-size: 12px;
    color: @red;
  }
}
</style>
