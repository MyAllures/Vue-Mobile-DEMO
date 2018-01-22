<template>
  <div class="promo-container">
    <card
      v-if="promotion.image_mobile"
      v-for="(promotion, index) in startedPromotions"
      @click.native="handleClick(promotion)"
      :key="index">
      <img slot="header"  class="promo-image" :src="promotion.image_mobile" :alt="promotion.image_mobile">
      <div slot="content" class="caption text-right">
        <span>{{promotion.name}}</span>
        <icon class="click-icon" scale="1.2" name="hand-o-up"></icon>
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
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/hand-o-up'
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
    Alert, Card, Icon
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

.click-icon {
  vertical-align: sub;
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

</style>
