<template>
  <div>
    <tab
      v-if="$route.meta.leftCtrl !== 'back'"
      :bar-active-color="theme"
      :animate="false"
      :active-color="theme"
      :line-width="2">
      <tab-item
        v-for="(tab,index) in tabs"
        :key="index"
        @on-item-click="switchTab(index)"
        :selected="tab.label === selected">
        <span>{{tab.label}}</span>
      </tab-item>
    </tab>
    <transition  name="component-fade" mode="out-in">
      <keep-alive :include="$store.state.keepAlivePage">
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
export default {
  name: 'Fin',
  data () {
    return {
      tabs: [{
        label: '充值',
        name: 'Deposit',
        route: ''
      }, {
        label: '取款',
        name: 'Withdrawal'
      }, {
        label: '财务记录',
        name: 'FinanceRecord'
      }]
    }
  },
  components: {
    Tab,
    TabItem
  },
  computed: {
    secondLevelRouteName () {
      if (this.$route.matched.length < 1) {
        return ''
      }
      return this.$route.matched[1].name
    },
    selected () {
      const selectedTab = this.tabs.find(tab => {
        return tab.name === this.secondLevelRouteName
      })
      return selectedTab ? selectedTab.label : ''
    },
    tabNames () {
      return this.tabs.map(tab => {
        return tab.name
      })
    }
  },
  methods: {
    switchTab (index) {
      this.$router.push({
        name: this.tabs[index].name
      })
    }
  }
}
</script>

<style lang="less" scoped>
.cube-tab-bar {
  background: #fff;
}
</style>

