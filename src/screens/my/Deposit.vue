<template>
  <div>
    <button-tab>
      <button-tab-item selected @on-item-click="switchView(onlinePayComponent)">在线存款</button-tab-item>
      <button-tab-item @on-item-click="switchView(remitComponent)">公司入款</button-tab-item>
    </button-tab>
    <div class="divide"></div>
    <transition name="component-fade" mode="out-in">
      <component v-bind:is="view"></component>
    </transition>
  </div>
</template>

<script>
import { ButtonTab, ButtonTabItem } from 'vux'
import Remit from '../../components/Remit.vue'
import OnlinePay from '../../components/OnlinePay.vue'
export default {
  data () {
    return {
      view: OnlinePay,
      remitComponent: Remit,
      onlinePayComponent: OnlinePay
    }
  },
  components: {
    ButtonTab,
    ButtonTabItem,
    Remit,
    OnlinePay
  },
  methods: {
    switchView (component) {
      this.view = component
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
