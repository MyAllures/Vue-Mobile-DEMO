<template>
  <div class="act-wrap">
    <div class="top">
      <div class="title">我的好友推荐名单</div>
      <div class="rules">
        <a @click="actDialogType = 'referral'">
          活动规则 <img src="@/assets/red-envelope-v2/icon-arrow.svg" />
        </a>
      </div>
    </div>
    <div class="content-wrap">
      <div class="list-title">
        <div class="column l">会员帐号</div>
        <div class="column m">状态</div>
        <div class="column r"></div>
      </div>
      <div class="list-wrap" ref="listWrap" :style="{ height: listWrapHeight }">
        <div class="list center" v-if="isLoading">
          <cube-loading />
        </div>
        <div class="list center" v-else-if="!list.length">
          暂无推荐好友
        </div>
        <div class="list" v-for="(data, i) in list" v-else>
          <div class="column l">{{ data.member }}</div>
          <div class="column m">
            <img src="@/assets/red-envelope-v2/success.svg" v-if="data.receivable" />
            <span v-else>已注册</span>
          </div>
          <div class="column r">
            <XButton text="尚未充值" mini="true" plain="true" disabled="true" v-if="!data.receivable"  />
            <XButton text="领取完" type="primary" mini="true" disabled="true" v-else-if="data.envelope_count === 0"  />
            <XButton :text="`拆 ${data.envelope_count} 个红包`" @click.native="openRE(data.id, i)" :show-loading="reLoading && currentIdx === i" :disabled="reLoading" type="primary" mini="true" v-else />
          </div>
        </div>
      </div>
      <div class="recommend" ref="recommend">
        <XButton text="推荐好友领红包" type="primary" @click.native="$router.push('/my/referral_link')" />
      </div>
    </div>
    <RedEnvPromotion :type="actDialogType" @hide="actDialogType = ''" />
    <RedEnvDialog :data="redEnvData" :remain="list[currentIdx] && list[currentIdx].envelope_count" :show="showReDialog" @next="openRE" @hide="showReDialog = false" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { XButton } from 'vux'
import RedEnvPromotion from '@/components/actV2/RedEnvPromotion'
import RedEnvDialog from '@/components/actV2/RedEnvDialog'
import {
  fetchActRefList,
  openActRe
} from '@/api'

export default {
  name: 'referrals',
  components: {
    XButton,
    RedEnvPromotion,
    RedEnvDialog
  },
  data: () => ({
    isLoading: true,
    listWrapHeight: 'auto',
    reLoading: false,
    redEnvData: {},
    showReDialog: false,
    currentId: -1,
    currentIdx: -1,
    actDialogType: ''
  }),
  mounted () {
    this.fetchActRefList()
    this.getListWrapHeight()
    window.addEventListener('resize', this.getListWrapHeight)
  },
  methods: {
    fetchActRefList () {
      fetchActRefList().then(response => {
        this.$store.dispatch('actv2/setRefList', response)
        this.isLoading = false
      })
    },
    getListWrapHeight () {
      this.listWrapHeight = (this.$refs.recommend.offsetTop - this.$refs.listWrap.offsetTop) + 'px'
    },
    openRE (id = -1, i = -1) {
      this.currentId = id > -1 ? id : this.currentId
      this.currentIdx = i > -1 ? i : this.currentIdx

      this.reLoading = true
      this.showReDialog = false

      openActRe('referral', this.currentId).then(response => {
        this.redEnvData = response
        this.showReDialog = true
        this.reLoading = false
      })
    }
  },
  computed: {
    ...mapState('actv2', {
      list: state => state.referral.list
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.getListWrapHeight)
  }
}
</script>

<style lang="scss" scoped>
.act-wrap {
  padding-bottom: 53px;
}
.top {
  display: flex;
  margin: 20px 16px 10px;
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
.list-title,
.list {
  display: flex;
  justify-content: space-between;
  padding-left: 16px;
  color: #666;
  height: 45px;
  line-height: 45px;

  > .column {

    &.l {
      flex: 1.5;
    }
    &.m {
      flex: 0 0 50px;
      text-align: center;

      img {
        vertical-align: middle;
      }
      span {
        color: #999;
      }
    }
    &.r {
      flex: 0 0 130px;
      text-align: center;

      button {
        padding: 0 .5em;
        min-width: 80px;
        text-align: center;
      }
    }
  }
}
.list-title {
  font-size: 13px;
}
.list-wrap {
  overflow-y: auto;
}
.list {
  font-size: 14px;
  background: #FFF;
  line-height: 45px;

  &.center {
    justify-content: center;
    align-items: center;
  }
  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
}
.recommend {
  position: fixed;
  left: 0;
  bottom: 53px;
  width: 100vw;
  padding: 18px 30px;
  box-sizing: border-box;
}
</style>
