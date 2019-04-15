<template>
  <div class="chat-manage-container">
    <div class="title">禁言管理</div>
    <div class="content"></div>
  </div>
</template>
<script>
export default {
  name: 'ChatManage'
}
</script>
<style lang="less" scoped>
.chat-manage-container {
  height: 100%;
  .title {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
    font-size: 16px;
    line-height: 40px;
    height: 40px;
    background-color: #f5f5f5;
  }
  .content {
    padding-bottom: 70px;
    height: calc(~"100%" - 40px);
    overflow-y: auto;
  }
}
</style>
