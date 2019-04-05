<template>
  <div>
    <div class="title">
      <span class="txt">中奖榜</span>
    </div>
    <div class="wrapper" ref='wrapper'>
      <ul class="items" >
        <li v-for="item in topItems" class="item">
          <span>{{ item.username }}</span>
          <span>{{ item.display }}</span> 
          <span class="amount">{{ item.amount | currency('￥') }}</span>
        </li>
      </ul>
      <ul class="items" ref="bottomList">
        <li v-for="item in bottomItems" class="item">
          <span>{{ item.username }}</span>
          <span>{{ item.display }}</span> 
          <span class="amount">{{ item.amount | currency('￥') }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
import { fetchWinHistory } from '../api'
export default {
  name: 'WinHistory',
  components: {
  },
  data () {
    return {
      topItems: [],
      bottomItems: [],
      index: 0,
      timeout: null,
      filterHKL: true
    }
  },
  created () {
    let now = new this.$moment()
    let hklBegain = this.$moment('9:35pm', 'h:mma')
    let hklEnd = this.$moment('9:45pm', 'h:mma')
    this.filterHKL = ![2, 4, 6].includes(now.day()) || now.isBefore(hklBegain) || now.isAfter(hklEnd)

    this.fillWinHistory().then(() => {
      this.$nextTick(() => {
        setInterval(this.rolling, 50)
      })
    })
  },
  methods: {
    refreshItems () {
      // 一个 ul 滚动结束需要 26000，第一次 ul 滚动结束只需要 16000
      this.timeout = setTimeout(() => {
        this.fillWinHistory()
      }, this.index === 1 ? 16000 : 26000)
    },
    fillWinHistory () {
      return fetchWinHistory().then(res => {
        if (this.filterHKL) {
          res = res.map(item => {
            if (item.display === '香港六合彩') {
              console.log('found')
              item.display = '极速六合彩'
            }
            return item
          })
        }
        if (res.length) {
          if (this.index === 0) {
            this.topItems = this.bottomItems = res
          } else if (this.index % 2 === 0) {
            this.topItems = res
          } else {
            this.bottomItems = res
          }
        }
        this.index += 1
      }).catch((res) => {}).then(() => {
        this.refreshItems()
      })
    },
    rolling () {
      let wrapper = this.$refs.wrapper
      let firstList = wrapper.children && wrapper.children[0]
      if (wrapper.scrollTop >= firstList.scrollHeight) {
        wrapper.scrollTop = 0
        // 滚动到顶部的时候 两个 ul 换位
        wrapper.appendChild(firstList)
      } else {
        wrapper.scrollTop++
      }
    }
  }
}
</script>
<style scoped lang="less">
.wrapper {
  height: 180px;
  overflow-y: hidden;
  background: #fff;
  padding: 10px;
}
.title { 
  background: #fff url('../assets/wave_bg.png') repeat-x left bottom;
  text-align: center;
  color: #feae2c;
  padding: 0 10px;
  height: 50px;
  .txt {
    margin-left: -60px;
    display: inline-block;
    line-height: 46px;
    padding-left: 90px;
    background: url('../assets/trophy.svg') no-repeat center center ;
    background-size: 28px;
  }
}
.items {
  position: relative;
}
.item {
  color: #666;
  line-height: 26px;
  font-size: 14px;
  display: flex;
  justifyContent: center;
  span {
    flex: 1;
  }
  .amount {
    text-align: right;
  }
}
</style>