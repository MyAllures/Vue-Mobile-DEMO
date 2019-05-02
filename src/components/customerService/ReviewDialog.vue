<template>
  <transition name="delay-out">
    <div class="cs-review" v-show="show">
      <transition name="fade-up">
        <div class="review-dialog" v-if="show">
          <a class="close" href="#" @click.prevent="close"><x-icon type="ios-close-empty" /></a>
          <div class="title">您对本次服务满意吗？</div>
          <div class="rating">
            <div class="rate-option" :key="i" v-for="(option, i) in RATINGS">
              <label>
                <input type="radio" name="rating" :value="option.value" v-model="rating" :disabled="processing" />
                <img :src="require(`../../assets/cs/icon-rate-${option.value}.svg`)" v-show="rating !== option.value" />
                <img :src="require(`../../assets/cs/icon-rate-${option.value}-2.svg`)" v-show="rating === option.value" />
                <span class="desc" :style="{ color: rating === option.value ? option.color : '#d4d4d4' }">{{ option.desc }}</span>
              </label>
            </div>
          </div>
          <div class="comment">
            <cube-textarea placeholder="请填写评价内容(选填)" maxlength="100" autoExpand="true" :disabled="processing" v-model="comment" />
          </div>
          <div class="submit">
            <XButton type="primary" text="提交" :show-loading="processing" :disabled="processing" @click.native="submit" />
          </div>
        </div>
      </transition>
      <transition name="fade-in">
        <div class="review-mask" v-if="show" @click="close"></div>
      </transition>
    </div>
  </transition>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { XButton } from 'vux'
import { sendServiceReview } from '@/api'
import { MSG_TYPE, MSG_CAT, RATINGS } from '@/utils/CustomerService'

export default {
  components: {
    XButton
  },
  props: {
    show: Boolean
  },
  data: () => ({
    RATINGS,
    rating: 0,
    comment: '',
    processing: false
  }),
  methods: {
    submit () {
      if (this.rating === 0) {
        this.$createToast({
          type: 'error',
          txt: '请选择评价！',
          time: 1600,
          zIndex: 1000
        }).show()
        return
      }
      this.processing = true
      sendServiceReview({
        session: this.session,
        rating: this.rating,
        comment: this.comment
      }).then(response => {
        this.reviewSucceed(response)
        this.processing = false
        this.close()
      })
    },
    reviewSucceed (response) {
      const successMsg = {
        id: response.id,
        session: response.session,
        rating: response.rating,
        cat: MSG_CAT.common,
        text: response.comment,
        type: MSG_TYPE.review
      }
      this.$store.dispatch('customerService/receiveMessages', {
        category: MSG_CAT.common,
        messages: [successMsg],
        once: false
      })
      const thankMsg = {
        session: response.session,
        cat: MSG_CAT.common,
        text: this.thankMessage,
        type: MSG_TYPE.reviewThank
      }
      this.$store.dispatch('customerService/receiveMessages', {
        category: MSG_CAT.common,
        messages: [thankMsg],
        once: false
      })
    },
    close () {
      this.rating = 0
      this.comment = ''
      this.$emit('close')
    }
  },
  computed: {
    ...mapState('customerService', {
      thankMessage: state => state.received.thank
    }),
    ...mapGetters('customerService', {
      session: 'currentSession'
    })
  }
}
</script>

<style>
.cube-popup-content {
  line-height: 1;
}
</style>
<style lang="scss" scoped>
.cs-review {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}
.review-dialog {
  width: 300px;
  position: absolute;
  left: 0;
  right: 0;
  top: 150px;
  margin: auto;
  padding: 15px 20px;
  font-size: 14px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(#000, .1);
  box-sizing: border-box;
  z-index: 1;
}
.close {
  position: absolute;
  top: 15px;
  right: 15px;
}
.title {
  color: #666;
  text-align: center;
  line-height: 26px;
}
.rating {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.rate-option {
  flex: 0 0 45px;
  margin: 0 10px;
  text-align: center;

  label {
    display: block;
  }
  input {
    position: absolute;
    width: 0;
    opacity: 0;
  }
  img {
    display: block;
  }
  .desc {
    display: block;
    margin-top: 3px;
    color: #d4d4d4;
  }
}
.comment, .submit {
  margin-top: 10px;
}
.review-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(#000, .6);
}

.delay-out-leave-active {
  transition: all .3s ease-out;
}
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all .3s ease-out;
}
.fade-up-enter {
  transform: translateY(10px);
  opacity: 0;
}
.fade-up-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
