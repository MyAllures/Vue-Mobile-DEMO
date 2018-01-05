<template>
  <div>
    <div>
      <blur :blur-amount="20" :url="user.avatar ? user.avatar: url" class="personal-info">
        <div  slot="default" class="center">
          <img class="profile-img" :src="user.avatar ? user.avatar: url">
          <p>{{user.username}}</p>
          <p class="balance">用戶餘額: <span>{{user.balance}}</span> RMB</p>
        </div>
      </blur>
    </div>
    <tab>
      <tab-item
        v-for="(tab,index) in tabs"
        :key="index"
        @on-item-click="switchTab(tab.name)"
        :selected="tab.name === activeTab">
          {{tab.label}}
        </tab-item>
    </tab>
    <transition  name="component-fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { Tab, TabItem, Blur } from 'vux'
export default {
  name: 'Home',
  data () {
    return {
      activeTab: this.$route.name,
      tabs: [
        {
          label: '充值',
          name: 'Recharge'
        },
        {
          label: '注单',
          name: 'BetRecord'
        },
        {
          label: '充值记录',
          name: 'PaymentRecord'
        },
        {
          label: '取款记录',
          name: 'WithdrawRecord'
        }
      ],
      // Temporarily for display
      url: 'https://eggdropsoupfly.thisistap.com/wp-content/uploads/2017/04/%E9%87%91%E6%AD%A3%E6%81%A9.jpeg'
    }
  },
  methods: {
    switchTab (name) {
      this.$router.push({name: name})
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  watch: {
    '$route.name': function () {
      this.activeTab = this.$route.name

      if (this.$route.name === 'Fin') { // to avoid not arrive recharge-page after user key .../fin/ directly
        this.$router.push({name: 'Recharge'})
      }
    }
  },
  components: {
    Tab,
    TabItem,
    Blur
  },
  beforeRouteEnter (to, from, next) {
    if (to.name === 'Fin') {
      next({ name: 'Recharge' })
    } else {
      next()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/vars.scss';
.personal-info {
  z-index: 0;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 1);
  .balance {
    font-weight: 200;
    span {
      color: lighten($green, 10%)
    }
  }
  .center {
    text-align: center;
    padding-top: 20px;
    color: #fff;
    font-size: 18px;
    letter-spacing: 1px;
  }
  .profile-img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid #ececec;
  }
}
</style>

