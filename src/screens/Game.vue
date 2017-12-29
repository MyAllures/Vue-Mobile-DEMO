<template>
  <div>
    <button-tab class="m-r-l m-l-l m-t m-b">
      <button-tab-item selected @on-item-click="initDeposit">{{ $t('deposit.title') }}</button-tab-item>
      <button-tab-item @on-item-click="initRemit">{{ $t('deposit.remit') }}</button-tab-item>
    </button-tab>
    <div class="divide"></div>
    <transition  name="component-fade" mode="out-in">
      <component v-bind:is="view"></component>
    </transition>
  </div>
</template>

<script>
  import { ButtonTab, ButtonTabItem } from 'vux'
  import remit from './remit.vue'
  import deposit from './deposit.vue'
  export default {
    data () {
      return {
        view: deposit
      }
    },
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
    }
  }
</script>

<style>
  .divide {
    width: 100%;
    height: 1px;
    background: #ccc;
  }
</style>
