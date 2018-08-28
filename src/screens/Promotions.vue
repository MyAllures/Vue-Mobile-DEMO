<template>
  <div>
    <div class="promo-container" v-if="promotions.length && !$route.params.promoId">
      <div
        class="activity-item"
        v-for="(promotion, index) in promotions"
        :key="index"
        @click="$router.push(`/promotions/${promotion.id}`)">
        <div class="activity-item-title">{{promotion.name}}</div>
        <div class="activity-item-img">
          <img width="100%" v-lazy="promotion.image_mobile" :alt="promotion.name" :key="promotion.image_mobile">
        </div>
      </div>
    </div>
    <div v-else>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { Card } from 'vux'
import { mapState } from 'vuex'
export default {
  name: 'Promotions',
  components: {
    Card
  },
  computed: {
    ...mapState([
      'promotions'
    ])
  }
}
</script>

<style lang="less" scoped>
.promo-container {
  background-color: #fff;
}

.activity-item {
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px 16px 20px;
  .activity-item-title {
    height: 36px;
    line-height: 36px;
    width: 100%;
    font-size: 16px;
    color: #333;
    text-align: center;
  }
  .activity-item-img {
    width: calc(~"100vw" - 40px);
    height: calc(~"25vw" - 10px);
    text-align: center;
  }
}

</style>
