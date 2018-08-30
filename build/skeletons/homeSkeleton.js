exports.skeleton =
`
<style>
  .skeleton-home-footer-icon {
    display: inline-block;
    text-align: center;
    width: 20%;
    height: 27px;
    padding-top: 5px;
  }
</style>
<div style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;">
  <div style="z-index: 1; position: fixed; top: 0;left: 0; right: 0; height: 50px; width: 100%; background-color: #166fd8;"></div>
  <div style="position: fixed; width: 100%; height: 100%; background-color: #f0f0f0; margin-top: 50px">
    <div style="height: 50vw;background-color: #ddd;"></div>
    <div style="width: 100%; height: 44px; background-color: #fff; border-bottom: 1px solid #ddd;"></div>
    <div style="width: 100%; height: 100%; background-color: #fff;"></div>
  </div>
  <div style="position: fixed; display: flex; justify-content: space-between; bottom: 0; width: 100%; height: 53px; border-top: 1px solid #C0BFC4; background-color: #fff;">
    <img class="skeleton-home-footer-icon" src="../../src/assets/footer/home_normal.svg"/>
    <img class="skeleton-home-footer-icon" src="../../src/assets/footer/game_normal.svg"/>
    <img class="skeleton-home-footer-icon" src="../../src/assets/footer/top_up_normal.svg"/>
    <img class="skeleton-home-footer-icon" src="../../src/assets/footer/finance_normal.svg"/>
    <img class="skeleton-home-footer-icon" src="../../src/assets/footer/me_normal.svg"/>
  </div>
</div>
`


