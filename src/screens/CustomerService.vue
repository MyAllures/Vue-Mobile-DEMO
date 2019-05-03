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
import {mapState} from 'vuex'
import VenomSocketObj from '@/wsObj/venom'

export default {
  components: {
    Footer,
    Messages
  },
  computed: {
    ...mapState(['systemConfig', 'ws'])
  },
  watch: {
    'systemConfig.enableBuiltInCustomerService': {
      handler (enabled) {
        let venomToken = localStorage.getItem('venom_token')
        if (enabled && venomToken && !this.ws.venom) {
          this.$store.dispatch('setWs', { ws: new VenomSocketObj(venomToken), type: 'venom' })
        }
      },
      immediate: true
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
