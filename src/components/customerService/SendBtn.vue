<template>
  <div class="wrapper">
    <div class="btn" @click="handleClick">
      <img src="../../assets/icon_paper-plane.svg" alt="plane" class="plane">
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
    }
  },
  methods: {
    handleClick () {
      this.$emit('send')
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: inline-block;
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  background: #166fd8;
  border-radius: 4px;
  text-align: center;
}

.icon {
  color: #fff;
  height: 25px;
  width: 25px;
}
</style>
