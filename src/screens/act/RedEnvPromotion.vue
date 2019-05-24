<template>
  <div id="re-promotion" v-if="type">
    <template v-if="act">
      <div class="content-wrap">
        <img class="flower" :src="require('@/assets/red-envelope-v2/promotion-flower.svg')" />
        <div class="content">
          <div class="section">
            <div class="section-title">活动介绍</div>
            <div class="section-content">{{ act.description }}</div>
          </div>
          <div class="section">
            <div class="section-title">活动内容</div>
            <div class="section-content">
              <table v-if="type === 'boost'">
                <thead>
                  <tr>
                    <td>每日充值<br v-if="hasMaxAmount" />金额</td>
                    <td>每日有效<br v-if="hasMaxAmount" />投注金额</td>
                    <td>当日可领<br v-if="hasMaxAmount" />红包个数</td>
                    <td v-if="hasMaxAmount">最高<br />金额</td>
                  </tr>
                </thead>
                <tbody>
                  <tr :key="i" v-for="(level, i) in act.levels">
                    <td v-if="i === 0" :rowspan="act.levels.length">{{ act.check_deposit.today_deposit || 0 }}+</td>
                    <td>{{ level.bet_amount_min }}</td>
                    <td>{{ level.count }}</td>
                    <td v-if="i === 0 && hasMaxAmount" :rowspan="act.levels.length">{{ act.display_max_amount }}</td>
                  </tr>
                </tbody>
              </table>
              <table v-else-if="type === 'referral'">
                <thead>
                  <tr>
                    <td>推荐人数</td>
                    <td>每成功推荐一人，<br v-if="hasMaxAmount" />可领红包数</td>
                    <td v-if="hasMaxAmount">最高<br />金额</td>
                  </tr>
                </thead>
                <tbody>
                  <tr :key="i" v-for="(level, i) in act.levels">
                    <td v-if="i < act.levels.length - 1">{{ level.referral_min }} ~ {{ act.levels[i + 1].referral_min - 1 }}</td>
                    <td v-else>{{ level.referral_min }} 以上</td>
                    <td>{{ level.count }}</td>
                    <td v-if="i === 0 && hasMaxAmount" :rowspan="act.levels.length">{{ act.display_max_amount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <template v-if="user.account_type">
          <button class="f-col" @click="goto('/my/red_envelopes')" v-if="type === 'boost'">查看我的返利红包</button>
          <button class="f-col" @click="goto('/my/referral_link')" v-else-if="type === 'referral'">立即推荐好友</button>
        </template>
        <template v-else>
          <div class="f-col login">
           <p>已有帐号</p>
           <button @click="goto('/login')">立即登录</button>
         </div>
         <div class="f-col register">
           <p>尚未注册</p>
           <button @click="goto('/register')">免费注册</button>
         </div>
        </template>
      </div>
    </template>
    <div class="loading" v-else><cube-loading /></div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'RedEnvPromotion',
  mounted () {
    if (this.type && !this.act) {
      this.getAct(this.type)
    }
  },
  methods: {
    ...mapActions('page', [
      'updatePageSetting'
    ]),
    ...mapActions('actv2', [
      'getAct'
    ]),
    goto (path) {
      this.$router.push(path)
    }
  },
  computed: {
    ...mapState([
      'user'
    ]),
    ...mapState('actv2', {
      actBoost: state => state.boost.detail,
      actReferral: state => state.referral.detail
    }),
    type () {
      return this.$route.params.type
    },
    act () {
      const acts = {
        boost: this.actBoost,
        referral: this.actReferral
      }
      return acts[this.type]
    },
    hasMaxAmount () {
      return this.act.display_max_amount > 0
    }
  },
  watch: {
    'act.name': {
      handler (name) {
        if (name) {
          this.updatePageSetting({
            ...this.$store.state.page.meta,
            title: name
          })
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
#re-promotion {
  background: #d23f34;
  height: calc(100vh - 46px);
}
.header {
  height: 46px;

  a {
    color: #FFF;
    line-height: 46px;
  }
  svg {
    fill: #FFF;
    vertical-align: middle;
  }
}
.content-wrap {
  width: 324px;
  background: #fff4df;
  margin: auto;
  padding: 12px;
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 90px;
  text-align: center;
  border-radius: 10px;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, .3);
  box-sizing: border-box;

  &:before {
    content: '';
    display: block;
    background: #fff4df;
    width: 84%;
    height: 10px;
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    margin: auto;
    border-radius: 10px 10px 0 0;
  }
}
.flower {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: auto;
}
.content {
  height: 100%;
  overflow-y: auto;
  position: relative;
}
.section {
  font-size: 14px;
  margin-bottom: 12px;

  table {
    width: 100%;
    color: #6d6452;

    thead {
      font-size: 11px;

      td {
        line-height: 16px;
        border-top-color: transparent;
        border-right-color: transparent;
        border-left-color: transparent;
        padding-bottom: 2px;
      }
    }
    td {
      text-align: center;
      vertical-align: middle;
      border: solid 1px #e1cfaf;
    }
    tbody {
      td {
        padding: 0 5px;
      }
    }
  }
}
.section-title {
  color: #c19353;
  margin-bottom: 5px;
  display: inline-block;
  line-height: 22px;
  position: relative;

  &:before,
  &:after {
    content: '';
    display: block;
    width: 62px;
    height: 9px;
    background: url(../../assets/red-envelope-v2/promotion-section.png) no-repeat;
    background-size: 62px 9px;
    position: absolute;
    top: calc((22px - 9px) / 2);
  }
  &:before {
    left: -72px;
    transform: rotate(180deg);
  }
  &:after {
    right: -72px;
  }
}
.section-content {
  background: #fae8c6;
  color: #6d6452;
  padding: 5px 6px;
  text-align: left;
  border-radius: 4px;
}
.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  width: 300px;
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;

  .f-col {
    flex: 1;
  }
  div {
    text-align: center;
    margin-top: -20px;

    &.login {
      margin-right: 6px;
    }
    &.register {
      margin-left: 6px;
    }
    p {
      font-size: 11px;
      color: #fff4df;
    }
    button {
      display: block;
      width: 100%;
    }
  }
  button {
    padding: 10px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    color: #d03e36;
    background: #FFF;
    border: none;
    border-radius: 4px;
 }
}
.loading {
  display: flex;
  justify-content: center;
}
</style>
