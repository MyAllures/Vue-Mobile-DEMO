<template>
  <div class="container">
    <swiper
      v-if="banners.length"
      :list="banners"
      :aspect-ratio=".45"
      :show-dots="false"
      dots-position="center"
      auto
      loop>
    </swiper>
    <div class="announcement" v-if="announcements.length" @click="showDialog = true">
      <div class="speaker">
        <icon class="icon" scale="1.3" name="bullhorn"></icon>
      </div>
      <div class="marquee">
        <marquee :messages="announcements"></marquee>
      </div>
    </div>
    <group class="register-money" v-if="!user.account_type&&parseInt(systemConfig.regPresentAmount)">
      <cell
        is-link
        link="/register">
        <div slot="after-title">现在注册立领{{systemConfig.regPresentAmount|currency('￥', 0)}}红包</div>
      </cell>
    </group>
    <flexbox-item >
      <h3 class="title">热门游戏</h3>
      <span class="more" @click="$root.bus.$emit('showGameMenu')">
        更多游戏<i class="arrow-right"></i>
      </span>
    </flexbox-item>
    <grid :cols="3">
      <grid-item
        @click.native="chooseGame(game)"
        v-for="(game, index) in allGames"
        :key="'game' + index"
        v-if="index < game_count">
        <img slot="icon" class="game-icon" v-lazy="game.icon" />
        <span slot="label">{{ game.display_name }}</span>
      </grid-item>
      <a target="_blank" :href="systemConfig.customerServiceUrl" class="weui-grid" v-if="systemConfig.customerServiceUrl">
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
      </a>
    </grid>
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
          <img v-lazy="promotion.image_mobile" alt="promotion.name">
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
          <p class="m-t swiper-announcement">{{a}}</p>
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
import Marquee from '../components/Marquee'
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
    fetchAnnouncements().then(
      result => {
        const datas = []
        result.forEach((item) => {
          if (item.platform !== 1) {
            datas.push(item)
          }
        })

        if (datas.length > 0) {
          datas.sort((a, b) => {
            return a.rank - b.rank
          })
        }
        this.announcements = datas.map(data => data.announcement)
      }
    )
    getPromotions().then(response => {
      this.promotions = response.filter(item => item.image_mobile)
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
    chooseGame (game) {
      this.sendGaEvent({
        label: game.display_name,
        category: '首页游戏选择',
        action: '点击'
      })
      localStorage.setItem('lastGame', game.id)
      this.$router.push(`/game/${game.id}`)
    }
  },
  components: {
    Swiper,
    SwiperItem,
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
    Cell,
    Marquee
  }
}
</script>

<style scoped lang="less">
@import '../styles/vars.less';
.icon-placeholder {
  opacity: 0;
}
.container /deep/ .vux-swiper {
  min-height: 45w;
}
.announcement {
  display: flex;
  height: 36px;
  width: 100%;
  overflow: hidden;
  background: #fff;
}
.announcement {
  .speaker {
    flex: 0 0 auto;
    display: flex;
    height: 36px;
    width: 36px;
    justify-content: center;
    align-items: center;
    color: #666;
    .fa-icon {
      margin: 7px 0;
    }
  }
  .marquee {
    flex: 1 1 auto;
    height: 36px;
  }
}

.swiper-announcement {
  padding: 10px;
  display: inline-block;
  height: 180px;
  overflow-y: scroll;
  overflow-x: hidden;
}
.weui-grids {
  &:after{
    border: none;
  }
  background: #fff;
  .weui-grid {
    padding: 10px;
  }
  /deep/ .weui-grid {
    height: 28vw;
  }
  /deep/ .weui-grid__icon {
    width: 60%;
    height: auto;
    text-align: center;
  }

  /deep/ .weui-grid__label {
    color: #666;
    line-height: 1;
    font-size: 15px;
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
  float: right;
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
  display: block;
  border-radius: 10px;
  min-height: 15vw;
}
</style>
