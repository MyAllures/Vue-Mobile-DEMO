<template>
  <transition name="fade">
    <div id="re-dialog" v-if="show">
      <div class="main">
        <div class="header">
          <div class="title" :class="{ error: isError }">领取{{ isError ? '失败' : '成功' }}</div>
          <div class="amount" v-if="!isError">¥{{ data.amount }}</div>
        </div>
        <div class="content">
          <div class="icon">
            <img src="@/assets/red-envelope-v2/envelope-dialog-fail.svg" v-if="isError" />
            <img src="@/assets/red-envelope-v2/envelope-dialog-success.svg" v-else />
          </div>
          <div class="desc">
            <span v-if="isError">{{ data.available_status }}</span>
            <span v-else>可在优惠和红包纪录中查询红包纪录</span>
          </div>
        </div>
        <div class="footer">
          <div class="prompt" v-if="hasMore">尚有 {{ remain }} 个红包还没拆</div>
          <button v-if="hasMore" @click="openNext">继续拆</button>
          <button v-else @click="hide">确认</button>
       </div>
     </div>
     <a class="close" href="#" @click.prevent="hide"><x-icon type="ios-close-outline"></x-icon></a>
   </div>
 </transition>
</template>

<script>
export default {
  name: 'RedEnvDialog',
  props: {
    data: Object,
    remain: Number,
    show: Boolean
  },
  methods: {
    hide () {
      this.$emit('hide')
    },
    openNext () {
      this.$emit('next')
    }
  },
  computed: {
    isError () {
      return !this.data.amount
    },
    hasMore () {
      return this.remain > 0
    }
  }
}
</script>

<style lang="scss" scoped>
#re-dialog {
  background: rgba(#000, .75);
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.main {
  width: 222px;
  height: 317px;
  background: url(../../assets/red-envelope-v2/envelope-dialog.png) no-repeat;
  background-size: 222px 317px;
  margin: 0 auto;
  position: relative;
  text-align: center;
  font-size: 14px;
}
.header {
  padding-top: 10px;

  .title {
    width: 160px;
    height: 19px;
    background: url(../../assets/red-envelope-v2/envelope-dialog-title.svg) no-repeat;
    background-size: 160px 19px;
    line-height: 19px;
    text-align: center;
    margin: 0 auto;
    color: #FFF;

    &.error {
      margin-top: 20px;
    }
  }
  .amount {
    font-size: 32px;
    font-weight: bold;
    color: #e66551;
  }
}
.content {
  position: absolute;
  top: 120px;
  width: 100%;

  .desc {
    width: 140px;
    margin: 0 auto;
    color: #fdebc5;
  }
}
.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 15px;
  box-sizing: border-box;

  .prompt {
    font-size: 10px;
    color: #fdebc5;
  }
  button {
    font-size: 16px;
    font-weight: bold;
    width: 100%;
    height: 40px;
    color: #c55141;
    background: #f9d275;
    padding: 10px;
    border: none;
    border-radius: 4px;
 }
}
.close {
  display: block;
  margin-top: 25px;

  svg {
    fill: #f0eff0;
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
