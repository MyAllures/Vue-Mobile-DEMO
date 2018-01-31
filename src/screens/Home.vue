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
    <grid :cols="3">
      <grid-item
        @click.native="$router.push(`/game/${game.id}`)"
        v-for="(game, index) in games"
        :key="'game' + index"
        v-if="index < 11">
        <img slot="icon" :src="game.icon">
        <span slot="label">{{ game.display_name }}</span>
      </grid-item>
      <grid-item @click.native="$router.push(`/`)">
        <img slot="icon" src="../assets/icon_pc.png" alt="PC">
        <span slot="label">电脑版</span>
      </grid-item>
    </grid>
    <div class="activity">
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
  Masker,
  Alert
} from 'vux'
import { fetchBanner, fetchAnnouncements, fetchGames, getPromotions } from '../api'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/bullhorn'
export default {
  name: 'Home',
  data () {
    return {
      banners: [],
      announcements: [],
      showDialog: false,
      games: [],
      showpromoPopup: false,
      promotions: []
    }
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
      })

    fetchAnnouncements()
      .then(res => {
        this.announcements = res
      })
    fetchGames().then(response => {
      this.games = response
    })
    getPromotions().then(response => {
      this.promotions = response.filter(item => item.image_mobile)
    })
  },
  methods: {
    handleClick (promotion) {
      this.$router.push(`/promotions/${promotion.id}`)
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
    GridItem
  }
}
</script>

<style scoped lang="less">
.announcement {
  height: 36px;
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
    font-size: 16px;
  }
}

.activity {
  .title {
    display: inline-block;
    font-weight: normal;
    font-size: 16px;
    color: #666;
    padding:10px 0 0 10px;
  }
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
</style>
