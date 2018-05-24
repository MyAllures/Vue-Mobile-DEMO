<template>
  <div class="chat-body" ref="view" @click="showSmile = false">
    <ul class="lay-scroll">
      <li v-for="(item, index) in messages"
        :key="index"
        :class="['clearfix', 'item', item.sender && user.username === item.sender.username ? 'item-right' : 'item-left', item.type < 0 ? 'sys-msg' : '']">
        <div class="lay-block clearfix" v-if="item.type >= 0">
          <div class="avatar">
            <icon name="cog" class="font-cog" v-if="item.type == 4" scale="3"></icon>
            <img :src="getAvatarSrc(item.sender)" v-else>
          </div>
          <div class="lay-content">
            <div class="msg-header">
              <h4>{{item.type === 4 ? '计划消息' : item.sender.nickname}}</h4>
              <span
                v-if="item.type !== 4"
                :class="['common-member', item.sender.level_name==='管理员'?'manager':'']">
                {{item.sender.level_name==='管理员'?'管理员':'普通会员'}}
              </span>
              <span class="msg-time">{{item.created_at | moment('HH:mm:ss')}}</span>
            </div>
            <envelope v-if="item.type === 5" :item="item" @click.native="openEnvelop(item.envelope_status.id)"></envelope>
            <div v-else-if="item.type === 7" class="picture">
              <img-async
                :src="item.content"
                @imgStart="imgLoadCount++"
                @imgLoad="imgLoadCount--"/>
            </div>
            <div v-else :class="['bubble', 'bubble' + item.type]">
              <p>
                <span v-if="item.type === 4 || item.type === 8">{{item.content}}</span>
                <img-async
                  @click.native="showImageMsg = true; showImageMsgUrl = item.content"
                  v-else-if="item.type === 1"
                  :src="item.content"
                  @imgStart="imgLoadCount++"
                  @imgLoad="imgLoadCount--"/>
              </p>
            </div>
          </div>
        </div>
        <div v-else>
          {{item.content}}
        </div>
      </li>
      <li v-if="personalSetting.blocked" class="block-user-info">您已被管理员拉黑，请联系客服。<li>
      <li ref="msgEnd" id="msgEnd" class="msgEnd"></li>
    </ul>
    <div v-transfer-dom>
      <popup v-model="showImageMsg" height="100%">
        <div class="close-pop-btn" @click="showImageMsg = false">完成</div>
        <div>
          <img :src="showImageMsgUrl" width="100%">
        </div>
      </popup>
    </div>
    <div v-transfer-dom>
      <x-dialog
        class="envelope-dialog"
        :show.sync="showEnvelopeDialog"
        :hide-on-blur="true"
        :dialog-style="dialogStyle">
        <div class="close-btn" @click="showEnvelopeDialog = false"></div>
        <div class="envelope-avatar">
          <div v-if="selectedEnvelope.avatar" class="avatar" :style="{'background-image': `url('${host+selectedEnvelope.avatar}')`}"></div>
          <div v-else class="money"></div>
        </div>
        <div class="envelope-owner">{{selectedEnvelope.sendername}} 发红包</div>
        <p class="envelope-content">
          ”{{selectedEnvelope.content}}”
        </p>
        <div v-if="selectedEnvelope.status === 4" class="loader">
          <div class="loading"></div>
          <div class="moneys"></div>
        </div>
        <div v-else-if="selectedEnvelope.status === 2" class="get-amount">
          <div class="row">
            <div class="moneys"></div>
            <div class="amount">{{selectedEnvelope.amount | currency('￥')}}</div>
          </div>
          <div class="text">恭喜你抢到红包啦！</div>
        </div>
        <div v-else class="not-remain">{{selectedEnvelope.status === 3 ?'手慢了，红包已派完。':'红包已过期'}}</div>
        <div v-if="selectedEnvelope.users && selectedEnvelope.users.length" class="userlist">
          <div class="count">{{statistic}}</div>
          <div class="view">
            <ul>
              <li :class="['group', member.receiver_id===user.id?'me':'']" v-for="(member, index) in selectedEnvelope.users" :key="index">
                <span>{{member.nickname}}</span>
                <span>{{member.amount | currency('￥')}}</span>
              </li>
            </ul>
          </div>
        </div>
      </x-dialog>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { TransferDom, Popup, XDialog, XTable } from 'vux'
import { takeEnvelope } from '../api'
import Envelope from './Envelope'
import ImgAsync from './ImgAsync'
import urls from '../api/urls'
export default {
  components: {
    Popup,
    Envelope,
    XDialog,
    XTable,
    ImgAsync
  },
  directives: {
    TransferDom
  },
  props: {
    messages: {
      default: ''
    },
    roomId: {
      default: ''
    },
    personalSetting: {
      type: Object
    }
  },
  name: 'ChatBody',
  data () {
    const width = window.innerWidth <= 320 ? window.innerWidth + 'px' : '355px'
    const dialogStyle = {
      'max-width': width,
      width: width,
      'box-sizing': 'border-box',
      'padding-top': '15px',
      'background-image': `url('${require('../assets/envelop-top.png')}'), linear-gradient(to right, #de5547, #de5547)`,
      'background-size': 'contain, cover',
      'background-position': 'top, center',
      'background-repeat': 'no-repeat, no-repeat'
    }
    return {
      showImageMsg: false,
      showImageMsgUrl: '',
      host: urls.host,
      roleCache: {},
      showEnvelopeDialog: false,
      selectedEnvelope: {},
      messageCount: 0,
      busy: false,
      imgLoadCount: 0,
      notNeedScroll: true,
      userLoading: false,
      dialogStyle
    }
  },
  computed: {
    ...mapState([
      'user', 'envelope'
    ]),
    noPermission () {
      return this.personalSetting.chat.status === 0
    },
    statistic () {
      if (this.selectedEnvelope.users) {
        const gottenNum = this.selectedEnvelope.users.length
        const total = this.selectedEnvelope.total
        if (this.selectedEnvelope.status === 3 || total === gottenNum) {
          return `${total}/${total} 已领完`
        } else {
          return `${gottenNum}/${total} 已领取`
        }
      } else {
        return ''
      }
    }
  },
  mounted () {
    this.notNeedScroll = false
    const view = this.$refs.view
    view.scrollTop = view.scrollHeight
  },
  watch: {
    'messages.length': function (newCount, oldCount) {
      if (newCount === 0) {
        return
      }
      this.notNeedScroll = false
      const view = this.$refs.view
      if (oldCount === 0) { // 初始
        this.$nextTick(() => {
          view.scrollTop = view.scrollHeight
        })
      } else if ( // 1. user正在閱讀之前訊息 2. 是否為自己發的訊息
        view.scrollTop + view.clientHeight + 100 > view.scrollHeight ||
        this.messages[newCount - 1].sender.username === this.user.username || this.messages[newCount - 1].type === 5) {
        this.$nextTick(() => {
          view.scrollTop = view.scrollHeight
        })
      } else {
        this.notNeedScroll = true
      }
    },
    'imgLoadCount': function (count) {
      if (count === 0) {
        if (!this.notNeedScroll) {
          this.$nextTick(() => {
            const view = this.$refs.view
            view.scrollTop = view.scrollHeight
          })
        }
      }
    }
  },
  methods: {
    getAvatarSrc (sender) {
      if (sender) {
        if (sender.username === this.user.username) {
          if (this.user.avatar) {
            return this.user.avatar
          }
        } else if (sender.avatar_url) {
          return sender.avatar_url
        }
      }
      return require('../assets/avatar.png')
    },
    openEnvelop (id) {
      if (this.noPermission || this.busy) {
        return
      }
      if (this.envelope[id].status !== 1) {
        if (!this.user.account_type) {
          this.$vux.toast.show({
            text: '游客不能抢红包',
            type: 'warn'
          })
          setTimeout(() => {
            this.$router.push('/login')
          }, 3000)
          return
        }
        this.selectedEnvelope = this.envelope[id]
        this.showEnvelopeDialog = true
        if (this.envelope[id].status === 4) {
          this.busy = true
          takeEnvelope(id, this.user.id).then(res => {
            this.busy = false
            const status = res.status
            switch (status) {
              case 'success':
                this.$store.dispatch('updateEnvelope', {id: id, data: {status: 2, amount: res.amount}})
                this.$store.dispatch('fetchUser')
                break
              case 'fail':
                const users = Object.values(res.receive_users)
                this.$store.dispatch('updateEnvelope', {id: id, data: {status: 3, users}})
                break
              case 'expired':
                this.$store.dispatch('updateEnvelope', {id: id, data: {status: 1}})
                break
              case 'repeat':
                this.$store.dispatch('updateEnvelope', {id: id, data: {status: 2}})
                break
            }
          }).catch(() => { this.busy = false })
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.chat-body {
  flex: 1 1 auto;
  height: 100%;
  overflow-y: auto;
}
.lay-scroll {
  .block-user-info {
    text-align: center;
    padding-top: 100px;
    font-size: 16px;
    color: red;
  }
}
.item {
  padding: 0 5px;
  margin-top: 20px;
  overflow: hidden;
  &.sys-msg {
    text-align: center;
    color: #eee;
    font-size: 12px;
    .type-warning {
      color: #f60;
      .btn-here {
        color: rgb(25, 158, 216);
      }
    }
    div {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 4px;
      background: rgba(255, 255, 255, .2);
    }
  }
  .lay-content {
    width: calc(~"100%" - 62px);
    .picture {
      width: 55%;
      img {
        width: 100%;
      }
    }
  }
  &.item-left {
    .lay-block {
      .lay-content {
        float: left;
        margin-left: 15px;
        .bubble:after {
          left: 0;
          border-left: 0;
          margin-left: -8px;
          border-right-color: inherit;
        }
      }
    }
  }
  &.item-right {
    .lay-block {
      .avatar {
        float: right;
      }
      .lay-content {
        float: right;
        margin-right: 15px;
        margin-left: 0;
        .msg-header {
          h4 {
            text-align: right;
            float: right;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-top: 2px;
            font-size: 12px;
          }

          span {
            float: right;
          }
        }
        .picture {
          float: right;
        }
        .bubble {
          float: right;
        }
        .bubble:after {
          right: 0;
          border-right: 0;
          margin-right: -9px;
          border-left-color: inherit;
        }
      }
    }
  }
}
.lay-block {
  .avatar {
    width: 42px;
    height: 42px;
    float: left;
    .font-cog {
      color: #7285d6;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 7px;
    }
  }
}

.common-member {
  float: left;
  width: auto;
  height: auto;
  padding: 0 6px;
  margin: 0 5px;
  background: #1976d2;
  border-radius: 10px;
  font-weight: 400;
  font-size: 10px;
  color: #fff;
  &.manager {
    background: #d6a254;
    padding: 0 6px;
    width: auto;
    height: auto;
    margin: 0 5px;
  }
}
.msg-header {
  overflow: hidden;
  h4 {
    float: left;
    max-width: 150px;
    font-size: 14px;
    color: #4f77ab;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 12px;
    padding-top: 2px;
  }
  .msg-time {
    color: #9f9f9f;
    float: left;
    font-size: 12px;
  }
}
.bubble {
  background: linear-gradient(to right, #1976D2, rgb(25, 158, 216));
  border-left-color: rgb(25, 158, 216);
  border-right-color: #1976D2;
  color: rgb(255, 255, 255);
  margin-top: 3px;
  position: relative;
  border-radius: 5px;
  padding: 5px 8px;
  font-size: 13px;
  display: inline-block;
  p {
    width: 100%;
  }
  &.bubble1 {
    width: 55%;
  }
  &.bubble4 {
    background: #ab47bc;
    background: linear-gradient(to right,#ab47bc,#5169DE);
    border-left-color: #5169de;
    border-right-color: #ab47bc;
  }
  &.bubble8 {
    background: linear-gradient(to right, #1976D2, rgb(25, 158, 216));
    border-left-color: rgb(25, 158, 216);
    border-right-color: #1976D2;
    color: rgb(255, 255, 255);
  }
  p {
    display: inline-block;
    span {
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 14px;
    }
    img {
      width: 100%;
      min-height: 50px;
    }
  }
}
.bubble:after {
  content: '';
  position: absolute;
  top: 14px;
  width: 0;
  height: 0;
  border: 9px solid transparent;
  border-top: 0;
  margin-top: -7px;
}
.close-pop-btn {
  text-align: right;
  padding: 4px;
  color: #444;
}
.envelope-dialog {
  font-weight: lighter;
  color: #fff;
  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
  }
  .envelope-avatar {
    height: 60px;
    width: 100%;
    .money,.avatar {
      height: 60px;
      width: 60px;
      margin: 0 auto;
      background-repeat: no-repeat;
      background-size: cover;
      background-position: center;
      border-radius: 50%;
      box-shadow: 0 2px 1px 0 rgba(149, 8, 8, 0.5);
    }
    .money {
      background-image: url('../assets/money.png')
    }
    .avatar {
      box-sizing: border-box;
      border: 3px solid #debd85;
    }
  }
  .envelope-owner {
    width: 100%;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    color: #debd85;
  }
  .envelope-content {
    width: 100%;
    box-sizing: border-box;
    word-wrap: break-word;
    line-height: 20px;
    font-size: 14px;
    padding: 0 20px;
  }
  .get-amount {
    width: 100%;
    height: 100px;
    .row {
      display: flex;
      width: 100%;
      height: 60px;
      align-items: center;
      justify-content: center;
      .moneys {
        height: 60px;
        width: 36px;
        background: url('../assets/moneys.png') no-repeat center;
        background-size: contain;
      }
      .amount {
        font-size: 36px;
        height: 60px;
        font-weight: 600;
      }
    }
    .text{
      height: 20px;
      font-size: 14px;
      line-height: 20px;
      width: 100%;
    }
  }
  .not-remain {
    font-size: 20px;
    font-weight: 600;
    width: 100%;
    height: 100px;
    line-height: 100px;
  }
  .userlist {
    box-sizing: border-box;
    width: 100%;
    height: 260px;
    padding:0 35px;
    background: #fff;
    font-size: 14px;
    color: #4a4a4a;
    .count {
      height: 50px;
      line-height: 50px;
      font-size: 12px;
      color: #de5547;
    }
    .view {
      width: 100%;
      height: 180px;
      overflow-y: auto;
      ul {
        width: 100%;
        li {
          height: 20px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          &.me{
            color: #c0493c;
          }
        }
      }
    }
    .loading {
      width: 100%;
      height: 30px;
      color: #de5547;
    }
  }
  .loader {
    position: relative;
    width: 100%;
    height: 100px;
    padding: 20px 0;
    .moneys {
      position: absolute;
      top: 45px;
      height: 50px;
      width: 100%;
      background: url('../assets/moneys.png') no-repeat center;
      background-size: contain;
    }
    .loading {
      font-size: 10px;
      margin: 0 auto;
      text-indent: -9999em;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: #f8e71c;
      background: linear-gradient(to right, #f8e71c 10%, #de5547 42%);
      position: relative;
      animation: loading 1.4s infinite linear;
      transform: translateZ(0);
    }
    .loading:before {
      width: 50%;
      height: 50%;
      background: #f8e71c;
      border-radius: 100% 0 0 0;
      position: absolute;
      top: 0;
      left: 0;
      content: '';
    }
    .loading:after {
      background: #de5547;
      width: 95%;
      height: 95%;
      border-radius: 50%;
      content: '';
      margin: auto;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
    @keyframes loading {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
}
</style>
