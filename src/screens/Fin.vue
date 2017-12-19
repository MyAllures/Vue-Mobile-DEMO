<template>
  <div>
    <tab>
      <tab-item selected @on-item-click="switchTab">注单</tab-item>
      <tab-item @on-item-click="switchTab">充值记录</tab-item>
      <tab-item @on-item-click="switchTab">取款记录</tab-item>
    </tab>
  </div>
</template>

<script>
import { Tab, TabItem } from 'vux'
export default {
  name: 'Home',
  data () {
    return {
    }
  },
  methods: {
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
