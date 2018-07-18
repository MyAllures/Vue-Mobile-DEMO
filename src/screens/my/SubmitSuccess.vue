<template>
  <div class="success-box">
    <div class="success-img"></div>
    <div class="success-text">提交成功，请等待交易状态更新</div>
    <div class="success-button">
      <x-button type="primary" @click.native="$router.push('/my/deposit')">
        继续充值
      </x-button>
      <x-button type="primary" plain @click.native="$router.push('/fin/payment_record')">
        查看充值纪录
      </x-button>
    </div>
  </div>
</template>
<script>
import {XButton} from 'vux'
export default {
  name: 'Success',
  components: {
    XButton
  }
}
</script>

<style lang="less" scoped>
.success-box {
  box-sizing: border-box;
  padding: 20px 30px 0 30px;
  .success-img {
    width: 100%;
    height: 200px;
    background: url('../../assets/submit_success.png') no-repeat;
    background-size: contain;
    background-position: center center;
  }
  .success-text {
    width: 100%;
    height: 60px;
    line-height: 60px;
    color: #666;
    font-size: 14px;
    text-align: center;
    margin-bottom: 150px;
  }
  .success-button {
    position: absolute;
    bottom: 100px;
    left: 30px;
    right: 30px;
  }
}
</style>

