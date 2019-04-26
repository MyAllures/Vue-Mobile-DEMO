<template>
  <div class="container">
    <div class="body">
      <Messages />
    </div>
    <div class="footer">
      <Footer />
    </div>
  </div>
</template>

<script>
import Footer from '@/components/customerService/Footer'
import Messages from '@/components/customerService/Messages'

export default {
  components: {
    Footer,
    Messages
  }
}
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
.body {
  height: calc(100% - 50px);
  background-color: #eee;
}
.footer {
  height: 50px;
  background-color: #fafafa;
  border: solid 1px #e5e5e5;
  box-sizing: border-box;
}
</style>
