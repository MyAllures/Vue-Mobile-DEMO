<template>
  <div v-transfer-dom>
    <div class="guide">
      <p class="title">添加到主屏幕，下次一键启动</p>
      <ul class="steps">
        <li class="step" data-count="1">点击正下方 <img class="share-img" src="../assets/safariguide/share_action.png" alt="share"/></li>
        <li class="step" data-count="2">
          右滑找到并点击「添加到主屏幕」
          <img class="add-screen-img" src="../assets/safariguide/add_to_screen.png" alt="screen"/>
        </li>
        <li class="step" data-count="3">
          点击右上角「添加」
          <img class="confirm-add-img" src="../assets/safariguide/confirm_toadd.jpg" alt="confirm"/>
        </li>
        <li class="step" data-count="4">
          下次可直接从主屏幕的图标一键启动网站
          <div class="app-entry">
            <div class="ellipse">
              <span class="domain">{{domain}}</span>
            </div>
            <img class="logo" :src="require(`../assets/favicon/${company === 2 ? '75ue_2' : 'default'}.png`)" alt="com"/>
          </div>
        </li>
      </ul>
      <div class="arrow-wrapper">
        <img class="arrow-img" src="../assets/safariguide/arrow.png" alt="down"/>
      </div>
      <a class="close" @click="handleClose">
        <x-icon type="ios-close-empty" size="24"></x-icon>
        <span class="text">不再提示</span>
      </a>
    </div>
  </div>
</template>

<script>
import {TransferDom} from 'vux'

export default {
  directives: {
    TransferDom
  },
  data () {
    return {
      company: window.company,
      domain: window.location.host
    }
  },
  created () {
    document.body.classList.add('dialog-open')
  },
  methods: {
    handleClose () {
      this.$emit('handleSafariQuickGuideClose')

      sessionStorage.setItem('hasClosedQuickGuide', 'true')
      document.body.classList.remove('dialog-open')
    }
  }
}
</script>

<style lang="scss" scoped>
$zIndex: 5000;

.title {
  color: #fea301;
  font-size: 20px;
  text-align: center;
  margin-bottom: 10px;
}

.steps {
  color: #fff;
  font-size: 14px;
}

.step {
  margin-bottom: 8px;
  &::before {
    content: attr(data-count);
    display: inline-block;
    width: 28px;
    height: 28px;
    line-height: 28px;
    background-color: #fea301;
    border-radius: 50%;
    text-align: center;
    margin-right: 5px;
    font-size: 18px;
  }
}

.guide {
  position: fixed;
  box-sizing: border-box;
  padding: 10px 40px;
  height: 90%;
  width: 100%;
  background-color: rgba(0,0,0, .7);
  bottom: 0;
  left: 0;
  z-index: $zIndex + 1;
}

.close {
  color: #fff;
  position: absolute;
  right: 20px;
  bottom: 20px;
  font-size: 14px;
  svg, .text {
    vertical-align: middle
  }
  svg {
    display: inline-block;
    fill: #fff;
  }
  .text{
    margin-left: -5px;
  }

  &:active {
    color: #fea301;
    svg {
      fill: #fea301;
    }
  }
}

.share-img {
  height: 36px;
  vertical-align: middle;
}

.add-screen-img {
  display: block;
  height: 60px;
  margin: 0 auto;
  margin-top: 5px;
}

.confirm-add-img {
  display: block;
  margin: 0 auto;
  width: 95%;
  margin-top: 5px;
}

.app-entry {
  position: relative;
  display: block;
  margin: 0 auto;
  height: 45px;
  width: 45px;
  border-radius: 5px;
  background-color: #fff;
  margin-top: 5px;
  overflow: hidden;
  text-align: center;
  .ellipse {
    position: relative;
    left: -10%;
    top: -15px;
    height: 30px;
    width: 120%;
    background: #fea301;
    clip-path: ellipse(50% 40% at 50% 50%);
  }

  .logo {
    display: inline-block;
    position: relative;
    top: -17px;
    height: 30px;
  }

  .domain {
    color: #fff;
    position: relative;
    display: block;
    font-size: 12px;
    left: 0px;
    transform: scale(0.7);
    bottom: -10px;
  }
}

.arrow-wrapper {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
}

.arrow-img {
  height: 120px;
}
</style>
