<template>
  <div>
    <div class="vux-group-tip text-danger">{{errorMsg}}</div>
    <div v-for="message in messages" class="messages vux-1px-b">
    <cell
      :title="message.title"
      :border-intent="false"  
      arrow-direction="up"
      :class="['cell-box', message.status ? '' : 'unread']"
      @click.native="read(message)">
      <div slot>
        <span :class="['sent-at', message.status ? '' : 'unread-line']">{{message.sent_at}}</span>
        &nbsp;&nbsp;
        <b class="arrow-down"></b>
      </div>
    </cell>
    <p class="slide" :class="message.show?'animate':''">{{message.content}}</p>
    </div>
    <div class="pulling-container">
      <pulling
        :queryset="queryset"
        v-on:updateQueryset="updateQueryset"
        v-on:updateQuery="updateQuery"
        :api="api"
        :query="query"
        :limit="limit"
        :extra="extraParam"
        ref="pulling"
        >
      </pulling>
    </div>
  </div>
</template>
<script>
import { Group, Cell, XButton, XInput, Spinner } from 'vux'
import urls from '../../api/urls'
import { noMessages } from '../../api'
import pulling from '../../components/pulling'

export default {
  data () {
    return {
      showContent004: false,
      showContent005: false,
      messages: [],
      errorMsg: '',
      loading: true,
      api: urls.messages,
      queryset: [],
      query: {},
      limit: 20,
      noMsgs: false,
      extraParam: 'platform=0'
    }
  },
  created () {
    this.$nextTick(() => {
      this.getMessages()
    })
  },
  methods: {
    read (message) {
      message.show = !message.show
      if (!message.status) {
        noMessages(message).then((response) => {
          message.status = 1
          this.$root.unread = this.$root.unread - 1 + ''
          if (this.$root.unread <= 0) {
            this.$root.unread = 0
          }
        }, (response) => {
          if (response.status === 401) {
            this.$store.commit('CLEAR_MEMBER')
            return this.$router.push('/login?next=' + this.$route.path)
          }
          this.$root.showToast = true
          this.$root.toastText = response.data.error || '发生错误，请重试'
        })
      }
    },
    getMessages () {
      this.queryset = []
      this.$refs.pulling.rebase()
    },
    updateQueryset (queryset) {
      for (let i = 0, l = queryset.length; i < l; i++) {
        queryset[i].show = false
        queryset[i].sent_at = queryset[i].sent_at.split('T')[0]
        queryset[i].title = queryset[i].title ? queryset[i].title : '/'
      }
      this.messages = queryset
      this.queryset = queryset
    },
    updateQuery (query) {
      this.query = query
    }
  },
  components: {
    Group,
    Cell,
    XButton,
    XInput,
    Spinner,
    pulling
  }
}
</script>
<style lang='less'>
.slide {
  padding: 0 15px;
  padding-bottom: 10px;
  overflow: hidden;
  display: none;
  font-size: 14px;
  word-wrap: break-word;
}
.animate {
  display: block;
}
.arrow-down {
  content: " ";
  display: inline-block;
  height: 6px;
  width: 6px;
  border-width: 2px 2px 0 0;
  border-color: #C8C8CD;
  border-style: solid;
  position: relative;
  top: -2px;
  position: absolute;
  top: 50%;
  margin-top: -4px;
  right: 10px;
  -webkit-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0) rotate(90deg);
  transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0) rotate(90deg);
}
.messages {
  background-color: #FFFFFF;
  line-height: 1.41176471;
  font-size: 17px;
  overflow: hidden;
  position: relative;
}
.sent-at {
  font-size: 13px;
}
.cell-box p {
  font-size: 14px;
  height: 20px;
  text-overflow:ellipsis;
  white-space:nowrap;
  overflow:hidden;
  width: 200px;
  color: #888 !important;
}
.unread p, .unread-line {
  color: red!important;
}
.loading {
  text-align: center;
}
</style>
