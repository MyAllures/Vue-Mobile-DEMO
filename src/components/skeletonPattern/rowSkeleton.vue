<template>
  <div :style="{
    'height': height,
    'background-image': backgroundImage,
    'width': width
  }" :class="{highlight}">
  </div>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '20px'
    },
    // 1.number to percent only. 2.if u want a full row, just ignore this prop.
    seperatePoints: {
      type: Array,
      required: false
    },
    color: {
      type: String,
      default: '#166fd8'
    },
    highlight: {
      type: String
    }
  },
  computed: {
    backgroundImage () {
      let backgroundImageStr = ''
      if (Array.isArray(this.seperatePoints)) {
        let str = ''
        // apply css rule
        this.seperatePoints.forEach((point, index) => {
          if (index % 2) {
            let even = `, rgba(0, 0, 0, 0) ${point}%, ${this.color} ${point}%`
            if ((index + 1) === this.seperatePoints.length) { // last
              str += even
              return
            }

            str += `${even}, `
          } else {
            if (index === 0) {
              str += `${this.color} 0, `
            }
            str += `${this.color} ${point}%, rgba(0, 0, 0, 0) ${point}%`
          }
        })

        backgroundImageStr = `linear-gradient(to right, ${str})`
      } else {
        backgroundImageStr = `linear-gradient(to right, ${this.color}, ${this.color})`
      }

      if (this.highlight) {
        let highlight = `linear-gradient(120deg, rgba(255,255,255,0) 10%, ${this.highlight} 30%, rgba(255,255,255,0) 50% ),`
        return `${highlight} ${backgroundImageStr}`
      } else {
        return backgroundImageStr
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.highlight {
  background-position: 0 0, 0 0;
  background-size: 70% 100%, 100% 100%;
  animation: highlight 1s infinite;
}
@keyframes highlight {
  to {
    background-position:
      100% 0, 0 0
  }
}
</style>
