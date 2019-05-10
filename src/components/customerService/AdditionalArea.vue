<template>
  <div class="wrapper">
    <label class="control-btn" for="capture">
      <img class="icon" src="../../assets/icon_upload.svg" alt="upload" />
      <input @change="sendMsgImg"
        type="file"
        id="capture"
        ref="fileImgSend"
        class="img-upload-input"
        accept="image/*" />
    </label>
    <a class="control-btn" href="#" @click.prevent="showReview" v-if="enableReview">
      <img class="icon" src="../../assets/cs/icon-review.svg" alt="comment" />
    </a>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import lrz from 'lrz'
import { uploadImgToService } from '@/api'
import { msgFormatter } from '@/utils'

export default {
  methods: {
    ...mapActions('customerService', [
      'showReviewDialog'
    ]),
    sendMsgImg (e) {
      let fileInp = this.$refs.fileImgSend
      let file = fileInp.files[0]

      if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(fileInp.value)) {
        this.$vux.toast.show({
          text: '文件格式不正确或您目前尚不符合发言条件',
          type: 'warn'
        })
        fileInp.value = ''
        return
      }

      lrz(file).then(rst => {
        if (rst.fileLen > 1024 * 1024) {
          this.$vux.toast.show({
            text: '图片尺寸太大，请选择较小尺寸的图片',
            type: 'warn'
          })
          fileInp.value = ''
          return
        }
        let formData = new FormData()
        formData.append('image', rst.file)
        uploadImgToService(formData).then((data) => {
          fileInp.value = ''
        }).catch((errRes) => {
          this.$vux.toast.show({
            text: msgFormatter(errRes),
            type: 'warn'
          })
        })
      })
    },
    showReview () {
      this.showReviewDialog()
    }
  },
  computed: {
    ...mapState('customerService', {
      enableReview: state => state.enableReview
    })
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.control-btn {
  width: 30px;
  text-align: center;
}
.icon {
  display: inline-block;
  box-sizing: border-box;
  width: 25px;
  height: 25px;
}
.img-upload-input {
  display: none;
}
</style>
