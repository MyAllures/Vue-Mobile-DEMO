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
import {fetchJWTToken} from '@/api'

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
        let venomTokenPromise
        let venomToken = localStorage.getItem('venom_token')
        if (venomToken) {
          venomTokenPromise = Promise.resolve(venomToken)
        } else {
          venomTokenPromise = fetchJWTToken('venom').catch(() => {})
        }

        venomTokenPromise.then(token => {
          if (enabled && !this.ws.venom) {
            this.$store.dispatch('setWs', { ws: new VenomSocketObj(token), type: 'venom' })
          }
        })
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
