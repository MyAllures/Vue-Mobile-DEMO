<template>
  <div class="container">
    <top-bar :style="{background: '#d23f34'}">
      <template slot="left">
        <div
          class="left-ctrl back"
          @click="$router.go(-1)">
          <span class="left-arrow"></span>
          返回
        </div>
      </template>
      <div class="main-title">
        红包领取详情
      </div>
      <template slot="right">
        <div class="right-ctrl">
          <div
            class="balance fr"
            @click="$store.dispatch('showRightMenu')">
            {{ user.balance|currency('￥')}}
          </div>
        </div>
      </template>
    </top-bar>
    <div class="header">
      <div class="info-panel">
        <div class="name">{{envelope.sender}}的红包</div>
        <div class="desc">{{envelope.content}}</div>
        <div v-if="envelope.status==='acquired'"class="amount">{{envelope.amount|currency('￥')}}</div>
      </div>
      <div class="ellipse"></div>
    </div>
    <div class="receiver-area">
      <div class="title">{{envelope.receiver_list.length}}人已抢到</div>
      <div class="list">
        <div :class="['list-item', receiver.username===user.username?'self':'']" v-for="receiver in envelope.receiver_list" :key="receiver.username">
          <span>{{receiver.nickname}}</span>
          <span>{{receiver.amount|currency('￥')}}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {fetchRedEnvelopeDetail} from '@/api'
import { mapState } from 'vuex'
import TopBar from '@/components/TopBar'
export default {
  name: 'RedEnvelopeDetail',
  components: {
    TopBar
  },
  data () {
    return {
      envelope: {
        sender: '',
        content: '',
        amount: 0,
        status: '',
        receiver_list: []
      }
    }
  },
  computed: {
    ...mapState([
      'user'
    ])
  },
  created () {
    fetchRedEnvelopeDetail(this.$route.params.id).then(res => {
      this.envelope = res
    })
  }
}
</script>
<style lang="scss" scoped>
.container {
  height: 100%;
  background: #fff;
}
.header {
  color: #fdebc5;
  .info-panel {
    position: relative;
    text-align: center;
    background: #d23f34;
    padding-top: 10px;
    z-index: 1;
    .name {
      font-size: 16px;
      margin-bottom: 5px;
    }
    .desc {
      font-size: 12px;
    }
    .amount {
      padding-top: 5px;
      font-size: 32px;
    }
  }
  .ellipse {
      height: 60px;
      width: 100%;
      background: #d23f34;
      clip-path: ellipse(50% 40% at 50% 50%);
      margin-top: -30px;
    }
}
.receiver-area {
  .title {
    font-size: 13px;
    color: #999;
    height: 50px;
    line-height: 50px;
    text-align: center;
  }
  .list {
    font-size: 14px;
    color: #333;
    width: 260px;
    margin: 0 auto;
  }
  .list-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    &.self {
      color: #d0021b;
    }
  }
}
</style>
