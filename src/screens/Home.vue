<template>
  <div>
    <swiper
      :list="banners"
      :aspect-ratio="400/1200"
      :interval=4000
      dots-position="center" auto loop
    ></swiper>
    <group>
      <cell class="tt">
        <span slot="icon" class="anmt-title">{{$t('home.announcement')}}</span>
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
        <div class="col" v-for="(game, index) in category" v-if="(game.icon && game.bg_icon)" :style="{backgroundImage:`url(${game.bg_icon})`}">
          <div class="gamebox">
            <a href="">
              <img :src="game.icon" alt="">
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="activity">
      <div class="head">
        <div class="title">
          <img src="../images/icon-activity.png" alt="">
          优惠活动
        </div>
        <a href="">更多>></a>
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
  .weui-cells {
    margin-top: 0 !important;
    &:after {
      border-bottom: none !important;
    }
  }
</style>
<style scoped lang="less">
.anmt-title {
  display: inline-block;
  width: 50px;
  color: red;
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
        /*border: 1px solid #fff;*/
        -moz-border-radius: 10px;
        -webkit-border-radius: 10px;
        border-radius: 10px;
        /*margin: 0 5px;*/
        /*background: rgba(255,255,255,.5);*/
        position: relative;
        a {
          width: 100%;
          font-weight: 600;
          color: #575e68;
          text-decoration: none;
          display: block;
          img {
            display: block;
            width: 80%;
            margin: 0 auto;
          }
          p {
            margin: 10px 0 0;
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
