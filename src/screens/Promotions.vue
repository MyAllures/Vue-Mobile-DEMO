<template>
  <div class="promo-container">
    <card
      v-if="promotion.image_mobile"
      v-for="(promotion, index) in startedPromotions"
      @click.native="handleClick(promotion)"
      :key="index">
      <img slot="header"  class="promo-image" :src="promotion.image_mobile" :alt="promotion.image_mobile">
      <div slot="content" class="caption text-right">
        <span>{{promotion.name}}, {{promotion.start_date}} ~ {{promotion.end_date}}</span>
        <span class="arrow"></span>
      </div>
    </card>
    <alert :hide-on-blur="true" v-model="promoPopup.visible" :title="promoPopup.title">
      <div class="popup-content">
        <p>开始时间：{{promoPopup.startDate}}</p>
        <p>截止时间：{{promoPopup.endDate}}</p>
        <p class="m-t text-left" v-html="promoPopup.description"></p>
      </div>
    </alert>
  </div>
</template>

<script>
import { Alert, Card } from 'vux'
import { getPromotions } from '../api'
import { mapGetters } from 'vuex'
import Vue from 'vue'

export default {
  data () {
    return {
      promotions: [],
      promoPopup: {
        visible: false
      },
      today: Vue.moment()
    }
  },
  methods: {
    handleClick (promo) {
      this.promoPopup = {
        visible: true,
        title: promo.name,
        startDate: promo.start_date,
        endDate: promo.end_date,
        description: promo.mobile_description
      }
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ]),
    startedPromotions () {
      return this.promotions.filter(promo => {
        return !this.today.isBefore(this.$moment(promo.start_date))
      })
    }
  },
  created () {
    getPromotions().then(promos => {
      this.promotions = promos
    })
  },
  components: {
    Alert, Card
  }
}
</script>

<style lang="less" scoped>
.promo-container {
  background-color: #fff;
  padding: 10px;
}

.promo-image {
  width: 100%;
  height: 130px;
}

.caption {
  font-size: 12px;
  color: #999
}
.popup-content {
  overflow-y: auto;
  max-height: 40vh;
}

.promo-container /deep/ .weui-dialog {
  max-width: 100%;
}
.arrow {
  display: inline-block;
  height: 6px;
  width: 6px;
  border-width: 2px 2px 0 0;
  border-color: #C8C8CD;
  border-style: solid;
  transform: rotate(45deg);
  margin-left: 3px;
  margin-right: 3px;
}
</style>
