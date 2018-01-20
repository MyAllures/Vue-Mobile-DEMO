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
          <icon class="icon" scale="1.5" name="bullhorn"></icon>
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
    <div class="gamelist" v-if="games.length">
      <div class="row" >
        <div class="col"
          v-if="index < 8"
          v-for="(game, index) in games"
          :style="{backgroundImage:`url(${game.bg_icon})`}"
          :key="index">
          <div class="gamebox">
            <router-link :to="`/game/${game.id}`">
              <img :src="game.icon" :alt="game.code">
            </router-link>
          </div>
        </div>
        <div class="col service">
          <div class="gamebox round">
            <a :href="$store.state.systemConfig.customerServiceUrl">
              <img src="../images/zxkf.png" alt="">
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="activity m-b" v-if="promotions">
      <div class="head">
        <div class="title">
          <img src="../images/icon-activity.png" alt="activity">
          优惠活动
        </div>
      </div>
      <div class="activity-list">
        <div v-for="(promo, index) in promotions"
          v-if="promo.image_mobile"
          @click="handleClick(promo.name,promo.start_date, promo.end_date, promo.mobile_description)"
          :key="index">
          <p>{{promo.name}}</p>
          <img :src="promo.image_mobile" :alt="index">
        </div>
      </div>
    </div>
    <alert :hide-on-blur="true" v-model="showpromoPopup" :title="promoPopup.title">
      <p>开始时间：{{promoPopup.start_date}}</p>
      <p>截止时间：{{promoPopup.end_date}}</p>
      <p>{{promoPopup.mobile_description}}</p>
    </alert>
    <x-dialog
      v-model="showDialog"
      :hide-on-blur="true">
        <swiper
          dots-position="center">
          <swiper-item
            :key="'swiper-anmt' + index"
            v-for="(a, index) in announcements">
            <p class="m-t">{{a.announcement}}</p>
          </swiper-item>
        </swiper>
    </x-dialog>
  </div>
</template>

<script>
import { Swiper, SwiperItem, Marquee, MarqueeItem, Alert, XDialog, Flexbox, FlexboxItem } from 'vux'
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
      promotions: '',
      showpromoPopup: false,
      promoPopup: {
        end_date: '',
        start_date: '',
        title: '',
        description: ''
      }
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
      this.promotions = response
    })
  },
  methods: {
    handleClick (title, start, end, description) {
      this.showpromoPopup = true
      this.promoPopup.title = title
      this.promoPopup.start_date = start
      this.promoPopup.end_date = end
      this.promoPopup.description = description
    }
  },
  components: {
    Swiper,
    SwiperItem,
    Marquee,
    MarqueeItem,
    XDialog,
    Alert,
    Flexbox,
    FlexboxItem,
    Icon
  }
}
</script>

<style scoped lang="less">

.announcement {
  height: 40px;
  .speaker {
    margin-left: 10px;
  }
  .icon {
    color: #4a4a4a;
  }
}

.marquee-item {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gamelist {
  .row {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    .col {
      padding: 1em 0;
      flex: 0 0 33.33%;
      position: relative;
      overflow: hidden;
      background-size: cover;
      background-position: center center;
      .gamebox {
        border-radius: 10px;
        img {
            display: block;
            width: percentage(2 / 4);
            height: auto;
            margin: 0 auto;
          }
        &.round {
          img {
            border-radius: 50%;
          }
        }
      }
    }
  }
}

.service {
  background-image: linear-gradient(to top, #4481eb 0%, #04befe 100%);
}

.activity {
  .head {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    font-size: 16px;
    .title {
      position: relative;
      font-weight: 700;
      padding-left: 28px;
      img {
        width: 21px;
        position: absolute;
        left: 0;
        top: 1px;
      }
    }
  }
  .activity-list {
    margin: 0 10px;
    padding: 10px;
    border: 1px solid #fff;
    border-radius: 10px;
    background: rgba(255,255,255,.5);
    p {
      font-size: 16px;
      font-weight: 700;
    }
    img {
      width: 100%;
      height: 80px;
      -webkit-user-drag: none;
    }
  }
}
</style>
