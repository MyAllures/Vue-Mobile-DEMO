<template>
  <div>
    <div class="tab" v-if="tabs.length && $route.name !== 'DetailBetRecord'">
      <div
        v-for="(tab,index) in tabs"
        :key="index"
        :class="['tab-item', {selected: tab.name === activeTab}]"
        :style="{width: Math.floor(100/tabs.length) + '%'}"
        @click="switchTab(tab.name)">
        <span class="tab-item-text">{{tab.label}}</span>
      </div>
    </div>
    <transition  name="component-fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { Tab, TabItem, XButton } from 'vux'
const tabs = [{
  label: '投注纪录',
  name: 'BetRecord'
}, {
  label: '充值纪录',
  name: 'PaymentRecord'
}, {
  label: '取款纪录',
  name: 'WithdrawRecord'
}, {
  label: '优惠和红包',
  name: 'PromotionRecord'
}]
export default {
  name: 'Home',
  computed: {
    tabs () {
      return this.$store.state.user.account_type === 0 ? [] : tabs
    },
    activeTab () {
      return this.$route.name
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

.tab {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  padding: 8px 0;
  background: #166fd8;
  text-align: center;
  font-size: 14px;
  @media screen and (max-width: 320px) {
    font-size: 12px;
  }
  .tab-item {
    display: inline-block;
    height: 28px;
    line-height: 28px;
    color: rgba(255, 255, 255, 0.8);
    &.selected{
      .tab-item-text {
        display: inline-block;
        height: 28px;
        background: #fff;
        border-radius: 14px;
        padding: 0 8px;
        color: #166fd8;
      }
    }
  }
}
</style>

