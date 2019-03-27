<template>
  <div>
    <x-dialog
      v-model="isVisible"
      :hide-on-blur="true"
      @on-hide="$emit('on-close')"
      :dialog-style="{
        width: `${width}px`,
        height: `${height}px`,
        'background-color': 'rgba(0,0,0,0)',
        'max-width': 'none',
        'pointer-events': 'none',
        margin: 'auto'
      }">
      <div class="wrapper">
        <div class="content">
          <template v-if="!takenEnvelope">
            <div class="title" >{{name}}</div>
            <div class="article-area">
              <div class="article-groups">
                <div class="article">
                  <div class="article-title">活动介绍</div>
                  <div class="article-content">{{description}}</div>
                </div>
                <div class="article">
                  <div class="article-title">领取条件</div>
                  <div class="article-content" v-if="status === 'ineligible'">
                    <template v-for="(p, index) in criteria">
                      <p  v-if="p.eligible===true":key="index">
                        ✓ {{p.message}}
                      </p>
                      <p class="false" v-else-if="p.eligible===false":key="index">
                        ✗ {{p.message}}
                      </p>
                      <p  v-else :key="index">
                        ・{{p}}
                      </p>
                    </template>
                  </div>
                  <div class="article-content" v-else>
                    <p  v-for="(p, index) in criteria" :key="index">
                      ・{{p.message}}
                    </p>
                  </div>
                </div>
                <div class="article">
                  <div class="article-title">活动时间</div>
                  <div class="article-content">{{duration_desc}}</div>
                </div>
              </div>
            </div>
            <div class="button-area">
              <div v-if="loading" class="button">
                <inline-loading></inline-loading>
              </div>
              <div v-else-if="status === 'available'" class="button" @click="takeActivityEnvelope">
                抢红包
              </div>
              <div v-else-if="status === 'ineligible'" class="button disabled ineligible">
                未满足领取条件
              </div>
              <div v-else-if="status === 'need_login'" class="button disabled">
                请先登录
              </div>
              <div v-else class="button disabled">
                {{messages[0]}}
              </div>
            </div>
          </template>
          <template v-else-if="status==='success'">
            <div class="title" >领取成功</div>
            <div class="result-area success">
              <div class="amount">{{amount|currency('￥')}}</div>
              <div class="icon"></div>
              <div class="desc">
                <p>红包已存入您的帐户</p>
                <p>稍后可在交易纪录中查询</p>
              </div>
            </div>
            <div class="button-area">
              <div class="button" @click="$emit('on-close')">确认</div>
            </div>
          </template>
          <template v-else>
            <div class="title">领取失败</div>
            <div class="result-area fail">
              <div class="icon"></div>
              <div class="desc">
                <p>红包就在刚刚被抢完了</p>
                <p>明天再来吧</p>
              </div>
            </div>
            <div class="button-area">
              <div class="button" @click="$emit('on-close')">确认</div>
            </div>
          </template>
        </div>
        <div class="close-btn"></div>
      </div>
    </x-dialog>
  </div>
</template>
<script>
import {XDialog, InlineLoading} from 'vux'
import {fetchActivityEnvelope, takeActivityEnvelope} from '@/api'
export default {
  name: 'EnvelopeHomeDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    XDialog,
    InlineLoading
  },
  data () {
    let width = window.innerWidth
    let height = window.innerHeight
    let imageRatio = 681 / 1061
    if (width / height > imageRatio) {
      width = height * imageRatio
    } else {
      height = width / imageRatio
    }
    return {
      isVisible: false,
      name: '',
      description: '',
      criteria: '',
      duration_desc: '',
      status: '',
      takenEnvelope: false,
      amount: '',
      messages: [],
      loading: false,
      width: width,
      height: height
    }
  },
  computed: {
    envelopeActivityId () {
      return this.$store.state.systemConfig.envelopeActivityId
    }
  },
  watch: {
    'visible': function (visible) {
      this.isVisible = visible
      if (visible) {
        this.status = ''
        this.messages = []
        this.name = ''
        this.description = ''
        this.criteria = ''
        this.duration_desc = ''
        this.takenEnvelope = false
        fetchActivityEnvelope(this.envelopeActivityId).then(res => {
          this.status = res.available_status.code
          this.messages = res.available_status.messages
          this.name = res.name
          this.description = res.description
          this.criteria = res.criteria
          this.duration_desc = res.duration_desc
        }).catch(() => {

        })
      }
    }
  },
  methods: {
    takeActivityEnvelope () {
      this.loading = true
      takeActivityEnvelope({activity_id: this.envelopeActivityId}).then(res => {
        this.sendGaEvent({
          label: '首页',
          category: '紅包',
          action: '点击抢红包'
        })
        if (res.code === 'success' || res.code === 'failed') {
          this.takenEnvelope = true
        }
        this.status = res.code
        this.messages = res.messages
        this.amount = res.amount
      }).catch(() => {

      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
.wrapper {
  position: relative;
  background-image: url('../assets/envelope_bg.png');
  background-size: contain;
  background-position: top center;
  background-repeat: no-repeat;
  width: 90%;
  height: 90%;
  margin: 0 auto;
}
.content {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding-top: 49%;
  padding-bottom: 1%;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  .title {
    flex: 0 0 auto;
    box-sizing: border-box;
    width: 100%;
    height: 30px;
    line-height: 30px;
    background: url('../assets/envelope_title_bg.svg') center no-repeat;
    background-size: contain;
    text-align: center;
    font-size: 22px;
    color: #fdebc5;
  }
  .article-area {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 85%;
    overflow-y: auto;
    color: #fdebc5;
    margin: 0 auto;
    .article-groups {
      box-sizing: border-box;
      width: 100%;
      margin-top: 10px;
      padding-left: 20px;
      .article {
        width: 100%;
        text-align: left;
        margin-bottom: 10px;
        &:last-child {
          margin-bottom: 0;
        }
        .article-title {
          display: inline-block;
          height: 20px;
          line-height: 20px;
          border-radius: 10px;
          padding: 0 10px;
          font-size: 14px;
          background-image: linear-gradient(to left, #c34141, #d13e3e);
        }
        .article-content {
          .false {
            color: #fff;
          }
          font-weight: lighter;
          p {
            font-weight: lighter;
          }
          font-size: 14px;
          width: 100%;
        }
      }
    }
  }
  .result-area {
    box-sizing: border-box;
    height: calc(~"100%" - 110px);
    padding-top: 2%;
    .desc {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-size: 14px;
      color: #fdebc5;
      p {
        font-weight: lighter;
      }
    }
    .amount {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 32px;
    }
    @media screen and (max-width: 320px) {
      .amount {
        color: #fff;
        font-size: 24px;
      }
    }
    .icon {
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      width: 100%;
      height: 60%;
    }
    &.success {
      .amount {
        height: 20%;
      }
      .desc {
        height: 20%;
      }
      .icon {
          background-image: url('../assets/envelope_success.png');
      }
    }
    &.fail {
      .desc {
        height: 40%;
      }
      .icon {
        background-image: url('../assets/envelope_fail.png');
      }
    }
  }
  .button-area {
    flex: 0 0 auto;
    box-sizing: border-box;
    height: 80px;
    padding: 19px 30px;
    .button {
      position: relative;
      width: 100%;
      max-width: 220px;
      height: 42px;
      line-height: 42px;
      border-radius: 25px;
      background-image: linear-gradient(to bottom, #fffbef, #fff0c5 3%, #ffcc5a);
      box-shadow: 0px 7px 0px 0px darken(#ffca7b, 35%);
      margin: 0 auto;
      color: #c24840;
      font-size: 15px;
      &.disabled {
        color: #666;
        background-image: linear-gradient(to bottom, #ffffff, #bababa);
        box-shadow: 0px 7px 0px 0px darken(#bababa, 15%);
      }
    }
  }
}
.close-btn {
  position: absolute;
  bottom: -40px;
  width: 23px;
  height: 23px;
  left: 50%;
  transform: translateX(-50%);
  border: 1px solid #fff;
  border-radius: 50%;
  &::before, &::after {
    height: 15px;
    width: 1px;
    top: 4px;
    left: 11px;
  }
}
</style>
