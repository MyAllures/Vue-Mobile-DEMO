<template>
  <div class="container">
    <template v-if="ready">
      <div class="body">
        <Messages />
      </div>
      <div class="footer">
        <Footer />
      </div>
      <ReviewDialog :show="showReview" />
    </template>
    <div class="container loading" v-else>
      <div class="body"><cube-loading :size="40"></cube-loading></div>
      <div class="footer"></div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Footer from '@/components/customerService/Footer'
import Messages from '@/components/customerService/Messages'
import ReviewDialog from '@/components/customerService/ReviewDialog'
import VenomSocketObj from '@/wsObj/venom'
import { fetchJWTToken } from '@/api'
import { getJWTToken } from '@/utils'

export default {
  components: {
    Footer,
    Messages,
    ReviewDialog
  },
  data () {
    return {
      ready: false
    }
  },
  methods: {
    ...mapActions('customerService', [
      'showReviewDialog'
    ])
  },
  computed: {
    ...mapState('customerService', {
      showReview: state => state.showReview,
      lastArchive: state => state.lastArchive,
      assigned: state => state.sessionAssigned
    }),
    ...mapState(['systemConfig', 'ws']),
    ...mapGetters('customerService', {
      lastSession: 'lastSession',
      session: 'currentSession'
    }),
    isPreventReview () {
      if (this.session && this.session !== this.lastSession) {
        return !this.assigned
      }
      return !this.session && !this.lastSession
    }
  },
  watch: {
    showReview (show) {
      if (show && this.isPreventReview) {
        this.$createToast({
          type: 'warn',
          txt: '先别急着评，先跟客服聊聊再说'
        }).show()
        this.showReviewDialog(false)
      }
    },
    lastArchive () {
      this.showReviewDialog()
    },
    'systemConfig.enableBuiltInCustomerService': {
      handler (enabled) {
        let venomTokenPromise
        let venomToken = getJWTToken('venom')
        if (venomToken) {
          venomTokenPromise = Promise.resolve(venomToken)
        } else {
          venomTokenPromise = fetchJWTToken('venom').then(setting => {
            localStorage.setItem('venom_setting', JSON.stringify(setting))
            return setting.token
          })
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
