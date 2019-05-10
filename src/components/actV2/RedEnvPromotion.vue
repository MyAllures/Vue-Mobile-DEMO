<template>
  <transition name="slide-fade">
    <div id="re-promotion" v-if="act">
      <div class="re-wrap">
        <div class="header">
          <a href="#" @click="hide"><x-icon type="ios-arrow-left" />返回</a>
        </div>
        <div class="content-wrap">
          <div class="content">
            <div class="promo-title">{{ act.name }}</div>
            <div class="section">
              <div class="section-title">活動介紹</div>
              <div class="section-content">{{ act.description }}</div>
            </div>
            <div class="section">
              <div class="section-title">活動內容</div>
              <div class="section-content">
                <table v-if="type === 'boost'">
                  <thead>
                    <tr>
                      <td>每日充值金额</td>
                      <td>每日有效投注金额</td>
                      <td>当日可领红包个数</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr :key="i" v-for="(level, i) in act.levels">
                      <td v-if="i === 0" :rowspan="act.levels.length">{{ act.check_deposit.today_deposit || 0 }}+</td>
                      <td>{{ level.bet_amount_min }}</td>
                      <td>{{ level.count }}</td>
                    </tr>
                  </tbody>
                </table>
                <table v-else-if="type === 'referral'">
                  <thead>
                    <tr>
                      <td>推荐人数</td>
                      <td>每成功推荐一人，可领红包数</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr :key="i" v-for="(level, i) in act.levels">
                      <td v-if="i < act.levels.length - 1">{{ level.referral_min }} ~ {{ act.levels[i + 1].referral_min - 1 }}</td>
                      <td v-else>{{ level.referral_min }} 以上</td>
                      <td>{{ level.count }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <template v-if="user.account_type">
            <button class="f-col" @click="goto('/my/red_envelopes')" v-if="type === 'boost'">查看我的返利紅包</button>
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
     </div>
   </div>
 </transition>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'RedEnvPromotion',
  props: {
    type: String
  },
  methods: {
    goto (path) {
      this.hide()
      this.$router.push(path)
    },
    hide () {
      this.$emit('hide')
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
    act () {
      const pairs = {
        boost: this.actBoost,
        referral: this.actReferral
      }
      return pairs[this.type]
    }
  }
}
</script>

<style lang="scss" scoped>
#re-promotion {
  background: #d23f34;
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}
.re-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
}
.header {
  height: 56px;

  a {
    color: #FFF;
    line-height: 56px;
  }
  svg {
    fill: #FFF;
    vertical-align: middle;
  }
}
.content-wrap {
  width: 324px;
  height: 470px;
  background: url(../../assets/red-envelope-v2/promotion-bg.png) no-repeat;
  background-size: 324px 470px;
  margin: 0 auto;
  padding: 20px 12px 16px;
  text-align: center;
  box-sizing: border-box;
}
.content {
  height: 100%;
  overflow-y: auto;
}
.promo-title {
  width: 252px;
  height: 47px;
  background: url(../../assets/red-envelope-v2/promotion-title.png) no-repeat;
  background-size: 252px 47px;
  margin: 0 auto 5px;
  font-size: 20px;
  color: #fae8c6;
  line-height: 47px;
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
  margin: 25px auto;
  width: 300px;
  display: flex;
  justify-content: center;

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

.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .5s ease-out;
}
.slide-fade-enter, .slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
