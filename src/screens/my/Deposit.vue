<template>
  <div>
    <button-tab v-if="onlinepayees.length">
      <button-tab-item selected @on-item-click="switchView(onlinePayComponent)">在线存款</button-tab-item>
      <button-tab-item @on-item-click="switchView(remitComponent)">公司入款</button-tab-item>
    </button-tab>
    <div class="divide"></div>
    <transition name="component-fade" mode="out-in">
      <component v-if="!loading" :is="view" :onlinepayees="onlinepayees"></component>
    </transition>
  </div>
</template>

<script>
import { ButtonTab, ButtonTabItem } from 'vux'
import Remit from '../../components/Remit.vue'
import OnlinePay from '../../components/OnlinePay.vue'
import { getOnlinepayees } from '../../api'
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
    OnlinePay
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
</style>
