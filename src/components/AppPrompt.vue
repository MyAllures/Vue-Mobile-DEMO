<template>
  <div class="wrapper" v-if="systemConfig.appIcon && !closedWithin1Day && visible">
    <i class="close-btn" @click="closePrompt"></i>
    <div class="desc">
      <img :src="systemConfig.appIcon" alt="App" v-if="systemConfig.appIcon" class="icon" />
      <span>下载 app，游戏更尽兴</span>
    </div>
    <x-button :href="systemConfig.appDownloadUrl" type="primary" mini class="download" target="_blank">前往下载</x-button>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { XButton } from 'vux'
const APP_PROMPT_KEY = 'app-prompt'
export default {
  data () {
    return {
      visible: true
    }
  },
  computed: {
    ...mapState([
      'systemConfig'
    ]),
    closedWithin1Day () {
      const lastClosed = window.localStorage.getItem(APP_PROMPT_KEY)
      return lastClosed ? this.$moment().format('YYYYMMDD') < lastClosed : false
    }
  },
  methods: {
    closePrompt () {
      this.visible = false
      window.localStorage.setItem(APP_PROMPT_KEY, this.$moment().format('YYYYMMDD'))
    }
  },
  components: {
    XButton
  }
}
</script>
<style scoped lang="less">
.wrapper {
  font-size: 14px;
  display: flex;
  color: #fff;
  width: 100%;
  height: 44px;
  line-height: 44px;
  background: rgba(0, 0, 0, 0.7);
  position: fixed;
  bottom: 50px;
  align-items: center;
}
.download {
  margin-right: 10px;
  display: inline-block;
  margin-right: 5px;
  border-radius: 4px;
  color: #fff;
  line-height: 32px;
  padding: 0 10px;
}
.desc {
  display: flex;
  align-items: center;
  flex: 1;
}
.icon {
  margin-right: 5px;
  width: 36px;
  height: 36px;
}
.close-btn {
  display: inline-block;
  padding: 0 5px 0 0;
  height: 20px;
  &::before, &::after {
    height: 12px;
  }
}
</style>