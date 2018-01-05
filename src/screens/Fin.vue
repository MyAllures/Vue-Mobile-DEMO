<template>
  <div>
    <div>
      <blur :blur-amount="20" :url="charactarUrl" class="personal-info">
        <div  slot="default" class="center">
          <img class="profile-img" :src="charactarUrl">
          <p>{{user.username}}</p>
          <p class="balance">{{$t('my.name')}}{{$t('my.balance')}}: <span>{{user.balance}}</span> RMB</p>
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
      charactarUrl: 'https://orig00.deviantart.net/4298/f/2007/035/d/9/starry_night_snoopy_by_knoxcat.png'
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

