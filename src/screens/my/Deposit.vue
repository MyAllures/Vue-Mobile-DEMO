<template>
  <div>
    <button-tab v-if="onlinepayees.length&&user.account_type">
      <button-tab-item selected @on-item-click="switchView(onlinePayComponent)">在线存款</button-tab-item>
      <button-tab-item @on-item-click="switchView(remitComponent)">公司入款</button-tab-item>
    </button-tab>
    <div class="divide"></div>
    <transition v-if="user.account_type" name="component-fade" mode="out-in">
      <component v-if="!loading" :is="view" :onlinepayees="onlinepayees"></component>
    </transition>
    <div v-else>
      <div class="text-center text-danger text">请先注册</div>
      <div class="m-a text-center">
        <x-button type="primary" @click.native="$router.push('/register')">
          立即注册
        </x-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ButtonTab, ButtonTabItem, XButton } from 'vux'
import Remit from '../../components/Remit.vue'
import OnlinePay from '../../components/OnlinePay.vue'
import { getOnlinepayees } from '../../api'
import { mapState } from 'vuex'
export default {
  data () {
    return {
      view: OnlinePay,
      remitComponent: Remit,
      onlinePayComponent: OnlinePay,
      onlinepayees: [],
      loading: true
    }
  },
  components: {
    ButtonTab,
    ButtonTabItem,
    Remit,
    OnlinePay,
    XButton
  },
  computed: {
    ...mapState([
      'user'
    ])
  },
  created () {
    getOnlinepayees().then(response => {
      if (response) {
        this.onlinepayees = this.formatOnlinepayees(response)
        if (!this.onlinepayees.length) {
          this.switchView(Remit)
        }
      } else {
        this.switchView(Remit)
      }
      this.loading = false
    }).catch(() => {
      this.switchView(Remit)
      this.loading = false
    })
  },
  methods: {
    switchView (component) {
      this.view = component
    },
    formatOnlinepayees (onlinepayees) {
      let arr = onlinepayees.filter(function (item, index, arr) {
        return item.detail.length
      })
      return arr
    }
  }
}
</script>
<style scoped>
	.vux-button-group{
		padding: 15px 40px;
		border-bottom: 1px solid #ccc;
  }
  .text {
    margin-top: 50px;
  }
</style>
