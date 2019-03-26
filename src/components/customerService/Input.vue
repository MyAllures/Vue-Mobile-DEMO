<template>
  <div class="wrapper">
    <cube-input
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
  background: #fff;
  border: solid 1px #f2f2f2;
  border-radius: 3px;
  height: 40px;
  width: 100%;
}
</style>
