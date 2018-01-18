<template>
  <div class="container">
    <x-header class="gamehall" :right-options="{showMore: true}">
      <x-icon slot="overwrite-left" type="navicon" size="35" style="fill:#fff;position:relative;top:-8px;left:-3px;"></x-icon>
      <span>{{currentGame.display_name}}</span>
    </x-header>
    <router-view :key="$route.name + ($route.params.gameId || '')"/>
  </div>
</template>

<script>
import { XHeader } from 'vux'
export default {
  name: 'GameHall',
  components: {
    XHeader
  },
  data () {
    return {}
  },
  computed: {
    currentGame () {
      return this.$store.getters.gameById(this.$route.params.gameId) || {}
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('fetchGames').catch(() => {})
    })
  }
}
</script>
