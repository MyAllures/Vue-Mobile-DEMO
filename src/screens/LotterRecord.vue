<template>
  <div>
    <x-header  class='lottery-header'>
      {{$t('misc.lotteryResult')}}
      <a v-if='$route.name === "LotterRecord"' slot="right">
        <icon scale="1" class='icon repeat-icon' @click.native='refresh' name="repeat"></icon>
      </a>
    </x-header>
    <div class="record-box">
      <div class="choose-head">
        <group class="choose-type">
          <popup-radio :options="gameList" v-model="game">
            <template slot-scope="props" slot="each-item">
              <p>
                <span style="color:#666;">{{ gameList[props.index] }}</span>
              </p>
            </template>
          </popup-radio>
        </group> 
        <group class="choose-date">
          <icon class='icon calendars' scale="1" name="calendar"></icon>
          <datetime v-model="dataTime" @on-change="change"></datetime>
        </group>
      </div>
      <table>
        <tr v-if='lotteryTime' v-for='(schedule, scheduleIndex) in dataNum.results'>
          <td class="showTime">
            <p class="periodsNumber" v-for="(fieldsObject, fieldsIndex) in lotteryNum">
              {{schedule[fieldsObject.keyNum]}}
            </p>
            <p class="periodsTime" v-for="(timeObject, timeIndex) in lotteryTime">
              {{schedule[timeObject.keyTime] |dateFilter}}
            </p>
          </td>
          <td class="showCount">
            <div>
              <div class="lotteryResult" v-bind:class="{luckLotery: codeKl}" v-for="num in lotteryResult">
                <span    
                  v-for='(loteryData, loteryIndex) in (schedule[num.key1]).split(",")'>
                  <!-- transformetable -->
                  <span
                    v-if='codeType === "jspk10" || codeType === "bcr" || codeType === "mlaft" || codeType === "er75ft"'
                    :style="{background: 'url('+ '/src/assets/ball-pk.png' +')',
                    backgroundPositionY: -(loteryData-1) * 21 + 'px'}"
                    class="loteryBg jspBg">{{loteryData}}</span>

                  <!-- 0开始^^^ball2 jsssc  cqssc pcdd xjssc tjssc jnd28-->
                   <span 
                    v-if='codeType === "jsssc" || codeType === "cqssc" || codeType === "pcdd" || codeType === "xjssc" || codeType === "tjssc" || codeType === "jnd28"'
                    class="loteryBg sscBg">{{~~loteryData}}</span>

                  <!-- 1开始 gdklsf  gd11x5 fc3d-->
                  <span 
                    v-if='codeType === "gdklsf" || codeType === "gd11x5" || codeType === "fc3d"'
                    class="loteryBg sscBg">{{~~loteryData}}</span>

                  <!-- cqlf -->
                  <span 
                    v-if='codeType === "cqlf"'
                    class="loteryBg sscBg">{{~~loteryData}}</span>

                  <!-- jsk3 -->
                  <span 
                    v-if='codeType === "jsk3"'
                    :style="{background: 'url('+ '/src/assets/ball_4.png' +')',
                    backgroundPositionY: - (loteryData - 1) * 27 + 'px'}"
                    class="loteryBg jsk3">{{loteryData}}</span>  

                  <!-- hkl -->
                  <span 
                    v-if='codeType === "hkl"'
                    :style="{background: 'url('+ '/src/assets/ball_hk6.png' +')',
                    backgroundPositionY: - (loteryData - 1) * 27 + 'px'}"
                    class="loteryBg hkl">{{~~loteryData}}</span> 

                  <!-- bjkl8 auluck8 -->
                  <span 
                    v-if='codeType === "bjkl8" || codeType === "auluck8"'
                    class="loteryBg auluck">{{~~loteryData}}</span> 
                </span>
              </div>
              <div v-if='!codeKl' class="compareContent">
                <span class="lotteryCompare" v-for="subHead in lotteryCompare">
                  {{schedule.result_category[subHead.key] |changeDataType}}
                </span>
              </div>
            </div>            
          </td> 
        </tr>
      </table>
      <div class="addMore" @click='addMore' v-if="firstLimit >= 30">{{$t('misc.load_more')}}</div>
      <divider class="noMore" v-if="firstLimit < 30">{{$t('misc.no_more')}}</divider>
    </div>
  </div>
</template>
<script>
import {XHeader, Flexbox, FlexboxItem, Datetime, dateFormat, PopupRadio, TabItem, Group, XInput, Divider} from 'vux'
import { fetchGames, getGameData } from '../api'
import _ from 'lodash'
import Icon from 'vue-awesome/components/Icon'

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
      game: '',
      gameList: [{
        code: '',
        display_name: ''
      }],
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
      lotteryTime: '',
      lotteryNum: '',
      lotteryResult: '',
      lotteryCompare: ''
    }
  },
  created () {
    fetchGames().then((response) => {
      this.games = response
      if (!response) {
        return
      }
      response.forEach((game, i) => {
        this.gameList[i] = game.display_name
      })
      this.game = this.gameList[0]
      this.codeType = this.games[0].code
    })
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
    game (val) {
      this.limit = 0
      document.getElementById('vux_view_box_body').scrollTop = 0
      for (let i = 0, l = this.games.length; i < l; i++) {
        if (this.games[i].display_name === val) {
          this.codeType = this.games[i].code
          this.getGameList()
        }
      }
    }
  },
  methods: {
    change (value) {
      this.dataTime = value
      this.getGameList()
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
      document.getElementById('vux_view_box_body').scrollTop = 0
    }
  },
  components: {
    XHeader,
    Flexbox,
    FlexboxItem,
    Datetime,
    PopupRadio,
    dateFormat,
    TabItem,
    Icon,
    Group,
    XInput,
    Divider
  }
}
</script>
<style lang="scss">
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
  background: white;
  .vux-no-group-title{
    margin-top: 0;
  }
  .choose-head {
    position: fixed;
    z-index: 100;
    width: 100%;
    top: 46px;
  }
  .choose-type{
    width: 40%;
    float: left;
    border-bottom: solid 1px #b5aaaa; 
    .vux-cell-value {
      color: #327bce;
      font-size: 14px;
    }
    .weui-cell {
      padding: 10px;
    }
    .weui-cell_access .weui-cell__ft:after {
      transform: matrix(0.71, 0.71, 0.71, -0.71, 0, 0);
      right: -4px;
    }
    .vux-cell-primary {
      display: none;
    }
  }
  .choose-date {
    position: relative;
    width: 60%;
    float: left;
    border-bottom: solid 1px #b5aaaa; 
    .calendars {
      position: absolute;
      top: 13px;
      left: 10px;
      color: #ccc;
    }
    .vux-cell-value {
      margin-left: 16px;
    }
    .weui-cell__ft {
      text-align: left;
    }
    .weui-cell_access .weui-cell__ft:after {
      transform: matrix(0, 0, 0, 0, 0, 0);
    }
    .lucky {
      display: block; 
      width: 80%; 
    }
  }
  .noList {
    position: relative;
    top: 44px;
    text-align: center;
    background: #FFFFFF
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
  .showTime {
    width: 25%;
    height: 50px;
    border-right: 1px solid #dcd9d9;
    border-bottom: 1px solid #f3ecec;
  }
  .periodsNumber {
    width: 100%;
    line-height: 38px;
    font-weight: 500;
    font-size: 14px;
    text-align: center;
    height: 25px;
  }
  .periodsTime {
    width: 100%;
    line-height: 25px;
    text-align: center;
    height: 25px;
    font-size: 13px;
  }
  .showCount {
    width: 70%;
    height: 50px;
    border-bottom: 1px solid #f3ecec;
  }
  .lotteryResult {
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
  .lotteryCompare {
    width: 100%;
    height: 25px;
    text-align: center;
    line-height: 25px;
    margin-right: 5px;
    font-size: 14px;
  }
  .compareContent {
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
  .addMore, .noMore{
      text-align: center;
      position: relative;
      top: 44px;
      font-size: 14px;
      background: #f1f1f1;
      margin-bottom: 40px;
      line-height: 34px;
    }
  .loteryBg {    
    display: inline-block; 
  }
  .jspBg {
    margin-top: 8px;
    width: 20px;
    height: 20px;
    margin-right: 1px; 
    background-size: 20px 20px;
    text-indent: -9999px;
  }
  .sscBg{
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
  .cqlfBg {
    margin-top: 4px;
    width: 24px;
    height: 24px;
  }
  .hkl {
    width: 25px;
    height: 25px;
    margin-top: 5px;
    text-indent: -9999px;
  }
  .jsk3 {
    margin-top: 3px;
    width: 27px;
    height: 27px;
    text-indent: -9999px;
  }
  .auluck {
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
}
@media (max-width: 350px) {
  .record-box {
    .jspBg {
      margin-right: -2px;
    }
    .lotteryCompare{
      margin-right: 2px;
    }
    .sscBg {
      margin-right: -3px;
    }
  }
}
</style>
