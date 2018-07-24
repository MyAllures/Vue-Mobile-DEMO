<template>
  <form class="v-form weui-cells">
    <slot></slot>
  </form>
</template>
<script>
const objectAssign = function (target) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let source = arguments[i] || {}
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop]
        if (value !== undefined) {
          target[prop] = value
        }
      }
    }
  }

  return target
}

export default {
  name: 'VForm',
  componentName: 'VForm',
  props: {
    model: Object,
    rules: Object
  },
  data () {
    return {
      fields: []
    }
  },
  created () {
    this.$on('form.addField', (field) => {
      if (field) {
        this.fields.push(field)
      }
    })
      /* istanbul ignore next */
    this.$on('form.removeField', (field) => {
      if (field.prop) {
        this.fields.splice(this.fields.indexOf(field), 1)
      }
    })
  },
  mounted () {

  },
  methods: {
    resetFields () {
      this.fields.forEach(field => {
        field.resetField()
      })
    },
    clearValidate (props = []) {
      const fields = props.length
          ? this.fields.filter(field => props.indexOf(field.prop) > -1)
          : this.fields
      fields.forEach(field => {
        field.clearValidate()
      })
    },
    validate (callback) {
      let valid = true
      let count = 0
        // 如果需要验证的fields为空，调用验证时立刻返回callback
      if (this.fields.length === 0 && callback) {
        callback(valid)
      }
      let invalidFields = {}
      this.fields.forEach(field => {
        field.validate('', (message, field) => {
          if (message) {
            valid = false
          }
          invalidFields = objectAssign({}, invalidFields, field)

          if (typeof callback === 'function' && ++count === this.fields.length) {
            callback(valid, invalidFields)
          }
        })
      })
    },
    validateField (prop, cb) {
      let field = this.fields.filter(field => field.prop === prop)[0]
      if (!field) { throw new Error('must call validateField with valid prop string!') }
      field.validate('', cb)
    }
  }
}
</script>


<style lang="less" scoped>
.weui-cells {
  margin-top: 0;
}
</style>
