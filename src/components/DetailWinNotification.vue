<template>
  <div v-transfer-dom>
    <x-dialog
      class="dialog"
      :show.sync="dialogVisible"
      :hide-on-blur="true"
      :dialog-style="{
        width: '85%',
        'max-width': '85%'
      }">
      <div class="win-notification">
        <div class="top">
          <span class="text">中奖明细</span>
          <div class="close-btn" @click="handleClose"></div>
        </div>
        <div class="body">
          <div class="total-sum" v-if="formatted.total_profit">
            <span>中奖总额</span>
            <span class="amount">￥{{formatted.total_profit}}</span>
          </div>
          <div class="game" v-for="(game, i) in formatted.win_notifications" :key="i">
            <div class="info">
              <div>
                <p class="name">{{game.game_name}}</p>
                <p class="issue">{{game.issue_number}}期</p>
              </div>
              <p class="amount">￥{{game.total_profit}}</p>
            </div>
            <ul class="result-list">
              <li class="result" v-for="(bet, index) in game.win_bets" :key="index">
                <span>{{`${index + 1}. ${bet.playgroup_name} @ ${bet.play_name}`}}</span>
                <span>{{`￥${parseFloat(bet.profit).toFixed(2)}`}}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <x-button @click.native="$router.push({name: 'BetRecord'})" type="primary">查看投注纪录</x-button>
        </div>
      </div>
    </x-dialog>
  </div>
</template>

<script>
import {TransferDom, XDialog, XButton} from 'vux'

export default {
  components: {
    XDialog, XButton
  },
  directives: {
    TransferDom
  },
  props: {
    notification: Object
  },
  data () {
    return {
      dialogVisible: true
    }
  },
  methods: {
    handleClose () {
      this.$emit('closeDetailNotification')
      this.dialogVisible = false
    }
  },
  computed: {
    formatted () {
      if (this.notification.type === 'win-notification-batch') {
        return this.notification
      } else {
        let game = {
          game_name: this.notification.game_name,
          issue_number: this.notification.issue_number,
          total_profit: this.notification.total_profit,
          win_bets: this.notification.win_bets
        }

        return {
          type: this.notification.type,
          win_notifications: [game]
        }
      }
    }
  }
}
</script>


<style lang="less" scoped>
.font-style (@size, @color, @weight, @spacing) {
  font-size: @size;
  color: @color;
  font-weight: @weight;
  letter-spacing: @spacing;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  &::before,&::after{
    background-color: #999;
  }
}

.win-notification {
  width: auto;
  max-height: 480px;
  overflow-y: auto;

  .top {
    height: 50px;
    line-height: 50px;
    border-bottom: 2px solid #eee;
    text-align: center;
    .font-style(18px, #333, 500, inherit);
  }

  .footer {
    width: 80%;
    margin: 0 auto;
    padding-bottom: 10px;
  }

  .total-sum {
    height: 40px;
    line-height: 40px;
    text-align: center;
    .font-style(16px, #333, normal, inherit);
    .amount {
      .font-style(inherit, #d0021b, 600, inherit);
    }
  }

  .game {
    padding: 10px ;
  }

  .info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px dashed #ddd;
    text-align: left;
    .name {
      .font-style(14px, #026bb3, 500, inherit);
    }
    .issue {
      .font-style(13px, #026bb3, inherit, .5px);
    }
    .amount {
      .font-style(16px,  #d0021b, 600, inherit);
    }
    .total-text {
      .font-style(13px,  #333, inherit, inherit);
    }
  }

  .result-list {
    display: block;
    overflow-y: auto;
    max-height: 290px;
    padding-left: 10px;
    .font-style(12px,  #666, inherit, inherit);
    .result {
      display: inline-flex;
      width: 100%;
      justify-content: space-between;
      line-height: 2.2;
    }
    .game-profit {
      .font-style(13px,  #026bb3, 600, inherit);
    }
  }
}
</style>
