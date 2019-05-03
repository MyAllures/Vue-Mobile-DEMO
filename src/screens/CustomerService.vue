<template>
  <div class="container">
    <template v-if="ready">
      <div class="body">
        <Messages />
      </div>
      <div class="footer">
        <Footer />
      </div>
    </template>
    <div class="container loading" v-else>
      <div class="body"><cube-loading :size="40"></cube-loading></div>
      <div class="footer"></div>
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
  data () {
    return {
      ready: false
    }
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
            this.ready = true
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
  &.loading .body {
    box-sizing: border-box;
    padding-top: 40px;
    display: flex;
    justify-content: center;
  }
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
