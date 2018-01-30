<template>
  <div>
    <x-header  class='lottery-header'>
      {{$t('misc.lotteryResult')}}
      <a v-if='$route.name === "LotterRecord"' slot="right">
        <icon scale="1" class='icon repeat-icon' @click.native='refresh' name="repeat"></icon>
      </a>
    </x-header>
    <div ref="recordBox" class="record-box results" :style="{height: resultsH + 'px'}">
      <div class="choose-head">
        <group class="choose-type">
          <div class="current-game" @click='selectGame()'>
            <span>{{currentGame.display_name}}</span>
            <span class="arrow"></span>
          </div>
          <x-address 
            style="display:none;" 
            title="title" 
            v-model="currentGameId" 
            :list="gameLists" 
            :show.sync="showGameMenu">
          </x-address>
        </group> 
        <group class="choose-date">
          <icon class='icon calendars' scale="1" name="calendar"></icon>
          <datetime v-model="dataTime" @on-change="change"></datetime>
        </group>
      </div>
      <table class="results">
        <tr v-if='lotteryTime' v-for='(schedule, scheduleIndex) in dataNum.results'>
          <td class="show-time">
            <p class="periods-number" v-for="(fieldsObject, fieldsIndex) in lotteryNum">
              {{schedule[fieldsObject.keyNum]}}
            </p>
            <p class="periods-time" v-for="(timeObject, timeIndex) in lotteryTime">
              {{schedule[timeObject.keyTime] |dateFilter}}
            </p>
          </td>
          <td class="show-count">
            <div>
              <div class="lottery-result" v-bind:class="{luckLotery: codeKl}" v-for="num in lotteryResult">
                <span v-for='(loteryData, loteryIndex) in (schedule[num.key1]).split(",")'>
                  <span v-if='codeType != "bjkl8" && codeType != "auluck8"' 
                        :class="`lottery_${codeType}_${~~loteryData}`">{{~~loteryData}}</span>
                  <span v-if='codeType === "bjkl8" || codeType === "auluck8"' 
                        :class="`lottery_${codeType}_${~~loteryData}`">{{~~loteryData}}</span>
                </span>
              </div>
              <div v-if='!codeKl' class="compare-content">
                <span class="lottery-compare" v-for="subHead in lotteryCompare">
                  {{schedule.result_category[subHead.key] |changeDataType}}
                </span>
              </div>
            </div>            
          </td> 
        </tr>
      </table>
      <box gap="10px 10px">
        <x-button v-if="firstLimit >= 30"
                  type="primary"
                  class="add-more"
                  @click.native='addMore'>
          <span>{{$t('misc.load_more')}}</span>
        </x-button>
        <div class="no-more" v-else>{{$t('misc.no_more')}}</div>
      </box>
    </div>
  </div>
</template>
<script>
import {XHeader, Flexbox, FlexboxItem, XAddress, Datetime, dateFormat, PopupRadio, TabItem, Group, XInput, XButton, Box} from 'vux'
import { getGameData } from '../api'
import _ from 'lodash'
import Icon from 'vue-awesome/components/Icon'
import 'vue-awesome/icons/calendar'
import 'vue-awesome/icons/repeat'
import { mapGetters } from 'vuex'

export default {
  data () {
    const TransformerTable =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_1st_2st'
            },
            {
              displayName: '大小',
              key: 'sum_of_1st_2st_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_1st_2st_odd_even'
            },
            {
              displayName: '',
              key: 'dragon_tiger_1_10'
            },
            {
              displayName: '',
              key: 'dragon_tiger_2_9'
            },
            {
              displayName: '',
              key: 'dragon_tiger_3_8'
            },
            {
              displayName: '',
              key: 'dragon_tiger_4_7'
            },
            {
              displayName: '',
              key: 'dragon_tiger_5_6'
            }
          ]
        }
      ]

    const sscTable =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '龙虎',
              key: 'dragon_tiger_1_5'
            }
          ]
        }
      ]

    const cqlfTable =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '尾大小',
              key: 'sum_of_ball_tail_than_size'
            }
          ]
        }
      ]

    const pcddTable =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            }
          ]
        }
      ]

    const jsk3Table =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          displayName: '总和',
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            }
          ]
        }
      ]

    const gd11x5Table =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '尾大小',
              key: 'sum_of_ball_tail_than_size'
            },
            {
              displayName: '龙虎',
              key: 'dragon_tiger_1_5'
            }
          ]
        }
      ]

    const bjkl8Table =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          subHeads: [
            {}
          ]
        }
      ]

    const hklTable =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          subHeads: [
            {
              displayName: '号码',
              key: 'sum_of_ball'
            },
            {
              displayName: '单双',
              key: 'sum_of_ball_odd_even'
            },
            {
              displayName: '大小',
              key: 'sum_of_ball_than_size'
            },
            {
              displayName: '七色波',
              key: 'seven_color_wavelength'
            }
          ]
        }
      ]

    const fc3dTable =
      [
        {
          subNum: [
            {
              displayName: '期数',
              keyNum: 'issue_number'
            }
          ]
        },
        {
          subTime: [
            {
              displayName: '时间',
              keyTime: 'schedule_result'
            }
          ]
        },
        {
          resultNum: [
            {
              displayName: '开奖号码',
              key1: 'result_str'
            }
          ]
        },
        {
          subHeads: [
            {
              displayName: '号码',
              key: 'three_balls_sum'
            },
            {
              displayName: '',
              key: 'ball_odd_even_1'
            },
            {
              displayName: '',
              key: 'ball_odd_even_2'
            },
            {
              displayName: '',
              key: 'ball_odd_even_3'
            }
          ]
        }
      ]

    const gameTable = [
      {
        code: 'jspk10',
        table: TransformerTable
      },
      {
        code: 'bcr',
        table: TransformerTable
      },
      {
        code: 'mlaft',
        table: TransformerTable
      },
      {
        code: 'er75ft',
        table: TransformerTable
      },
      {
        code: 'cqssc',
        table: sscTable
      },
      {
        code: 'jsssc',
        table: sscTable
      },
      {
        code: 'xjssc',
        table: sscTable
      },
      {
        code: 'tjssc',
        table: sscTable
      },
      {
        code: 'cqlf',
        table: cqlfTable
      },
      {
        code: 'gdklsf',
        table: cqlfTable
      },
      {
        code: 'pcdd',
        table: pcddTable
      },
      {
        code: 'jnd28',
        table: pcddTable
      },
      {
        code: 'jsk3',
        table: jsk3Table
      },
      {
        code: 'gd11x5',
        table: gd11x5Table
      },
      {
        code: 'bjkl8',
        table: bjkl8Table
      },
      {
        code: 'auluck8',
        table: bjkl8Table
      },
      {
        code: 'hkl',
        table: hklTable
      },
      {
        code: 'fc3d',
        table: fc3dTable
      }
    ]

    return {
      game: [],
      gameLists: [],
      currentGameId: [],
      dataTime: '',
      codeType: '',
      limit: 30,
      firstLimit: 30,
      games: '',
      dataNum: {
        count: '',
        next: '',
        results: {
          issue_number: '',
          result_str: '',
          schedule_result: ''
        }
      },
      codeKl: false,
      gameTable,
      nowGameTable: '',
      showGameMenu: false,
      lotteryTime: '',
      lotteryNum: '',
      lotteryResult: '',
      lotteryCompare: ''
    }
  },
  computed: {
    resultsH () {
      return (document.documentElement.clientHeight || document.body.clientHeight) - 46 - 53
    },
    ...mapGetters([
      'allGames'
    ]),
    currentGame () {
      let code = _.find(this.allGames, game => (game.id + '') === this.currentGameId[0])
      return code || { display_name: '请选择' }
    }
  },
  created () {
    let data = new Date()
    data = dateFormat(new Date(data), 'YYYY-MM-DD')
    this.dataTime = data
  },
  filters: {
    dateFilter (value) {
      return dateFormat(new Date(value), 'MM-DD HH:mm')
    },
    changeDataType (val) {
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
        case 'prime':
          return '质'
        case 'composite':
          return '合'
        default:
          return val
      }
    }
  },
  watch: {
    'allGames': function (allGames) {
      const played = localStorage.getItem('lastGame')
      this.currentGameId = played ? [played] : [allGames[0].id + '']
      _.each(this.allGames, (game) => {
        this.gameLists.push(
          {
            name: game.display_name,
            value: game.id + '',
            code: game.code
          }
        )
      })
    },
    currentGame () {
      this.limit = 0
      this.$refs.recordBox.scrollTop = 0
      this.gameLists.forEach((game, i) => {
        if (this.currentGame.display_name === game.name) {
          this.codeType = game.code
          this.getGameList()
        }
      })
    }
  },
  methods: {
    change (value) {
      this.dataTime = value
      this.getGameList()
    },
    selectGame () {
      this.showGameMenu = true
    },
    getGameList () {
      getGameData(this.codeType, this.dataTime).then((response) => {
        this.firstLimit = response.results.length
        this.codeKl = false
        this.dataNum = response
        this.nowGameTable = _.find(this.gameTable, item => {
          return item.code === this.codeType
        })
        if (this.codeType === 'auluck8' || this.codeType === 'bjkl8') {
          this.codeKl = true
        }
        this.lotteryNum = this.nowGameTable.table[0].subNum
        this.lotteryTime = this.nowGameTable.table[1].subTime
        this.lotteryResult = this.nowGameTable.table[2].resultNum
        if (this.codeType !== 'auluck8' || this.codeType !== 'bjkl8') {
          this.lotteryCompare = this.nowGameTable.table[3].subHeads
        }
      })
    },
    addMore () {
      if (this.dataNum.count > this.limit || this.dataNum.count < this.limit + 30) {
        this.limit += 30
      } else {
        this.limit += this.dataNum.cout - this.limit
      }
      getGameData(this.codeType, this.dataTime, this.limit).then((response) => {
        this.firstLimit = response.results.length
        this.dataNum.results.push(...response.results)
      })
    },
    refresh () {
      this.getGameList()
      this.$refs.recordBox.scrollTop = 0
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$store.dispatch('fetchGames')
    })
  },
  components: {
    XHeader,
    XAddress,
    Flexbox,
    FlexboxItem,
    Datetime,
    PopupRadio,
    dateFormat,
    TabItem,
    Icon,
    Group,
    XInput,
    XButton,
    Box
  }
}
</script>
<style lang="scss" scoped>
.results {
  overflow-y: scroll;
}
.lottery-header {
  position: fixed;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 46px;
  .repeat-icon {
    color: #FFFFFF;
  }
}
.record-box{
  background: #f1f1f1;
  .choose-head {
    position: fixed;
    z-index: 100;
    width: 100%;
    top: 26px;
    border-bottom: solid 1px #b5aaaa;
    .choose-type{
      width: 40%;
      float: left;
      .current-game {
        width: 100%;
        display: inline-block;
        line-height: 44px;
        text-indent: 10px;
        height: 44px;
        color: #156fd8;
      }
      .arrow {
        display: inline-block;
        height: 6px;
        width: 6px;
        border-width: 2px 2px 0 0;
        border-color: #C8C8CD;
        border-style: solid;
        transform: rotate(135deg);
        margin-left: 3px;
        margin-bottom: 2px;
      }
    }
    .choose-type /deep/ .weui-cell__hd {
      display: none;
    }
    .choose-type /deep/ .vux-cell-bd {
      display: none;
    }
    .choose-type /deep/ .weui-cell_access .weui-cell__ft:after {
      transform: matrix(0.71,0.71, 0.71, -0.71, 0, 0);
      right:-4px;
    }
    .choose-type /deep/ .vux-cell-value {
      color: #156fd8;
      font-size: 16px;
      font-weight: 400;
    }
  }
  .choose-date {
    position: relative;
    width: 60%;
    float: left;
    .calendars {
      position: absolute;
      top: 13px;
      left: 10px;
      color: #ccc;
    }
    .lucky {
      display: block; 
      width: 80%; 
    }
  }
  .choose-date /deep/ .vux-cell-value {
      display: block;
      text-align: left;
      text-indent: 20px;
  }
  .choose-date /deep/ .weui-cell_access .weui-cell__ft:after {
      transform: matrix(0, 0, 0, 0, 0, 0);
  }
  .periods {
    text-align: center;
    font-size: 14px;
  }
  .periods-list {
    color: #327bce;
    font-weight: bold;
  }
  .blod {
    font-weight: bold;
  }
  .periods-right {
    border-right: 1px solid #c3bbbb;
  }
  .vux-flex-row {
    border-bottom: 0.5px solid #e8dcdc;
  }
  .show-time {
    width: 25%;
    height: 50px;
    border-right: 1px solid #dcd9d9;
    border-bottom: 1px solid #f3ecec;
  }
  .periods-number {
    width: 100%;
    line-height: 38px;
    font-weight: 500;
    font-size: 14px;
    text-align: center;
    height: 25px;
  }
  .periods-time {
    width: 100%;
    line-height: 25px;
    text-align: center;
    height: 25px;
    font-size: 13px;
  }
  .show-count {
    width: 70%;
    height: 50px;
    border-bottom: 1px solid #f3ecec;
  }
  .lottery-result {
    width: 100%;
    height: 25px;
    text-align: center;
    color: #327bce;
    line-height: 25px;
  }
  .luckLotery {
    height: 50px;
    width: 230px;
    margin:  0 auto;
    overflow: hidden;
  }
  .lottery-compare {
    width: 100%;
    height: 25px;
    text-align: center;
    line-height: 25px;
    margin-right: 5px;
    font-size: 14px;
  }
  .compare-content {
    width: 100%;
    line-height: 25px;
    height: 25px;
    text-align: center;
  }
  table {
    width: 100%;
    overflow: hidden;
    position: relative;
    background: #FFFFFF;
    top: 44px;
    border-collapse:collapse;
  }
  .add-more, .no-more{
    position: relative;
    top: 44px;
    font-size: 14px;
    margin-bottom: 10px;
  }
  .no-more {
    text-align: center;
    color: #ccc;
  }
}

$transformetable: jspk10, bcr, mlaft, er75ft;
%jspbg {
  display: inline-block; 
  margin-top: 8px;
  width: 20px;
  height: 20px;
  background: url("../assets/ball-pk.png") no-repeat;
  margin-right: 1px; 
  background-size: 20px 210px;
  text-indent: -9999px;
}
@each $game in $transformetable{
  @for $i from 0 through 9 {
    .lottery_#{$game}_#{$i+1} {
      @extend %jspbg;
      background-position-y:(-21px * $i);
    }
  }
}

%hklbg {
  display: inline-block; 
  width: 25px;
  height: 25px;
  margin-top: 5px;
  background: url("../assets/ball_hk6.png") no-repeat;
  text-indent: -9999px;
}
@for $i from 1 through 49 {
  .lottery_hkl_#{$i+1} {
    @extend %hklbg;
    background-position-y:(-27px * $i);
  }
}
%jskbg {
  display: inline-block;
  margin-top: 3px;
  width: 27px;
  height: 27px;
  text-indent: -9999px;
  background: url("../assets/ball_4.png") no-repeat;
}
@for $i from 0 through 5 {
  .lottery_jsk3_#{$i+1} {
    @extend %jskbg;
    background-position-y:(-27px * $i);
  }
}

$bjklbgtable: bjkl8, auluck8;
%bjklbg {
  display: inline-block;
  margin-top: 4px;
  border-radius: 100%;
  text-align: center;
  width: 18px;
  height: 18px;
  font-size: 12px;
  line-height: 18px;
  color: black;
  background: radial-gradient(circle at 5px 5px, #fff, #ccc);
}
@each $game in $bjklbgtable {
  @for $i from 1 through 80 {
    .lottery_#{$game}_#{$i} {
      @extend %bjklbg;
    }
  }
}
$anothertable: ball2, jsssc, cqssc, pcdd, xjssc, tjssc, jnd28, gdklsf, gd11x5, fc3d, cqlf;
%anotherbg {
  display: inline-block;
  margin-top: 4px;
  border-radius: 100%;
  background: radial-gradient(circle at 5px 5px, #fff, #ccc);
  height: 22px;
  width:22px;
  color: black;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  margin-bottom: 1px; 
}
@each $game in $anothertable {
  @for $i from 0 through 20 {
    .lottery_#{$game}_#{$i} {
      @extend %anotherbg;
    }
  }
}
@media (max-width: 350px) {
  $transformetable: jspk10, bcr, mlaft, er75ft;
  @each $game in $transformetable{
    @for $i from 0 through 9 {
      .lottery_#{$game}_#{$i+1} {
        margin-right: -2px;
      }
    }
  }
}
</style>