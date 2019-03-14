<template>
  <div class="view" :style="style">
    <slot></slot>
  </div>
</template>

<script>
export default {
  computed: {
    style () {
      let tabbarHidden = this.$route.meta.tabbarHidden
      return {
        'padding-top': '46px',
        'padding-bottom': tabbarHidden ? 0 : '53px',
        'height': '100%'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.view {
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}
</style>
