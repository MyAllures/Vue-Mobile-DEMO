<template>
  <div>
    <swiper 
      :list="banners"
      dots-position="center"
    ></swiper>
    <group>
      <cell>
        <span slot="icon" class="anmt-title">{{$t('home.announcement')}}</span>
        <marquee
          :interval="5000"
        >
          <marquee-item 
            v-for="(a, index) in announcements" 
            :key="'announcement' + index" 
            @click.native="showDialog = true">
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
  </div>
</template>

<script>
import { Group, Cell, Swiper, SwiperItem, Marquee, MarqueeItem, XDialog } from 'vux'
import { fetchBanner, fetchAnnouncements } from '../api'

export default {
  name: 'Home',
  data () {
    return {
      banners: [],
      announcements: [],
      showDialog: false
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
  },
  components: {
    Group,
    Cell,
    Swiper,
    SwiperItem,
    Marquee,
    MarqueeItem,
    XDialog
  }
}
</script>

<style scoped>
.anmt-title {
  width: 40px;
  display: inline-block;
}
.maq-txt {
  display: block;
  word-break: break-all;
  text-align: left;
  text-overflow: ellipsis;
}
.dialog {
  padding: 15px;
}
.anmt-txt {
  word-break: break-all;
}
.close {
  color: #999;
  font-size: 24px;
  font-weight: 200;
  position: absolute;
  top: 0px;
}
.swiper {
  margin-top: 20px;
}
</style>
