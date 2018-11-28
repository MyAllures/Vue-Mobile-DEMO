<template>
  <div v-transfer-dom>
    <x-dialog
        v-fix-scroll
        :show.sync="dialogVisible"
        :hide-on-blur="true"
        :dialog-style="{
          width: '90%',
          'max-width': '90%'
        }">
        <div class="wrapper">
          <div class="header">
            <div class="title">余额不足</div>
            <div class="close-btn" @click="dialogVisible = false"></div>
          </div>
          <div class="image"></div>
          <div class="description">
            <p>亲，余额不足呢！</p>
            <p>目前仅剩 {{user.balance| currency('￥')}} 元</p>
            <p>不足投注 {{dialog.total| currency('￥')}} 元</p>
            <p>注单明细预估可赢 {{dialog.expectation| currency('￥')}} 元</p>
            <p>赶紧去充值呗！</p>
          </div>
          <flexbox class="buttons">
            <flexbox-item>
              <x-button @click.native="goToPay" type="primary">去充值</x-button>
            </flexbox-item>
            <flexbox-item>
              <x-button type="default" @click.native="dialogVisible = false">返回修改</x-button>
            </flexbox-item>
          </flexbox>
        </div>
      </x-dialog>
  </div>
</template>

<script>
import {Flexbox, FlexboxItem, XDialog, XButton, TransferDom} from 'vux'
import {mapState} from 'vuex'
import FixScroll from '../directive/fixscroll'
export default {
  name: 'BalanceHintDialog',
  components: {
    Flexbox, FlexboxItem, XDialog, XButton
  },
  directives: {
    TransferDom,
    FixScroll
  },
  data () {
    return {
      dialogVisible: false
    }
  },
  computed: {
    ...mapState(['user']),
    dialog () {
      return this.$store.state.dialog.balance
    }
  },
  watch: {
    'dialog.visible': function (visible) {
      this.dialogVisible = visible
    },
    'dialogVisible': function (dialogVisible) {
      if (dialogVisible === false && this.dialog.visible !== dialogVisible) {
        this.$store.dispatch('updateDialog', {
          name: 'balance',
          state: Object.assign({}, this.dialog, {visible: false})
        })
      }
    }
  },
  methods: {
    goToPay () {
      this.dialogVisible = false
      this.sendGaEvent({
        label: '餘額不足',
        category: '遊戲大廳充值',
        action: '充值提示'
      })
      this.$router.push({path: '/my/deposit'})
    }
  }
}
</script>

<style lang="less" scoped>
.wrapper {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  text-align: left;
  background-color: #fff;
  padding: 12px 15px 20px 15px;
  overflow: hidden;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      font-size: 18px;
      color: #333;
    }
    .close-btn {
      &::before,&::after{
        background: #999;
      }
    }
  }
  .image {
    width: 33vw;
    height: 28vw;
    margin: 0 auto;
    background-image: url('../assets/not_enough.png');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center center;
  }
  .description {
    margin: 5px auto 15px auto;
    width: 100%;
    font-size: 14px;
    text-align: center;
    color: #666;
  }
}
</style>
