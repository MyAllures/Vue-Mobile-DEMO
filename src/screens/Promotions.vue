<template>
  <div>
    <div class="promo-container" v-if="promotions.length && !$route.params.promoId">
      <card
        v-if="promotion.image_mobile"
        v-for="(promotion, index) in promotions"
        @click.native="$router.push(`/promotions/${promotion.id}`)"
        :key="index">
        <img slot="header"  class="promo-image" :src="promotion.image_mobile" :alt="promotion.image_mobile">
        <div slot="content" class="caption">
          <span>{{promotion.name}}</span>
        </div>
      </card>
    </div>
    <div v-else>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { Card } from 'vux'
import { getPromotions } from '../api'
export default {
  name: 'Promotions',
  data () {
    return {
      promotions: [],
      today: this.$moment()
    }
  },
  created () {
    getPromotions().then(response => {
      this.promotions = response.filter(item => item.image_mobile)
    })
  },
  components: {
    Card
  }
}
</script>

<style lang="less" scoped>
.promo-container {
  padding: 10px;
  background-color: #fff;
}

.promo-image {
  width: 100%;
  height: 130px;
}

.caption {
  font-size: 14px;
  color: #999
}

</style>
