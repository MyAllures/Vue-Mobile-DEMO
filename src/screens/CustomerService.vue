<template>
  <div class="container">
    <div class="body">
      <Messages :rawMessages="rawMessages"></Messages>
    </div>
    <div class="footer">
      <Footer></Footer>
    </div>
  </div>
</template>

<script>
import Footer from '@/components/customerService/Footer'
import Messages from '@/components/customerService/Messages'
import VenomSocketObj from '@/wsObj/venom.js'
import {mapState} from 'vuex'

export default {
  components: {
    Footer, Messages
  },
  created () {
    if (!this.$store.state.ws.venom) {
      this.$store.dispatch('setWs', { ws: new VenomSocketObj(), type: 'venom' })
    }
  },
  computed: {
    ...mapState('customerService',
      {messages: state => state.messages}
    ),
    rawMessages () {
      return this.messages
    }
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
}

.body {
  height: calc(~"100% -"50px);
  background-color: #eee;
}

.footer {
  height: 50px;
  box-sizing: border-box;
  background-color: #fafafa;
  border: solid 1px #e5e5e5;
}
</style>
