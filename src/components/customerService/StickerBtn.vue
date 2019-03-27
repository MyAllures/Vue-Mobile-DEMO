<template>
  <div class="container" v-if="stickers.length">
    <div :class="['trigger', {active: popupVisible}]">
      <img src="../../assets/icon_sticker.svg" class="smile" @click="popupVisible = !popupVisible"/>
    </div>
    <div class="sticker-popup" v-show="popupVisible">
      <div class="stickers-wrapper">
        <img class="sticker"
          @click="handleStickerClick(sticker.id)"
          v-for="(sticker,index) in currentStickers.stickers"
          :src="sticker.url" :key="index" alt="">
      </div>
      <div class="covers-wrapper">
        <img :class="['cover-img', {active: currentGroupId === sticker.id}]"
          @click="switchGroup(sticker.id)"
          v-for="(sticker, index) in stickers"
          :key="index"
          :src="sticker.cover"
          alt="cover">
      </div>
    </div>
  </div>
</template>

<script>
import {fetchServiceStickers} from '../../api'
import {EMITTED_ACTION} from '@/utils/CustomerService'
export default {
  data () {
    return {
      stickers: [],
      currentGroupId: '',
      popupVisible: false
    }
  },
  methods: {
    fetchStickers () {
      fetchServiceStickers().then((res) => {
        this.stickers = res
        if (this.stickers.length) {
          this.switchGroup(this.stickers[0].id)
        }
      }).catch((e) => {
      })
    },
    switchGroup (id) {
      this.currentGroupId = id
    },
    handleStickerClick (id) {
      this.$store.state.ws.venom.send({action: EMITTED_ACTION.sticker, parameter: {id}})
      this.popupVisible = !this.popupVisible
    }
  },
  computed: {
    currentStickers () {
      return this.stickers.find(sticker => sticker.id && (sticker.id === this.currentGroupId)) || {}
    }
  },
  created () {
    this.fetchStickers()
  }
}
</script>

<style lang="scss" scoped>
.trigger {
  position: absolute;
  top: 13px;
  right: 60px;
  &.active {
    opacity: .7;
  }
}


.sticker-popup {
  position: absolute;
  width: 100%;
  bottom: 50px;
  left: 0;
}

.stickers-wrapper {
  display: flex;
  flex-wrap: nowrap;
  background-color: #fff;
  height: 120px;
  overflow-x: auto;
}

.covers-wrapper {
  display: flex;
  width: 100%;
  height: 60px;
  overflow-x: auto;
  flex-wrap: nowrap;
  background-color: #ddd;
}

.cover-img {
  display: inline-block;
  box-sizing: border-box;
  width: 60px;
  height: 60px;
  padding: 5px;
  &.active {
    background-color: #fff;
  }
}

.sticker-wrapper {
  box-sizing: border-box;
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  padding: 10px;
  overflow-x: auto;
}

.sticker {
  display: inline-block;
  width: 100px;
  height: 100px;
  margin: 5px;
}

</style>
