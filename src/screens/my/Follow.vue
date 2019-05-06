<template>
  <div class="follow-container">
    <group>
      <cell title="允许他人关注">
        <cube-switch
          :value="user.followable"
          :disabled="user.followable===undefined||switchLoading"
          @input="switchFollowStatus"></cube-switch>
      </cell>
    </group>
    <div class="title">我关注的会员</div>
    <template v-if="user.followeeList">
      <group v-if="user.followeeList.length">
        <cell :title="followee.nickname" v-for="followee in user.followeeList" :key="followee.username">
          <div class="avatar" :style="{'background-image': followee.avatar_url?`url('${followee.avatar_url}')`:`url('${defaultAvatar}')`}" slot="icon"></div>
          <div v-if="!followeeLoading.includes(followee.username)" class="cancel" @click="cancelFollow(followee)">
            取消关注
          </div>
          <div v-else class="cancel">
            <InlineLoading></InlineLoading>
          </div>
        </cell>
      </group>
      <div v-else class="no-follow">
        <div class="icon"></div>
        <div class="text">还没有关注任何会员</div>
        <div class="hint">点击头像即可关注会员，快去关注吧！</div>
      </div>
    </template>
  </div>
</template>
<script>
import { mapState } from 'vuex'
import { Group, Cell, InlineLoading } from 'vux'
import {eagle} from '@/api'
export default {
  name: 'Follow',
  components: {
    Group,
    Cell,
    InlineLoading
  },
  data () {
    const defaultAvatar = require('@/assets/avatar.png')
    return {
      switchLoading: false,
      followeeLoading: [],
      defaultAvatar
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    switchFollowStatus (val) {
      this.switchLoading = true
      eagle.updateChatRoomUserInfo(this.user.username, {
        followable: val
      }).then(() => {
        this.$store.dispatch('setUser', {
          followable: val
        })
      }).catch(() => {

      }).finally(() => {
        this.switchLoading = false
      })
    },
    cancelFollow (followee) {
      this.followeeLoading.push(followee.username)
      this.$store.dispatch('toggleFollowee', followee).then(res => {
        this.$vux.toast.show({
          text: res.messages[0],
          type: 'success'
        })
        this.followeeLoading.splice(this.followeeLoading.indexOf(followee.username), 1)
      }).catch(() => {

      })
    }
  }
}
</script>

<style lang="less" scoped>
.follow-container  {
  padding-top: 20px;
  /deep/ .weui-cell {
    padding: 0 15px;
    display: flex;
    align-items: center;
    height: 45px;
  }
  /deep/ .weui-cells {
    margin: 0;
  }
}
.avatar {
  height: 36px;
  width: 36px;
  border-radius: 10px;
  margin-right: 10px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.cancel {
  height: 45px;
  width: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: @azul;
}
.title {
  font-size: 14px;
  color: #666;
  padding-left: 15px;
  margin: 20px 0 10px 0;
}
.no-follow {
  text-align: center;
  .icon{
    height: 200px;
    background: url('../../assets/no_follow.png')  no-repeat center;
    background-size: contain;
  }
  .text {
    font-size: 16px;
    color: #333;
  }
  .hint {
    font-size: 14px;
    color: #666;
  }
}
</style>


