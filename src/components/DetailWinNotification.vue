<template>
  <div v-transfer-dom>
    <x-dialog
      class="win-notification"
      :show.sync="true"
      :hide-on-blur="true"
      :dialog-style="{
        width: '90%',
        'max-width': '90%'
      }">
      <div>

      </div>
    </x-dialog>
  </div>
</template>

<script>

</script>

<style lang="scss" scoped>
.win-notification {
  width: 280px;
  max-height: 385px;
  overflow-y: auto;

  .title {
    text-align: center;
    margin-bottom: 10px;
    @include font-style(16px, #333, 500, false)
  }
  .congratulation {
    margin-bottom: 10px;
    @include font-style(14px, #417505, false, false);
  }

  .game {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px dashed #ddd;
    margin-bottom: 5px;
    padding-bottom: 5px;
    padding-right: 10px;
    .name {
      @include font-style(14px, #026bb3, 500, false);
    }
    .issue {
      @include font-style(13px, #026bb3, false, .5px);
    }
    .amount {
      @include font-style(16px,  #d0021b, 600, false);
    }
    .total-text {
      @include font-style(13px,  #333, false, false);
    }
  }

  .result-list {
    display: block;
    overflow-y: auto;
    max-height: 290px;
    padding-right: 10px;
    @include font-style(12px,  #666, false, false);
    .result {
      display: inline-flex;
      width: 100%;
      justify-content: space-between;
      line-height: 2.2;
    }
    .game-profit {
      @include font-style(13px,  #026bb3, 600, false);
    }
  }
}
</style>
