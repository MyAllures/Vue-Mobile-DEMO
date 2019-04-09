<template>
  <div class="container">
    <AdditionalArea />
    <Input ref="textbox" :value.sync="value" />
    <SendBtn @send="handleSend" />
  </div>
</template>

<script>
import AdditionalArea from './AdditionalArea.vue'
import Input from './Input'
import StickerBtn from './StickerBtn'
import SendBtn from './SendBtn'
import {EMITTED_ACTION} from '@/utils/CustomerService'

export default {
  components: {
    AdditionalArea,
    Input,
    StickerBtn,
    SendBtn
  },
  data () {
    return {
      value: ''
    }
  },
  methods: {
    handleSend () {
      this.$refs.textbox.$refs.input.focus()
      if (!this.value) {
        return
      }
      this.$store.state.ws.venom.send({action: EMITTED_ACTION.normal, parameter: {text: this.value}})
      this.value = ''
      this.$emit('send')
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  position: relative;
  box-sizing: border-box;
  justify-content: space-around;
  align-content: center;
  padding: 5px;
}
</style>
