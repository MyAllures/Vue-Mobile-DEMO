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
import VenomSocketObj from '@/wsObj/venom'
import { JWT } from '@/utils/jwtToken'

export default {
  components: {
    Footer,
    Messages
  },
  created () {
    if (!this.$store.state.ws.venom) {
      let token = this.$cookie.get(`${JWT.venom}_token`)
      if (token) {
        this.$store.dispatch('setWs', { ws: new VenomSocketObj(token), type: 'venom' })
      }
    }
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
