<template>
  <div class="fin-tabs">
    <div class="tab-view" v-show="tabs.length && $route.name !== 'DetailBetRecord'" ref="view">
      <div class="tab">
        <div
          v-for="(tab,index) in tabs"
          :key="index"
          :class="['tab-item', {selected: tab.name === activeTab}]"
          data-type="tab-item"
          @click="switchTab($event, tab)">
          <span class="tab-item-text">{{tab.label}}</span>
        </div>
      </div>
    </div>
    <transition  name="component-fade" mode="out-in">
      <keep-alive :include="$store.state.keepAlivePage">
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import { Tab, TabItem, XButton } from 'vux'
const tabs = [{
  label: '投注纪录',
  name: 'BetRecord'
}, {
  label: '个人报表',
  name: 'PersonalReport'
}, {
  label: '充值纪录',
  name: 'PaymentRecord'
}, {
  label: '取款纪录',
  name: 'WithdrawRecord'
}, {
  label: '优惠和红包',
  name: 'PromotionRecord'
}, {
  label: '反水纪录',
  name: 'ReturnRecord'
}]
export default {
  name: 'Home',
  components: {
    Tab,
    TabItem,
    XButton
  },
  computed: {
    tabs () {
      return this.$store.state.user.account_type === 0 ? [] : tabs
    },
    activeTab () {
      return this.$route.name
    }
  },
  mounted () {
    let idx = tabs.findIndex(tab => tab.name === this.activeTab)
    this.$refs.view.scrollLeft = window.innerWidth / 3.5 * idx
  },
  methods: {
    switchTab (e, {name, label}) {
      let target = e.target
      while (target.dataset.type !== 'tab-item') {
        if (target.nodeName === 'BODY') {
          return
        }
        target = target.parentNode
      }

      let targetL = target.offsetLeft
      let targetW = target.offsetWidth
      let targetR = targetL + targetW
      let viewL = this.$refs.view.scrollLeft
      let windowW = window.innerWidth
      if (targetL + targetW - viewL > windowW + 10) {
        this.$refs.view.scrollLeft = viewL + targetW
      } else if (targetR > viewL && targetL < viewL) {
        this.$refs.view.scrollLeft = targetL - targetW / 2
      }
      if (this.$route.name !== name) {
        this.sendGaEvent({
          category: label,
          action: '检视'
        })
        this.$router.push({name: name})
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tab-view {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  background: @azul;
  text-align: center;
  overflow-x: scroll;
  font-size: 14px;
  @media screen and (max-width: 320px) {
    font-size: 12px;
  }
  .tab {
    display: flex;
    flex-wrap: nowrap;
    height: 44px;
  }
  .tab-item {
    flex: 0 0 auto;
    height: 44px;
    line-height: 44px;
    width: 100/4.2vw;
    color: rgba(255, 255, 255, 0.8);
    &.selected{
      .tab-item-text {
        background: #fff;
        border-radius: 14px;
        padding: 7px 8px;
        color: @azul;
      }
    }
  }
}
</style>

