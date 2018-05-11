<template>
  <div class="promotion">
    <h2>{{promo.name}}</h2>
    <figure>
      <img class="image" :src="promo.image_mobile" :alt="promo.id">
      <figcaption class="caption">{{promo.name}}</figcaption>
    </figure>
    <article class="article" v-html="promo.mobile_description"></article>
  </div>
</template>

<script>
import { getPromotions } from '../api'
import _ from 'lodash'

export default {
  name: 'Promotions',
  data () {
    return {
      allPromotions: [],
      promo: {}
    }
  },
  created () {
    getPromotions().then(allPromotions => {
      this.allPromotions = allPromotions
    })
  },
  watch: {
    'allPromotions': function (allPromotions) {
      this.promo = _.find(allPromotions, promo => (promo.id + '') === this.$route.params.promoId)
    }
  }
}
</script>

<style lang="less" scoped>
.image {
  width: 100%;
  height: 120px;
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
