<template>
    <datetime
      :style="{display:'flexbox',padding:0,width:'100%'}"
      :end-date="endDate"
      v-model="currentValue"
      :format="format"
      :confirm-text="$t('my.ok')"
      :placeholder="$t('my.select')"
      @on-change="handleChange"
      ref="datetime"
      :cancel-text="$t('my.cancel')">
    </datetime>
</template>
<script>
import {Datetime} from 'vux'
export default {
  name: 'VDatetime',
  components: {
    Datetime
  },
  props: {
    value: [String, Number],
    endDate: String,
    format: String
  },
  data () {
    return {
      currentValue: ''
    }
  },
  watch: {
    'value' (val, oldValue) {
      this.$emit('form.change', [val])
      this.currentValue = val
    }
  },
  created () {
    this.currentValue = (this.value === undefined || this.value === null) ? '' : this.value
  },
  methods: {
    handleChange (value) {
      this.$emit('change', value)
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
