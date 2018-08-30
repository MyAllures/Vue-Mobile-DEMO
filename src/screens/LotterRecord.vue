<template>
  <div ref="recordBox" class="history-container">
    <table class="history-table">
      <tr v-if="lotteryTime"
        v-for="(schedule, scheduleIndex) in records.results"
        :key="'scheduleIndex' + scheduleIndex"
        class="row">
        <td class="show-time">
          <p class="periods-number"
            v-for="(fieldsObject, fieldsIndex) in lotteryNum"
            :key="'fieldsIndex' + fieldsIndex">
            {{schedule[fieldsObject.keyNum]}}
          </p>
          <p class="periods-time"
            v-for="(timeObject, timeIndex) in lotteryTime"
            :key="'timeIndex' + timeIndex">
            {{schedule[timeObject.keyTime] |dateFilter}}
          </p>
        </td>
        <td class="show-count">
          <div v-if="schedule.result_status === 'valid' && schedule.result_category">
            <div class="lottery-result"
              :class="{'luck-lottery': codeKl}"
              v-for="(num, index) in lotteryResult"
              :key="'lotteryResult' + index">
              <span v-for="(loteryData, lotteryIndex) in (schedule[num.key1]).split(',')"
              :key="'lotteryIndex' + lotteryIndex">
                <span v-if='gameCode != "bjkl8" && gameCode != "auluck8"'
                      :class="`lottery-${gameCode}-${~~loteryData}`">{{~~loteryData}}</span>
                <span v-if='gameCode === "bjkl8" || gameCode === "auluck8"'
                      :class="[`lottery-${gameCode}-${~~loteryData}`, 'bjkl-class']">{{~~loteryData}}</span>
              </span>
            </div>
            <div v-if="!codeKl" class="compare-content">
              <span class="lottery-compare"
                v-for="(subHead, index) in lotteryCompare"
                :key="'subHead' + index">
                {{schedule.result_category[subHead.key] | changeDataType}}
              </span>
            </div>
          </div>
          <div class="invalid text-center" v-else>官方开奖无效</div>
        </td>
      </tr>
      <tr class="condition text-center" v-if="loading">
        <inline-loading></inline-loading>
      </tr>

      <tr class="condition" v-else>
        <x-button v-if="(pagination.total > records.results.length)"
          type="default"
          action-type="button"
          class="add-more"
          @click.native="addMore">
          <inline-loading v-if="addMoreLoading"></inline-loading>
          <span v-else>{{$t('misc.load_more')}}</span>
        </x-button>

        <div class="no-more" v-else>
          <span v-if="!nowGameTable.table">暂无资料</span>
          <span v-else>{{$t('misc.no_more')}}</span>
        </div>
      </tr>
    </table>
  </div>
</template>

<script>
import { XHeader, Flexbox, FlexboxItem, XAddress, Datetime, dateFormat, PopupRadio, TabItem, Group, XInput, XButton, Box, InlineLoading } from 'vux'
import { getGameHistoryData } from '../api'
import _ from 'lodash'

export default {
  props: {
    gameCode: {
      type: String,
      required: true
    },
    currentGame: {
      type: Object
    },
    date: {
      type: String
    }
  },
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
        code: 'csffc',
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
        code: 'luckdd',
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
        code: 'luckl',
        table: hklTable
      },
      {
        code: 'fc3d',
        table: fc3dTable
      }
    ]

    return {
      records: { results: [] },
      codeKl: false,
      gameTable,
      nowGameTable: '',
      lotteryTime: '',
      lotteryNum: '',
      lotteryResult: '',
      lotteryCompare: '',
      pagination: {
        total: 0,
        offset: 0
      },
      addMoreLoading: false
    }
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
  created () {
    this.initRecords()
  },
  watch: {
    'currentGame': function () {
      this.initRecords()
    },
    'date': function (date) {
      this.initRecords()
    }
  },
  methods: {
    initRecords () {
      this.records.results = []
      this.pagination = {
        offset: 0,
        total: 0
      }
      this.getGameRecords()
    },
    getGameRecords () {
      if (this.loading) {
        return
      }
      this.loading = true
      let data = {
        gameCode: this.gameCode,
        limit: 30,
        offset: this.pagination.offset,
        time: this.date
      }
      this.nowGameTable = _.find(this.gameTable, item => {
        return item.code === this.gameCode
      })

      if (!this.nowGameTable || !this.nowGameTable.table) {
        this.loading = false
        return
      }

      getGameHistoryData(data).then((response) => {
        this.pagination.total = response.count

        this.codeKl = false
        this.records = response

        if (this.gameCode === 'auluck8' || this.gameCode === 'bjkl8') {
          this.codeKl = true
        }

        this.lotteryNum = this.nowGameTable.table[0].subNum
        this.lotteryTime = this.nowGameTable.table[1].subTime
        this.lotteryResult = this.nowGameTable.table[2].resultNum

        if (this.gameCode !== 'auluck8' || this.gameCode !== 'bjkl8') {
          this.lotteryCompare = this.nowGameTable.table[3].subHeads
        }

        this.loading = false
        this.$refs.recordBox && this.$refs.recordBox.scrollIntoView()
      })
    },
    addMore () {
      if (this.loading) {
        return
      }
      this.addMoreLoading = true
      this.pagination.offset += 30

      let data = {
        gameCode: this.gameCode,
        limit: 30,
        offset: this.pagination.offset,
        time: this.date
      }

      getGameHistoryData(data).then((response) => {
        this.pagination.total = response.count
        this.records.results.push(...response.results)
        this.addMoreLoading = false
      })
    }
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
    Group,
    XInput,
    XButton,
    Box,
    InlineLoading
  }
}
</script>
<style lang="less" scoped>
.smaller320(@rules) {
  @media (max-width: 321px) { @rules(); }
}
.history-container {
  height: calc(~"100% - "40px);
}
.history-table {
  display: inline-block;
  width: 100%;
  height: 100%;
  overflow: auto;
  border-collapse: collapse;
  .condition {
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    padding: 5px;
    border-bottom: 1px solid #ddd;
  }
  .row {
    display: flex;
    background-color: #fff;
    border-bottom: 1px solid #ddd;
  }
}

.show-time {
  box-sizing: border-box;
  flex: 0 0 100px;
  width: auto;
  height: 50px;
  padding: 0px 5px;
  border-right: 1px solid #dcd9d9;
  .periods-number {
    width: 100%;
    line-height: 38px;
    font-size: 14px;
    text-align: center;
    height: 25px;
  }
  .periods-time {
    color: #999;
    width: 100%;
    line-height: 25px;
    text-align: center;
    height: 25px;
    font-size: 13px;
  }
}


.show-count {
  flex: 1 0 auto;
  height: 50px;
  .lottery-result {
    width: 100%;
    height: 25px;
    text-align: center;
    color: #327bce;
    line-height: 25px;
    .bjkl-class {
      margin-top: 0px;
    }
  }
  .luck-lottery {
    height: 50px;
    width: 270px;
    margin:  0 auto;
    overflow: hidden;
  }
  .lottery-compare {
    color: #999;
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
}

.add-more, .no-more{
  position: relative;
  font-size: 14px;
}

.no-more {
  text-align: center;
  color: #666;
}

.invalid {
  line-height: 50px;
}

.jspbg {
  display: inline-block;
  margin-top: 8px;
  width: 20px;
  height: 20px;
  background: url("../assets/ball-pk.png") no-repeat;
  margin-right: 1px;
  background-size: 20px 210px;
  text-indent: -9999px;
  .smaller320({
    margin-right: -3px;
  });
}

@racinggames:
  jspk10 10,
  bcr 10 ,
  mlaft 10,
  er75ft 10;

.racinggames-loop(@gameindex: length(@racinggames)) when (@gameindex > 0) {

  @device: extract(@racinggames, @gameindex);
  @name:   extract(@device, 1);
  @size:   extract(@device, 2);

  .number-loop(@num: @size) when (@num > 0) {
    .lottery-@{name}-@{num} {
      &:extend(.jspbg);
      background-position: 0 -21px * (@num - 1) ;
    }
    .number-loop(@num - 1);
  }

  .number-loop();
  .racinggames-loop(@gameindex - 1);
}

.racinggames-loop();

.plainball {
  display: inline-block;
  width: 22px;
  height: 22px;
  line-height: 22px;
  background: radial-gradient(circle at 5px 5px, #fff, #ccc);
  border-radius: 100%;
  text-align: center;
  color: #333;
  margin-top: 4px;
  font-weight: normal;
  font-size: 14px;
}

@plainballgames:
  tjssc 10,
  xjssc 10 ,
  cqssc 10,
  jsssc 10,
  csffc 10,
  pcdd 27,
  luckdd 27,
  bjkl8 80,
  auluck8 80,
  gd11x5 11,
  gdklsf 20,
  jnd28 27,
  cqlf 20,
  fc3d 9;

.plaingames-loop(@gameindex: length(@plainballgames)) when (@gameindex > 0) {

  @device: extract(@plainballgames, @gameindex);
  @name:   extract(@device, 1);
  @size:   extract(@device, 2);

  .number-loop(@num: @size) when (@num >= 0) {
    .lottery-@{name}-@{num} {
      &:extend(.plainball);
    }
    .number-loop(@num - 1);
  }

  .number-loop();
  .plaingames-loop(@gameindex - 1);
}

.plaingames-loop();

.jsk3-dice {
  display: inline-block;
  background: url(../assets/ball_4.png) no-repeat;
  background-size: 27px 162px;
  width: 27px;
  height: 27px;
  margin-top: 3px;
  text-indent: -9999px;
  margin-right: 5px;
}


.jsk3-loop(@i: 6) when (@i > 0) {
  .jsk3-loop(@i - 1);
  .lottery-jsk3-@{i} {
    &:extend(.jsk3-dice);
    background-position: 0 (-27px * (@i - 1));
  }
}

.jsk3-loop();

.hk6ball {
  display: inline-block;
  width: 28px;
  height: 28px;
  margin-top: 4px;
  margin-left: 5px;
  background-image: url('../assets/ball_hk6.png');
  background-size: 28px 1372px;
  vertical-align: middle;
  text-indent: -9999px;
}

.hkl-if(@i) when (@i < 10) {
    .luckl-0@{i},
    .hkl-0@{i} {
      &:extend(.hk6ball);
      background-position: 0 (-28px * (@i - 1));;
    }
  }

.hk6-loop(@i) when (@i < 50) {
  .hk6-loop(@i + 1);
  .hkl-if(@i);
  .lottery-luckl-@{i},
  .lottery-hkl-@{i} {
    &:extend(.hk6ball);
    background-position: 0 (-28px * (@i - 1));;
  }
}

.hk6-loop(1);
</style>
