<template>
  <div class="container">
    <div class="tip">请先转帐至收款银行，再填入存款信息</div>
    <div class="dot-title">
      <span class="dot"></span>
      收款银行信息，请仔细核对
    </div>
    <div class="stamp-wrapper">
      <div class="stamp">
        <div class="item">
          <div class="item-title">{{$t('remit.payee_name')}}</div>
          <div class="item-content">{{payee.payee_name}}</div>
        </div>
        <div class="item">
          <div class="item-title">{{$t('remit.bank_account')}}</div>
          <div class="item-content">{{payee.account}}</div>
        </div>
        <div class="item half">
          <div class="item-title">{{$t('remit.bank_name')}}</div>
          <div class="item-content">{{payee.display_name}}</div>
        </div>
        <div class="item half">
          <div class="item-title">{{$t('remit.bank_address')}}</div>
          <div class="item-content">{{payee.address}}</div>
        </div>
        <div class="limithint">{{limitHint}}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Bank',
  props: {
    payee: Object,
    limitHint: String
  }
}
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  .tip {
    box-sizing: border-box;
    padding: 20px 16px 4px 16px;
    width: 100%;
    font-size: 16px;
    color: #333;
  }
  .limithint {
    position: relative;
    box-sizing: border-box;
    padding: 0 8px;
    color: #bfbfbf;
    font-size: 13px;
    &::before {
      position: absolute;
      left: 0px;
      font-size: 16px;
      content: '*';
      color: #bfbfbf;
    }
  }
}
</style>
