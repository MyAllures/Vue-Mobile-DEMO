<template>
  <div :style="{
    'height': height,
    'background-image': backgroundImage,
    'width': width
  }">
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
    // number/percent only
    seperatePoints: {
      type: Array,
      default: [30, 40]
    },
    color: {
      type: String,
      default: '#166fd8'
    }
  },
  computed: {
    backgroundImage () {
      if (Array.isArray(this.seperatePoints)) {
        let str = ''
        // apply css rule
        this.seperatePoints.forEach((point, index) => {
          if (index % 2) {
            let even = `, transparent ${point}%, ${this.color} ${point}%`
            if ((index + 1) === this.seperatePoints.length) { // last
              str += even
              return
            }

            str += `${even}, `
          } else {
            if (index === 0) {
              str += `${this.color} 0, `
            }
            str += `${this.color} ${point}%, transparent ${point}%`
          }
        })
        return `linear-gradient(to right, ${str})`
      } else {
        return 'transparent'
      }
    }
  }
}
</script>
