<template>
  <div class="wrapper">
    <iframe :src="appDownloadUrl" width="100%" height="100%" frameborder="0"></iframe>
  </div>
</template>

<script>
export default {
  computed: {
    appDownloadUrl () {
      return this.$store.state.systemConfig.appDownloadUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  height: 100%;
  justify-content: center;
}

</style>
