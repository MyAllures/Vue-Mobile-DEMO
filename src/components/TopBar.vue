<template>
  <header class="topbar" :style="{background: $route.meta.headerBgColor}">
    <div class="topbar__left topbar__child" v-if="$slots.left">
      <slot name="left"></slot>
    </div>
    <div class="topbar__content topbar__child">
      <slot></slot>
    </div>
    <div class="topbar__right topbar__child">
      <slot name="right"></slot>
    </div>
  </header>
</template>

<script>
export default {
  name: 'TopBar',
  props: {
    msg: String,
    bgColor: String
  }
}
</script>

<style scoped lang="less">
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 46px;
  z-index: 200;
  background-color: @azul;
  color: #666;
  .topbar__child {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 46px;
  }
  .topbar__left {
    position: absolute;
    top:0;
    left:0;
    .left-ctrl {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      font-size: 16px;
      &.back {
        width: 70px;
        color: #fff;
        padding-left: 10px;
        .left-arrow {
          width: 12px;
          height: 12px;
          border: 1px solid #fff;
          border-width: 1px 0 0 1px;
          transform: rotate(315deg);
        }
      }
    }
  }
  .topbar__right {
    position: absolute;
    top:0;
    right:0;
    .right-ctrl {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      font-size: 14px;
    }
  }
  .topbar__content {
    flex: 1 0 auto;
    .main-title {
      font-size: 18px;
      color: #fff;
      &.left {
        font-size: 16px;
        padding-left:20px;
        margin-right: auto;
      }
    }
  }
}
</style>
