<template>
  <div>
    <div>
        <button-tab>
	        <button-tab-item selected @on-item-click="initDeposit">在线存款</button-tab-item>
	        <button-tab-item @on-item-click="initRemit">公司入款</button-tab-item>
      	</button-tab>      
	    <div class="divide"></div>
	    <transition  name="component-fade" mode="out-in">
	        <component v-bind:is="view"></component>
	    </transition>  
    </div>
  </div>
</template>

<script>
import { ButtonTab, ButtonTabItem } from 'vux'
import remit from './remit.vue'
import deposit from './deposit.vue'
export default {
  components: {
    ButtonTab,
    ButtonTabItem
  },
  methods: {
    initDeposit () {
      this.view = deposit
    },
    initRemit () {
      this.view = remit
    }
  },
  data () {
    return {
      view: deposit
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