<template>
  <div class="box">
    <div class="img"></div>
    <div class="text">请先注册</div>
    <div class="button">
      <x-button type="primary" @click.native="$router.push('/register')">
        立即注册
      </x-button>
    </div>
  </div>
</template>
<script>
import { XButton } from 'vux'
export default {
  components: {
    XButton
  }
}
</script>
<style scoped lang="less">
.box {
  box-sizing: border-box;
  padding: 20px 30px 0 30px;
  .img {
    width: 100%;
    height: 200px;
    background: url('../assets/unregistered.png') no-repeat;
    background-size: contain;
    background-position: center center;
  }
  .text {
    width: 100%;
    height: 60px;
    line-height: 60px;
    color: #666;
    font-size: 14px;
    text-align: center;
  }
}
</style>