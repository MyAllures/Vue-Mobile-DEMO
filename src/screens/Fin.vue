<template>
  <div>
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
import { Tab, TabItem } from 'vux'
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
      ]
    }
  },
  methods: {
    switchTab (name) {
      this.$router.push({name: name})
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
    TabItem
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

