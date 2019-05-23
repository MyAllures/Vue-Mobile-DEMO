<template>
  <popup class="filter-dialog" v-model="isShow" height="88%">
    <div class="header">
      <div class="title">游戏筛选</div>
      <div class="tools">
        <a href="#" class="link" @click.prevent="selectAllGames(false)">清除</a>
        <a href="#" class="link" @click.prevent="selectAllGames(true)">全选</a>
      </div>
    </div>
    <div class="content">
      <div class="group" :key="i" v-for="(group, i) in gamesByGroup">
        <div class="top">
          <div class="title">{{ group.name }}</div>
          <div class="tools">
            <a href="#" class="link" @click.prevent="selectGames(i, true)" v-if="!childHasSelected(i)">全选</a>
            <a href="#" class="link" @click.prevent="selectGames(i, false)" v-else>清除全部</a>
          </div>
        </div>
        <div class="selector">
          <a href="#" :class="{ selected: game.selected }" :key="j" v-for="(game, j) in group.data" @click.prevent="game.selected = !game.selected">{{ game.name }}</a>
        </div>
      </div>
    </div>
    <div class="footer">
      <XButton text="确定" type="primary" :show-loading="loading" @click.native="submit" />
    </div>
  </popup>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { Popup, XButton } from 'vux'
import { eagle } from '@/api'

export default {
  name: 'ChatFilterDialog',
  components: {
    Popup,
    XButton
  },
  props: {
    show: Boolean
  },
  data: () => ({
    isShow: false,
    loading: false,
    gamesByGroup: []
  }),
  created () {
    this.setGames()
  },
  methods: {
    ...mapActions([
      'updateFilters'
    ]),
    setGames () {
      const games = Object.assign({}, this.sortedGames)
      const ranks = Object.keys(games)
      let result = []
      for (const rank in games) {
        const game = Object.assign({}, games[rank])
        const i = ranks.indexOf(rank)
        game.data.map(game => {
          game.selected = this.user.filters.game_settings[game.code] === true
          return game
        })
        if (game.data.length < 4 && i < ranks.length - 1) {
          const next = games[ranks[i + 1]]
          next.data.map(game => {
            game.selected = this.user.filters.game_settings[game.code] === true
            return game
          })
          game.name += ' / ' + next.name
          game.data = game.data.concat(next.data)
          delete games[ranks[i + 1]]
        }
        result.push(game)
      }
      this.gamesByGroup = result
    },
    selectAllGames (selected) {
      this.gamesByGroup.forEach(group => {
        group.data.forEach(data => {
          data.selected = selected
        })
      })
    },
    selectGames (groupIndex, selected) {
      this.gamesByGroup[groupIndex].data.forEach(data => {
        data.selected = selected
      })
    },
    childHasSelected (groupIndex) {
      return this.gamesByGroup[groupIndex].data.findIndex(data => data.selected === true) !== -1
    },
    submit () {
      this.loading = true
      let data = {}
      this.gamesByGroup.forEach(group => {
        group.data.forEach(game => {
          data[game.code] = game.selected
        })
      })
      eagle.updateChatRoomUserInfo(this.user.username, {
        game_settings: data
      }).then(() => {
        this.updateFilters({
          game_settings: data
        })
        this.loading = false
        this.isShow = false
      })
    }
  },
  computed: {
    ...mapGetters([
      'user', 'sortedGames'
    ])
  },
  watch: {
    show (val) {
      this.isShow = val
    },
    isShow (val) {
      if (!val) {
        this.$emit('update:show', false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-dialog {
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}
.header {
  height: 40px;
  line-height: 40px;
  background: #FFF;
  padding: 0 10px;
  display: flex;
  justify-content: space-between;

  .title {
    font-size: 18px;
  }
}
.tools {
  a {
    display: inline-block;
    font-size: 14px;
    color: #166fd8;
    padding: 0 8px;
  }
}
.content {
  height: calc(100% - 40px - 60px);
  padding: 10px 5px 10px 15px;
  overflow-y: auto;
  box-sizing: border-box;
}
.group:not(:last-child) {
  margin-bottom: 10px;
}
.top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;

  .title {
    font-size: 16px;
    color: #333;
    font-weight: bold;
  }
}
.selector {

  a {
    margin: 0 3px 5px 0;
    padding: 4px 8px;
    display: inline-block;
    background-color: #FFF;
    color: #666;
    font-size: 14px;
    border: solid 1px #e3e3e3;
    border-radius: 2px;

    &.selected {
      color: #1870d8;
      border-color: #166fd8;
    }
  }
}
.footer {
  height: 60px;
  background: #FFF;
  padding: 0 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
