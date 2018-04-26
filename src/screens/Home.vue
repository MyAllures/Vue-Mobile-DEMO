<template>
  <div>
    <swiper
      v-if="banners.length"
      :list="banners"
      :aspect-ratio=".45"
      :show-dots="false"
      dots-position="center"
      auto
      loop>
    </swiper>
    <flexbox class="announcement" v-if="announcements.length" @click.native="showDialog = true">
      <flexbox-item :span="1">
        <div class="speaker">
          <icon class="icon" scale="1.3" name="bullhorn"></icon>
        </div>
      </flexbox-item>
      <flexbox-item>
        <marquee :interval="5000">
          <marquee-item
            v-for="(item, index) in announcements"
            :key="'announcement' + index"
            class="marquee-item">
            <span>{{ item.announcement }}</span>
          </marquee-item>
        </marquee>
      </flexbox-item>
    </flexbox>
    <group class="register-money" v-if="!user.account_type&&parseInt(systemConfig.regPresentAmount)">
      <cell
        is-link
        link="/register">
        <div slot="after-title">现在注册立领{{systemConfig.regPresentAmount|currency('￥')}}红包</div>
      </cell>
    </group>
    <flexbox-item>
      <div class="game-title">
        <h3 class="title">热门游戏</h3>
        <router-link class="more" to="/game" @click.native="$emit('showGameMenu')">更多游戏<i class="arrow-right"></i></router-link>
      </div>
    </flexbox-item>
    <grid :cols="3" v-if="allGames.length">
      <grid-item
        @click.native="chooseGame(game.id)"
        v-for="(game, index) in allGames"
        :key="'game' + index"
        v-if="index < game_count">
        <img slot="icon" :src="game.icon" class="game-icon">
        <span slot="label">{{ game.display_name }}</span>
      </grid-item>
      <a target="_blank" :href="systemConfig.customerServiceUrl" class="weui-grid" @click="openPClink()" v-if="systemConfig.customerServiceUrl">
        <div class="weui-grid__icon">
          <img slot="icon" src="../assets/icon_cs.png" alt="custom service" class="game-icon">
        </div>
        <div class="weui-grid__label">
          <span>联系客服</span>
        </div>
      </a>
      <a class="weui-grid" @click="openPClink" >
        <div class="weui-grid__icon">
          <img slot="icon" src="../assets/icon_desktop.png" alt="desktop" class="game-icon" >
        </div>
        <div class="weui-grid__label">
          <span>电脑版</span>
        </div>
      </a>
      <a class="weui-grid" @click="tryDemo" >
        <div  v-if="!$store.state.user.logined">
          <div class="weui-grid__icon"  >
            <img slot="icon" src="../assets/icon_try.png" alt="trial" class="game-icon">
          </div>
          <div class="weui-grid__label">
            <span>免费试玩</span>
          </div>
        </div>
        <div class="grid-placeholder" v-else></div>
      </a>
    </grid>
    <div class="game-loading" v-else>
      <InlineLoading  />
    </div>
    <div v-if="promotions.length > 0" class="activity">
      <flexbox>
        <flexbox-item>
          <h3 class="title">优惠活动</h3>
        </flexbox-item>
        <flexbox-item v-if="promotions.length > 5"
          class="text-right"
          @click.native="$router.push({name: 'Promotions'})">
          <span class="title more">更多活动</span>
        </flexbox-item>
      </flexbox>
      <card
        v-for="(promotion, index) in promotions"
        :header="{title: promotion.name}"
        :key="'card' + index"
        v-if="promotions && index < 5"
        @click.native="handleClick(promotion)">
        <div slot="content" class>
          <img :src="promotion.image_mobile" alt="promotion.name">
        </div>
      </card>
    </div>

    <x-dialog
      v-model="showDialog"
      :hide-on-blur="true">
      <swiper
        height="250px"
        dots-position="center">
        <swiper-item
          :key="'swiper-anmt' + index"
          v-for="(a, index) in announcements">
          <p class="m-t swiper-announcement">{{a.announcement}}</p>
        </swiper-item>
      </swiper>
    </x-dialog>
    <tryplay-popup />
  </div>
</template>

<script>
import {
  Swiper,
  SwiperItem,
  Card,
  Grid,
  GridItem,
  Marquee,
  MarqueeItem,
  XDialog,
  Flexbox,
  FlexboxItem,
  InlineLoading,
  Masker,
  Alert,
  Group,
  Cell
} from 'vux'
import { mapGetters, mapState } from 'vuex'
import { fetchBanner, fetchAnnouncements, getPromotions } from '../api'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/bullhorn'
import TryplayPopup from '../components/TryplayPopup'
import freetrial from '../mixins/freetrial.js'
export default {
  name: 'Home',
  data () {
    return {
      banners: [],
      announcements: [],
      showDialog: false,
      game_count: 15,
      showpromoPopup: false,
      promotions: [],
      today: this.$moment()
    }
  },
  mixins: [freetrial],
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    ...mapState([
      'user', 'systemConfig'
    ])
  },
  created () {
    fetchBanner()
      .then(res => {
        this.banners = res.map(banner => {
          return {
            url: 'javascript:',
            img: banner.image
          }
        })
      }).catch(() => {})

    fetchAnnouncements()
      .then(res => {
        this.announcements = res
      })
    getPromotions().then(response => {
      this.promotions = response.filter(item => item.image_mobile && this.today.isBetween(item.start_date, item.end_date, 'day', '[]'))
    })
  },
  methods: {
    openPClink () {
      this.$cookie.set('desktop', 1)
      window.location.reload()
    },
    handleClick (promotion) {
      this.$router.push(`/promotions/${promotion.id}`)
    },
    chooseGame (gameId) {
      localStorage.setItem('lastGame', gameId)
      this.$router.push(`/game/${gameId}`)
    }
  },
  components: {
    Swiper,
    SwiperItem,
    Marquee,
    MarqueeItem,
    XDialog,
    Flexbox,
    FlexboxItem,
    Icon,
    Masker,
    Alert,
    Card,
    Grid,
    GridItem,
    InlineLoading,
    TryplayPopup,
    Group,
    Cell
  }
}
</script>

<style scoped lang="less">
@import '../styles/vars.less';
.grid-placeholder {
  height: 89px;
}
.announcement {
  height: 36px;
  background: #fff;
}
.announcement {
  .speaker {
    display: flex;
    justify-content: center;
    margin-left: 10px;
    color: #666;
  }
  /deep/ .vux-marquee-box {
    color: #666;
  }
}

.swiper-announcement {
  padding: 10px;
  display: inline-block;
  height: 180px;
  overflow-y: scroll;
  overflow-x: hidden;
}
.marquee-item {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.weui-grids {
  &:after{
    border: none;
  }
  background: #fff;
  .weui-grid {
    padding: 10px;
  }
  /deep/ .weui-grid__icon {
    width: 60%;
    height: 60%;
  }

  /deep/ .weui-grid__label {
    color: #666;
    line-height: 1;
    margin-top: 10px;
    font-size: 16px;
  }
}
.register-money {
  /deep/ .weui-cells.vux-no-group-title {
    margin-top: 10px;
  }
  color: @red;
  text-align: center;
}
.game-title {
  display: flex;
  justify-content: space-between;
}
.more {
  width: 50%;
  display: inline-block;
  line-height: 36px;
  padding: 0 10px 0 0;
  text-align: right;
  margin-right: 10px;
  position: relative;
  color: #666;
  &:visited, &:active {
    color: #666;
  }
  .arrow-right:after {
    margin-left: 5px;
    border-color: #666;
  }
}
.title {
  display: inline-block;
  font-weight: normal;
  font-size: 16px;
  color: #666;
  line-height: 36px;
  padding: 0 0 0 10px;
}
.activity {
  .more:after {
    content: '';
    display: inline-block;
    height: 6px;
    width: 6px;
    border-width: 2px 2px 0 0;
    border-color: #C8C8CD;
    border-style: solid;
    transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
    margin-right: 5px;
    margin-left: 3px;
  }
  /deep/ .vux-card-content {
    text-align: center;
    img {
      display: block;
      margin: auto;
      max-height: 80px;
      padding: 5px 0;
    }
  }
}
.game-loading {
  text-align: center;
  background: #fff;
  padding: 100px 0;
}
.game-icon {
  border-radius: 10px;
}
</style>
