<template>
  <div class="success-box">
    <div class="success-img"></div>
    <div class="success-text">提交成功，请等待交易状态更新</div>
    <div class="success-button">
      <x-button type="primary" @click.native="toRecord">
        查看取款纪录
      </x-button>
    </div>
  </div>
</template>

<script>
import {XButton} from 'vux'
export default {
  name: 'withdrawSuccess',
  components: {
    XButton
  },
  methods: {
    toRecord () {
      this.sendGaEvent({
        label: '取款完成',
        category: '查看取款纪录',
        action: '点击'
      })
      this.$router.push('/fin/withdraw_record')
    }
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
    background: url('../../assets/icon_withdrawsuccess.png') no-repeat;
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
  }
  @media screen and (min-width: 321px) {
    .success-button {
      position: absolute;
      bottom: 100px;
      left: 30px;
      right: 30px;
    }
  }
}
</style>

