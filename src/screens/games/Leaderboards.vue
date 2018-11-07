<template>
  <div class="leaderbaord-container">
    <div v-if="loading && firstFetch" class="text-center p-t-lg">
      <InlineLoading></InlineLoading>
    </div>
    <div class="leaderbaord" v-else>
      <x-table full-bordered class="table">
        <thead>
          <tr>
            <td>彩种</td>
            <td>期数</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in listItems" :key="index">
            <td class="play text-center">
              <span v-if="item.type === 'in' || item.type === 'not_in'">{{item.type | typeFilter}} - {{item.title}}</span>
              <span v-else>{{item.title}} - {{item.type | typeFilter}}</span>
            </td>
            <td class="issue">
              {{item.num}}期
            </td>
          </tr>
        </tbody>
        </x-table>
      <divider>{{$t('misc.nomore_data')}}</divider>
    </div>
  </div>
</template>

<script>
import { Divider, XTable, InlineLoading } from 'vux'

export default {
  name: 'Leaderboards',
  props: {
    listItems: {
      type: Array
    },
    loading: {
      type: Boolean
    },
    firstFetch: {
      type: Boolean
    }
  },
  filters: {
    typeFilter (val) {
      switch (val) {
        case 'dragon':
          return '龙'
        case 'tiger':
          return '虎'
        case 'bigger':
          return '大'
        case 'smaller':
          return '小'
        case 'great':
          return '极大'
        case 'tiny':
          return '极小'
        case 'outOfDefinition':
          return '无极值'
        case 'odd':
          return '单'
        case 'even':
          return '双'
        case 'straight':
          return '顺子'
        case 'half_straight':
          return '半顺'
        case 'misc_six':
          return '杂六'
        case 'pair':
          return '对子'
        case 'leopard':
          return '豹子'
        case 'blue':
          return '蓝波'
        case 'red':
          return '红波'
        case 'green':
          return '绿波'
        case 'equal':
          return '和'
        case 'gold':
          return '金'
        case 'wood':
          return '木'
        case 'water':
          return '水'
        case 'fire':
          return '火'
        case 'earth':
          return '土'
        case 'front_part_more':
          return '前多'
        case 'rear_part_more':
          return '后多'
        case 'odd_more':
          return '单多'
        case 'even_more':
          return '双多'
        case 'smaller_odd':
          return '小单'
        case 'smaller_even':
          return '小双'
        case 'bigger_odd':
          return '大单'
        case 'bigger_even':
          return '大双'
        case 'east':
          return '东'
        case 'west':
          return '西'
        case 'south':
          return '南'
        case 'north':
          return '北'
        case 'zhong':
          return '中'
        case 'fa':
          return '发'
        case 'bai':
          return '白'
        case 'sumodd':
          return '合数单'
        case 'sumeven':
          return '合数双'
        case 'sumbigger':
          return '合数大'
        case 'sumsmaller':
          return '合数小'
        case 'tailbigger':
          return '尾大'
        case 'tailsmaller':
          return '尾小'
        case 'tailprime':
          return '尾质'
        case 'tailcomposite':
          return '尾合'
        case 'prime':
          return '质'
        case 'composite':
          return '合'
        case 'in':
          return '必出号码'
        case 'not_in':
          return '不出号码'
        default:
          return val
      }
    }
  },
  components: {
    Divider, XTable, InlineLoading
  }
}
</script>

<style lang="less" scoped>
@import '../../styles/vars.less';

.leaderbaord-container {
  height: 100%;
  overflow-y: hidden;
  .leaderbaord {
    height: 100%;
    overflow-y: auto;
  }
}

.table {
  background-color: #fff;
  .play, .issue {
    font-size: 18px;
  }
  .play {
    width: 60%;
    color: #4a4a4a;
  }
  .issue {
    color: @red;
  }
}

.no-data {
  width: 100%;
  height: calc(100vh / 2);
  line-height: calc(100vh / 2);
  font-size: 18px;
  color: #9b9b9b;
}

.vux-table {
  position: static;
}
</style>

