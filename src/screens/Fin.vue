<template>
  <div>
    <tab>
      <tab-item selected @on-item-click="initRegrets">充值</tab-item>
      <tab-item @on-item-click="switchTab">注单</tab-item>
      <tab-item @on-item-click="switchTab">充值记录</tab-item>
      <tab-item @on-item-click="switchTab">取款记录</tab-item>
    </tab>
    <transition  name="component-fade" mode="out-in">
      <component v-bind:is="view"></component>
    </transition>  
  </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
import regrets from './regrets.vue'
export default {
  name: 'Home',
  data () {
    return {
      view: regrets
    }
  },
  methods: {
    initRegrets () {
      this.view = regrets
    },
    switchTab () {}
  },
  components: {
    Tab,
    TabItem
  }
}
</script>

<style scoped>
</style>
