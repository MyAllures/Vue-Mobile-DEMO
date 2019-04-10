<template>
  <div class="emoji-selector" v-show="Object.keys(emojis).length">
    <div class="emoji-button" @click="showEmojiMenu = !showEmojiMenu">
      <img src="@/assets/icon_sticker.svg" />
    </div>
    <div class="emoji-container" v-if="showEmojiMenu">
      <cube-tab-bar v-model="selectedLabel" show-slider>
        <cube-tab v-for="(item, index) in emojiCategories" :label="item.label" :key="item.category" />
      </cube-tab-bar>
      <cube-tab-panels v-model="selectedLabel">
        <cube-tab-panel v-for="(item, index) in emojiCategories" :label="item.label" :key="item.category">
          <div class="emojis">
            <a href="#" class="emoji" v-for="(emoji, i) in emojiCollection[index]" :key="emoji.shortcode" @click.prevent="handleSelect(emoji.emoji)">{{emoji.emoji}}</a>
          </div>
        </cube-tab-panel>
      </cube-tab-panels>
    </div>
  </div>
</template>

<script>
import { fetchServiceEmoji } from '@/api'

export default {
  data () {
    return {
      emojis: {},
      emojiCatName: {
        activity: '活动',
        flags: '旗帜',
        'food-drink': '饮食',
        nature: '自然',
        objects: '物件',
        people: '人类',
        symbols: '符号',
        'travel-places': '旅游'
      },
      selectedLabel: '',
      showEmojiMenu: false
    }
  },
  created () {
    this.fetchEmojis()
  },
  methods: {
    fetchEmojis () {
      fetchServiceEmoji().then(response => {
        this.emojis = response
        this.selectedLabel = this.emojiCategories[0].label
      })
    },
    handleSelect (emoji) {
      this.$emit('emojiSelected', emoji)
    }
  },
  computed: {
    emojiCategories () {
      let data = []
      for (const category in this.emojis) {
        const emoji = this.emojis[category][0].emoji
        data.push({
          category: category,
          label: emoji + '<br />' + this.emojiCatName[category]
        })
      }
      return data
    },
    emojiCollection () {
      let collection = []
      for (const category in this.emojis) {
        const emojis = this.emojis[category]
        collection.push(emojis)
      }
      return collection
    }
  }
}
</script>

<style lang="scss">
$blue: #156fd8;

.cube-tab-bar-slider {
  background-color: $blue !important;
}
.cube-tab-panels-group {
  height: 100%;
}
</style>
<style lang="scss" scoped>
$blue: #156fd8;

.emoji-button {
  position: absolute;
  top: 13px;
  right: 60px;
  cursor: pointer;
}
.emoji-container {
  position: absolute;
  left: 0;
  bottom: 50px;
  width: 100%;
  height: 360px;
  max-height: calc(100vh - 46px - 50px);
  background: #FFF;
  border-top: solid 1px #e5e5e5;
  z-index: 1;

  .cube-tab-bar {
    height: 54px;
  }
  .cube-tab {
    line-height: 1.3;

    &.cube-tab_active {
      color: $blue;
    }
  }
  .cube-tab-panels {
    margin-top: 5px;
    height: calc(100% - 54px - 5px);
  }
  .cube-tab-panels-group {
    height: 100%;
  }
  .emojis {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    height: 100%;
    overflow-y: scroll;
  }
  .emoji {
    width: 36px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    box-sizing: border-box;

    &:focus {
      border: 2px solid $blue;
      line-height: 32px;
    }
  }
}
</style>
