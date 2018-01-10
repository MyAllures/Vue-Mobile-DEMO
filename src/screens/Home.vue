<template>
  <div>
    <swiper
      :list="banners"
      :aspect-ratio="400/1200"
      :interval=4000
      dots-position="center" auto loop
    ></swiper>
    <group class="announcement">
      <cell class="tt">
        <span slot="icon" class="anmt-title">
          <svg  version="1.1" role="presentation" width="20" height="20" viewBox="0 0 1792 1792" class="speaker m-l-xlg fa-icon" style="font-size: 1.25em;">
            <path d="M1664 640q53 0 90.5 37.5t37.5 90.5-37.5 90.5-90.5 37.5v384q0 52-38 90t-90 38q-417-347-812-380-58 19-91 66t-31 100.5 40 92.5q-20 33-23 65.5t6 58 33.5 55 48 50 61.5 50.5q-29 58-111.5 83t-168.5 11.5-132-55.5q-7-23-29.5-87.5t-32-94.5-23-89-15-101 3.5-98.5 22-110.5h-122q-66 0-113-47t-47-113v-192q0-66 47-113t113-47h480q435 0 896-384 52 0 90 38t38 90v384zM1536 1244v-954q-394 302-768 343v270q377 42 768 341z"></path> 
          </svg>&nbsp;
          {{$t('home.announcement')}}
        </span>
        <marquee :interval="5000">
          <marquee-item
            v-for="(a, index) in announcements"
            :key="'announcement' + index"
            @click.native="showDialog = true"
            class="walk-item">
            <span class="maq-txt">{{ index + 1 }}: {{ a.announcement }}</span>
          </marquee-item>
        </marquee>
      </cell>
    </group>
    <x-dialog
      v-model="showDialog"
      :hide-on-blur="true">
      <div class="dialog">
        <div @click="showDialog = false" class="close">
          <span class="vux-close">&times;</span>
        </div>
        <swiper
          class="swiper"
          auto
          dots-position="center">
          <swiper-item
            :key="'swiper-anmt' + index"
            v-for="(a, index) in announcements">
            <p class="anmt-txt">{{a.announcement}}</p>
          </swiper-item>
        </swiper>
      </div>
    </x-dialog>
    <div class="gamelist">
      <div class="row" v-if="category" >
        <div class="col" v-for="(game, index) in category" v-if="index < 11" :style="{backgroundImage:`url(${game.bg_icon})`}">
          <div class="gamebox">
            <a>
              <img :src="game.icon" alt="">
            </a>
          </div>
        </div>
        <div class="col zxkf">
        </div>
      </div>
    </div>

    <div class="activity">
      <div class="head">
        <div class="title">
          <img src="../images/icon-activity.png" alt="">
          优惠活动
        </div>
      </div>

      <div class="activity-list" v-if="promotions">
        <a v-for="(p, i) in promotions" v-if="p.image_mobile" @click="handleClick(p.name,p.start_date, p.end_date)">
          <p>{{p.name}}</p>
          <img :src="p.image_mobile" alt="">
        </a>
      </div>
    </div>
    <div class="box">
      <alert :hide-on-blur="true" v-model="show" :title="title">
        <p>开始时间：{{start_date}}</p>
        <p>截止时间：{{end_date}}</p>
      </alert>
    </div>

  </div>
</template>

<script>
import { Group, Cell, Swiper, SwiperItem, Marquee, MarqueeItem, XDialog, Masker, Alert } from 'vux'
import { fetchBanner, fetchAnnouncements, getGameCategory, getPromotions } from '../api'

export default {
  name: 'Home',
  data () {
    return {
      banners: [],
      announcements: [],
      showDialog: false,
      category: [],
      show: false,
      promotions: '',
      title: '',
      start_date: '',
      end_date: ''
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
    getGameCategory().then(response => {
      this.category = response
    })
    getPromotions().then(response => {
      this.promotions = response
    })
  },
  methods: {
    handleClick (title, start, end) {
      this.show = true
      this.title = title
      this.start_date = start
      this.end_date = end
    }
  },
  components: {
    Group,
    Cell,
    Swiper,
    SwiperItem,
    Marquee,
    MarqueeItem,
    XDialog,
    Masker,
    Alert
  }
}
</script>

<style lang="less">
  .announcement {
    .weui-cells {
      margin-top: 0 !important;
      &:after {
        border-bottom: none !important;
      }
    }
    .vux-swiper {
      height: 160px!important;
    }
  }
</style>
<style scoped lang="less">

.anmt-title {
  display: inline-block;
  width: 80px;
  .speaker {
    transform: translateY(2px);
  }
}
.walk-item {
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tt {
  background-color: #f0f0f0;
}
.gamelist {
  margin: 0;
  border: 0;
  vertical-align: baseline;
  font: inherit;
  font-size: 100%;
  .title {
    position: relative;
    font-size: 16px;
    font-weight: 700;
    padding: 10px 10px 0 38px;
    img {
      width: 21px;
      position: absolute;
      left: 10px;
      top: 10px;
    }
  }
  .row {
    display: -webkit-flex;
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    .zxkf {
      background-image: url('../images/zxkf.png')
    }
    .col {
      padding: 5px 0;
      flex: 0 0 33.33%;
      max-width: 33.33%;
      position: relative;
      text-align: center;
      overflow: hidden;
      background-size: cover;l
      background-position: center center;
      .gamebox {
        text-align: center;
        font-size: 15px;
        padding: 10px 4px;
        -moz-border-radius: 10px;
        -webkit-border-radius: 10px;
        border-radius: 10px;
        position: relative;
        a {
          width: 100%;
          font-weight: 600;
          color: #575e68;
          text-decoration: none;
          display: block;
          img {
            display: block;
            width: 80px;
            margin: 0 auto;
          }
        }
      }
    }
  }
}
  .activity {

    .head {
      display: -webkit-box;
      display: -webkit-flex;
      display: -moz-box;
      display: -moz-flex;
      display: -ms-flexbox;
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
  .box {
    position: relative;
    clear: both;
  }
</style>
