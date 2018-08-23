import { register } from '../api'
import { msgFormatter } from '../utils'

export default {
  data () {
    return {
      tryDemoLoading: false
    }
  },
  methods: {
    tryDemo: function () {
      if (this.$store.state.user.logined || this.tryDemoLoading) {
        return
      }
      this.tryDemoLoading = true
      register({ account_type: 0 }).then(user => {
        if (user.trial_auth_req === 1) {
          this.$store.dispatch('openVerifyPopup')
          let msg = ''
          return Promise.reject(msg)
        }
        return this.$store.dispatch('login', { user })
          .then(() => {
            window.gtag('event', '試玩', {'event_category': '遊客'})
            this.$vux.toast.show({
              text: '试玩已开启',
              type: 'success'
            })
            this.$router.push({name: 'Home'})
          })
      }).then(result => {
        this.$store.dispatch('fetchUser')
      }).catch(errorMsg => {
        if (errorMsg) {
          this.$vux.toast.show({
            text: msgFormatter(errorMsg),
            type: 'warn'
          })
        }
      }).finally(() => {
        this.tryDemoLoading = false
      })
    }
  }
}
