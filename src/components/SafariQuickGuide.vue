<template>
  <div class="">
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
          <img class="confirm-add-img" src="../assets/safariguide/confirm_add.png" alt="confirm"/>
        </li>
        <li class="step" data-count="4">
          下次可直接从主屏幕的图标一键启动网站
          <img class="siteicon-img" src="../assets/safariguide/icon.png" alt="site"/>
        </li>
      </ul>
      <button class="close">
        <x-icon type="ios-close-empty" size="24"></x-icon>
        <span class="text">不再提示</span>
      </button>
    </div>
    <div class="global-mask black"></div>
  </div>
</template>

<script>
export default {
  mounted () {
    document.body.style.overflow = 'hidden'
  }
}
</script>

<style lang="scss" scoped>
$zIndex: 999;

.title {
  color: #fea301;
  font-size: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.steps {
  color: #fff;
  font-size: 14px;
}

.step {
  margin-bottom: 15px;
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
  padding: 30px 40px;
  height: 100%;
  width: 100%;
  top: 0;
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
  height: 36px;
  width: 100%;
  margin-top: 5px;
}

.siteicon-img {
  display: block;
  margin: 0 auto;
  height: 40px;
  margin-top: 5px;
}
</style>
