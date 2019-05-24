<template>
  <img :src="src" alt="" />
</template>
<script>
export default {
  name: 'ImgWrapper',
  props: {
    src: {
      type: String
    },
    type: {
      type: String,
      default: 'image'
    }
  },
  mounted () {
    const img = this.$el
    this.$emit('imgStart')
    if (!img.complete) {
      img.onload = (e) => {
        this.formatImg()
        this.$nextTick(() => {
          this.$emit('imgLoad')
        })
        img.onload = null
      }
      img.onerror = () => {
        this.$emit('imgLoad')
      }
    } else {
      this.formatImg()
      this.$nextTick(() => {
        this.$emit('imgLoad')
      })
    }
  },
  methods: {
    formatImg () {
      const img = this.$el
      let w = img.clientWidth
      let h = img.clientHeight
      if (this.type === 'sticker') {
        if (w > h) {
          img.style.width = '120px'
          img.style.height = 'auto'
        } else {
          img.style.width = 'auto'
          img.style.height = '120px'
        }
        return
      }
      if (w > h) {
        if (w > 240) {
          img.style.width = '240px'
        }
      } else {
        if (h > 240) {
          img.style.height = '240px'
        }
      }
    }
  }
}
</script>

