<template>
  <div class="container" :style="{height: height, 'line-height': height}">
    <span class="text" ref="message" :style="{ position:'relative', left: `-${leftOffset}px`}">{{messages[currentIndex]}}</span>
  </div>
</template>

<script>
export default {
  name: 'Marquee',
  props: {
    messages: {
      type: Array,
      default: []
    },
    height: {
      type: String,
      default: '36px'
    }
  },
  data () {
    return {
      leftOffset: 0,
      currentIndex: 0,
      messageWidth: 0,
      timer: null
    }
  },
  watch: {
    'messages': function () {
      this.setMarquee()
    }
  },
  created () {
    if (this.messages.length > 0) {
      this.setMarquee()
    }
  },
  methods: {
    setMarquee () {
      this.$nextTick(() => {
        this.messageWidth = this.$refs.message.offsetWidth
        this.timer = setTimeout(() => {
          this.scrollMarquee()
        }, 1000)
      })
    },
    scrollMarquee () {
      this.timer = setTimeout(() => {
        this.leftOffset += 1
        if (this.leftOffset > this.messageWidth) {
          let idx = this.currentIndex + 1
          if (idx >= this.messages.length) {
            idx = idx % this.messages.length
          }
          this.timer = setTimeout(() => {
            this.currentIndex = idx
            this.leftOffset = 0
            this.setMarquee()
          }, 1000)
        } else {
          this.scrollMarquee()
        }
      }, 17)
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  }
}
</script>

<style lang="less" scoped>
.container {
  overflow: hidden;
  .text {
    white-space: nowrap;
  }
}
</style>
