<template>
  <div v-transfer-dom>
    <popup :value="isShow" position="left" @on-hide="handleClose" class="popup">
      <div class="popup-content">
        <div class="banner">
          <router-link to="/">
            <img :src="logoSrc" alt="logo"/>
          </router-link>
        </div>
        <ul class="popup-menu">
          <li
            :class="[
            'popup-menu-item',
            {'active': $route.path.split('/')[2] === game.id + ''}]"
            v-for="(game, index) in allGames"
            :key="index"
            @click="switchGame(game.id)">
              {{game.display_name || ''}}
            </li>
        </ul>
      </div>
    </popup>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { TransferDom, Popup, Group, CellBox, Cell } from 'vux'

export default {
  props: {
    isShow: {
      type: Boolean
    }
  },
  data () {
    return {
    }
  },
  directives: {
    TransferDom
  },
  components: {
    Popup,
    Group,
    CellBox,
    Cell
  },
  computed: {
    ...mapGetters([
      'allGames'
    ]),
    logoSrc () {
      return this.$store.state.systemConfig.homePageLogo
    }
  },
  watch: {
    'allGames': function () {
      let currentGameId = this.$route.params.gameId
      if (!currentGameId) {
        currentGameId = localStorage.getItem('lastGame') || this.allGames[0].id
        this.$router.push(`/game/${currentGameId}`)
      }
    }
  },
  methods: {
    handleClose () {
      this.$emit('closeSideBar')
    },
    switchGame (key) {
      localStorage.setItem('lastGame', key)
      this.$router.push(`/game/${key}`)
      this.handleClose()
    }
  }
}
</script>

<style lang="less" scoped>
.popup {
  background-color: #fff;
}
.popup-content {
  width: 150px;
  font-size: 18px;
  color: #4a4a4a;
  .banner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 70px;
    width: 100%;
    img {
      width: 100%;
    }
  }
  .popup-menu-item {
    box-sizing: border-box;
    height: 50px;
    line-height: 50px;
    padding-left: 20px;
    text-align: left;
    width: 100%;
    border-bottom: 1px solid #f1f1f1;
    &.active {
      color: #fff;
      background-image: linear-gradient(to bottom, #006bb3, #00397c);
    }
  }
}
</style>
