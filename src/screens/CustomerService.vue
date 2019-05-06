<template>
  <div class="container">
    <div class="body">
      <Messages />
    </div>
    <div class="footer">
      <Footer />
    </div>
    <ReviewDialog :show="showReview" />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Footer from '@/components/customerService/Footer'
import Messages from '@/components/customerService/Messages'
import ReviewDialog from '@/components/customerService/ReviewDialog'

export default {
  components: {
    Footer,
    Messages,
    ReviewDialog
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
    ...mapGetters('customerService', {
      lastSession: 'lastSession',
      session: 'currentSession'
    }),
    isPreventReview () {
      return (!this.session && !this.lastSession) || (this.session && !this.assigned)
    }
  },
  watch: {
    session () {
      this.$store.dispatch('customerService/setSessionAssigned', false)
    },
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
