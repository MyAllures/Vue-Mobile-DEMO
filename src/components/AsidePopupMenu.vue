<template>
  <div v-transfer-dom>
    <popup :value="isShow" :position="position" @on-hide="handleClose" class="popup">
      <div :style="{'width': width}">
        <div>
          <slot></slot>
        </div>
        <div class="">
          <group class="popup-content">
            <cell-box :border-intent="false"
              @click.native="handleClose"
              v-for="(item, index) in items"
              :link="`/game/${item.id}`"
              :class="[
                'popup-item',
                {
                  'active': $route.path.split('/')[2] === item.id + ''
                }
              ]"
              :key="index">
              <span :class="
                [
                  'display-name',
                  {
                    'text-center': itemCenter
                  }
                ]">
                {{item.display_name}}
              </span>
            </cell-box>
            <!-- <cell title="cell slot">
            <div>
              <span style="color: green">'Hi, I\'m Vux.'</span>
            </div>
          </cell> -->
          </group>
        </div>
      </div>
    </popup>
  </div>
</template>

<script>
import { TransferDom, Popup, Group, CellBox, Cell } from 'vux'

export default {
  props: {
    position: {
      type: String
    },
    items: {
      type: Array
    },
    width: {
      type: String
    },
    showLogo: {
      type: Boolean
    },
    isShow: {
      type: Boolean
    },
    itemCenter: {
      type: Boolean
    }
  },
  data () {
    return {
      logo: ''
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
  methods: {
    handleClose () {
      this.$emit('update:isShow', false)
    }
  },
  computed: {
  }
}
</script>

<style lang="less" scoped>
.popup {
  background-color: #fff;
}
.popup-content {
  .popup-item {
    .display-name {
      display: inline-block;
      width: 100%;
    }
    &:after {
      display: none
    }
    &.active {
      color: #fff;
      font-weight: 200;
      background-image: linear-gradient(to bottom, #006bb3, #00397c);
    }
  }
}
.weui-cell {
  padding: 10px 20px;
  margin-top: 0;
}
</style>
