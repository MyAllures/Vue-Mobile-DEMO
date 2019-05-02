<template>
  <div class="container">
    <div class="body">
      <Messages />
    </div>
    <div class="footer">
      <Footer />
    </div>
    <ReviewDialog :show="showReview" @close="showReview = false" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Footer from '@/components/customerService/Footer'
import Messages from '@/components/customerService/Messages'
import ReviewDialog from '@/components/customerService/ReviewDialog'

export default {
  components: {
    Footer,
    Messages,
    ReviewDialog
  },
  data: () => ({
    showReview: false
  }),
  computed: {
    ...mapState('customerService', {
      lastArchive: state => state.lastArchive
    }),
    ...mapGetters('customerService', {
      session: 'currentSession'
    })
  },
  watch: {
    showReview (show) {
      if (show && !this.session) {
        this.$createToast({
          type: 'warn',
          txt: '先别急着评，先跟客服聊聊再说',
          time: 1600
        }).show()
        this.showReview = false
      }
    },
    lastArchive () {
      this.showReview = true
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
