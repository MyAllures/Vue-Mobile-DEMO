<template>
  <div>
    <swiper
      :list="banners"
      :aspect-ratio="400/1200"
      :interval=4000
      dots-position="center" auto loop
    ></swiper>
    <group>
      <cell>
        <span slot="icon" class="anmt-title">{{$t('home.announcement')}}</span>
        <marquee :interval="5000">
          <marquee-item
            v-for="(a, index) in announcements"
            :key="'announcement' + index"
            @click.native="showDialog = true"
          style="text-align: left">
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
      <div class="title">
        <img src="./icon-game.png" alt="">
        热门游戏
      </div>
      <div class="row" v-if="category" >
        <div class="col" v-for="(game, index) in category" v-if="game.icon">
          <div class="blur">
            <img :src="game.icon" alt="">
          </div>
          <div class="gamebox">
            <a href="">
              <img :src="game.icon" alt="">
              <p>{{game.display_name}}</p>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="activity">
      <div class="head">
        <div class="title">
          <img src="./icon-activity.png" alt="">
          优惠活动
        </div>
        <a href="">更多>></a>
      </div>

      <div class="activity-list">
        <a v-for="(p, i) in promotions" @click="handleClick(p.name,p.start_date, p.end_date)">
          <p>{{p.name}}</p>
          <img :src="p.image" alt="">
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
import { fetchBanner, fetchAnnouncements } from '../api'
import axios from 'axios'
import urls from '../api/urls'

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
    this.getGameCategory()
    this.getPromotions()
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
  },
  methods: {
    getGameCategory () {
      axios.get(urls.games).then(response => {
        this.category = response
      })
    },
    getPromotions () {
      axios.get(urls.promotions).then(response => {
        this.promotions = response
        console.log(this.promotions)
      })
    },
    handleClick (title,start,end) {
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

<style scoped lang="less">
.anmt-title {
  display: inline-block;
  width: 50px;
  color: red;
}
.gamelist {
  margin: 0;
  padding: 5px;
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
      .blur {
        width:100%;
        -webkit-filter:blur(5px);
        -moz-filter:blur(5px);
        -o-filter:blur(5px);
        -ms-filter:blur(5px);
        filter:blur(5px);
        position: absolute;
        top: -20%;
        left: -20%;
        img {
          width: 150%;
          height: 150%;
        }
      }
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
            width: 60%;
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
