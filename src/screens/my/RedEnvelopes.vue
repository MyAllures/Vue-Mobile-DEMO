<template>
  <div class="act-wrap">
    <div class="top">
      <div class="title">我的今日返利红包</div>
      <div class="rules">
        <router-link to="/act/boost">
          活动规则 <img src="@/assets/red-envelope-v2/icon-arrow.svg" />
        </router-link>
      </div>
    </div>
    <div class="content-wrap">
      <template v-if="isLoading">
        <cube-loading />
      </template>
      <template v-else>
        <div class="content info">
          <div class="desc">今日累计有效投注</div>
          <div class="count">¥{{ myData.bet_amount }}</div>
          <div class="progress-bar">
            <div class="limit from">¥{{ currentBetLevelAmount }}</div>
            <div class="limit to">¥{{ nextBetLevelAmount }}</div>
            <div class="progress">
              <div class="progress-inner" :style="{ width: `${progressWidth}%` }"></div>
            </div>
          </div>
          <div class="prompt">
            <span v-if="myData.next_level === 'finished'">今日返利红包已领完，明天继续加油</span>
            <span v-else>{{ myData.next_level }}</span>
          </div>
        </div>
        <div class="content stats">
          <div class="stat available">
            <div class="count highlight" :class="{ gray: redEnvRemain === 0 }">{{ redEnvRemain }}</div>
            <div class="desc">今日未拆红包个数</div>
          </div>
          <XButton type="primary" text="拆紅包" @click.native="openRE" :show-loading="reLoading" :disabled="reLoading" v-if="redEnvRemain" />
          <XButton text="今日红包已拆完，加把劲继续投注！" disabled v-else />
        </div>
      </template>
    </div>
    <RedEnvDialog :data="redEnvData" :remain="redEnvRemain" :show="showReDialog" @next="openRE" @hide="showReDialog = false" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { Group, Cell, XButton } from 'vux'
import RedEnvDialog from '@/components/actV2/RedEnvDialog'
import {
  fetchActBoost,
  openActRe
} from '@/api'

export default {
  name: 'red_envelope',
  components: {
    Group,
    Cell,
    XButton,
    RedEnvDialog
  },
  data: () => ({
    isLoading: true,
    myData: null,
    reLoading: false,
    redEnvData: {},
    showReDialog: false
  }),
  mounted () {
    this.fetchActBoost()
  },
  methods: {
    fetchActBoost () {
      fetchActBoost().then(response => {
        this.myData = response
        this.$nextTick(() => {
          this.isLoading = false
        })
      })
    },
    openRE () {
      this.reLoading = true
      this.showReDialog = false
      openActRe('engagement_boost').then(response => {
        this.redEnvData = response
        this.showReDialog = true
        this.reLoading = false
      })
    }
  },
  computed: {
    ...mapState('actv2', {
      remainCount: state => state.boost.count,
      act: state => state.boost.detail
    }),
    betInterval () {
      return this.act.levels ? this.act.levels.map(level => level.bet_amount_min) : []
    },
    nextBetLevelIndex () {
      const index = this.betInterval.findIndex(amount => amount > this.myData.bet_amount)
      return index === -1 ? this.betInterval.length - 1 : index
    },
    currentBetLevelAmount () {
      return this.nextBetLevelIndex === 0 ? 0 : this.betInterval[this.nextBetLevelIndex - 1]
    },
    nextBetLevelAmount () {
      return this.betInterval[this.nextBetLevelIndex]
    },
    progressWidth () {
      if (!this.myData) {
        return 0
      }
      const percent = (this.myData.bet_amount - this.currentBetLevelAmount) / (this.nextBetLevelAmount - this.currentBetLevelAmount) * 100
      return Math.min(percent, 100)
    },
    redEnvRemain () {
      if (this.remainCount === false) {
        return this.redEnvData ? this.redEnvData.remain_envelope_count : 0
      }
      return this.remainCount
    }
  }
}
</script>

<style lang="scss" scoped>
.act-wrap {
  padding-bottom: 53px;
}
.top {
  display: flex;
  margin: 20px 16px 12px;
  justify-content: space-between;

  .title {
    font-size: 16px;
    color: #333;
  }
  .rules {
    a {
      font-size: 14px;
      color: #166fd8;
    }
    img {
      vertical-align: middle;
    }
  }
}
.content-wrap {
  background: #FFF;
  padding: 16px 30px;

  .content {
    font-size: 14px;
    text-align: center;

    &:not(:last-child) {
      border-bottom: 1px solid #EEE;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
  }
}
.cube-loading /deep/ .cube-loading-spinners {
  margin: 0 auto;
}
.content {

  .desc {
    color: #666;
    line-height: 1;
  }
  .count {
    color: #333;
    font-size: 24px;
    font-weight: bold;
  }
  .highlight {
    color: #166fd8;
  }
  .gray {
    color: #999;
  }
  .progress-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    overflow: hidden;

    .limit {
      font-size: 12px;
      font-weight: bold;
      color: #999;
    }
    .progress {
      flex: 0 0 100%;
      height: 5px;
      background-color: #f2f2f2;
      margin-bottom: 10px;
      border-radius: 7px;
    }
    .progress-inner {
      height: 8px;
      background-image: linear-gradient(to right, #31a8ee, #166fd8);
      margin-top: -1.5px;
      border-radius: 7px;
      animation: progress-in 1.5s ease-out;
    }
  }
  &.info {
    .prompt {
      font-weight: bold;
      letter-spacing: .5px;
    }
  }
  &.stats {
    .stat {
      margin-bottom: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
    button {
      font-size: 16px;
    }
  }
}
@keyframes progress-in {
  from { max-width: 0%; }
  to { max-width: 100%; }
}
</style>
