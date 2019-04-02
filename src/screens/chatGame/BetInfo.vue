<template>
  <div class="bet-info-container">
    <div class="bet-info-header">
      <div>
        <div class="game-name">{{info.display_name}}</div>
        <div class="issue-number">{{info.issue_number}}期</div>
      </div>
      <x-button
        mini
        type="primary"
        @click.native="bet">跟单
      </x-button>
    </div>
    <div class="bet-info-content">
      <ul class="bet-group">
        <li class="bet-group-item" v-for="(bet, index) in info.bets" :key="bet">
          <div class="label">{{`${bet.play.playgroup} - ${bet.play.display_name}`}}</div>
          <div class="amount">{{bet.bet_amount|currency('￥')}}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {XButton} from 'vux'
export default {
  name: 'ChatGameBetInfo',
  props: {
    info: Object
  },
  components: {
    XButton
  },
  data () {

  },
  methods: {
    bet () {

    }
  }
}
</script>

<style lang="less" scoped>
.bet-info-container {
  font-size: 12px;
  width: 100%;
  color: #333;
  .bet-info-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 5px;
    .game-name {
      font-weight: 500;
    }
    .issue-number {
      color: #999;
    }
    /deep/ .weui-btn {
      margin: 0;
    }
  }
  .bet-info-content {
    width: 100%;
    border-top: 2px dashed #ddd;
    .bet-group {
      width: 100%;
      .bet-group-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        .amount {
          flex: 0 0 auto;
          width: 60px;
        }
      }
    }
  }
}
</style>

