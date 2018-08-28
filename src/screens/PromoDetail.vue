<template>
  <div class="promotion" v-if="promo">
    <h2>{{promo.name}}</h2>
    <figure>
      <img class="image" :src="promo.image_mobile" :alt="promo.id">
    </figure>
    <article class="article" v-html="promo.mobile_description"></article>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'PromotionDetail',
  props: {
    promotion: Object
  },
  computed: {
    ...mapState([
      'promotions'
    ]),
    promo () {
      return this.promotions.find(promo => (promo.id + '') === this.$route.params.promoId)
    }
  }
}
</script>

<style lang="less" scoped>
.image {
  width: calc(~"100vw" - 20px);
  height: calc(~"25vw" - 5px);
}

.caption {
  padding-bottom: 10px;
  font-size: 14px;
}

.promotion {
  box-sizing: border-box;
  width: 100%;
  padding: 10px;
  background-color: #fff;
}

.article {
  width: 100%;
  word-break: break-all;
  /deep/ img {
    width: 100%;
    height: auto
  }
}
</style>
