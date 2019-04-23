<template>
  <div class="box">
    <div class="img"></div>
    <div class="text">提交成功，请等待交易状态更新</div>
    <div class="button">
      <x-button type="primary" @click.native="$router.push('/fin/deposit')">
        继续充值
      </x-button>
      <x-button type="primary" plain @click.native="toRecord">
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
  },
  methods: {
    toRecord () {
      this.sendGaEvent({
        label: '充值完成',
        category: '查看充值纪录',
        action: '点击'
      })
      this.$router.push('/fin/record/deposit')
    }
  }
}
</script>

<style lang="less" scoped>
.box {
  box-sizing: border-box;
  padding: 20px 30px 0 30px;
  .img {
    width: 100%;
    height: 200px;
    background: url('../../assets/submit_success.png') no-repeat;
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
  @media screen and (min-width: 321px) {
    .button {
      position: absolute;
      bottom: 100px;
      left: 30px;
      right: 30px;
    }
  }
}
</style>

