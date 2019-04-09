<template>
  <div class="wrapper">
    <cube-input
      class="input"
      ref="input"
      v-model="value"
      @input="handleInput"
      :placeholder="''"
      type="text">
    </cube-input>
    <StickerBtn></StickerBtn>
  </div>
</template>

<script>
import StickerBtn from './StickerBtn.vue'
export default {
  components: {
    StickerBtn
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleInput (e) {
      this.$emit('update:value', e)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: inline-block;
  width: 100%;
  margin-right: 5px;
  margin-left: 5px;
}

.input {
  padding-right: 30px;
}
</style>
