<template>
  <div>

  </div>
</template>

<script>
import {fetchServiceStickers} from '../../api'
export default {
  methods: {
    fetchStickers () {
      fetchServiceStickers().then((res) => {
        console.log(res, 'sticker res')
      }).catch((e) => {
      })
    }
  },
  created () {
    this.fetchStickers()
  }
}
</script>

<style lang="scss" scoped>

</style>
