<template>
  <div>
    <div class="fin-tabs" v-if="$route.meta.leftCtrl !== 'back'">
      <tab
        :animate="false"
        :active-color="theme"
        scroll-threshold="4"
        :line-width="1">
        <tab-item
          v-for="(tab,index) in tabs"
          :key="index"
          @on-item-click="switchTab(index)"
          :selected="tab.name === activeTab">
          <span>{{tab.label}}</span>
        </tab-item>
      </tab>
    </div>
    <transition  name="component-fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { Tab, TabItem, XButton } from 'vux'
export default {
  name: 'FinanceRecord',
  data () {
    return {
      tabs: [{
        label: '个人报表',
        name: 'PersonalReport'
      }, {
        label: '投注纪录',
        name: 'BetRecord'
      }, {
        label: '充值纪录',
        name: 'DepositRecord'
      }, {
        label: '取款纪录',
        name: 'WithdrawRecord'
      }, {
        label: '追号纪录',
        name: 'BetTrackRecord'
      }, {
        label: '优惠和红包',
        name: 'PromotionRecord'
      }, {
        label: '反水纪录',
        name: 'ReturnRecord'
      }]
    }
  },
  components: {
    Tab,
    TabItem,
    XButton
  },
  computed: {
    activeTab () {
      return this.$route.name
    }
  },
  methods: {
    switchTab (index) {
      const targetRouteName = this.tabs[index].name
      if (targetRouteName !== this.$route.name) {
        this.$router.push({name: this.tabs[index].name})
      }
    }
  }
}
</script>

<style lang="less" scoped>
.fin-tabs {
  margin-top: 10px;
  /deep/ .vux-tab-container {
    height: auto;
  }
  /deep/ .vux-tab {
    height: 28px;
    background: transparent;
    .vux-tab-item {
      background: none;
      line-height: 28px;
      border-radius: 14px;
      border: none;
      font-size: 13px;
      &.vux-tab-selected {
        color: #fff;
      }
    }
    &.scrollable {
      padding-bottom: 10px;
      .vux-tab-item {
        flex: 0 0 20%;
      }
    }
  }
}
</style>

