<template>
  <img :src="src" alt="" />
</template>
<script>
export default {
  name: 'ImgWrapper',
  props: {
    src: {
      type: String
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

