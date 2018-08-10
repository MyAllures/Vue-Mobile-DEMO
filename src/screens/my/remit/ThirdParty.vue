<template>
  <div class="container">
    <div class="tip">请前请先截屏并用{{payee.display_name}}扫描进行充值，再填写入款信息</div>
    <div class="dot-title">
      <span class="dot"></span>
      请扫描二维码进行充值
    </div>
    <div class="qrcode" :style="{'background-image': `url('${payee.qr_code}')`}"></div>
    <div class="limithint">{{limitHint}}</div>
  </div>
</template>
<script>
export default {
  name: 'ThirdParty',
  props: {
    payee: Object,
    limitHint: String
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  .qrcode {
    height: 140px;
    width: 100%;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: 16px 0;
  }
  .tip {
    box-sizing: border-box;
    padding: 20px 16px 4px 16px;
    width: 100%;
    font-size: 16px;
    color: #333;
  }
  .limithint {
    box-sizing: border-box;
    padding: 8px 16px;
    color: #999;
    font-size: 13px;
  }
}

</style>
