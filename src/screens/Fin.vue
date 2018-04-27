<template>
  <div>
    <tab v-if="tabs.length && $route.name !== 'DetailBetRecord'">
      <tab-item
        :line-width="1"
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
import { Tab, TabItem, XButton } from 'vux'
const tabs = [{
  label: '投注记录',
  name: 'BetRecord'
}, {
  label: '充值记录',
  name: 'PaymentRecord'
}, {
  label: '取款记录',
  name: 'WithdrawRecord'
}, {
  label: '优惠和红包',
  name: 'PromotionRecord'
}]
export default {
  name: 'Home',
  data () {
    return {
      activeTab: this.$route.name
    }
  },
  computed: {
    tabs () {
      return this.$store.state.user.account_type === 0 ? [] : tabs
    }
  },
  methods: {
    switchTab (name) {
      this.$router.push({name: name})
    }
  },
  components: {
    Tab,
    TabItem,
    XButton
  }
}
</script>

<style lang="less" scoped>
@import '../styles/vars.less';

.personal-info {
  z-index: 0;
  text-shadow: 0px 0px 1px #999;
  .balance {
    font-weight: 200;
    span {
      color: lighten(@green, 10%)
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
    border: 4px solid #ddd;
  }
}
</style>

