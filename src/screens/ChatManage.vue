<template>
  <div class="chat-manage-container">
    <div class="title">禁言管理</div>
    <div class="content">
      <table class="table">
          <thead class="thead">
            <tr>
              <th class="first-col" width="30%">会员名</th>
              <th width="25%">昵称</th>
              <th width="17%">禁言时间</th>
              <th width="17%">剩余时间</th>
              <th width="11%"></th>
            </tr>
          </thead>
          <tbody>
            <tr class="row" v-for="member in bannedList" :key="member.username">
              <td class="first-col">{{member.username}}</td>
              <td>{{member.nickname}}</td>
              <td>{{member.ban_duration}}分钟</td>
              <td>{{member.ban_remaining_time}}分钟</td>
              <td>
                <a class="unban" @click="unbanMember(member.username)">解除</a>
              </td>
            </tr>
          </tbody>
        </table>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
  name: 'ChatManage',
  data () {
    return {
      bannedList: [],
      unbanLoading: false
    }
  },
  computed: {
    ...mapState('eagle', {
      isManager: state => state.isManager,
      ws: state => state.ws
    })
  },
  created () {
    this.ws.fetchBannedList().then(res => {
      this.bannedList = res
    }).catch(() => {})
  },
  methods: {
    unbanMember (username) {
      if (this.unbanLoading) {
        return
      }
      this.unbanLoading = true
      this.ws.unbanMember(username).then(res => {
        this.$vux.toast.show({
          text: res.status,
          type: 'success'
        })
        return this.ws.fetchBannedList()
      }).then(res => {
        this.bannedList = res
      }).catch(() => {

      }).finally(() => {
        this.unbanLoading = false
      })
    }
  }
}
</script>
<style lang="less" scoped>
.chat-manage-container {
  height: 100%;
  background: #eee;
  .title {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
    font-size: 16px;
    line-height: 40px;
    height: 40px;
    background-color: #fff;
  }
  .content {
    padding-bottom: 70px;
    height: calc(~"100%" - 110px);
    overflow-y: auto;
  }
  .table {
    width: 100%;
    text-align: left;
    border-collapse: collapse;
    table-layout: fixed;
    font-size: 14px;
    margin-top: 10px;
    .thead {
      font-size: 12px;
    }
    td {
      vertical-align: middle;
    }
    th {
      box-sizing: border-box;
      height: 30px;
      line-height: 30px;
      color: #666666;
      background: #eeeeee;
    }
    .row {
      height: 40px;
      background-color: #ffffff;
      border-bottom: 2px solid #eee;
      .btn {
        text-align: center;
      }
    }
    .data {
      border: none;
      font-size: 14px;
    }
    .box {
      display: inline-block;
      width: 30px;
      text-align: center;
    }
    .first-col {
      padding-left: 15px;
    }
    .prediction-result {
      span {
        font-size: 16px;
        @media screen and (max-width: 320px) {
          font-size: 14px;
        }
      }
    }
    .unban {
      color: @azul;
    }
  }
}
</style>
