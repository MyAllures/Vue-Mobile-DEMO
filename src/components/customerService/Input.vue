<template>
  <div class="wrapper">
    <cube-input
      class="input"
      ref="input"
      v-model="value"
      @input="handleInput"
      @focus="inputFocused"
      :placeholder="''"
      type="text">
    </cube-input>
    <EmojiSelector ref="emojiSelector" @emojiSelected="insertEmoji" v-if="showEmojiSelector" />
  </div>
</template>

<script>
import EmojiSelector from './EmojiSelector'

export default {
  components: {
    EmojiSelector
  },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      showEmojiSelector: true
    }
  },
  methods: {
    handleInput (e) {
      this.$emit('update:value', e)
    },
    inputFocused () {
      this.$refs.emojiSelector.showEmojiMenu = false
    },
    insertEmoji (emoji) {
      this.$emit('update:value', `${this.value} ${emoji} `)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: inline-block;
  width: 100%;
  margin-right: 5px;
  margin-left: 5px;
}

.input {
  padding-right: 30px;
}
</style>
