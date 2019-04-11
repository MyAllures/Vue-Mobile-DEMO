<template>
  <i ref="point" v-show="hasUnread" :class="['red-point', {'in-right-menu': inRightMenu}]"></i>
</template>

<script>
import {mapState} from 'vuex'
export default {
  props: {
    inRightMenu: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('customerService', {
      unread: state => state.unread
    }),
    hasUnread () {
      return !!this.unread
    }
  },
  mounted () {
    const pointDOM = this.$refs.point
    pointDOM.parentElement.style.position = 'relative'
  }
}
</script>

<style lang="scss" scoped>
.red-point {
  display: block;
  position: absolute;
  box-sizing: border-box;
  top: 5px;
  right: 3px;
  width: 8px;
  height: 8px;
  background-color: #d0021b;
  border-radius: 50%;
  box-shadow: 0 0 1px 0 #000;
  &.in-right-menu {
    top: -5px;
    right: -10px;
  }
}
</style>
